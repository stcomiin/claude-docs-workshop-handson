# PROJECT.md — FastAPI Perf Workshop

> Authoritative project statement. Synthesized from a single-doc SPEC ingest:
> `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md`.
> See `.planning/intel/SYNTHESIS.md` for the ingest summary.

---

## Core Value

A backend-Python workshop deliverable that teaches **investigation discipline** to
backend developers and data engineers in Elasticsearch-based stacks. The lesson —
restated stack-agnostically — is:

> When an agent says "this is slow because X," the right answer is never "OK, fix X."
> It's **"prove that's where the time is, then fix the proven cause."**
> Force the agent to **prove with data** (read the instrumentation), then design a
> measurement that would **falsify** the hypothesis before accepting it.

Participants leave with two reusable, stack-agnostic prompts (the *pivot prompt* and
the *falsification prompt*) and a measurable before/after narrative they can carry
into Monday-morning production work.

The deliverable is the workshop directory `fastapi-perf-investigation-workshop/`,
which fills a gap in the existing handson set: the BMAD/GSD/research-report
exercises lean frontend or document-output and don't speak directly to backend devs
or data scientists who are judged by *measured outcomes* (latency, throughput,
statistical correctness).

## Current Focus

Phase 3 gap closure is complete. The workshop now covers Option A plus Option B
steps 9-10 with a live-tested Profile API request-body command, slow-log
evidence path, mapping inspection, and a participant post-fix verification
command that does not conflict with shipped pre-fix trap-shape guards. Phase 4
is next: trap #3, the ES DSL primer, Appendix B, closing-slide restatement, and
the full facilitator runbook.

## Constraints (binding)

These are mirrored from `.planning/intel/constraints.md` — the authoritative
copies live there with full provenance back to the SPEC sections.

### Structural / filesystem

- **Deliverable directory:** `fastapi-perf-investigation-workshop/` at the repo
  root, naming convention matches existing `one-shot-task-dashboard-{bmad,gsd}-workshop/`
  peers. The `.planning/` tree lives **inside** this deliverable directory, not at
  the repo root. (`CON-deliverable-directory-layout`)
- **No `CLAUDE.md` / `AGENTS.md` shipped** with the workshop. Intentional — part
  of the lesson is that the agent must discover the structure on its own.
  (`CON-no-claude-md-shipped` / `DESIGN-CHOICE-no-claude-md-shipped`)

### Artifact contracts

- **Docker image is the primary distribution artifact.** Pre-baked with
  Elasticsearch (pinned), an intentionally-wrong index mapping, ~50k seeded
  activity documents, cluster status `green` on first startup. Tagged with semver
  and pushed to a registry; `docker save` tarball as bandwidth-fallback.
  (`CON-docker-image-contract` / `DESIGN-CHOICE-docker-as-distribution`)
- **Endpoint:** `GET /dashboard/summary` returns the response shape in
  `CON-endpoint-response-shape` and MUST be functionally correct (intentionally
  slow, never buggy).
- **Three layered, intentional perf traps** in `dashboard.py` and the seed
  mapping (`CON-three-layered-perf-traps`):
  1. N+1 `_count` requests per user (visible from code-reading)
  2. Aggregation on the `text + fielddata: true` parent of a `username` multi-field
     instead of its already-existing `.keyword` subfield (invisible from
     `dashboard.py` — defect lives in the mapping; agg runs slowly rather than
     erroring because `fielddata: true` is enabled)
  3. Date-range filter under `query` context AND using non-rounded `now-30d`
     date math (invisible — two coupled defects in one place; together they
     prevent both filter-cache and request-cache hits)
  Two of three MUST NOT be diagnosable from code-reading alone — that's the
  pedagogical core.
- **Pre-instrumented timing** via `with timer("name"):` context manager in
  `app/timing.py`. Exactly three timer blocks as-shipped: `load_top_users`,
  `count_per_user`, `compute_org_summary`. Logs to stdout in the parseable format
  `[timer] <name> <ms>ms`. (`CON-pre-instrumented-timing`)
- **Test contract:** `tests/test_dashboard.py` MUST contain 4 green tests:
  response shape, sort order, non-negative numerics, JSON-serializability.
  (`CON-test-suite-shape`)
- **Bench harness:** `tests/bench.sh` runs the curl loop **3 times in sequence**
  so participants can observe (or fail to observe) request-cache warm-up — that
  three-run shape is load-bearing for diagnosing trap #3. (`CON-bench-script`)
