---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-07T08:28:37Z"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 11
  completed_plans: 10
  percent: 40
---

# STATE.md — FastAPI Perf Workshop

> Project memory. Updated by the orchestrator and phase agents as work proceeds.
> Authoritative project statement: `.planning/PROJECT.md`.

---

## Project Reference

- **Name:** FastAPI Perf Workshop
- **Deliverable:** `fastapi-perf-investigation-workshop/` — a backend-Python
  workshop teaching investigation discipline (force the agent to prove with data,
  then design a measurement that would falsify) on a deliberately slow FastAPI +
  Elasticsearch endpoint with three layered perf traps.

- **Core value:** Participants leave with two stack-agnostic prompts (pivot +
  falsification), a measurable before/after narrative, and the discipline that
  closes the gap between agentic coding's biggest strength (skimming logs and
  proposing hypotheses fast) and its most consistent failure (defending
  wrong-but-plausible hypotheses under casual questioning).

- **Target runtime:** Claude Code (Claude as the implementer; Opus 4.7 is the
  workshop's design-target model for participants).

- **Granularity:** standard (5-8 phases)
- **Phase count:** 5
- **Source ingest:** single SPEC,
  `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md`
  (high confidence, not locked, no competing variants).

## Current Focus

Phase 3 UAT found three executable-command gaps in the Option B trap #2 path.
The shipped automated gates still pass, but the profile command is rejected by
Elasticsearch 9.3.3 and the documented participant `username.keyword` fix
conflicts with the current default pytest suite. Plan `03-04` is ready for gap
closure.

## Current Position

- **Phase:** 3
- **Plan:** 4 of 4
- **Status:** UAT gaps found; ready to execute gap closure
- **Progress:** `[####      ]` 40% by phase (2 of 5 phases complete);
  91% by planned plan count (10 of 11 plans complete)

```
Phase 1: Tracer Slice — Workshop Motion End-to-End            [##########] Complete (3/3 plans)
Phase 2: Option A Complete Vertical                           [##########] Complete (4/4 plans)
Phase 3: Option B Trap #2 Narrative — Mapping & profile       [#######   ] UAT gaps found (3/4 plans)
Phase 4: Option B Trap #3 + Workshop Polish                   [          ] Not started
Phase 5: Dual-Model Pre-Flight Validation                     [          ] Not started
```

## Performance Metrics

> Updated as phases complete. Metrics are observable from the deliverable, not
> from process artifacts.

- **Phases complete:** 2 / 5
- **Plans complete:** 10 / 11
- **v1 requirements satisfied:** 4 / 7
- **Verification gates passing in deliverable:** Phase 1 and Phase 2 gates
  passing; Phase 3 automated gates pass but UAT gaps are open

  - `docker compose -f docker/docker-compose.yml config`: passing
  - `uv run pytest`: passing (9 tests)
  - `uv run ruff check app`: passing
  - `mypy app`: passing
  - Phase 2 README/reference static checks: passing
  - Phase 3 README/reference static checks: passing
  - Phase 3 UAT: complete, 2 passed / 3 issues; `03-04` planned
  - `CLAUDE.md` / `AGENTS.md` absence check: passing
  - live Docker seed and timing calibration after Phase 2: passing under the
    relative-improvement contract; current VM rerun measured
    3.178/1.850/1.605 s before the Option A fix and 0.114/0.098/0.085 s after
    it.

- **Facilitator pre-flight status:** not yet attempted (Phase 5)

## Accumulated Context

### Decisions

> No locked decisions (no ADRs in the ingest set). Five non-locked design
> choices recorded in `.planning/PROJECT.md` for traceability:
> - `DESIGN-CHOICE-backend-stack-elasticsearch`
> - `DESIGN-CHOICE-pedagogy-investigation-discipline`
> - `DESIGN-CHOICE-target-model-opus-4-7`
> - `DESIGN-CHOICE-docker-as-distribution`
> - `DESIGN-CHOICE-no-claude-md-shipped`
>
> Downstream phases bind on the structural constraints in
> `.planning/intel/constraints.md`, not on these non-locked choices abstractly.

### Open Todos

None.

### Blockers

None.

### Risks (carried from SPEC §13 / `.planning/intel/context.md` "Risks and

mitigations registry")

Active to monitor in later phases:

- ES baseline variance across hardware → relative improvements are the binding
  measure; pre-flight calibration mandatory at Phase 5.

- Opus 4.7 vs Sonnet 4.6 behaviour split → Phase 5 validates both.
- Seed data small enough that ES caches everything and traps don't surface →
  Phase 2 added the intended trap shape; Phase 5 must calibrate live timings on
  the published image and target hardware.

- Three-terminal setup overwhelming small screens → README setup section
  established in Phase 1 (stub) and finalized as the polished version through
  Phase 2/4 README work.

- `uvicorn --reload` benchmark noise after a fix → addressed in the Phase 1
  README setup section by restarting without `--reload` for benchmark
  comparisons and treating the first post-restart iteration as warm-up.

## Session Continuity

### What just happened (this session)

- Planned Phase 2 with three executable plans under
  `.planning/phases/02-option-a-complete-vertical/`: runtime hidden traps
  (`02-01`), trap-shape tests (`02-02`), and Option A docs/reference (`02-03`).
  Research, validation, and pattern-map artifacts were created for the phase.

- Executed all three Phase 2 plans. Runtime work added the Phase 2 username
  mapping, stale-mapping reseed guard, and `compute_org_summary` trap shape.
  Test work expanded `tests/test_dashboard.py` to six tests and locked the
  mapping/query shape. Docs work replaced the tracer README/reference with the
  complete Option A arc and facilitator answer key.

- Verification passed: `uv run pytest -q`, `uv run ruff check app
  tests/test_dashboard.py`, `uv run mypy app`, Phase 2 doc greps,
  `test ! -f CLAUDE.md && test ! -f AGENTS.md`, and Docker Compose config.

- Completed Phase 2 traceability updates in `ROADMAP.md`, `REQUIREMENTS.md`,
  and `STATE.md`.

- Shipped Phase 2 by pushing branch
  `feat/fastapi-perf-workshop-phase-2-option-a` and opening PR #3:
  https://github.com/stcomiin/claude-docs-workshop-handson/pull/3.
  Before opening the PR, reran `uv run pytest -q`, `uv run ruff check app
  tests/test_dashboard.py`, `uv run mypy app`, Phase 2 README/reference static
  checks, `CLAUDE.md` / `AGENTS.md` absence checks, and
  `docker compose -f docker/docker-compose.yml config`.

### Prior planning history

- Planned Phase 1 with three executable wave-based plans under
  `.planning/phases/01-tracer-slice-workshop-motion-end-to-end/`: Docker/seed
  (`01-01`), FastAPI endpoint/tests (`01-02`), and bench/README/reference docs
  (`01-03`). Research, validation, and pattern-map artifacts were also created.

- Audited the original 5-phase roadmap and found that despite the doc claiming
  "vertical slices", the phases were sliced **horizontally** by directory
  (docker → app → tests → README → preflight). Symptoms: strict linear
  dependency chain, lopsided requirement ownership (Phase 4 owned 4 of 7
  reqs), no end-to-end integration possible until Phase 5.

- Re-cut the 5 phases as **tracer-bullet vertical slices**: Phase 1 ships a
  thin end-to-end motion (full directory layout, 50k seed, trap #1 only,
  README stub with pivot prompt only). Phase 2 makes Option A a complete
  vertical (adds traps #2/#3 physically, full Option A arc). Phase 3 lands
  Option B steps 9-10 (trap #2 narrative). Phase 4 lands Option B steps 11-12

  + polish (trap #3, ES DSL primer, Appendix B, closing slide, full
  failure-mode runbook). Phase 5 unchanged in spirit — dual-model pre-flight,
  but now validating an already-integrated workshop.

- Reassigned requirement ownership: Phase 1 owns REQ-no-out-of-scope-drift +
  REQ-correctness-preserved; Phase 2 owns REQ-measured-fix-option-a +
  REQ-investigation-discipline-takeaway; Phase 3 owns
  REQ-investigation-uses-instrumentation; Phase 4 owns REQ-measured-fix-option-b

  + REQ-portable-prompt-artifacts; Phase 5 still validation-only. 7/7 mapped.
- Files updated: `ROADMAP.md` (full rewrite), `STATE.md` (this section,
  Current Position, Risks), `REQUIREMENTS.md` (traceability table), `PROJECT.md`
  (Current Focus phase summary line). `intel/*` and `INGEST-CONFLICTS.md`
  unchanged — constraints and conflicts are upstream of phasing.

- After tracer-bullet refactor, ran a Codex review against the PR. Codex
  flagged three substantive technical errors in the SPEC's trap definitions:
  (a) `username` as `{"type": "text"}` would *fail* with `fielddata is disabled`
  rather than be slow, breaking the "endpoint is slow but correct" premise;
  (b) `username.keyword` doesn't exist if `username` is only `text`, so the
  Phase 3 "no re-index" fix path dead-ends; (c) ES request-cache eligibility
  isn't determined by `query` vs `filter` alone — it depends on the whole
  search shape (`size: 0`, deterministic body, no relative `now`), so trap #3
  as written would be unreliable. Fixed at the SPEC source and propagated
  through `intel/constraints.md`, `intel/requirements.md`, `PROJECT.md`,
  `REQUIREMENTS.md`, and `ROADMAP.md`. Trap #2 now uses a multi-field mapping
  (`text + fielddata: true` with a `keyword` subfield) so the agg is slow but
  runs and the no-reindex fix path is real. Trap #3 is now framed as two
  coupled defects (`query` context + millisecond-precise `now-30d`); the fix
  moves to `filter` context AND rounds to `/d`. Commit message #3 updated
  accordingly: `fix: move date range to filter context, round now to day for
  cache hit`.

### Prior session

- Single-doc SPEC ingest synthesized into per-type intel
  (`.planning/intel/{SYNTHESIS,requirements,constraints,decisions,context}.md`).

- Conflicts report: 0 blockers, 0 competing variants, 0 auto-resolved.
- PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md all created from intel
  with the (now-superseded) horizontal phasing.

### What happens next (next session)

- Execute Phase 3 UAT gap closure: `/gsd-execute-phase 3 --gaps-only`.

- Gap closure should fix the profile command form and align participant
  post-fix verification with the shipped starting-state guard tests before
  Phase 4 starts.

### Files to keep in working memory

- `.planning/PROJECT.md` — core value + constraints + non-locked design choices
- `.planning/REQUIREMENTS.md` — 7 reqs + traceability table
- `.planning/ROADMAP.md` — 5 phases with goals + success criteria
- `.planning/intel/SYNTHESIS.md` — ingest summary (entry point to per-type intel)
- `.planning/intel/constraints.md` — 18 binding constraints (authoritative)
- `.planning/intel/requirements.md` — full requirement entries with §-references
- `.planning/intel/context.md` — workshop background, audience, risks registry
- `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md`
  — source SPEC (cross-check during phase planning)
