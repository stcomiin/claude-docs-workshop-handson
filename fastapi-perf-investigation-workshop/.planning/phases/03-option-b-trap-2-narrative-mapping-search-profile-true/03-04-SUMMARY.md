---
phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
plan: "04"
type: gap_closure
subsystem: documentation-testing
tags: [fastapi, elasticsearch, profile-api, pytest, uat]
requires:
  - phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
    provides: "Phase 3 UAT gaps and gap-closure plan"
provides:
  - "Live-tested Elasticsearch Profile API command"
  - "Participant post-fix pytest command that excludes starting-state guards"
  - "Resolved Phase 3 UAT gaps"
affects: [phase-4, README, facilitator-reference, tests]
tech-stack:
  added: []
  patterns:
    - "Use pytest markers to separate shipped starting-state guards from participant post-fix checks."
key-files:
  created: []
  modified:
    - README.md
    - reference/option-a-sample-run.md
    - tests/test_dashboard.py
    - pyproject.toml
    - .planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-UAT.md
key-decisions:
  - "Profile API guidance now uses `\"profile\": true` in the JSON body because Elasticsearch 9.3.3 rejects `profile=true` as a URL parameter."
  - "The pre-fix trap-shape test is marked `starting_state`; participant post-fix docs run `pytest -m \"not starting_state\"`."
requirements-completed:
  - REQ-investigation-uses-instrumentation
duration: 10 min
completed: 2026-05-07
---

# Phase 3 Plan 04: UAT Gap Closure Summary

**Fixed executable-command gaps found by Phase 3 UAT**

## Performance

- **Duration:** 10 min
- **Started:** 2026-05-07T08:27:00Z
- **Completed:** 2026-05-07T08:37:04Z
- **Tasks:** 2
- **Files modified:** 4 deliverable files, 1 UAT artifact, 4 tracking files

## Accomplishments

- Replaced the rejected `_search?profile=true` profile command with the tested
  `POST /activities/_search?pretty` plus `"profile": true` request-body form.
- Updated the facilitator reference to use the same Profile API body form.
- Added a `starting_state` pytest marker for the shipped pre-fix trap-shape
  guard.
- Updated README/reference post-fix commands to use
  `pytest -m "not starting_state"` after the participant applies commit 2.
- Updated Phase 3 UAT gaps from failed to resolved and restored roadmap/state
  status to Phase 3 complete.

## Task Commits

1. **Tasks 1-2: Profile command and post-fix verification gap closure** - `f2c52ac` (fix)

## Files Created/Modified

- `README.md` - Uses tested Profile API request-body command and post-fix
  pytest marker exclusion.
- `reference/option-a-sample-run.md` - Mirrors corrected evidence path and
  participant post-fix verification.
- `tests/test_dashboard.py` - Guards the corrected docs and marks the
  starting-state trap-shape test.
- `pyproject.toml` - Registers the `starting_state` pytest marker.
- `.planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-UAT.md`
  - Marks all UAT gaps resolved.

## Decisions Made

- Kept default shipped-branch `uv run pytest` behavior intact: all nine tests
  still run and pass before participants modify the app.
- Used a pytest marker rather than renaming or deleting the trap-shape guard, so
  Phase 3 still proves the workshop starts with parent `username`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Registered pytest marker in `pyproject.toml`**
- **Found during:** Task 2 implementation
- **Issue:** The plan listed README/reference/tests, but using a custom marker
  without registering it would create pytest warnings and a less polished
  participant path.
- **Fix:** Added `[tool.pytest.ini_options]` with the `starting_state` marker.
- **Files modified:** `pyproject.toml`
- **Verification:** `uv run pytest` passed without marker warnings.
- **Committed in:** `f2c52ac`

---

**Total deviations:** 1 auto-fixed blocking polish issue.
**Impact on plan:** Positive; marker registration makes the chosen convention explicit.

## Verification

- `uv run pytest` - passed, 9 tests.
- `uv run ruff check app tests/test_dashboard.py` - passed.
- `uv run mypy app` - passed.
- `test ! -e CLAUDE.md && test ! -e AGENTS.md` - passed.
- Live Profile API command returned a response containing `profile`.
- Slow-log enable/reset path returned `{"acknowledged":true}` and emitted
  `index.search.slowlog` entries.
- Detached temp worktree with only the participant `username.keyword` fix:
  `uv run pytest -m "not starting_state"` passed with 8 selected / 1 deselected,
  and `uv run ruff check app` plus `uv run mypy app` passed.

## Issues Encountered

None remaining.

## User Setup Required

None. Docker was used for live ES command verification and remains optional for
static gates.

## Next Phase Readiness

Phase 3 is complete after UAT gap closure. Phase 4 can now build on a tested
Option B trap #2 evidence path.

---
*Phase: 03-option-b-trap-2-narrative-mapping-search-profile-true*
*Completed: 2026-05-07*
