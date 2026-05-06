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

Roadmap restructured from horizontal layering (docker → app → tests → docs →
preflight) to **tracer-bullet vertical slices** (motion → Option A → Option B
trap #2 → Option B trap #3 + polish → dual-model preflight). Phase 1 not yet
started.

## Current Position

- **Phase:** 1 — Tracer Slice — Workshop Motion End-to-End
- **Plan:** None (no plans created yet)
- **Status:** Not started
- **Progress:** `[          ]` 0% (0 of 5 phases complete)

```
Phase 1: Tracer Slice — Workshop Motion End-to-End            [          ] Not started
Phase 2: Option A Complete Vertical                           [          ] Not started
Phase 3: Option B Trap #2 Narrative — Mapping & profile       [          ] Not started
Phase 4: Option B Trap #3 + Workshop Polish                   [          ] Not started
Phase 5: Dual-Model Pre-Flight Validation                     [          ] Not started
```

## Performance Metrics

> Updated as phases complete. Metrics are observable from the deliverable, not
> from process artifacts.

- **Phases complete:** 0 / 5
- **Plans complete:** 0 / 0
- **v1 requirements satisfied:** 0 / 7
- **Verification gates passing in deliverable:** N/A (no code yet)
  - `pytest`: not yet runnable
  - `bash tests/bench.sh`: not yet runnable
  - `ruff check app`: not yet runnable
  - `mypy app`: not yet runnable
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

None — phases are derived but no plans yet.

### Blockers

None.

### Risks (carried from SPEC §13 / `.planning/intel/context.md` "Risks and
mitigations registry")

Active to monitor during execution:

- ES baseline variance across hardware → relative improvements are the binding
  measure; pre-flight calibration mandatory at Phase 5.
- Opus 4.7 vs Sonnet 4.6 behaviour split → Phase 5 validates both.
- Seed data small enough that ES caches everything and traps don't surface →
  Phase 2 must tune seed size and refresh behavior so traps #2 and #3 are
  observable on laptop-class hardware once they're added on top of Phase 1's
  tracer baseline.
- Three-terminal setup overwhelming small screens → README setup section
  established in Phase 1 (stub) and finalized as the polished version through
  Phase 2/4 README work.
- `uvicorn --reload` poisoning the first benchmark after a fix → addressed in
  the Phase 1 README stub setup section ("manual restart between bench runs
  after a fix") and reaffirmed in Phase 2's Option A arc.

## Session Continuity

### What just happened (this session)

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

### Prior session

- Single-doc SPEC ingest synthesized into per-type intel
  (`.planning/intel/{SYNTHESIS,requirements,constraints,decisions,context}.md`).
- Conflicts report: 0 blockers, 0 competing variants, 0 auto-resolved.
- PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md all created from intel
  with the (now-superseded) horizontal phasing.

### What happens next (next session)

- Plan Phase 1: `/gsd-plan-phase 1` (Tracer Slice — Workshop Motion
  End-to-End). Phase 1 stubs the **entire** `CON-deliverable-directory-layout`
  but only fills in: `docker/Dockerfile`, `docker/docker-compose.yml`,
  `docker/seed/mappings.json` (with `username` correctly mapped as `keyword`
  — trap #2 lands in Phase 2, NOT Phase 1), `docker/seed/build_seed.py`
  (~50k documents), `app/{__init__,main,es,timing}.py`, `app/routes/dashboard.py`
  (with trap #1 N+1 loop only — traps #2 and #3 land in Phase 2), `tests/test_dashboard.py`
  (4 tests from `CON-test-suite-shape`), `tests/bench.sh`, `pyproject.toml`,
  `.gitignore`, and a README **stub** containing setup prerequisites + pivot
  prompt + 10-minute tracer walkthrough.
- The phase agent should bind on `CON-deliverable-directory-layout`,
  `CON-docker-image-contract` (50k seed, semver tagging, registry push),
  `CON-pre-instrumented-timing` (three timer blocks, parseable log format),
  `CON-test-suite-shape` (4 pytest tests), `CON-bench-script` (3-run curl
  loop), `CON-verification-commands` (pytest / bench.sh / ruff / mypy gates),
  `CON-setup-prerequisites` (Docker, three terminals, ES_JAVA_OPTS, port
  allocation, `--reload` caveat), `CON-no-claude-md-shipped`, and
  `CON-out-of-scope`.
- The phase agent should explicitly NOT introduce trap #2 (text-mapped
  `username`) or trap #3 (`query`-context date filter) — those are Phase 2's
  scope.

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
