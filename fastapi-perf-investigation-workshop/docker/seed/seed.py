from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ES_URL = os.getenv("ELASTICSEARCH_URL", "http://es:9200").rstrip("/")
INDEX = "activities"
EXPECTED_COUNT = 50000
MAPPINGS_PATH = Path("/seed/mappings.json")
DOCUMENTS_PATH = Path("/seed/documents.ndjson")
TIMEOUT_SECONDS = 180
REQUEST_TIMEOUT_SECONDS = 60


def request(
    method: str,
    path: str,
    *,
    body: bytes | None = None,
    content_type: str = "application/json",
) -> tuple[int, bytes]:
    headers = {}
    if body is not None:
        headers["Content-Type"] = content_type
    req = Request(f"{ES_URL}{path}", data=body, headers=headers, method=method)
    with urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        return response.status, response.read()


def wait_for_elasticsearch() -> None:
    deadline = time.monotonic() + TIMEOUT_SECONDS
    last_error: Exception | None = None

    while time.monotonic() < deadline:
        try:
            request("GET", "/_cluster/health")
            return
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            time.sleep(2)

    raise SystemExit(f"Timed out waiting for Elasticsearch at {ES_URL}: {last_error}")


def index_exists() -> bool:
    try:
        request("HEAD", f"/{INDEX}")
        return True
    except HTTPError as exc:
        if exc.code == 404:
            return False
        raise


def count_documents() -> int:
    _, raw = request("GET", f"/{INDEX}/_count")
    payload = json.loads(raw.decode("utf-8"))
    return int(payload["count"])


def get_mapping() -> dict[str, Any]:
    _, raw = request("GET", f"/{INDEX}/_mapping")
    payload = json.loads(raw.decode("utf-8"))
    return dict(payload)


def mapping_matches_phase2() -> bool:
    payload = get_mapping()
    index_mapping = payload.get(INDEX, {})
    if not isinstance(index_mapping, dict):
        return False

    mappings = index_mapping.get("mappings", {})
    if not isinstance(mappings, dict):
        return False

    properties = mappings.get("properties", {})
    if not isinstance(properties, dict):
        return False

    username = properties.get("username", {})
    if not isinstance(username, dict):
        return False

    fields = username.get("fields", {})
    if not isinstance(fields, dict):
        return False

    keyword = fields.get("keyword", {})
    if not isinstance(keyword, dict):
        return False

    return (
        username.get("type") == "text"
        and username.get("fielddata") is True
        and keyword.get("type") == "keyword"
    )


def create_index() -> None:
    mappings = MAPPINGS_PATH.read_bytes()
    request("PUT", f"/{INDEX}", body=mappings)


def delete_index() -> None:
    try:
        request("DELETE", f"/{INDEX}")
    except HTTPError as exc:
        if exc.code != 404:
            raise


def bulk_load() -> None:
    request(
        "POST",
        "/_bulk?refresh=true",
        body=DOCUMENTS_PATH.read_bytes(),
        content_type="application/x-ndjson",
    )


def ensure_seeded() -> None:
    if index_exists():
        existing_count = count_documents()
        if existing_count == EXPECTED_COUNT and mapping_matches_phase2():
            print("Seeded activities index with 50000 documents")
            return
        if existing_count == EXPECTED_COUNT:
            print("Existing activities index has stale mapping; recreating")
        else:
            print(
                f"Existing activities index has {existing_count} documents; "
                "recreating"
            )
        delete_index()

    create_index()
    bulk_load()
    actual_count = count_documents()
    if actual_count != EXPECTED_COUNT:
        raise SystemExit(
            f"Expected {EXPECTED_COUNT} documents in {INDEX}, found {actual_count}"
        )
    print("Seeded activities index with 50000 documents")


def main() -> None:
    wait_for_elasticsearch()
    ensure_seeded()


if __name__ == "__main__":
    main()
