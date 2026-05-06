# Phase 1: Tracer Slice - Workshop Motion End-to-End Research

**Researched:** 2026-05-06
**Domain:** FastAPI + Elasticsearch performance workshop scaffold
**Confidence:** HIGH for phase planning; runtime latency bands still require Phase 5 calibration

<user_constraints>
## User Constraints

No `CONTEXT.md` exists for this phase. Planning proceeds from `ROADMAP.md`,
`REQUIREMENTS.md`, `PROJECT.md`, and `.planning/intel/*`.

### Locked Scope From Roadmap And Intel
- Deliver the full workshop directory layout in Phase 1, even where files are
  minimal stubs.
- Build only the tracer slice: Docker/ES startup, 50k seed, FastAPI endpoint,
  timer output, tests, bench harness, and README walkthrough for trap #1.
- Physically include only trap #1: an N+1 `_count` loop in `top_users`
  construction.
- Do not introduce trap #2 in Phase 1. `username` must be mapped as `keyword`;
  no `text`, no `fielddata: true`, and no `username.keyword` fix path yet.
- Do not introduce trap #3 in Phase 1. The 30-day date range in
  `compute_org_summary` must use filter context and rounded date math.
- Keep the workshop local-only. Security is intentionally disabled on the
  single-node localhost ES container; this must not be presented as production
  guidance.
- Do not ship `CLAUDE.md` or `AGENTS.md`.
- Do not introduce out-of-scope topics: async/await refactors, ES cluster ops,
  reindex strategy, production deployment, frontend, auth, vector/ML/ESQL.

### The Agent's Discretion
- Exact internal Python function names are discretionary if the endpoint shape,
  timer names, and future trap extension points are preserved.
- Tests may use a fake ES client so `pytest` does not require Docker.
- Docker seeding may use a one-shot Compose seed service if `docker compose up -d`
  reliably yields a seeded `activities` index and the Dockerfile still builds the
  workshop ES image.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| ES runtime and seeded index | Database/Storage | Docker runtime | Elasticsearch owns persistence and query behavior; Docker makes it reproducible. |
| FastAPI `/dashboard/summary` | API/Backend | Database/Storage | The endpoint orchestrates ES queries and exposes the workshop surface. |
| Timer instrumentation | API/Backend | CLI/logs | Logs are emitted by the app and read by participants in the uvicorn terminal. |
| Correctness tests | API/Backend | Test infrastructure | Tests protect response shape and correctness before/after fixes. |
| Bench harness | CLI/test infrastructure | API/Backend | `bench.sh` measures the running endpoint with curl. |
| README tracer walkthrough | Documentation | CLI/workshop process | The README guides the 10-minute motion and preserves the pivot prompt. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 should plan a narrow but real vertical slice: the user can start ES with
Docker Compose, start FastAPI, call `/dashboard/summary`, see exactly three timer
lines, run a three-request bench loop, and run four correctness tests. The app
should be intentionally slow only because of the visible N+1 count loop. The ES
mapping and date query should be deliberately correct in Phase 1 so later phases
can add traps #2 and #3 without ambiguity.

The safest implementation shape is three work areas: Docker/seed, FastAPI/tests,
and docs/bench/reference. Docker and FastAPI can be implemented in the same wave
because they touch disjoint files; README/bench should follow once the concrete
commands and endpoint shape exist. Tests should avoid depending on a live Docker
daemon by using a fake ES client, while final verification still includes the
live Docker + uvicorn + curl path.

**Primary recommendation:** create three executable plans: `01-01` Docker/seed,
`01-02` FastAPI endpoint plus tests, and `01-03` bench plus README/reference
walkthrough.
</research_summary>

<standard_stack>
## Standard Stack

Versions checked on 2026-05-06 using official docs and package index metadata.

| Tool | Version | Purpose | Planning note |
|------|---------|---------|---------------|
| Python | 3.11+ | Participant runtime | Spec requires 3.11+. Elastic's Python client requires Python 3.10+. |
| Elasticsearch Docker image | 9.3.3 | Local ES service | Current Elastic self-managed tutorial examples reference 9.3.3; pin the image. |
| `elasticsearch` Python client | 9.3.0 | FastAPI talks to ES | Same major/minor family as the pinned ES server; package index lacks 9.3.3. |
| `fastapi` | 0.136.1 | API framework | Current package index latest at planning time. |
| `uvicorn[standard]` | 0.46.0 | ASGI server | Current package index latest at planning time. |
| `pytest` | 9.0.3 | Correctness tests | Current package index latest at planning time. |
| `httpx` | 0.28.1 | FastAPI TestClient dependency | FastAPI testing docs require httpx for TestClient. |
| `ruff` | 0.15.12 | Lint gate | Current package index latest at planning time. |
| `mypy` | 1.20.2 | Type gate | Current package index latest at planning time. |

Install command for participants:

