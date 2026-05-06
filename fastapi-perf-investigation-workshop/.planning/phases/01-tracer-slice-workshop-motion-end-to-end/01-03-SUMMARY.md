---
phase: 01-tracer-slice-workshop-motion-end-to-end
plan: "03"
subsystem: docs
tags: [bench, readme, facilitator-reference]
requires:
  - phase: 01-tracer-slice-workshop-motion-end-to-end/01-01
    provides: Docker ES runtime and seeded activities index
  - phase: 01-tracer-slice-workshop-motion-end-to-end/01-02
    provides: FastAPI dashboard endpoint and correctness gates
provides:
  - Three-run curl bench harness
  - Phase 1 README setup and tracer walkthrough
  - Phase 1 facilitator reference stub
  - Python/Docker workshop ignore rules
affects:
  - phase-02-option-a
tech-stack:
  added: [bash, curl]
  patterns: [three-run-bench-loop, tracer-only-doc-scope, facilitator-reference-stub]
key-files:
  created:
    - .gitignore
    - README.md
    - reference/option-a-sample-run.md
    - tests/bench.sh
  modified:
    - app/routes/dashboard.py
key-decisions:
  - "README states the tracer slice scope explicitly and includes only the pivot prompt."
  - "The reference file remains a stub so later Option A/B details are not spoiled."
  - "The endpoint counts 1000 candidate users but returns the top 10, making trap #1 measurable while keeping the response compact."
patterns-established:
  - "Bench output uses curl's Response time format for participant-visible timing."
  - "Docs separate Phase 1 tracer behavior from later Option A/B material."
requirements-completed:
  - REQ-correctness-preserved
  - REQ-no-out-of-scope-drift
duration: 4min
completed: 2026-05-06
---

# Phase 1 Plan 03 Summary

**Tracer walkthrough, bench harness, reference stub, and measurable N+1 baseline**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-06T18:01:23Z
- **Completed:** 2026-05-06T18:05:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added executable `tests/bench.sh` with exactly three curl requests to `/dashboard/summary`.
- Added `.gitignore` for Python caches, virtualenvs, local env files, and generated seed output.
- Added README setup, live commands, scope guardrails, the pivot prompt, and the 10-minute tracer walkthrough.
- Added the Phase 1 facilitator reference stub without future Option A/B details.
- Calibrated the tracer endpoint so live bench output makes `count_per_user` visibly dominant.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add bench harness and ignore rules** - `5d4f97f` (feat)
2. **Task 2: Write README tracer setup and walkthrough** - `3f990b8` (docs)
3. **Runtime calibration: Make tracer bottleneck measurable** - `7a1670f` (fix)
4. **Task 3: Add Phase 1 reference stub and final smoke checks** - `0f31b89` (docs)

## Files Created/Modified

- `.gitignore` - Local Python, tool-cache, env, and generated seed ignores.
- `README.md` - Tracer setup, walkthrough, pivot prompt, commands, and scope guardrails.
- `reference/option-a-sample-run.md` - Phase 1 facilitator reference stub.
- `tests/bench.sh` - Three-run curl latency harness.
- `app/routes/dashboard.py` - Candidate count calibration for measurable trap #1 timing.

## Decisions Made

The benchmark should demonstrate the lesson without bloating the response. The endpoint now evaluates 1000 candidate users through the N+1 count loop, then returns the top 10 sorted users.

## Deviations from Plan

### Auto-fixed Issues

**1. Tracer N+1 baseline was too fast to teach from**
- **Found during:** Task 3 live bench smoke
- **Issue:** Counting only 10 users produced sub-100ms runs, making `count_per_user` technically visible but not pedagogically useful.
- **Fix:** Count 1000 candidate users and return only the top 10.
- **Files modified:** `app/routes/dashboard.py`
- **Verification:** `bash tests/bench.sh` returned 2.91s, 1.80s, 1.55s; timer logs showed `count_per_user` at 2601.3ms, 1756.2ms, and 1527.7ms.
- **Committed in:** `7a1670f`

---

**Total deviations:** 1 auto-fixed calibration issue.
**Impact on plan:** The endpoint still contains only trap #1; the response contract remains compact.

## Issues Encountered

None beyond the calibration issue above.

## User Setup Required

Docker must be running for the live ES and bench path. No external service configuration is required.

## Next Phase Readiness

Phase 2 can deepen this same vertical slice into Option A by adding the remaining physical traps and the full Option A walkthrough.

## Self-Check: PASSED

- `test -x tests/bench.sh` passes.
- README contains the tracer-only sentence and pivot prompt.
- `reference/option-a-sample-run.md` contains the three timer names and future-phases note.
- `test ! -f CLAUDE.md && test ! -f AGENTS.md` passes.
- `bash tests/bench.sh` passes against the live FastAPI and Docker ES runtime.
- `pytest`, `ruff check app`, and `mypy app` exit 0 after the calibration change.

---
*Phase: 01-tracer-slice-workshop-motion-end-to-end*
*Completed: 2026-05-06*