- **Verification gates:** `pytest`, `bash tests/bench.sh`, `ruff check app`,
  `mypy app` — all four MUST be runnable throughout the exercise.
  (`CON-verification-commands`)

### Performance targets (relative, not absolute)

ES baselines vary more than SQLite baselines (heap, OS file cache, refresh cycle,
request-cache state). **Relative improvements are the binding measure.**
Pre-flight calibration against the pre-baked image is mandatory.
(`CON-expected-timings`)

| State | Total response time |
|---|---|
| As-shipped | 5–10 s |
| After N+1 fix | 3–6 s |
| After mapping fix | 200–500 ms |
| After `query` → `filter` fix | 50–150 ms cached / 200–400 ms cold |

### Workshop pedagogy

- **Option A (~40-45 min):** investigation discipline + one measured fix
  (visible N+1) + Popper-style falsification step. Lands the core lesson.
  (`CON-option-a-arc`)
- **Option B (~70-75 min):** full perf-engineering loop including the two
  invisible traps. Three commits, ~50-100x faster than as-shipped.
  (`CON-option-b-arc`)
- **Pivot prompt** and **falsification prompt** in README verbatim, plus
  stack-agnostic restatement. (`CON-pivot-and-falsification-prompts`)
- **Target model: Opus 4.7.** Sonnet 4.6 is supported fallback. Facilitator
  MUST validate against both at pre-flight. (`CON-target-model` /
  `DESIGN-CHOICE-target-model-opus-4-7`)

### Setup prerequisites (surfaced in README)

Docker required (Desktop on Mac/Windows; Engine on Linux). Three terminals:
`uvicorn`, `claude`, harness/tests. ES container ships with
`ES_JAVA_OPTS=-Xms512m -Xmx512m` for low-memory laptops. ES on `9200`, FastAPI on
`8765`. Python 3.11+. Git Bash or WSL for Windows. `--reload` only for first
sanity check; restart without `--reload` for benchmark comparisons after a fix
and treat the first post-restart iteration as warm-up.
(`CON-setup-prerequisites`)

### Facilitator runbook

- Build & test image, tag with semver, push to registry (one-time, then on
  revision).
- Pre-workshop email 1 week prior: prerequisite + image pull + 5-min smoke test.
- 24-hour pre-flight: run Option A on a fresh clone with the published image,
  confirm timings, confirm Opus 4.7 does NOT solve step 3 in one shot AND does
  NOT find traps #2/#3 from code-reading alone, validate Sonnet 4.6 fallback.
- `reference/option-a-sample-run.md` documents 5 failure modes:
  (a) Claude finds the cause too fast, (b) fix doesn't measurably help, (c)
  bench numbers don't change after fix, (d) Docker image won't start /
  cluster doesn't reach green/yellow, (e) ES request cache warm from prior
  bench masks trap #3 fix.
  (`CON-facilitator-preflight`)

### Expected commit shape (participant's git history after a clean run)

Following BMAD workshop convention (`CON-expected-commit-shape`):

```
Workshop starting point
fix: replace per-user _count loop with single terms aggregation
```

Option B adds:

```
fix: aggregate on username.keyword to avoid fielddata on text field
fix: move date range to filter context, round now to day for cache hit
```

## Out of Scope (hard "do not implement" list)

From SPEC §15 — `CON-out-of-scope`:

- **Async/await refactoring.** Slowness is not async-related. Teaching "make it
  async" would teach a wrong lesson — the workshop fights this hypothesis on
  purpose.
- **ES cluster operations** — sharding, replica strategy, snapshot/restore.
- **Reindex strategies and zero-downtime migrations** — mention but do not drill.
- **Production deployment** — k8s, observability stack beyond ES slow log.
- **Frontend integration.**
- **Authentication / authorization.** Workshop ES image disables security;
  single-node localhost only.
- **ES vector search, ML features, ESQL,** or anything outside core query/aggs.

Reflected throughout this PROJECT.md so phases don't drift. `REQ-no-out-of-scope-drift`
gates this at the deliverable level.

## Decisions

> **No locked decisions.** The ingest set contains 0 ADRs. The five entries below
> are **non-locked design choices** with explicit considered-alternatives rationale,
> recorded for traceability. Downstream phases bind on the structural constraints
> in `constraints.md` (which mirror these where structurally relevant), not on
> these choices abstractly. A future ADR may revise any of them.

### Non-locked design choices

#### `DESIGN-CHOICE-backend-stack-elasticsearch`

- **Choice:** Elasticsearch (single-node, Docker-distributed) as the workshop
  datastore.