```bash
uv pip install -e .
# fallback:
python -m pip install -e .
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Data Flow

```text
docker compose up -d
  -> es service starts single-node Elasticsearch on localhost:9200
  -> seed service waits for ES, creates activities, bulk-loads 50k docs

uvicorn app.main:app --port 8765
  -> GET /dashboard/summary
  -> app.es.get_es_client()
  -> dashboard.list_top_users()
  -> dashboard.count_user_activities() repeated once per user (trap #1)
  -> dashboard.compute_org_summary()
  -> timing.timer() emits three stdout lines
  -> JSON response

bash tests/bench.sh
  -> curl loop calls /dashboard/summary three times
```

### Recommended Project Structure

```text
fastapi-perf-investigation-workshop/
├── README.md
├── pyproject.toml
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── seed/
│       ├── build_seed.py
│       ├── mappings.json
│       └── seed.py
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── es.py
│   ├── timing.py
│   └── routes/
│       └── dashboard.py
├── tests/
│   ├── test_dashboard.py
│   └── bench.sh
└── reference/
    └── option-a-sample-run.md
```

### Pattern: Fake ES For Correctness Tests

Use a fake client in `tests/test_dashboard.py` rather than requiring Docker for
`pytest`. The fake should return the same response structures as the ES client
methods used by `dashboard.py`, which lets tests verify the endpoint contract,
sort order, non-negative numerics, and JSON serializability.

### Pattern: Future-Proof `compute_org_summary`

Keep `compute_org_summary` as a separate function and include a harmless
`username` terms aggregation on the Phase 1 `keyword` mapping. Phase 2 can then
alter mapping/query behavior without restructuring the endpoint.

### Pattern: Rounded Filter Context In Phase 1

Use `bool.filter` and date math such as `now-30d/d` and `now/d` for Phase 1.
This avoids accidentally shipping trap #3 early and keeps the request-cache
lesson available for Phase 4.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| HTTP API framework | Custom WSGI server | FastAPI + uvicorn | Workshop needs standard, familiar backend entry points. |
| ES protocol client | Raw socket/HTTP wrapper | Official `elasticsearch` Python client | Avoids query transport details distracting from the lesson. |
| API tests | Live server subprocess for pytest | FastAPI `TestClient` with a fake ES client | Faster and does not require Docker. |
| Timing | Ad hoc prints scattered in code | A single `timer(name)` context manager | Keeps timer format parseable and exact. |
| Benchmarking | Python timing harness | Existing spec's curl-based `tests/bench.sh` | Matches participant CLI workflow and workshop convention. |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Accidentally Shipping Trap #2 In Phase 1
**What goes wrong:** `username` is mapped as `text` with `fielddata: true`.
**Why it matters:** Phase 1 must isolate trap #1 so the tracer walkthrough has a
single visible performance defect.
**Prevention:** `docker/seed/mappings.json` must contain `"username": {"type":
"keyword"}` and must not contain `"fielddata": true`.

### Pitfall 2: Accidentally Shipping Trap #3 In Phase 1
**What goes wrong:** date ranges are placed under `bool.must` or use `now-30d`
without `/d`.
**Why it matters:** Phase 1 must not teach cache-miss behavior yet.
**Prevention:** `dashboard.py` must contain `filter` and `now-30d/d`, not
`must` for date range filtering.

### Pitfall 3: Tests Require Docker
**What goes wrong:** `pytest` fails on laptops without a running ES container.
**Why it matters:** The test gate must stay cheap and green throughout the
exercise.
**Prevention:** use a fake ES client in tests; reserve Docker-dependent checks
for `bench.sh` and final smoke verification.

### Pitfall 4: `docker compose up -d` Returns Before Seeding
**What goes wrong:** the app starts before the `activities` index is populated.
**Why it matters:** first-run workshop friction hides the lesson.
**Prevention:** provide an explicit seed service that exits only after `_count`
returns 50000 and document the readiness check in README.
</common_pitfalls>

<sources>
## Sources

### Primary
- Elastic Docker installation docs: https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker
- Elastic local development quickstart: https://www.elastic.co/docs/deploy-manage/deploy/self-managed/local-development-installation-quickstart
- Elastic Python client getting started: https://www.elastic.co/docs/reference/elasticsearch/clients/python/getting-started
- Elastic text field and fielddata docs: https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text
- Elastic query/filter context docs: https://www.elastic.co/docs/reference/query-languages/query-dsl/query-filter-context
- Elastic shard request cache docs: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/shard-request-cache
- FastAPI testing docs: https://fastapi.tiangolo.com/tutorial/testing/

### Local Project Sources
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/intel/constraints.md`
- `.planning/intel/context.md`
- `../one-shot-task-dashboard-gsd-workshop/README.md`
- `../one-shot-task-dashboard-bmad-workshop/README.md`
- `../one-shot-task-dashboard-bmad-workshop/reference/option-a-sample-run.md`
</sources>

## RESEARCH COMPLETE
