from __future__ import annotations

import json
from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routes import dashboard


class FakeElasticsearch:
    def search(self, *, index: str, body: dict[str, Any]) -> dict[str, Any]:
        assert index == "activities"
        aggs = body.get("aggs", {})

        if "top_users" in aggs:
            return {
                "aggregations": {
                    "top_users": {
                        "buckets": [
                            self._top_user_bucket("u_0001", "user_0001", 100),
                            self._top_user_bucket("u_0002", "user_0002", 90),
                            self._top_user_bucket("u_0003", "user_0003", 80),
                        ]
                    }
                }
            }

        return {
            "aggregations": {
                "last_30d": {
                    "doc_count": 45,
                    "unique_users": {"value": 3},
                    "username_distribution": {
                        "buckets": [
                            {"key": "user_0001", "doc_count": 18},
                            {"key": "user_0002", "doc_count": 15},
                            {"key": "user_0003", "doc_count": 12},
                        ]
                    },
                },
                "prior_30d": {"doc_count": 30},
            }
        }

    def count(self, *, index: str, body: dict[str, Any]) -> dict[str, int]:
        assert index == "activities"
        filters = body["query"]["bool"]["filter"]
        user_id = filters[0]["term"]["user_id"]
        counts = {"u_0001": 18, "u_0002": 15, "u_0003": 12}
        return {"count": counts[user_id]}

    def _top_user_bucket(
        self, user_id: str, username: str, doc_count: int
    ) -> dict[str, Any]:
        return {
            "key": user_id,
            "doc_count": doc_count,
            "username": {"hits": {"hits": [{"_source": {"username": username}}]}},
        }


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setattr(dashboard, "get_es_client", lambda: FakeElasticsearch())
    with TestClient(app) as test_client:
        yield test_client


def test_response_shape(client: TestClient) -> None:
    response = client.get("/dashboard/summary")

    assert response.status_code == 200
    payload = response.json()
    assert set(payload) == {"top_users", "org_summary"}
    assert isinstance(payload["top_users"], list)
    assert payload["top_users"]

    for user in payload["top_users"]:
        assert set(user) == {"user_id", "username", "activity_count_30d"}

    assert set(payload["org_summary"]) == {
        "total_activities_30d",
        "unique_users_30d",
        "growth_rate_vs_prior_30d",
    }


def test_top_users_sorted_descending(client: TestClient) -> None:
    response = client.get("/dashboard/summary")
    payload = response.json()

    counts = [user["activity_count_30d"] for user in payload["top_users"]]
    assert counts == sorted(counts, reverse=True)


def test_org_summary_numbers_are_non_negative(client: TestClient) -> None:
    response = client.get("/dashboard/summary")
    payload = response.json()

    for value in payload["org_summary"].values():
        assert isinstance(value, int | float)
        assert value >= 0


def test_response_is_json_serializable(client: TestClient) -> None:
    response = client.get("/dashboard/summary")

    json.dumps(response.json())
