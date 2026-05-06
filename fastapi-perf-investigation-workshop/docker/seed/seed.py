from __future__ import annotations

import json
import os
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ES_URL = os.getenv("ELASTICSEARCH_URL", "http://es:9200").rstrip("/")
INDEX = "activities"
EXPECTED_COUNT = 50000
MAPPINGS_PATH = Path("/seed/mappings.json")
DOCUMENTS_PATH = Path("/seed/documents.ndjson")
TIMEOUT_SECONDS = 180


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
    with urlopen(req, timeout=10) as response:
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
        if existing_count == EXPECTED_COUNT:
            print("Seeded activities index with 50000 documents")
            return
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
