---
phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
plan: "03"
subsystem: testing
tags: [pytest, fastapi, elasticsearch, docs-coverage]
requires:
  - phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
    provides: "README and reference docs for Option B trap #2"
provides:
  - "Static pytest guards for Phase 3 README and reference coverage"
  - "No-agent-instruction-file guard"
  - "Continued runtime trap-shape protection"
affects: [phase-4, tests, verification]
tech-stack:
  added: []
  patterns: ["Pytest reads local docs with pathlib for static workshop contract checks"]
key-files:
  created: []
  modified: [tests/test_dashboard.py]
key-decisions:
  - "Used local-file static tests instead of live Docker checks for documentation coverage."
patterns-established:
  - "Phase docs requirements are enforced through pytest string guards."
requirements-completed:
  - REQ-investigation-uses-instrumentation
duration: 7 min
completed: 2026-05-07
---

# Phase 3 Plan 03: Static Docs Guard Summary

**Pytest guards for Option B trap #2 README/reference coverage plus preserved runtime trap boundaries**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-07T05:58:00Z
- **Completed:** 2026-05-07T06:05:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Added README static assertions for profile, slow-log, mapping inspection, keyword fix, commit string, and timing band.
- Added facilitator-reference static assertions for trap #2 path, model guidance, and trap #3 boundary.
- Added a no-`CLAUDE.md` / no-`AGENTS.md` guard.
- Kept the existing runtime tests that assert parent `username`, query context, and non-rounded date math remain in the shipped starting point.

## Task Commits

1. **Tasks 1-3: Phase 3 static docs and trap-boundary tests** - `18478ef` (test)

## Files Created/Modified

- `tests/test_dashboard.py` - Adds three Phase 3 static guard tests.

## Decisions Made

- Used `Path(...).read_text(encoding="utf-8")` static tests so pytest remains Docker-free.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Bare `pytest` is not on this shell's PATH. Verification used `uv run pytest`, which resolves the project-pinned pytest 9.0.3 environment.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 3 deliverables are complete. Phase 4 can build on the preserved trap #3 boundary and add the cache-context narrative.

---
*Phase: 03-option-b-trap-2-narrative-mapping-search-profile-true*
*Completed: 2026-05-07*
