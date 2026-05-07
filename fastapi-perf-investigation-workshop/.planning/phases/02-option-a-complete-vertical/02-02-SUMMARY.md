---
phase: 02-option-a-complete-vertical
plan: "02"
subsystem: tests
tags: [pytest, fake-elasticsearch, trap-shape]
requires:
  - phase: 02-option-a-complete-vertical/02-01
    provides: Phase 2 runtime trap shape
provides:
  - Fake ES request-body recording
  - Phase 2 mapping and query-shape regression tests
affects:
  - phase-02-docs
tech-stack:
  added: []
  patterns: [fake-elasticsearch-test-client, request-body-shape-assertions]
key-files:
  created: []
  modified:
    - tests/test_dashboard.py
key-decisions:
  - "Trap-shape tests inspect both mapping JSON and fake ES request bodies so pytest catches accidental removal of the hidden traps."
requirements-completed:
  - REQ-measured-fix-option-a
duration: 3min
completed: 2026-05-07
---

# Phase 2 Plan 02 Summary

**Regression tests for the Option A starting point and its intentional hidden traps**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-07T00:08:50Z
- **Completed:** 2026-05-07T00:11:02Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Extended `FakeElasticsearch` to record `search_bodies` and `count_bodies`.
- Updated the fake org-summary response to match the Phase 2 query shape.
- Added a mapping test that asserts `username` is `text` with `fielddata: true`
  and a `keyword` subfield.
- Added a request-body test that asserts `compute_org_summary` uses `bool.must`,
  `now-30d`/`now`, and parent `username`.
- Preserved the original four response correctness tests.

## Task Commits

1. **Task 1: Update fake ES client for Phase 2 query shapes** -
   `3296923` (`test(02-02): record fake ES request bodies`)
2. **Task 2: Add mapping and query trap-shape assertions** -
   `93e6efc` (`test(02-02): assert Phase 2 trap shapes`)

## Files Created/Modified

- `tests/test_dashboard.py` - now contains six tests: the original four
  correctness checks plus two Phase 2 trap-shape checks.

## Decisions Made

The tests verify intentional performance defects structurally rather than by
asserting wall-clock timings. Timing remains a live Docker/bench calibration
gate because the SPEC expects hardware variance.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Plan `02-03` can now document the Option A participant path against a runtime
whose hidden traps are locked by tests.

## Self-Check: PASSED

- `uv run pytest -q` passes with 6 tests.
- `uv run ruff check app tests/test_dashboard.py` passes.
- `uv run mypy app` passes.
- `tests/test_dashboard.py` contains
  `test_phase2_mapping_contains_username_text_fielddata_keyword_subfield`.
- `tests/test_dashboard.py` contains
  `test_compute_org_summary_uses_query_context_unrounded_now_and_username_text_agg`.

---
*Phase: 02-option-a-complete-vertical*
*Completed: 2026-05-07*
