---
phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
plan: "01"
subsystem: documentation
tags: [fastapi, elasticsearch, profile-api, slow-log, workshop]
requires:
  - phase: 02-option-a-complete-vertical
    provides: "Complete Option A README path and hidden trap starting runtime"
provides:
  - "Participant-facing Option B steps 9-10"
  - "Profile API, slow-log, and mapping inspection commands"
  - "Trap #2 participant fix and stop condition"
affects: [phase-4, README, facilitator-reference]
tech-stack:
  added: []
  patterns: ["README uses stack-native ES instrumentation commands inside the workshop flow"]
key-files:
  created: []
  modified: [README.md]
key-decisions:
  - "Kept the shipped runtime pre-fix; README teaches the participant branch change instead."
patterns-established:
  - "Option B docs require profile or slow-log evidence before accepting hidden-trap diagnoses."
requirements-completed:
  - REQ-investigation-uses-instrumentation
duration: 8 min
completed: 2026-05-07
---

# Phase 3 Plan 01: README Option B Trap #2 Summary

**README continuation for Option B steps 9-10 with ES profile, slow-log, mapping inspection, keyword fix, and trap #3 stop condition**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-07T05:45:00Z
- **Completed:** 2026-05-07T05:53:00Z
- **Tasks:** 3
- **Files modified:** 1 deliverable file, 1 plan metadata correction

## Accomplishments

- Added `## Option B: steps 9-10` after the Option A commit section.
- Documented the copyable `_search?profile=true`, slow-log, and mapping inspection commands.
- Named the exact second participant commit and the 200-500 ms post-fix-2 calibration band.
- Added an explicit stop condition that trap #3 remains for the later Option B step.

## Task Commits

1. **Tasks 1-3: README Option B trap #2 flow** - `cf18556` (docs)

**Plan metadata:** `fd7a523` (docs: corrected brittle grep verification and recorded phase start)

## Files Created/Modified

- `README.md` - Adds Option B steps 9-10 and ES instrumentation commands.
- `.planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-01-PLAN.md` - Corrects one plan verification command to use fixed-string grep for a URL containing `*`.

## Decisions Made

- Kept the shipped app in the pre-fix state; the README instructs the participant to change `username` to `username.keyword` on their branch.
- Included slow-log reset instructions so the `0ms` local troubleshooting setting does not remain enabled.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed brittle grep verification for mapping URL**
- **Found during:** Task 2 verification
- **Issue:** The plan's grep command treated `*` in `_mapping?filter_path=*.mappings.properties.username` as a regex operator, so verification failed even though the README contained the required URL.
- **Fix:** Changed that plan verification command to `grep -Fq`.
- **Files modified:** `.planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-01-PLAN.md`
- **Verification:** Re-ran all README grep checks successfully.
- **Committed in:** `fd7a523`

---

**Total deviations:** 1 auto-fixed (blocking verification issue)
**Impact on plan:** No scope change; the README content stayed aligned with the plan.

## Issues Encountered

None beyond the verification command correction above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for `03-02` reference docs and `03-03` static guards. Phase 4 can rely on README preserving the trap #3 boundary.

---
*Phase: 03-option-b-trap-2-narrative-mapping-search-profile-true*
*Completed: 2026-05-07*
