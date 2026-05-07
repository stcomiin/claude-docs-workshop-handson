# Phase 3: Pattern Map

**Mapped:** 2026-05-07
**Phase:** 3 - Option B Trap #2 Narrative - Mapping and `_search?profile=true`

## Summary

Phase 3 extends the Phase 2 workshop slice without changing the shipped runtime
trap state. The closest analogs are the Phase 2 README/reference/test patterns:
docs teach the participant branch action, while tests protect the starting
point and required strings. Plans should modify `README.md`,
`reference/option-a-sample-run.md`, and `tests/test_dashboard.py`; they should
read but not change `app/routes/dashboard.py` and `docker/seed/mappings.json`.

## Planned Files And Closest Analogs

| Planned file | Role | Closest analog | Reuse guidance |
|--------------|------|----------------|----------------|
| `README.md` | Participant Option B steps 9-10 | Current Option A README | Add a distinct Option B continuation after Option A; preserve setup, prompts, and guardrails. |
| `reference/option-a-sample-run.md` | Facilitator answer key extension | Current Option A sample run | Extend in place with Option B trap #2 behavior and intervention points. |
| `tests/test_dashboard.py` | Static docs and trap-boundary guards | Existing fake-client tests | Keep Docker-free pytest; add Path-based doc assertions and preserve existing trap-shape tests. |
| `app/routes/dashboard.py` | Runtime starting trap shape | Current `compute_org_summary` | Read-only for Phase 3 planning; starting code should still aggregate on `username`. |
| `docker/seed/mappings.json` | Mapping proof source | Current Phase 2 mapping | Read-only; docs point to existing `text + fielddata + keyword` shape. |

## Shared Patterns To Preserve

- Keep no `CLAUDE.md` or `AGENTS.md` in the shipped workshop.
- Keep tests independent of Docker and live Elasticsearch.
- Keep `tests/bench.sh` as the latency harness.
- Keep three top-level timer names in the shipped starting point.
- Keep the app synchronous; no `async def` refactor.
- Keep Option B step 10 fix limited to `username` -> `username.keyword`.
- Keep Phase 4 cache fix out of Phase 3 docs.

## Implementation Pattern Risks

- Updating `app/routes/dashboard.py` to `username.keyword` during Phase 3 would
  erase the participant's trap #2.
- Using slow-log thresholds without a reset command can leave noisy local logs.
- A README appendix-only treatment would fail the phase: instrumentation commands
  must appear inside the Option B step 9-10 flow.
- Renaming the reference file creates avoidable link churn; extending the
  existing file is lower risk.

## PATTERN MAPPING COMPLETE
