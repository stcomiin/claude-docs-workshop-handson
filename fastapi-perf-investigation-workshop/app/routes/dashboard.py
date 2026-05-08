# Final Option B notes (fill in after completing the exercise):
# - Fix 1 before/after evidence:
# - Fix 2 before/after evidence:
# - Fix 3 before/after evidence:

from __future__ import annotations

from typing import Any, Protocol, cast

from fastapi import APIRouter
from typing_extensions import TypedDict

from app.es import get_es_client
from app.timing import timer


INDEX_NAME = "activities"
CANDIDATE_USER_LIMIT = 1000
RESPONSE_USER_LIMIT = 10

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


JsonDict = dict[str, Any]


class ActivitiesEsClient(Protocol):
    def search(self, *, index: str, body: JsonDict) -> Any:
        ...

    def count(self, *, index: str, body: JsonDict) -> Any:
        ...


class TopUser(TypedDict):
    user_id: str
    username: str
    activity_count_30d: int


class OrgSummary(TypedDict):
    total_activities_30d: int
    unique_users_30d: int
    growth_rate_vs_prior_30d: float


class DashboardSummary(TypedDict):
    top_users: list[TopUser]
    org_summary: OrgSummary


def _json_dict(value: Any) -> JsonDict:
    return cast(JsonDict, value)


def _bucket_list(value: Any) -> list[JsonDict]:
    return cast(list[JsonDict], value)


def _username_from_bucket(bucket: JsonDict) -> str:
    username = _json_dict(bucket.get("username", {}))
    hits = _json_dict(username.get("hits", {}))
    hit_list = cast(list[JsonDict], hits.get("hits", []))
    if not hit_list:
        return ""

    source = _json_dict(hit_list[0].get("_source", {}))
    return str(source.get("username", ""))


def _count_from_response(response: Any) -> int:
    return int(_json_dict(response).get("count", 0))


def _total_hits_from_response(response: JsonDict) -> int:
    hits = _json_dict(response.get("hits", {}))
    total = hits.get("total", 0)
    if isinstance(total, dict):
        return int(total.get("value", 0))
    return int(total)


def _growth_rate(total_30d: int, prior_total: int) -> float:
    if prior_total > 0:
        return round((total_30d - prior_total) / prior_total, 4)
    if total_30d > 0:
        return 1.0
    return 0.0


def list_top_users(es: ActivitiesEsClient, limit: int = 10) -> list[TopUser]:
    body: JsonDict = {
        "size": 0,
        "query": {
            "bool": {
                "filter": [
                    {"range": {"created_at": {"gte": "now-30d/d", "lt": "now/d"}}}
                ]
            }
        },
        "aggs": {
            "top_users": {
                "terms": {
                    "field": "user_id",
                    "size": limit,
                    "order": {"_count": "desc"},
                },
                "aggs": {
                    "username": {
                        "top_hits": {
                            "size": 1,
                            "_source": ["username"],
                        }
                    }
                },
            }
        },
    }
    response = _json_dict(es.search(index=INDEX_NAME, body=body))
    aggregations = _json_dict(response.get("aggregations", {}))
    top_users = _json_dict(aggregations.get("top_users", {}))

    users: list[TopUser] = []
    for bucket in _bucket_list(top_users.get("buckets", [])):
        users.append(
            {
                "user_id": str(bucket.get("key", "")),
                "username": _username_from_bucket(bucket),
                "activity_count_30d": 0,
            }
        )
    return users


def count_user_activities(es: ActivitiesEsClient, user_id: str) -> int:
    body: JsonDict = {
        "query": {
            "bool": {
                "filter": [
                    {"term": {"user_id": user_id}},
                    {"range": {"created_at": {"gte": "now-30d/d", "lt": "now/d"}}},
                ]
            }
        }
    }
    return _count_from_response(es.count(index=INDEX_NAME, body=body))


def compute_org_summary(es: ActivitiesEsClient) -> OrgSummary:
    last_30d_body: JsonDict = {
        "size": 0,
        "track_total_hits": True,
        "query": {
            "bool": {
                "must": [
                    {"range": {"created_at": {"gte": "now-30d", "lt": "now"}}}
                ]
            }
        },
        "aggs": {
            "unique_users": {"cardinality": {"field": "user_id"}},
            "username_distribution": {"terms": {"field": "username", "size": 10}},
        },
    }
    prior_30d_body: JsonDict = {
        "query": {
            "bool": {
                "must": [
                    {"range": {"created_at": {"gte": "now-60d", "lt": "now-30d"}}}
                ]
            }
        }
    }

    response = _json_dict(es.search(index=INDEX_NAME, body=last_30d_body))
    aggregations = _json_dict(response.get("aggregations", {}))
    unique_users = _json_dict(aggregations.get("unique_users", {}))
    prior_response = es.count(index=INDEX_NAME, body=prior_30d_body)

    total_30d = _total_hits_from_response(response)
    prior_total = _count_from_response(prior_response)

    return {
        "total_activities_30d": total_30d,
        "unique_users_30d": int(unique_users.get("value", 0)),
        "growth_rate_vs_prior_30d": _growth_rate(total_30d, prior_total),
    }


@router.get("/summary")
def get_dashboard_summary() -> DashboardSummary:
    es = cast(ActivitiesEsClient, get_es_client())

    with timer("load_top_users"):
        users = list_top_users(es, limit=CANDIDATE_USER_LIMIT)

    with timer("count_per_user"):
        for user in users:
            user["activity_count_30d"] = count_user_activities(es, user["user_id"])
        users.sort(key=lambda user: user["activity_count_30d"], reverse=True)
        users = users[:RESPONSE_USER_LIMIT]

    with timer("compute_org_summary"):
        org_summary = compute_org_summary(es)

    return {"top_users": users, "org_summary": org_summary}
