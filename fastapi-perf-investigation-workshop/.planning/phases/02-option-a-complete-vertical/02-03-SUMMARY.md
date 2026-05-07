---
phase: 02-option-a-complete-vertical
plan: "03"
subsystem: docs
tags: [readme, facilitator-reference, option-a]
requires:
  - phase: 02-option-a-complete-vertical/02-01
    provides: Phase 2 runtime trap shape
provides:
  - Complete Option A participant path
  - Facilitator Option A answer key
affects: []
tech-stack:
  added: []
  patterns: [workshop-readme-arc, sample-run-reference]
key-files:
  created: []
  modified:
    - README.md
    - reference/option-a-sample-run.md
key-decisions:
  - "README now presents Option A as an 8-step measured investigation with pivot and falsification prompts."
  - "The facilitator reference documents expected Claude behavior and intervention points without exposing longer-path fixes."
requirements-completed:
  - REQ-measured-fix-option-a
  - REQ-investigation-discipline-takeaway
duration: 4min
completed: 2026-05-07
---

# Phase 2 Plan 03 Summary

**Option A participant documentation and facilitator answer key**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-07T00:11:03Z
- **Completed:** 2026-05-07T00:14:58Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced the Phase 1 tracer README with the complete Option A participant
  path.
- Added the expected 5-10 s baseline and 3-6 s post-fix timing bands.
- Included the pivot prompt and falsification prompt verbatim.
- Documented the Option A 8-step investigation arc and expected participant
  commit.
- Expanded `reference/option-a-sample-run.md` into a facilitator answer key
  covering expected Opus behavior, Sonnet divergence, and intervention points.
- Stated that remaining slowness after Option A is intentional without teaching
  longer-path fixes.

## Task Commits

1. **Task 1: Write the full README Option A participant path** -
   `83eef6a` (`docs(02-03): write Option A README`)
2. **Task 2: Expand the facilitator Option A sample run** -
   `11ebd57` (`docs(02-03): expand Option A reference`)

## Files Created/Modified

- `README.md` - complete Option A setup, timing bands, prompts, arc, expected
  commit, and scope guardrails.
- `reference/option-a-sample-run.md` - facilitator answer key and intervention
  guide.

## Decisions Made

The public participant docs describe only the measured N+1 fix for Option A.
The reference can name remaining slowness as expected, but it does not provide
the hidden-fix steps that belong to longer workshop paths.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Phase 2 is ready for full phase verification and roadmap/state updates.

## Self-Check: PASSED

- `grep -q 'Option A: 8-step investigation arc' README.md` passes.
- `grep -q 'Now design a measurement whose result would \*falsify\*' README.md`
  passes.
- `grep -q 'fix: replace per-user _count loop with single terms aggregation' README.md`
  passes.
- `grep -q 'Step 3 not solved in one shot' reference/option-a-sample-run.md`
  passes.
- `grep -q 'Where Sonnet 4.6 may diverge' reference/option-a-sample-run.md`
  passes.
- `test ! -f CLAUDE.md && test ! -f AGENTS.md` passes.

---
*Phase: 02-option-a-complete-vertical*
*Completed: 2026-05-07*
