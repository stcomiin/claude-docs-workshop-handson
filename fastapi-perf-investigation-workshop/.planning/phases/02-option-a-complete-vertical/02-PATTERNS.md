# Phase 2: Pattern Map

**Mapped:** 2026-05-06
**Phase:** 2 - Option A Complete Vertical

## Summary

Phase 2 extends the Phase 1 runtime rather than introducing new subsystems. The
closest analogs are the exact files produced in Phase 1: `dashboard.py` already
has separable ES query helpers, `seed.py` already owns idempotent index creation,
and README/reference already use the workshop convention. Plans should modify
these files in place and avoid adding new agent instruction files.

## Planned Files And Closest Analogs

| Planned file | Role | Closest analog | Reuse guidance |
|--------------|------|----------------|----------------|
| `docker/seed/mappings.json` | Phase 2 hidden mapping trap | Current `docker/seed/mappings.json` | Preserve all existing fields and change only `username` to text + fielddata + keyword subfield. |
| `docker/seed/seed.py` | Idempotent local ES seeding | Current `docker/seed/seed.py` | Keep stdlib HTTP approach; add semantic mapping-shape detection before accepting an existing index. |
| `app/routes/dashboard.py` | Slow endpoint and hidden query/cache trap | Current `app/routes/dashboard.py` | Keep helper-function split and exactly three top-level timers; alter only `compute_org_summary` for traps #2/#3. |
| `tests/test_dashboard.py` | Correctness and trap-shape tests | Current `tests/test_dashboard.py` | Keep FastAPI TestClient + fake ES; extend fake to record request bodies and validate intentional traps. |
| `README.md` | Participant Option A path | Current `README.md`; prior workshop READMEs in sibling directories | Replace tracer-slice framing with complete Option A arc while preserving setup commands and guardrails. |
| `reference/option-a-sample-run.md` | Facilitator Option A answer key | Current reference stub; BMAD sample-run convention | Expand into step-by-step expected behavior without teaching the Option B fixes. |

## Shared Patterns To Preserve

- Keep the app synchronous. Do not add `async def`.
- Keep `pytest` independent of Docker by monkeypatching `dashboard.get_es_client`.
- Keep `tests/bench.sh` as the only latency harness.
- Keep Docker and app commands rooted at localhost ports 9200 and 8765.
- Keep no `CLAUDE.md` or `AGENTS.md` in the shipped workshop.

## Implementation Pattern Risks

- Updating `mappings.json` alone is insufficient because an existing named
  volume can retain the Phase 1 index mapping.
- Moving all date ranges to a top-level 30-day query can accidentally make
  `prior_30d` always zero; preserve a prior-period count path.
- Adding finer-grained timers to the shipped starting point would violate the
  current three-timer instrumentation contract; participants add finer timers
  during the Option A exercise only if needed.
- README must include both prompts verbatim, but Option A should stop after the
  N+1 fix and not instruct the hidden fixes.

## PATTERN MAPPING COMPLETE
