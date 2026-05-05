# FastAPI slow-endpoint investigation handson — design

**Date:** 2026-05-04
**Status:** Draft for review
**Audience:** Backend developers, data engineers, and data scientists working in Elasticsearch-based stacks (search, observability, log analytics)
**Workshop slot:** 40-45 min Option A path; optional 70-75 min Option B path
**Workshop home:** `claude-docs.devbionics.com/docs/skills-plugins-deep-dive/` — handson section

---

## 1. Background

The existing handson portion of the workshop has three exercises:

1. **GSD existing-codebase exercise** — TS/React/Express OSINT dashboard, add a Test button.
2. **BMAD existing-codebase exercise** — same dashboard, BMAD workflow.
3. **Research and report generation** — parallel agents + document skills.

All three lean frontend (React UI changes) or document-output (Word/PDF/PPT/XLSX). None speak directly to backend developers or data scientists who want to know what agentic coding does for *their* day-to-day work.

This handson fills that gap with a backend-Python exercise built around the lesson the existing handsons don't exercise: **forcing the agent to prove its hypotheses with measurement before accepting them.**

## 2. The takeaway (single sentence)

> When an agent says "this is slow because X," the right answer is never "OK, fix X" — it's "prove that's where the time is, then fix the proven cause."

## 3. Why this lesson, for this audience

