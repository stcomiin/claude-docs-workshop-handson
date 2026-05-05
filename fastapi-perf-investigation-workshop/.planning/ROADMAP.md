# ROADMAP.md — FastAPI Perf Workshop

> Phases derived from the 7 v1 requirements (`.planning/REQUIREMENTS.md`) and
> 18 structural constraints (`.planning/intel/constraints.md`). Each phase
> delivers an independently verifiable capability — vertical slices, not
> horizontal layers. Granularity: standard (5-8 phases). Total: 5 phases.

---

## Phases

- [ ] **Phase 1: Docker ES Image with Intentional Defects** — pre-baked single-node Elasticsearch cluster shipped as the workshop's primary distribution artifact, with the bad mapping and seeded data in place.
- [ ] **Phase 2: FastAPI App with Three Layered Perf Traps** — slow endpoint, ES client helper, and pre-instrumented `with timer():` scaffolding that produces the timer log participants will read.
- [ ] **Phase 3: Correctness Tests + Latency Bench Harness** — `pytest` correctness contract and three-run `bench.sh` curl harness that participants run throughout the exercise.
- [ ] **Phase 4: Workshop Content — README, Option A & B Arcs, Reference Answer-Key** — participant-facing README with arcs, ES DSL primer, pivot + falsification prompts, Appendix B, plus facilitator-facing `reference/option-a-sample-run.md` failure-mode runbook.
- [ ] **Phase 5: Facilitator Pre-Flight Validation** — 24-hour pre-flight gate against Opus 4.7 (target) and Sonnet 4.6 (fallback), confirming the lesson lands on a fresh laptop with documented timings.

---

## Phase Details

### Phase 1: Docker ES Image with Intentional Defects
**Goal**: A facilitator can build, tag, and push a Docker image that ships a single-node Elasticsearch cluster pre-loaded with ~50k seeded activity documents and an intentionally-wrong index mapping, ready to be pulled by participants.
**Depends on**: Nothing (first phase)
**Requirements**: REQ-no-out-of-scope-drift
**Success Criteria** (what must be TRUE):
  1. Facilitator can run a single `docker compose -f docker/docker-compose.yml up -d` command and within 30-90 seconds (cold) or ~10 seconds (warm) reach a single-node ES cluster with status `green` or `yellow` on `localhost:9200`.
  2. The seeded index `activities` contains ~50k documents with the username field intentionally mapped as `text` (not `keyword`), reproducible from `docker/seed/mappings.json` and `docker/seed/build_seed.py` at image build time.
  3. The image runs on a low-memory laptop with `ES_JAVA_OPTS=-Xms512m -Xmx512m` set by default, on Mac, Windows (Docker Desktop + WSL2), and Linux.
  4. The image and its build inputs introduce nothing from the out-of-scope list: no sharding/replica configuration beyond single-node defaults, no auth, no vector / ML / ESQL plugins.
**Plans**: TBD

### Phase 2: FastAPI App with Three Layered Perf Traps
**Goal**: A participant can hit `GET /dashboard/summary` against the running ES container, receive the contract-correct response, observe a 5–10 s response time, and see three named timer blocks log to the uvicorn console — with two of three perf causes deliberately invisible from reading `dashboard.py` alone.
**Depends on**: Phase 1
**Requirements**: REQ-investigation-uses-instrumentation
**Success Criteria** (what must be TRUE):
  1. Running `uvicorn` against the Phase-1 ES container and curling `http://localhost:8765/dashboard/summary` returns the response shape from `CON-endpoint-response-shape` (`top_users` list with `user_id` / `username` / `activity_count_30d`, plus `org_summary` with `total_activities_30d` / `unique_users_30d` / `growth_rate_vs_prior_30d`).
  2. The uvicorn console emits exactly three timer lines per request in the parseable form `[timer] load_top_users <N>ms`, `[timer] count_per_user <N>ms`, `[timer] compute_org_summary <N>ms`, with `count_per_user` dominating the wall-clock baseline.
  3. All three perf causes from `CON-three-layered-perf-traps` are present and individually verifiable: an N+1 `_count` loop in `top_users` construction (visible from `dashboard.py`), a `terms` aggregation on the `text`-mapped `username` field (invisible without `_search?profile=true` or mapping inspection), and a 30-day date filter sitting under `query` context where `filter` should be used (invisible without running the same request twice and noticing no cache hit).
  4. After step 6 of Option A — when a participant asks Claude to add finer-grained timers inside `compute_org_summary` — the existing `with timer():` context manager and code structure support that addition without restructuring (i.e., the instrumentation is extension-friendly).
**Plans**: TBD

### Phase 3: Correctness Tests + Latency Bench Harness
**Goal**: A participant can run `pytest` and `bash tests/bench.sh` at any point during the exercise, get green correctness signal, observe latency numbers, and use the three-run bench shape to diagnose request-cache behavior.
**Depends on**: Phase 2
**Requirements**: REQ-correctness-preserved
**Success Criteria** (what must be TRUE):
  1. `pytest` runs in the workshop directory and reports 4 green tests covering response shape (top-level keys + list types), `top_users` sorted descending by `activity_count_30d`, non-negative numerics in `org_summary`, and JSON-serializability — and these tests stay green after every Option A and Option B fix in the reference run.
  2. `bash tests/bench.sh` runs three sequential `curl` requests against `http://localhost:8765/dashboard/summary` and prints `Response time: <T>s` for each — and the second/third runs after a `query` → `filter` fix demonstrably show request-cache hits, while the as-shipped baseline does not.
  3. Both `ruff check app` and `mypy app` pass on the as-shipped code, so the workshop terminates with all four verification gates (`pytest`, `bench.sh`, `ruff`, `mypy`) green simultaneously.
