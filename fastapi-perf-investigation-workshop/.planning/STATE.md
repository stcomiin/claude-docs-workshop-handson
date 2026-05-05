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

Bootstrapping from intel-only state. Phase 1 not yet started.

## Current Position

- **Phase:** 1 — Docker ES Image with Intentional Defects
- **Plan:** None (no plans created yet)
- **Status:** Not started
- **Progress:** `[          ]` 0% (0 of 5 phases complete)

```
Phase 1: Docker ES Image with Intentional Defects        [          ] Not started
Phase 2: FastAPI App with Three Layered Perf Traps        [          ] Not started
Phase 3: Correctness Tests + Latency Bench Harness        [          ] Not started
Phase 4: Workshop Content — README + Reference Doc        [          ] Not started
Phase 5: Facilitator Pre-Flight Validation                [          ] Not started
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
  Phase 1 must tune seed size and refresh behavior so traps #2 and #3 are
  observable on laptop-class hardware.
- Three-terminal setup overwhelming small screens → addressed in Phase 4 README
  setup section.
- `uvicorn --reload` poisoning the first benchmark after a fix → addressed in
  Phase 4 README setup section ("manual restart between bench runs after a fix").

## Session Continuity

### What just happened (this session)

- Single-doc SPEC ingest synthesized into per-type intel
  (`.planning/intel/{SYNTHESIS,requirements,constraints,decisions,context}.md`).
- Conflicts report: 0 blockers, 0 competing variants, 0 auto-resolved.
- Roadmapping: 7 v1 requirements → 5 phases (vertical slices, mirroring the
  SPEC §7 directory layout: docker → app → tests/bench → README + reference →
  pre-flight). 100% coverage validated.
- PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md all created from intel.

### What happens next (next session)

- Plan Phase 1: `/gsd-plan-phase 1` (Docker ES Image with Intentional Defects).
  Phase 1's deliverables are: `docker/Dockerfile`, `docker/docker-compose.yml`,
  `docker/seed/mappings.json` (with the intentional `text`-mapped `username`),
  `docker/seed/build_seed.py` (~50k documents), and the registry push +
  semver-tagging procedure.
- The phase agent should bind on `CON-docker-image-contract`,
  `CON-three-layered-perf-traps` (specifically the mapping bug — trap #2's
  defect physically lives in the seed mapping), `CON-setup-prerequisites`
  (the `ES_JAVA_OPTS` heap default and port allocation), and `CON-out-of-scope`
  (no sharding, replica strategy, auth, ML/vector — single-node localhost only).

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