Synthesized across leading agentic-coding writeups (Eric J. Ma's "How to do agentic data science", ClickHouse engineering blog, Armin Ronacher's agentic coding recommendations, AI Hero "Real Engineers" cohort, MIT Missing Semester 2026, iximiuz' production take):

- Investigation is where coding agents **shine most** — they skim logs faster than humans and propose plausible hypotheses quickly.
- Investigation is also where they **fail most consistently** — they produce many wrong-but-plausible hypotheses and will defend them under casual questioning.
- The discipline that closes the gap is "prove it with data." Backend devs and data scientists both work in domains where this discipline matters more than in pure UI work, because their work is judged by *measured outcomes* (latency, throughput, statistical correctness) rather than visible UI behavior.

The existing handsons teach **pattern-following** ("understand the codebase, follow conventions, stay in scope"). This one teaches **investigation discipline**. Together they cover the two halves of competent agentic coding.

## 4. Audience

- **Primary:** backend developers and data engineers in Elasticsearch-based stacks (search, observability, log analytics).
- **Secondary:** data scientists who query Elasticsearch via Kibana or Python clients.
- **Assumed knowledge:** basic familiarity with `curl`, `pip` / `uv`, virtualenvs, Docker (or willingness to install Docker Desktop), reading stack traces. Working knowledge of Elasticsearch query DSL helpful but not required — the workshop README provides a 1-page primer.
- **Not assumed:** prior FastAPI experience, prior performance-engineering background, or deep Elasticsearch internals knowledge (the perf gotchas in this exercise are the very things experienced devs miss).
- **Why ES specifically:** the audience's production stack uses Elasticsearch. Investigation discipline is exercised on the tools participants will face Monday morning, not on a stand-in. ES also has the convenient property that several of its perf gotchas (mapping-as-config, query-vs-filter context) are not visible from reading the request code — which makes the discipline actually do work, instead of being theatre on top of textbook antipatterns Claude already recognizes.

## 5. Format

Two paths, both starting from the same setup:

- **Option A (~40-45 min)** — investigation discipline + one measured fix (the visible N+1 trap), with a Popper-style falsification step. Lands the core lesson.
- **Option B (~70-75 min)** — full perf-engineering loop including the two *invisible* traps (text-mapped agg, `query` vs `filter` context); participant ends with a measurably faster endpoint they can explain step by step *and* with two fixes they could not have found by code-reading alone.

This matches the Option A / Option B convention already used in the GSD and BMAD workshop READMEs.

## 6. Considered alternatives (and why this one)

| Alternative | Why not |
|---|---|
| **SQLite + pandas-as-database traps** | Lesson would survive but mismatch the participants' production stack (Elasticsearch). Translation tax weakens transfer. Worse: SQLite traps (N+1, `pd.read_sql("SELECT *")`) are textbook patterns Claude Opus 4.7 recognizes from training data on first read — defeating the "force the agent to prove with data" lesson. ES traps are less code-readable, defeating the failure mode better. |
| **Implement OIDC on FastAPI endpoints** | Pure backend security — excludes data scientists. Mostly copy-from-docs work where agents don't differentiate from regular coding. Setup pain (external IdP). Hard to verify in a workshop. |
| **Notebook → tested production module (with Marimo)** | Mechanical refactoring; agents finish too quickly. Less unique investigation lesson. (Designed in parallel as Option B candidate; deferred.) |
| **Add a Python collector with parallel agents** | Echoes the existing TS dashboard exercise too closely; teaches pattern-following, which is already covered. |

This exercise was selected because it uniquely showcases agentic coding's investigation strength while teaching a discipline (verification through measurement) that the existing handsons do not. The Elasticsearch backend is chosen because it matches the audience's production stack *and* its perf gotchas resist code-reading shortcuts — both factors that strengthen the lesson.

## 7. What gets shipped

A new top-level directory in the workshop repo:

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

The Docker image is the workshop's primary distribution artifact. It is pre-baked with:
- Elasticsearch (pinned version)
- The intentionally-wrong index mapping
- ~50k seeded activity documents
- Cluster status `green` on first startup

Naming convention matches the existing `one-shot-task-dashboard-{bmad,gsd}-workshop` directories.

### 7.1 Setup notes for participants (must surface in README)

- **Docker required.** Docker Desktop on Mac/Windows; Docker Engine on Linux. Workshop will not run without it. Pre-pull the image **before** the workshop session — see "pre-workshop steps" in the README.
- **Start ES in detached mode:** `docker compose -f docker/docker-compose.yml up -d` (~30-90s cold pull, ~10s warm). Detached mode (`-d`) keeps you at three terminals instead of four. Use `docker compose logs es` if you need to inspect ES output.
- **Three terminals required.** One for `uvicorn` (the FastAPI app and its timer logs), one for `claude` (the agent session), one for running `bash tests/bench.sh` and `pytest`. Recommend tiling windows or using `tmux` / Windows Terminal panes.
- **Windows participants:** use Git Bash or WSL — `bash` and `curl` are required. Docker Desktop with the WSL2 backend is recommended over Hyper-V. This matches the existing BMAD/GSD READMEs.
- **Memory:** the ES container uses ~1 GB heap by default. Close other heavy apps if you have 8 GB of RAM total. The image ships with `ES_JAVA_OPTS=-Xms512m -Xmx512m` for low-memory laptops; participants on tight machines can stay at that setting.
- **Ports:** ES on `9200` (internal, app-to-ES); FastAPI on `8765` (bench-to-app). Both configurable in `docker-compose.yml` and `app/es.py` if there's a collision.
- **`--reload` caveat:** start uvicorn with `--reload` for the first sanity check, but **stop and restart uvicorn manually between bench runs after a fix**. Reload triggers re-import on edit, which can poison the first benchmark immediately after a code change.
- **Target model:** Opus 4.7 is the design target. Sonnet 4.6 is a supported fallback but is more likely to skip the slow log / timer output and propose surface-level fixes — the workshop's pivot moment is sharper on Opus 4.7.
- **Python:** 3.11+ required. `uv python install 3.11` recommended for participants without it.
- **ES DSL primer in the README:** participants who haven't written an Elasticsearch query before get a 1-page primer covering `term`, `terms`, `range`, `match_all`, `bool`/`must`/`filter`, and `aggs.terms` / `aggs.date_histogram`. Enough to orient — not a substitute for the docs.

## 8. The slow endpoint

`GET /dashboard/summary` returns:

```json
{
  "top_users": [
    {"user_id": "u_123", "username": "...", "activity_count_30d": 142},
    ...
  ],
  "org_summary": {
    "total_activities_30d": 47832,
    "unique_users_30d": 1023,
    "growth_rate_vs_prior_30d": 0.18
  }
}
```

### 8.1 Three layered causes of slowness (intentional)

The traps are deliberately tuned so two of three are *not* visible from reading `dashboard.py` alone. This is the design choice that defeats the "Claude Opus 4.7 finds it from code in turn 1" failure mode.

1. **N+1 search requests** *(visible from code reading)*. `top_users` is built by calling `es.count(index="activities", body={"query": {"term": {"user_id": ...}}})` once per user, instead of a single `terms` aggregation that returns all counts in one request. Claude will likely identify this from reading the code — that's fine. The pivot and falsification still apply, and the participant practices the discipline on a known-positive case.

2. **Aggregation on a `text`-mapped field** *(invisible from `dashboard.py` — the bug lives in the mapping)*. The endpoint runs a `terms` aggregation on `username`, but the index mapping in `docker/seed/mappings.json` has `"username": {"type": "text"}` instead of `"keyword"`. This forces fielddata loading on every aggregation request — orders of magnitude slower than the keyword path. The aggregation request code looks identical regardless of mapping; reading `dashboard.py` reveals nothing. Diagnosis requires `_search?profile=true`, the slow log, or inspecting the mapping directly.

3. **`query` context where `filter` should be used** *(invisible from any single file — same JSON shape, different semantics)*. The 30-day date range filter for `unique_users_30d` is in `query` context (uncacheable, runs scoring), not `filter` context (cacheable, no scoring). The same identical JSON shape produces dramatically different perf depending on which key it sits under. Code-reading sees a normal `bool.must` block. Diagnosis requires running the same request twice and noticing the second request *isn't* faster — the request cache isn't engaged.

The endpoint is **correct** — pytest tests pass against the seeded data. It's just slow.

### 8.2 Pre-instrumented timing

The endpoint wraps each phase in a named timer:

```python
with timer("load_top_users"):
    users = list_top_users(es)
with timer("count_per_user"):
    for u in users:
        u.activity_count_30d = count_user_activities(es, u.user_id)
with timer("compute_org_summary"):
    summary = compute_org_summary(es)  # contains username-agg + date-range filter
```

The timer logs to stdout in a parseable format:

```
[timer] load_top_users 12.3ms
[timer] count_per_user 2418.7ms
[timer] compute_org_summary 1180.2ms
```

The instrumentation is **deliberate**. It exists *so the agent has data to read*. Participants will be tempted to skip past it; the workshop forces them to use it.

Note that the as-shipped instrumentation has only three timer blocks. Causes #2 (text-mapped agg) and #3 (`query` vs `filter`) both live inside `compute_org_summary` — they are not split until step 6 of the arc, when Claude is asked to add finer-grained timers. This is part of the lesson: investigation often requires *adding* instrumentation to existing instrumentation, and on Elasticsearch the `?profile=true` flag and slow-log threshold are *also* instrumentation participants need to learn to enable.

### 8.3 Expected timing on a typical laptop

| State | Total response time |
|---|---|
| As-shipped (all three causes) | 5–10 s |
| After N+1 fix (terms aggregation) | 3–6 s |
| After mapping fix (`text` → `keyword`) | 200–500 ms |
| After `query` → `filter` context fix | 50–150 ms (cached path) / 200–400 ms (cold) |

ES baselines vary more than SQLite baselines because the container's heap, OS file cache, refresh cycle, and request-cache state all influence numbers. Participants record numbers on their own machine. **Relative improvements** matter; absolute numbers vary with hardware and ES container state. Pre-flight calibration against the pre-baked image is mandatory (see Section 14).

### 8.4 Test setup

`tests/test_dashboard.py` has 4 tests:
- shape of the response (top-level keys, list types)
- `top_users` sorted descending by `activity_count_30d`
- `org_summary` numeric fields are non-negative
- response is JSON-serializable

These pass green before any change. They protect against fixes that break correctness.

`tests/bench.sh` is a tiny script:

```bash
#!/usr/bin/env bash
for i in 1 2 3; do
  curl -s -w "Response time: %{time_total}s\n" -o /dev/null \
    http://localhost:8765/dashboard/summary
done
```

## 9. The arc — Option A (~45 min)

| # | Time | Action |
|---|---|---|
| 1 | 4 min | `docker compose -f docker/docker-compose.yml up -d` (~30-90s cold, ~10s warm), `uv pip install -e .` (or pip), `uvicorn app.main:app --port 8765 --reload`. Hit the endpoint with `curl`. Confirm it's slow. (Image must be pre-pulled — see pre-workshop steps in README.) |
| 2 | 3 min | Run `bash tests/bench.sh`. Observe 5–10s baseline. Look at the timing log output in the uvicorn console. |
| 3 | 5 min | Ask Claude (fresh session, workshop dir as cwd): *"This endpoint at `/dashboard/summary` is slow. Where is the time going?"* Claude proposes a hypothesis — likely without reading the timing logs first. |
| 4 | 10 min | **The pivot prompt:** *"Prove that. Run the bench script, look at the timer log output, and tell me which named timer block dominates."* Claude reads the actual data. The hypothesis often updates. Includes orientation friction (uvicorn console is a separate terminal — Claude needs to be told where to look). |
| 5 | 4 min | **The falsification prompt:** *"Now design a measurement that would falsify your hypothesis, not confirm it. Run it. Report what you find."* If the hypothesis survives the falsification attempt, it's load-bearing — proceed. If it collapses, return to step 4. |
| 6 | 5 min | If granularity is insufficient, have Claude add finer-grained timers inside the worst phase. Re-run, gather data. |
| 7 | 12 min | Have Claude propose and implement a fix for the top bottleneck **only**. Run `pytest` — must pass. Restart uvicorn (drop `--reload`). Run bench — must improve. |
| 8 | 3 min | Wrap-up: final measurement, what they'd fix next, finish. |

**Total: ~45 min.**

### 9.1 The pivot moment in step 4

This is the **pedagogical core** of the exercise. Claude's first hypothesis without data may be:

- "Probably need a higher `refresh_interval` on the index"
- "FastAPI's overhead — switch to the async ES client"
- "ES is slow on 50k docs — bulk requests would help"
- "The aggregation needs `_source` filtering"

Any of those *might* help. Participants don't know which. The pivot prompt forces Claude to read the timing logs, find that `count_per_user` dominates the wall-clock initially, and propose the actually-correct fix (replace the per-user `_count` loop with a single `terms` aggregation). Fixing that doesn't make the endpoint fast — it just shifts the dominant cost to `compute_org_summary`, which contains the two invisible traps (text-mapped agg, `query` vs `filter`). *That's* where the investigation discipline does real work, because reading `dashboard.py` reveals neither.

The falsification step (step 5) hardens the discipline further: even after Claude has data, it must design a measurement that *would have shown the hypothesis wrong* and run it. This is Popper's actual scientific method — confirmation is cheap; surviving falsification is what makes a hypothesis load-bearing. Roughly half the time the first data-grounded hypothesis collapses under its own falsification test, which is exactly the lesson moment.

The lesson is portable: **don't accept the first plausible hypothesis. Force proof. Then try to disprove the proof.**

### 9.2 The exact prompts (provided in workshop README)

**Pivot prompt** (after Claude's first hypothesis):

> Prove that hypothesis with data. Run `bash tests/bench.sh`, then read the timing log output from the uvicorn console. Tell me which named timer block dominates the wall-clock time, and quote the numbers verbatim. Only after you have the numbers, propose the fix.

**Falsification prompt** (after Claude's data-grounded hypothesis):

> Now design a measurement whose result would *falsify* this hypothesis — not confirm it. If you think `<phase X>` dominates, what would you expect to see if it actually didn't? Run that measurement and report what you find. Only proceed to a fix if the falsification attempt fails.

Both prompts are the workshop's portable artifacts — participants should be able to reuse them verbatim on their own production code on Monday. The general form (perf harness + structured instrumentation + named blocks + falsification) translates to any language and any domain. The README's closing slide should restate them in language-agnostic form:

> *"Prove that hypothesis with data. Run the perf harness, read the instrumentation output, tell me which named block dominates wall-clock time, and quote the numbers. Only after you have the numbers, propose the fix. Then try to falsify your own hypothesis before you accept it."*

## 10. The arc — Option B (~70 min)

Steps 1–8 from Option A unchanged.

| # | Time | Action |
|---|---|---|
| 9 | 10 min | After fix #1, re-measure. The endpoint is *still* slow — the dominant cost shifted to `compute_org_summary` but didn't go away. Have Claude investigate using `_search?profile=true` or by enabling the slow log. The profile reveals fielddata loading on the username field. |
| 10 | 10 min | Diagnose the mapping bug: inspect `docker/seed/mappings.json`, find `"username": {"type": "text"}`. Implement fix #2: either use `username.keyword` subfield in the aggregation (no re-index needed) or rebuild the index with `keyword` mapping. Measure. Big drop. |
| 11 | 8 min | After fix #2, the dominant cost is now the `query`-context date filter. Run the same request twice — second isn't faster, so the request cache isn't engaged. Diagnose: `must` block under `query` context vs `filter` context. Move the date range to `filter`. Re-bench: second request is now cached. |
| 12 | 4 min | Final measurement. Document before/after in a comment block at the top of `dashboard.py`. Discuss what *Monday equivalent* of each fix looks like in the participant's real ES setup. |

**Total: ~75 min.** Option B participant ends with an endpoint roughly 50–100x faster than as-shipped (less dramatic than the SQLite numbers because ES has different baseline costs), with three pieces of evidence that each fix did what was claimed — *and* with two of three fixes that they could not have found by reading the source alone.

## 11. Verification commands

Participants run these throughout:

```bash
pytest                       # correctness
bash tests/bench.sh          # latency
ruff check app               # lint (no agent-introduced syntax errors)
mypy app                     # type sanity
```

A successful exercise ends with:
- pytest green
- bench script showing measurable improvement
- ruff and mypy green
- a clear narrative the participant can speak: *"the bottleneck was X (per the logs); we fixed it by Y; the new measurement is Z."*

## 12. What participants learn (the takeaway, restated)

The portable skill is the **pivot prompt** in step 4 and the discipline behind it:

> When an agent proposes a hypothesis, ask it to prove the hypothesis with data — and only accept the proven version.

Subordinate lessons:

- **Falsification beats confirmation.** Designing a measurement that *would* disprove your hypothesis is a stronger move than running one that confirms it. Half the time the first data-grounded hypothesis collapses under its own falsification test.
- Reading existing instrumentation is faster than adding new instrumentation.
- Incremental measured fixes are more reliable than rewrites.
- The first bottleneck masks the next bottleneck — perf work is layered.
- pytest + bench + ruff form a tight feedback loop the agent can run autonomously.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Hardware variance distorts numbers | Express improvements as relative ("got 6x faster"), not absolute |
| Claude solves the first trap (N+1) instantly from code-reading | Designed in: trap #1 is intentionally visible; the lesson on trap #1 is *practicing the discipline on a known answer*. Traps #2 (text mapping) and #3 (`query` vs `filter`) are not visible from `dashboard.py`, so the discipline does real work in steps 9-11 of Option B. Falsification step in step 5 also stress-tests easy answers. |
| Opus 4.7 vs Sonnet 4.6 behavior split | Target model is Opus 4.7. Sonnet 4.6 is a supported fallback but more likely to skip slow log / `?profile=true` and propose surface-level fixes — facilitator must validate the script against both at pre-flight |
| Docker not installed or Docker Desktop not running | Workshop README states Docker as a prerequisite; participants pre-pull the image before the session; facilitator has a fallback procedure for participants who can't get Docker working (pair with someone who can) |
| ES container OOM on low-memory laptops | Image ships with `ES_JAVA_OPTS=-Xms512m -Xmx512m` by default; setup notes warn 8GB-RAM participants to close other apps |
| ES image pull bandwidth constrained at workshop venue | Pre-workshop instructions require pulling the image at home; facilitator brings a USB stick with `docker save` tarball as fallback |
| ES version drift (image rebuild needed) | Image tagged with semver (`v1.0.0`); `pyproject.toml` pins `elasticsearch-py` to compatible major; image rebuild documented in `docker/Dockerfile` |
| Windows participants cannot run `bash bench.sh` | README requires Git Bash or WSL on Windows (matches existing BMAD/GSD READMEs); Docker Desktop with WSL2 backend recommended |
| Three-terminal setup (uvicorn, Claude, bench; ES detached) overwhelms small screens | Setup notes (Section 7.1) state the requirement up front; recommend tile windows or use `tmux` / Windows Terminal panes |
| `uvicorn --reload` triggers re-import on edit and poisons the first benchmark after a fix | Setup notes recommend stopping/restarting uvicorn between bench runs after fixes; use `--reload` only during initial sanity check |
| Port 9200 (ES) or 8765 (FastAPI) already in use | `docker-compose.yml` and `app/es.py` document how to remap; troubleshooting in `reference/option-a-sample-run.md` |
| `uv pip install -e .` PATH issues on Windows | Document `pip install -e .` fallback; verify `uv` is on PATH in setup notes |
| Participant copy-pastes Option A sample run | Same convention as existing BMAD/GSD handsons — sample run is troubleshooting, not the answer key |
| Claude gets stuck in a debugging spiral | Workshop README warns: if Claude has been wrong twice in a row, restart the session. Real production discipline. |
| Seed data is small enough that ES caches everything and traps don't surface | Pre-flight tunes seed size and refresh behavior so trap #2 and #3 are observable on the target hardware (laptop-class) |
| FastAPI / `elasticsearch-py` version mismatches | `pyproject.toml` pins versions; image and client tested together; `uv` recommended in setup |
| Participant lacks Python 3.11+ | README states minimum version up front, with `uv python install` instructions |
| Participant has never written ES query DSL | README ships a 1-page primer on `term`, `terms`, `range`, `bool/must/filter`, `aggs.terms`, `aggs.date_histogram` — enough to orient |
| Lesson stays "ES-specific" in non-ES participants' heads | Appendix B translates the workshop primitives (slow log, mapping-as-config, `query` vs `filter` cache context, pivot/falsification prompts) to Postgres / MongoDB / Spark equivalents |

## 14. Setup of facilitator-side artifacts

- **Docker image build & test (one-time, then on revision):** facilitator builds the workshop ES image from `docker/Dockerfile`, tests on Mac/Windows/Linux, tags with semver, and pushes to a registry participants can pull from (e.g., `ghcr.io/<org>/perf-workshop-es:v1.0.0`). Alternative: distribute as `docker save` tarball. Image rebuild needed when ES version, mappings, or seed data change.
- **Pre-workshop email (1 week before):** participants receive Docker prerequisite, image pull command, and a 5-minute "did it pull and run?" smoke test. Catches Docker setup issues at home, not at the workshop.
- **Pre-flight check (24 hours before workshop):** facilitator runs through Option A on a fresh clone with the published image, confirms timings are within expected range, confirms current Claude (target: Opus 4.7) does not solve step 3 in one shot *and* does not find traps #2 and #3 from code-reading alone, validates against Sonnet 4.6 fallback. The 24-hour lead time exists so the image can be rebuilt or seed data re-tuned if any of those properties have drifted — a 15-minute pre-flight is too late to fix anything.
- **Target model:** Opus 4.7. Sonnet 4.6 is a supported fallback. The facilitator script must be validated against both at pre-flight.
- **Failure-mode runbook:** included in `reference/option-a-sample-run.md`. Five documented failure modes: (a) Claude finds the right cause too fast, (b) Claude proposes a fix that doesn't measurably help, (c) bench script numbers don't change after fix, (d) Docker image fails to start or ES doesn't reach `green`/`yellow`, (e) ES request cache is "warm" from a prior bench, masking the trap #3 fix.
- **No CLAUDE.md / AGENTS.md is shipped.** This is intentional. Part of the lesson is that the agent has to discover the structure on its own — adding context files would short-circuit the investigation.

## 15. Out of scope

- Async/await refactoring (the slowness is not async-related; teaching participants to "make it async" would teach a wrong lesson here).
- ES cluster operations (sharding, replica strategy, snapshot/restore) — single-node workshop ES is intentional.
- Reindex strategies and zero-downtime migrations (mention but don't drill into trap #2's full re-index path).
- Production deployment, k8s, observability stack beyond ES slow log (excellent follow-on workshops).
- Frontend integration.
- Authentication / authorization (the workshop ES image disables security; this is single-node localhost only).
- ES vector search, ML features, ESQL, or anything outside core query/aggs.

## 16. Expected commit shape after a clean run

Following the BMAD workshop's commit-shape convention:

```
Workshop starting point
fix: replace per-user _count loop with single terms aggregation
```

Option B adds two more commits:

```
fix: aggregate on username.keyword to avoid fielddata on text field
fix: move date range to filter context for request-cache hit
```

## 17. Open questions

None remaining after self-review.

---

## Appendix A — Mapping to existing workshop conventions

| Convention | This handson |
|---|---|
| Top-level directory naming | `fastapi-perf-investigation-workshop/` (matches `one-shot-task-dashboard-bmad-workshop/`) |
| Option A / Option B time budget | 40-45 min / 70-75 min (matches BMAD's 30-40 min / longer) |
| `reference/option-a-sample-run.md` | Yes (matches BMAD) |
| Verification via tests + manual | Yes (`pytest` + `bench.sh` + manual smoke) |
| Existing-codebase pedagogy | Yes — endpoint exists, participant investigates and improves |
| Single bounded scope | Yes — one endpoint, no scope creep |
| Pre-built Docker image as workshop artifact | New — no precedent in existing BMAD/GSD/research-report exercises. Justified because the participants' production stack is ES, and Docker is the cleanest way to ship a pre-seeded, mapping-broken ES single-node cluster. |

---

## Appendix B — Translate to your world

The workshop tech (Elasticsearch + FastAPI) matches the participants' production stack. This appendix exists for the case where a participant *also* works with adjacent stacks and wants to carry the discipline across:

| Workshop primitive (ES) | Postgres / SQL | MongoDB | Spark / Trino / dbt |
|---|---|---|---|
| `bash tests/bench.sh` | `pgbench`, query timing, APM percentile widget | `mongostat`, query timing | `EXPLAIN`, Spark UI, dbt run timing |
| `_search?profile=true` + slow log | `EXPLAIN ANALYZE`, `auto_explain`, slow query log | `db.system.profile`, `explain("executionStats")` | Spark UI stage view, Trino query plan, dbt `--debug` |
| Named timer blocks (`with timer("phase"):`) | Sentry/Datadog/New Relic span names; pg span events | APM span names | Spark stage timing, dbt model timing |
| Mapping-as-config (text vs keyword bug) | DB indexes, column types, partial indexes | Index definitions, sparse indexes | Partition columns, file format, Z-order columns |
| `query` vs `filter` cache context | Materialized views, query-result caches, prepared-statement plans | hint(), index intersection | Result caching layers, broadcast hints, predicate pushdown |
| Pivot prompt (*"Prove that. Read the instrumentation."*) | Identical wording | Identical | Identical |
| Falsification prompt (*"Design a measurement that would falsify..."*) | Identical | Identical | Identical |

The two prompts are stack-agnostic. The instrumentation that fills them in differs by domain; the discipline does not.

The portable habit, restated for any audience:

> When an agent says "the bottleneck is X," ask it to (1) prove with the instrumentation your stack provides, (2) design a measurement that would *falsify* the hypothesis, and (3) only propose a fix after both. Instrumentation differs by stack. Discipline does not.
