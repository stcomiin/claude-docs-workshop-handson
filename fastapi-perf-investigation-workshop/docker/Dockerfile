ARG ELASTIC_VERSION=9.3.3

FROM python:3.11-slim AS seed-builder
WORKDIR /seed
COPY seed/build_seed.py /seed/build_seed.py
RUN python /seed/build_seed.py --output /seed/documents.ndjson --count 50000

FROM docker.elastic.co/elasticsearch/elasticsearch:${ELASTIC_VERSION} AS es
COPY seed/mappings.json /usr/share/elasticsearch/config/workshop-seed/mappings.json
COPY --from=seed-builder /seed/documents.ndjson /usr/share/elasticsearch/config/workshop-seed/documents.ndjson

FROM python:3.11-slim AS seed-runner
WORKDIR /seed
COPY seed/seed.py /seed/seed.py
COPY seed/mappings.json /seed/mappings.json
COPY --from=seed-builder /seed/documents.ndjson /seed/documents.ndjson
CMD ["python", "/seed/seed.py"]