- **Why:** Matches the audience's production stack (search, observability, log
  analytics). ES perf gotchas (mapping-as-config, `query` vs `filter` context)
  resist code-reading shortcuts — both factors strengthen the lesson.
- **Rejected alternatives:** SQLite + pandas-as-database (textbook patterns Opus
  recognizes from training, defeats the prove-with-data lesson); OIDC on FastAPI
  (excludes data scientists, mostly copy-from-docs); Marimo notebook → tested
  module (mechanical refactoring, agents finish too quickly); Python collector
  with parallel agents (echoes existing TS dashboard exercise).
- **Binds via constraint:** `CON-three-layered-perf-traps`.

#### `DESIGN-CHOICE-pedagogy-investigation-discipline`

- **Choice:** Teach investigation discipline ("force the agent to prove its
  hypotheses with measurement before accepting them") via a deliberately slow
  endpoint with three layered perf traps and explicit pivot + falsification
  prompts.
- **Why:** Existing handsons teach pattern-following ("understand the codebase,
  follow conventions, stay in scope"). This handson teaches the second half of
  competent agentic coding: investigation discipline.
- **Note:** Portable artifacts (the two prompts) are intentionally stack-agnostic.
  Translate-to-your-world (Appendix B) maps ES primitives to Postgres / MongoDB /
  Spark equivalents but explicitly notes the prompts are stack-agnostic.
- **Binds via constraint:** `CON-pivot-and-falsification-prompts`.

#### `DESIGN-CHOICE-target-model-opus-4-7`

- **Choice:** Opus 4.7 is the design target; Sonnet 4.6 is a supported fallback.
- **Why:** Sonnet 4.6 is more likely to skip the slow log / `?profile=true` and
  propose surface-level fixes — the workshop's pivot moment is sharper on
  Opus 4.7. Per the SPEC: "current Claude (target: Opus 4.7) does not solve
  step 3 in one shot *and* does not find traps #2 and #3 from code-reading alone."
- **Binds via constraint:** `CON-target-model`, `CON-facilitator-preflight`.

#### `DESIGN-CHOICE-docker-as-distribution`

- **Choice:** Pre-built Docker image as primary distribution artifact;
  `docker save` tarball as bandwidth-constrained-venue fallback.
- **Why:** Participants' production stack is ES, and Docker is the cleanest way
  to ship a pre-seeded, mapping-broken ES single-node cluster. New convention —
  no precedent in existing BMAD/GSD/research-report exercises (see Appendix A).
- **Binds via constraint:** `CON-docker-image-contract`.

#### `DESIGN-CHOICE-no-claude-md-shipped`

- **Choice:** No `CLAUDE.md` / `AGENTS.md` shipped with the workshop.
- **Why:** Part of the lesson is that the agent must discover the structure on
  its own. Adding context files would short-circuit the investigation.
- **Binds via constraint:** `CON-no-claude-md-shipped` (structural — referenced
  by the workshop README and the directory layout).

## Success Metric (developer-facing)

The workshop ships and runs end-to-end on a fresh laptop, lands the
investigation-discipline lesson (Option A baseline), and produces measurable
improvement (Option B). Operationalized:

1. A participant on a fresh laptop with Docker installed can run
   `docker compose up -d`, install Python deps, start `uvicorn`, hit
   `/dashboard/summary`, and observe a 5–10 s response.
2. Following the README's Option A arc with Opus 4.7, the participant produces
   one commit (`fix: replace per-user _count loop with single terms aggregation`)
   and a measurable improvement (5–10 s → 3–6 s) with `pytest`, `ruff`, `mypy`
   green.
3. Following Option B, the participant produces three commits and reaches
   50–150 ms cached / 200–400 ms cold.
4. The participant can articulate the one-sentence takeaway and has practiced
   both the pivot prompt and the falsification prompt at least once.
5. Facilitator pre-flight (24-hour gate) passes against both Opus 4.7 and
   Sonnet 4.6.

## Where Things Live

- **Intel** (synthesized from the source SPEC):
  `.planning/intel/{SYNTHESIS,requirements,constraints,decisions,context}.md`
- **Source SPEC** (cross-check):
  `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md`
- **Sibling workshop directories** (peers, NOT in scope, naming reference only):
  `one-shot-task-dashboard-{bmad,gsd}-workshop/`,
  `research-report-generation-workflow-{starter,completed}/` at repo root.
- **Conflicts report:** `.planning/INGEST-CONFLICTS.md` (0 blockers, 0 competing
  variants, 0 auto-resolved — single-doc high-confidence ingest).
