from __future__ import annotations

import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routes import dashboard


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def project_file(relative_path: str) -> Path:
    return PROJECT_ROOT / relative_path


class FakeElasticsearch:
    def __init__(self) -> None:
        self.search_bodies: list[dict[str, Any]] = []
        self.count_bodies: list[dict[str, Any]] = []

    def search(self, *, index: str, body: dict[str, Any]) -> dict[str, Any]:
        assert index == "activities"
        self.search_bodies.append(body)
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

        if "unique_users" in aggs:
            return {
                "hits": {"total": {"value": 45, "relation": "eq"}},
                "aggregations": {
                    "unique_users": {"value": 3},
                    "username_distribution": {
                        "buckets": [
                            {"key": "user_0001", "doc_count": 18},
                            {"key": "user_0002", "doc_count": 15},
                            {"key": "user_0003", "doc_count": 12},
                        ]
                    },
                },
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
        self.count_bodies.append(body)
        bool_query = body["query"]["bool"]
        filters = bool_query.get("filter", bool_query.get("must", []))
        term_filter = next(
            (item for item in filters if "term" in item and "user_id" in item["term"]),
            None,
        )
        if term_filter is None:
            return {"count": 30}

        user_id = term_filter["term"]["user_id"]
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
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[tuple[TestClient, FakeElasticsearch]]:
    fake_es = FakeElasticsearch()
    monkeypatch.setattr(dashboard, "get_es_client", lambda: fake_es)
    with TestClient(app) as test_client:
        yield test_client, fake_es


def test_response_shape(client: tuple[TestClient, FakeElasticsearch]) -> None:
    test_client, _fake_es = client
    response = test_client.get("/dashboard/summary")

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


def test_top_users_sorted_descending(
    client: tuple[TestClient, FakeElasticsearch],
) -> None:
    test_client, _fake_es = client
    response = test_client.get("/dashboard/summary")
    payload = response.json()

    counts = [user["activity_count_30d"] for user in payload["top_users"]]
    assert counts == sorted(counts, reverse=True)


def test_org_summary_numbers_are_non_negative(
    client: tuple[TestClient, FakeElasticsearch],
) -> None:
    test_client, _fake_es = client
    response = test_client.get("/dashboard/summary")
    payload = response.json()

    for value in payload["org_summary"].values():
        assert isinstance(value, int | float)
        assert value >= 0


def test_response_is_json_serializable(
    client: tuple[TestClient, FakeElasticsearch],
) -> None:
    test_client, _fake_es = client
    response = test_client.get("/dashboard/summary")

    json.dumps(response.json())


def test_phase2_mapping_contains_username_text_fielddata_keyword_subfield() -> None:
    mapping = json.loads(
        project_file("docker/seed/mappings.json").read_text(encoding="utf-8")
    )
    username = mapping["mappings"]["properties"]["username"]

    assert username["type"] == "text"
    assert username["fielddata"] is True
    assert username["fields"]["keyword"]["type"] == "keyword"


@pytest.mark.starting_state
def test_compute_org_summary_uses_query_context_unrounded_now_and_username_text_agg(
    client: tuple[TestClient, FakeElasticsearch],
) -> None:
    test_client, fake_es = client

    response = test_client.get("/dashboard/summary")

    assert response.status_code == 200
    body = next(
        search_body
        for search_body in fake_es.search_bodies
        if "unique_users" in search_body.get("aggs", {})
    )

    assert body["query"]["bool"]["must"][0]["range"]["created_at"] == {
        "gte": "now-30d",
        "lt": "now",
    }
    assert body["aggs"]["username_distribution"]["terms"]["field"] == "username"

    serialized = json.dumps(body)
    assert "username.keyword" not in serialized
    assert "now-30d/d" not in serialized


def test_phase3_readme_documents_profile_slow_log_and_keyword_fix() -> None:
    readme = project_file("README.md").read_text(encoding="utf-8")

    assert "Option B: steps 9-10" in readme
    assert "_search?pretty" in readme
    assert '"profile": true' in readme
    assert "_search?pretty&profile=true" not in readme
    assert "index.search.slowlog.threshold.query.trace" in readme
    assert "_mapping?filter_path=*.mappings.properties.username" in readme
    assert "username.keyword" in readme
    assert 'pytest -m "not starting_state"' in readme
    assert "fix: aggregate on username.keyword to avoid fielddata on text field" in readme
    assert "200-500 ms" in readme


def test_phase4_readme_documents_trap3_primer_appendix_and_closing() -> None:
    readme = project_file("README.md").read_text(encoding="utf-8")

    assert "## Elasticsearch Query DSL Primer" in readme
    assert "bool.filter" in readme
    assert "aggs.date_histogram" in readme
    assert "Option B: steps 11-12" in readme
    assert (
        "fix: move date range to filter context, round now to day for cache hit"
        in readme
    )
    assert "now-30d/d" in readme
    assert "50-150 ms cached / 200-400 ms cold" in readme
    assert "## Closing Lesson" in readme
    assert "Prove that hypothesis with data" in readme
    assert "## Appendix B: Translate To Your World" in readme
    assert "Postgres / SQL" in readme
    assert "MongoDB" in readme
    assert "Spark / Trino / dbt" in readme


def test_phase3_reference_documents_trap2_path_and_trap3_boundary() -> None:
    reference = project_file("reference/option-a-sample-run.md").read_text(
        encoding="utf-8"
    )

    assert "Option B steps 9-10" in reference
    assert "Expected trap #2 investigation path" in reference
    assert "Profile API or slow-log evidence" in reference
    assert '"profile": true' in reference
    assert "_search?profile=true" not in reference
    assert "Mapping inspection" in reference
    assert "quoted profile or slow-log evidence" in reference
    assert "single aggregation-field change" in reference
    assert 'pytest -m "not starting_state"' in reference
    assert "Trap #3 remains" in reference
    assert "request-cache hits" in reference
    assert "fix: aggregate on username.keyword to avoid fielddata on text field" in reference


def test_phase4_reference_documents_trap3_and_failure_modes() -> None:
    reference = project_file("reference/option-a-sample-run.md").read_text(
        encoding="utf-8"
    )

    assert "Option B steps 11-12" in reference
    assert "Expected trap #3 investigation path" in reference
    assert "Completed dashboard.py comment example" in reference
    assert (
        "fix: move date range to filter context, round now to day for cache hit"
        in reference
    )
    assert "## Failure-mode runbook" in reference
    assert "Claude finds the cause too fast" in reference
    assert "Fix does not measurably help" in reference
    assert "Bench numbers do not change" in reference
    assert "Docker image will not start or ES is not green/yellow" in reference
    assert "Warm request cache masks trap #3" in reference


def test_phase4_dashboard_has_non_spoiler_final_notes_template() -> None:
    dashboard_source = project_file("app/routes/dashboard.py").read_text(
        encoding="utf-8"
    )
    header = "\n".join(dashboard_source.splitlines()[:30])

    assert "Final Option B notes" in header
    assert "username.keyword" not in header
    assert "now-30d/d" not in header
    assert (
        "fix: move date range to filter context, round now to day for cache hit"
        not in header
    )


def test_phase3_no_agent_instruction_files_ship() -> None:
    assert not project_file("CLAUDE.md").exists()
    assert not project_file("AGENTS.md").exists()
