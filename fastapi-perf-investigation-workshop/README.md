# FastAPI Perf Investigation Workshop

This is the tracer slice -- Option A and Option B are not yet present.

## What this tracer slice includes

- Docker Compose startup for local Elasticsearch.
- A deterministic 50k-document `activities` seed.
- A synchronous FastAPI endpoint at `GET /dashboard/summary`.
- Three timer blocks: `load_top_users`, `count_per_user`, and `compute_org_summary`.
- Four pytest correctness tests.
- A three-run curl bench harness.
- Trap #1 only: the visible N+1 `_count` loop in `count_per_user`.

The Elasticsearch container disables security for a single-node localhost workshop runtime. Do not treat that setting as production guidance.

## Setup Prerequisites

- Docker Desktop or Docker Engine.
- Python 3.11+.
- Three terminals:
  - `uvicorn`
  - `claude`
  - `bash tests/bench.sh` and `pytest`
- Windows participants need Git Bash or WSL for `bash` and `curl`.
- Elasticsearch uses port 9200.
- FastAPI uses port 8765.

Use `uvicorn app.main:app --port 8765 --reload` only for the first sanity check. After applying a fix, stop uvicorn and manually restart it before running benchmarks; reload-on-edit can skew the first post-fix run.

## Start The Tracer Runtime

From this directory:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

Install Python dependencies:

```bash
uv pip install -e .
```

Fallback:

```bash
python -m pip install -e .
```

Start FastAPI:

```bash
uvicorn app.main:app --port 8765 --reload
```

Sanity check the endpoint:

```bash
curl http://localhost:8765/dashboard/summary
```

Run the latency harness:

```bash
bash tests/bench.sh
```

Run the correctness and code gates:

```bash
pytest
ruff check app
mypy app
```

## Pivot Prompt

Prove that hypothesis with data. Run `bash tests/bench.sh`, then read the timing log output from the uvicorn console. Tell me which named timer block dominates the wall-clock time, and quote the numbers verbatim. Only after you have the numbers, propose the fix.

## 10-Minute Facilitator Walkthrough

1. Start Elasticsearch with `docker compose -f docker/docker-compose.yml up -d --build`.
2. Start FastAPI with `uvicorn app.main:app --port 8765 --reload`.
3. Call `curl http://localhost:8765/dashboard/summary`.
4. Run `bash tests/bench.sh`.
5. Ask Claude: `This endpoint at /dashboard/summary is slow. Where is the time going?`
6. Use the pivot prompt above.
7. Confirm Claude reads the uvicorn timer output and identifies `count_per_user` as the dominant block.
8. Apply only the N+1 terms-aggregation fix during this tracer walkthrough.
9. Stop uvicorn, restart it without relying on reload timing, then re-run `bash tests/bench.sh`.
10. Run `pytest`, `ruff check app`, and `mypy app`.
11. Stop before Option A or Option B material.

## Scope Guardrails

Do not add async/await changes, authentication, frontend code, production deployment steps, Elasticsearch cluster operations, reindex strategy work, vector search, ML features, or ESQL. This slice exists to prove the workshop motion end to end with only trap #1 present.
