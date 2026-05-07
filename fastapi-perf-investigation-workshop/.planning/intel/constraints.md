# Constraints

Synthesized from SPEC sources. Each entry traces back to a `source:` for provenance. Constraints are technical/structural mandates that bind downstream implementation; they are not locked decisions (no ADR present) but they are authoritative within their SPEC's scope.

---

## CON-deliverable-directory-layout

- **Type:** schema (filesystem layout)
- **Source:** `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md` §7
- **Scope:** Top-level workshop directory shape and file inventory
- **Content:**

A new top-level directory `fastapi-perf-investigation-workshop/` in the workshop repo with the following structure:

```
fastapi-perf-investigation-workshop/
├── README.md                    # workshop instructions, Option A & B paths,
│                                # incl. 1-page ES query DSL primer
├── pyproject.toml               # FastAPI, uvicorn, elasticsearch-py, pytest pinned
├── docker/
│   ├── Dockerfile               # builds ES image with seed data + bad mapping
│   ├── docker-compose.yml       # one-command ES startup (single-node)
│   └── seed/
│       ├── mappings.json        # intentionally bad mapping (text where keyword needed)
│       └── build_seed.py        # generates documents.ndjson at image build time
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry
│   ├── es.py                    # Elasticsearch client helper
│   ├── timing.py                # `with timer("name"):` context manager
│   └── routes/
│       └── dashboard.py         # the slow endpoint (intentionally bad)
├── tests/
│   ├── test_dashboard.py        # correctness tests (green at start)
│   └── bench.sh                 # latency harness using curl
├── reference/
│   └── option-a-sample-run.md   # troubleshooting / answer key
└── .gitignore
```

Naming convention matches existing `one-shot-task-dashboard-{bmad,gsd}-workshop/` directories.

---

## CON-docker-image-contract

- **Type:** schema (artifact contract)
- **Source:** §7
- **Scope:** Workshop's primary distribution artifact
- **Content:**

The Docker image is the workshop's primary distribution artifact. It MUST be pre-baked with:
- Elasticsearch (pinned version)
- The intentionally-wrong index mapping
- ~50k seeded activity documents
- Cluster status `green` on first startup

Image is tagged with semver (e.g., `v1.0.0`) and pushed to a registry participants pull from (example: `ghcr.io/<org>/perf-workshop-es:v1.0.0`). Alternative distribution: `docker save` tarball. Image rebuild is required when ES version, mappings, or seed data change.

---

## CON-endpoint-response-shape

- **Type:** api-contract
- **Source:** §8
- **Scope:** `GET /dashboard/summary`
- **Content:**

```json
{
  "top_users": [
    {"user_id": "u_123", "username": "...", "activity_count_30d": 142}
  ],
  "org_summary": {
    "total_activities_30d": 47832,
    "unique_users_30d": 1023,
    "growth_rate_vs_prior_30d": 0.18
  }
}
```

The endpoint MUST be functionally correct (pytest passes against seeded data). It is intentionally slow, not buggy.

---

## CON-three-layered-perf-traps

- **Type:** schema (intentional defects)
- **Source:** §8.1
- **Scope:** `dashboard.py` and seed mapping; the pedagogical core
- **Content:**

Three layered, intentional causes of slowness MUST be present. The traps MUST be tuned so two of three are NOT visible from reading `dashboard.py` alone.

1. **N+1 search requests** *(visible from code reading).* `top_users` is built by calling `es.count(index="activities", body={"query": {"term": {"user_id": ...}}})` once per user, instead of a single `terms` aggregation. Claude is expected to identify this from code reading; that is acceptable because the pivot/falsification still apply on a known-positive case.

2. **Aggregation on a `text`-mapped field** *(invisible from `dashboard.py`).* `docker/seed/mappings.json` MUST define `username` as a multi-field: `{"type": "text", "fielddata": true, "fields": {"keyword": {"type": "keyword"}}}`. The endpoint's `terms` aggregation MUST target the parent `username` (text + fielddata) path rather than the `username.keyword` subfield. The agg runs (because `fielddata: true` is set) but loads fielddata onto the JVM heap on every request — orders of magnitude slower than the keyword path. Diagnosis requires `_search?profile=true`, the slow log, or inspecting the mapping directly. Fix path: switch the aggregation to `username.keyword` (no re-index — the subfield is already in the multi-field). Without `fielddata: true`, the agg would fail with `fielddata is disabled on text fields` rather than be slow, breaking the "slow but correct" premise.

