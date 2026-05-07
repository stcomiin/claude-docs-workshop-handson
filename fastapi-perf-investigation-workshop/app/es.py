from __future__ import annotations

import os

from elasticsearch import Elasticsearch


ES_URL_ENV = "ELASTICSEARCH_URL"
DEFAULT_ES_URL = "http://localhost:9200"

_client: Elasticsearch | None = None
_client_url: str | None = None


def get_es_client() -> Elasticsearch:
    global _client, _client_url

    url = os.getenv(ES_URL_ENV, DEFAULT_ES_URL)
    if _client is None or _client_url != url:
        _client = Elasticsearch(url, request_timeout=30)
        _client_url = url
    return _client