**Plans**: TBD

### Phase 4: Workshop Content — README, Option A & B Arcs, Reference Answer-Key
**Goal**: A participant on a fresh laptop reads the workshop README and walks through the Option A or Option B arc to a measured fix, leaving with the one-sentence takeaway, both portable prompts, and a before/after narrative — backed by a facilitator-only reference answer-key documenting the expected path and five failure modes.
**Depends on**: Phase 3
**Requirements**: REQ-investigation-discipline-takeaway, REQ-portable-prompt-artifacts, REQ-measured-fix-option-a, REQ-measured-fix-option-b
**Success Criteria** (what must be TRUE):
  1. The README contains the verbatim Option A 8-step arc (~45 min) and the Option B 12-step arc (~75 min) per `CON-option-a-arc` / `CON-option-b-arc`, including the pivot moment at step 4, the falsification step at step 5, and steps 9–11 for Option B's invisible traps — and a participant following the arc end-to-end produces the expected commit shape from `CON-expected-commit-shape` (one commit Option A; three commits Option B).
  2. The README reproduces both portable prompts verbatim — the pivot prompt ("Prove that hypothesis with data...") and the falsification prompt ("Now design a measurement that would falsify...") — plus the closing-slide stack-agnostic restatement, and Appendix B's translate-to-your-world table mapping ES primitives to Postgres / MongoDB / Spark equivalents with the explicit note that the prompts themselves are stack-agnostic.
  3. The README ships a 1-page ES query DSL primer (covering `term`, `terms`, `range`, `match_all`, `bool`/`must`/`filter`, `aggs.terms`, `aggs.date_histogram`) and the setup prerequisites from `CON-setup-prerequisites` (Docker, three terminals, Python 3.11+, Git Bash/WSL for Windows, `--reload` caveat, port 9200/8765 remap).
  4. After completing Option A in the reference run, a participant has produced one commit (`fix: replace per-user _count loop with single terms aggregation`), `pytest` / `ruff` / `mypy` are green, and `bench.sh` shows the 5–10 s → 3–6 s improvement band — and the participant can articulate the one-sentence takeaway at wrap-up.
  5. After completing Option B in the reference run, a participant has produced three commits in the order specified by `CON-expected-commit-shape`, the endpoint reaches the 50–150 ms cached / 200–400 ms cold band, a comment block at the top of `dashboard.py` documents before/after for each of the three fixes, and the participant has discussed Monday-equivalents per Appendix B.
  6. `reference/option-a-sample-run.md` exists as a facilitator-facing answer-key documenting the expected investigation path, including the five failure-mode runbook entries from `CON-facilitator-preflight`: (a) Claude finds the cause too fast, (b) fix doesn't measurably help, (c) bench numbers don't change, (d) Docker image won't start / cluster doesn't reach green/yellow, (e) ES request cache warm from prior bench masking trap #3.
  7. The deliverable contains no `CLAUDE.md` / `AGENTS.md` (per `CON-no-claude-md-shipped`), and nothing in the README or sample run drills into out-of-scope topics (async/await, cluster ops, reindex strategies, prod deploy, frontend, auth, vector / ML / ESQL).
**Plans**: TBD

### Phase 5: Facilitator Pre-Flight Validation
**Goal**: A facilitator running through the workshop on a fresh clone with the published Docker image 24 hours before a session can confirm the deliverable lands the lesson against the target model (Opus 4.7) and the supported fallback (Sonnet 4.6), with timings in the expected bands and all five failure-mode runbook entries either non-occurring or successfully recoverable.
**Depends on**: Phase 4
**Requirements**: (validation phase — gates end-to-end correctness across phases 1–4; no single requirement owned, but the developer-facing success metric depends on this gate)
**Success Criteria** (what must be TRUE):
  1. On a fresh clone with the published image, the facilitator can run Option A end-to-end against Opus 4.7 and observe: (a) Claude does NOT solve step 3 in one shot, (b) Claude does NOT find traps #2 and #3 from code-reading alone, (c) the pivot prompt at step 4 forces Claude to read the timer log, (d) baseline 5–10 s and post-fix 3–6 s timings land within the expected bands per `CON-expected-timings`.
  2. The same Option A run repeated against Sonnet 4.6 fallback lands the lesson — even if Sonnet is more likely to skip the slow log / `?profile=true`, the facilitator confirms the pivot moment still occurs and the fix is still measurable, with notes on where Sonnet behaviour diverges (so the facilitator can guide live).
  3. The facilitator can run Option B end-to-end against Opus 4.7 and reach the 50–150 ms cached / 200–400 ms cold band, producing all three commits from `CON-expected-commit-shape` in the expected order.
  4. The pre-workshop email has been sent at least 1 week prior to participants, including the Docker prerequisite, the image pull command, and a 5-minute "did it pull and run?" smoke test — and the image is tagged with semver and pushed to the registry.
  5. Each of the five failure-mode runbook entries in `reference/option-a-sample-run.md` has been validated against a reproducible trigger condition during pre-flight (or explicitly noted as "not triggered in this pre-flight, watch live").
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Docker ES Image with Intentional Defects | 0/0 | Not started | - |
| 2. FastAPI App with Three Layered Perf Traps | 0/0 | Not started | - |
| 3. Correctness Tests + Latency Bench Harness | 0/0 | Not started | - |
| 4. Workshop Content — README, Option A & B Arcs, Reference Answer-Key | 0/0 | Not started | - |
| 5. Facilitator Pre-Flight Validation | 0/0 | Not started | - |