3. **`query` context with non-rounded `now` date math** *(invisible from any single file — two coupled defects in one place).* The 30-day date range filter for `unique_users_30d` MUST sit under `query` context (`bool.must`) AND use millisecond-precise `now-30d` instead of day-rounded `now-30d/d`. Two coupled cache misses: (a) `query` context skips the segment-level filter cache and runs scoring; (b) millisecond-precise `now` produces a different filter bitset and a different request-body cache key on every request, so neither the filter cache nor the request cache is engaged. The aggs sub-request MUST use `size: 0` so the request cache is *eligible* once the body becomes deterministic (this is correct in the as-shipped code; the trap is purely about query context + non-rounded date). Diagnosis requires running the same request twice and noticing the second isn't faster. Fix path: move to `filter` context AND round to `/d` (`now-30d/d`). Either fix alone is insufficient.

---

## CON-pre-instrumented-timing

- **Type:** protocol (instrumentation contract)
- **Source:** §8.2
- **Scope:** `app/timing.py` + `dashboard.py`
- **Content:**

The endpoint MUST wrap each phase in a named timer using a `with timer("name"):` context manager. As-shipped instrumentation MUST contain exactly three timer blocks:

```python
with timer("load_top_users"):
    users = list_top_users(es)
with timer("count_per_user"):
    for u in users:
        u.activity_count_30d = count_user_activities(es, u.user_id)
with timer("compute_org_summary"):
    summary = compute_org_summary(es)  # contains username-agg + date-range filter
```

The timer MUST log to stdout in this parseable format:

```
[timer] load_top_users 12.3ms
[timer] count_per_user 2418.7ms
[timer] compute_org_summary 1180.2ms
```

Causes #2 (text-mapped agg) and #3 (`query` vs `filter`) both live inside `compute_org_summary` and are NOT split until step 6 of Option A, when Claude is asked to add finer-grained timers. This is part of the lesson: investigation often requires *adding* instrumentation to existing instrumentation.

The instrumentation is deliberate; it exists so the agent has data to read.

---

## CON-expected-timings

- **Type:** nfr (latency targets, relative)
- **Source:** §8.3
- **Scope:** `GET /dashboard/summary` total response time
- **Content:**

| State | Total response time |
|---|---|
| As-shipped (all three causes) | 5–10 s |
| After N+1 fix (terms aggregation) | 3–6 s |
| After mapping fix (`text` → `keyword`) | 200–500 ms |
| After `query` → `filter` context fix | 50–150 ms (cached path) / 200–400 ms (cold) |

Constraint: ES baselines vary more than SQLite baselines because heap, OS file cache, refresh cycle, and request-cache state all influence numbers. Participants record numbers on their own machine. **Relative improvements** are the binding measure; absolute numbers vary with hardware and ES container state. Pre-flight calibration against the pre-baked image is mandatory (Section 14).

---

## CON-test-suite-shape

- **Type:** api-contract (test contract)
- **Source:** §8.4
- **Scope:** `tests/test_dashboard.py`
- **Content:**

`tests/test_dashboard.py` MUST contain 4 tests, all green before any change:

1. shape of the response (top-level keys, list types)
2. `top_users` sorted descending by `activity_count_30d`
3. `org_summary` numeric fields are non-negative
4. response is JSON-serializable

These tests exist to protect against fixes that break correctness.

---

## CON-bench-script

- **Type:** protocol (latency harness)
- **Source:** §8.4
- **Scope:** `tests/bench.sh`
- **Content:**

```bash
#!/usr/bin/env bash
for i in 1 2 3; do
  curl -s -w "Response time: %{time_total}s\n" -o /dev/null \
    http://localhost:8765/dashboard/summary
done
```

Three runs in sequence so participants can observe (or fail to observe) request-cache warm-up — load-bearing for diagnosing trap #3.

---

## CON-verification-commands

- **Type:** protocol
- **Source:** §11
- **Scope:** Per-step participant verification gates
- **Content:**

Participants MUST be able to run, throughout the exercise:

```bash
pytest                       # correctness
bash tests/bench.sh          # latency
ruff check app               # lint (no agent-introduced syntax errors)
mypy app                     # type sanity
```

A successful exercise terminates with all four green AND a measurable bench improvement AND a clear narrative from the participant: *"the bottleneck was X (per the logs); we fixed it by Y; the new measurement is Z."*

---

## CON-setup-prerequisites

- **Type:** protocol (participant setup)
- **Source:** §7.1
- **Scope:** Pre-flight participant requirements surfaced in README
- **Content:**

