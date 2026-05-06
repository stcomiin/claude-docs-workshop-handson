from __future__ import annotations

import os

from elasticsearch import Elasticsearch


ES_URL_ENV = "ELASTICSEARCH_URL"
DEFAULT_ES_URL = "http://localhost:9200"


def get_es_client() -> Elasticsearch:
    return Elasticsearch(os.getenv(ES_URL_ENV, DEFAULT_ES_URL), request_timeout=30)
