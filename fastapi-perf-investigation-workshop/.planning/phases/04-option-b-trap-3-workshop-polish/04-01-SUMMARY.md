---
phase: 04-option-b-trap-3-workshop-polish
plan: "01"
subsystem: documentation-source
tags: [fastapi, elasticsearch, workshop, option-b, docs]
requires:
  - phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
    provides: "Option B steps 9-10 and trap #2 boundary"
provides:
  - "ES DSL primer in README"
  - "Option B steps 11-12 participant flow"
  - "Closing lesson and Appendix B translation table"
  - "Non-spoiler final notes template in dashboard.py"
affects: [phase-4, README, dashboard, facilitator-reference, tests]
tech-stack:
  added: []
  patterns:
    - "Keep shipped source non-spoiler while documenting participant final notes."
key-files:
  created: []
  modified:
    - README.md
    - app/routes/dashboard.py
key-decisions:
  - "README remains the participant-facing canonical path for Option B and portable artifacts."
  - "The shipped dashboard source gets a blank final-notes template, not completed answers."
patterns-established:
  - "Final Option B evidence is recorded by participants after the exercise, not prefilled in shipped code."
requirements-completed:
  - REQ-measured-fix-option-b
  - REQ-portable-prompt-artifacts
duration: 8 min
completed: 2026-05-07
---

# Phase 4 Plan 01: Participant README And Source Notes Summary

**Complete Option B participant docs with ES DSL primer, final cache-fix steps, portable takeaways, and a non-spoiler source note template**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-07T09:32:00Z
- **Completed:** 2026-05-07T09:40:32Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Added the one-page Elasticsearch Query DSL primer to README.
- Added Option B steps 11-12, including the two-part cache fix, post-fix checks, exact third commit, and calibrated cold/cached timing band.
- Added the closing stack-agnostic lesson restatement and Appendix B translation table.
- Added a blank final-notes template at the top of `app/routes/dashboard.py` without revealing the completed answers.

## Task Commits

1. **Task 1: Add the ES DSL primer to README** - `46f21cc` (docs)
2. **Task 2: Add Option B steps 11-12 and final measurement guidance** - `c4f3015` (docs)
3. **Task 3: Add Appendix B, closing restatement, and non-spoiler source notes** - `59d293d` (docs)

## Files Created/Modified

- `README.md` - Adds primer, final Option B steps, closing lesson, Appendix B, and updated scope guardrails.
- `app/routes/dashboard.py` - Adds non-spoiler final Option B notes template.

## Decisions Made

- Kept README as the participant-facing canonical flow.
- Used a non-answer dashboard comment template so the shipped source remains a starting exercise.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 02 can extend the facilitator reference with the same trap #3 path and runbook.

## Self-Check: PASSED

---
*Phase: 04-option-b-trap-3-workshop-polish*
*Completed: 2026-05-07*