- **Docker required.** Docker Desktop on Mac/Windows; Docker Engine on Linux. Workshop will not run without it. Participants MUST pre-pull the image *before* the workshop session.
- **Start ES detached:** `docker compose -f docker/docker-compose.yml up -d` (~30-90s cold pull, ~10s warm). Detached mode keeps participants at three terminals instead of four.
- **Three terminals required.** One for `uvicorn`, one for `claude`, one for `bash tests/bench.sh` and `pytest`.
- **Windows participants:** Git Bash or WSL required (`bash` and `curl`); Docker Desktop with WSL2 backend recommended over Hyper-V. Matches existing BMAD/GSD READMEs.
- **Memory:** ES container uses ~1 GB heap default. Image MUST ship with `ES_JAVA_OPTS=-Xms512m -Xmx512m` for low-memory laptops.
- **Ports:** ES on `9200` (internal app↔ES); FastAPI on `8765` (bench↔app). Both configurable in `docker-compose.yml` and `app/es.py`.
- **`--reload` caveat:** start uvicorn with `--reload` only for the first sanity check; participants MUST stop it and restart without `--reload` for benchmark comparisons after a fix. The reloader's file watcher and accidental mid-bench restarts add noise; the first benchmark iteration after any restart should be treated as warm-up.
- **Python:** 3.11+ required. `uv python install 3.11` recommended.
- **ES DSL primer in README:** 1-page primer covering `term`, `terms`, `range`, `match_all`, `bool`/`must`/`filter`, `aggs.terms`, `aggs.date_histogram`.

---

## CON-target-model

- **Type:** nfr (model compatibility)
- **Source:** §7.1, §13, §14
- **Scope:** Workshop pedagogical sharpness
- **Content:**

Opus 4.7 is the design target. Sonnet 4.6 is a *supported fallback* but is more likely to skip the slow log / timer output and propose surface-level fixes — the workshop's pivot moment is sharper on Opus 4.7. Facilitator script MUST be validated against both at pre-flight. Per the SPEC: "current Claude (target: Opus 4.7) does not solve step 3 in one shot *and* does not find traps #2 and #3 from code-reading alone".

---

## CON-no-claude-md-shipped

- **Type:** protocol (intentional omission)
- **Source:** §14
- **Scope:** Workshop repo contents
- **Content:**

No `CLAUDE.md` / `AGENTS.md` is shipped. This is intentional — part of the lesson is that the agent must discover the structure on its own. Adding context files would short-circuit the investigation.

---

## CON-option-a-arc

- **Type:** protocol (workshop arc, ~45 min)
- **Source:** §9
- **Scope:** Option A workshop flow
- **Content:**

Eight-step flow totaling ~45 min:

1. **4 min** — `docker compose ... up -d`, install deps, `uvicorn ... --reload`, hit endpoint with curl, confirm slow.
2. **3 min** — `bash tests/bench.sh`. Observe 5–10s baseline. Read timing log output in uvicorn console.
3. **5 min** — Ask Claude (fresh session, workshop dir as cwd): *"This endpoint at `/dashboard/summary` is slow. Where is the time going?"* Claude proposes hypothesis, often without reading timing logs.
4. **10 min** — **Pivot prompt:** *"Prove that. Run the bench script, look at the timer log output, and tell me which named timer block dominates."* Claude reads actual data; hypothesis often updates. Includes orientation friction (uvicorn console is a separate terminal).
5. **4 min** — **Falsification prompt:** *"Now design a measurement that would falsify your hypothesis, not confirm it. Run it. Report what you find."* If hypothesis survives, it's load-bearing — proceed. If it collapses, return to step 4.
6. **5 min** — If granularity insufficient, have Claude add finer-grained timers inside the worst phase. Re-run.
7. **12 min** — Have Claude propose and implement a fix for the top bottleneck **only**. Run `pytest` (must pass). Restart uvicorn (drop `--reload`). Run bench (must improve).
8. **3 min** — Wrap-up: final measurement, what they'd fix next, finish.

---

## CON-option-b-arc

- **Type:** protocol (workshop arc, ~75 min)
- **Source:** §10
- **Scope:** Option B workshop flow
- **Content:**

Steps 1–8 from Option A unchanged. Adds:

9. **10 min** — After fix #1, re-measure. Endpoint *still* slow — dominant cost shifted to `compute_org_summary`. Claude investigates using `_search?profile=true` or by enabling slow log. Profile reveals fielddata loading on `username`.
10. **10 min** — Diagnose mapping bug: inspect `docker/seed/mappings.json`, find `username` mapped as `text` with `fielddata: true` (which is *why* the agg ran slowly instead of erroring) and the `username.keyword` subfield already exposed in the multi-field. Implement fix #2: switch the aggregation from `username` to `username.keyword`. No re-index needed. Measure. Big drop.
11. **8 min** — After fix #2, dominant cost is `query`-context, non-rounded date filter. Run same request twice — second isn't faster, neither cache engaged. Diagnose two coupled defects: `must` under `query` context (no filter cache, scoring runs) AND `now-30d` (non-deterministic body, no request cache). Move the date range to `filter` context AND round to `/d` (`now-30d/d`). Re-bench: second request now cached.
12. **4 min** — Final measurement. Document before/after in comment block at top of `dashboard.py`. Discuss Monday equivalents.

Endpoint ends roughly 50–100x faster than as-shipped (less dramatic than SQLite numbers because ES has different baseline costs).

---

## CON-pivot-and-falsification-prompts

- **Type:** protocol (portable artifacts)
- **Source:** §9.2
- **Scope:** Workshop README's two reusable prompts
- **Content:**

**Pivot prompt** (after Claude's first hypothesis):

> Prove that hypothesis with data. Run `bash tests/bench.sh`, then read the timing log output from the uvicorn console. Tell me which named timer block dominates the wall-clock time, and quote the numbers verbatim. Only after you have the numbers, propose the fix.

**Falsification prompt** (after Claude's data-grounded hypothesis):

> Now design a measurement whose result would *falsify* this hypothesis — not confirm it. If you think `<phase X>` dominates, what would you expect to see if it actually didn't? Run that measurement and report what you find. Only proceed to a fix if the falsification attempt fails.

Stack-agnostic restatement (closing slide):

> *"Prove that hypothesis with data. Run the perf harness, read the instrumentation output, tell me which named block dominates wall-clock time, and quote the numbers. Only after you have the numbers, propose the fix. Then try to falsify your own hypothesis before you accept it."*

---

## CON-facilitator-preflight

- **Type:** protocol (facilitator runbook)
- **Source:** §14
- **Scope:** Workshop facilitator pre-flight checklist
- **Content:**

- **Docker image build & test (one-time, then on revision):** facilitator builds workshop ES image from `docker/Dockerfile`, tests on Mac/Windows/Linux, tags with semver, pushes to registry.
- **Pre-workshop email (1 week before):** participants receive Docker prerequisite, image pull command, and a 5-minute "did it pull and run?" smoke test.
- **Pre-flight check (24 hours before workshop):** facilitator runs through Option A on a fresh clone with the published image, confirms timings within expected range, confirms target Claude (Opus 4.7) does not solve step 3 in one shot AND does not find traps #2/#3 from code-reading alone, validates against Sonnet 4.6 fallback. The 24-hour lead exists so the image can be rebuilt or seed re-tuned if any property has drifted.
- **Failure-mode runbook in `reference/option-a-sample-run.md`** with five documented failure modes:
  - (a) Claude finds the right cause too fast
  - (b) Claude proposes a fix that doesn't measurably help
  - (c) bench script numbers don't change after fix
  - (d) Docker image fails to start or ES doesn't reach `green`/`yellow`
  - (e) ES request cache is "warm" from a prior bench, masking trap #3 fix

---

## CON-out-of-scope

- **Type:** schema (scope guardrails)
- **Source:** §15
- **Scope:** Hard "do not implement" list
- **Content:**

OUT of scope:

- Async/await refactoring (slowness is not async-related; teaching "make it async" would teach a wrong lesson)
- ES cluster operations (sharding, replica strategy, snapshot/restore)
- Reindex strategies and zero-downtime migrations (mention but do not drill)
- Production deployment, k8s, observability stack beyond ES slow log
- Frontend integration
- Authentication / authorization (workshop ES image disables security; single-node localhost only)
- ES vector search, ML features, ESQL, or anything outside core query/aggs

---

## CON-expected-commit-shape

- **Type:** schema (artifact)
- **Source:** §16
- **Scope:** Participant's git history after a clean run
- **Content:**

Following BMAD workshop's commit-shape convention:

```
Workshop starting point
fix: replace per-user _count loop with single terms aggregation
```

Option B adds two more commits:

```
fix: aggregate on username.keyword to avoid fielddata on text field
fix: move date range to filter context, round now to day for cache hit
```
