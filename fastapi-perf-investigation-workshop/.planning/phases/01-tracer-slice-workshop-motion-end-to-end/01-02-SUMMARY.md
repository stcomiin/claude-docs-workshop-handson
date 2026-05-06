---
phase: 01-tracer-slice-workshop-motion-end-to-end
plan: "02"
subsystem: api
tags: [fastapi, elasticsearch, pytest, ruff, mypy]
requires:
  - phase: 01-tracer-slice-workshop-motion-end-to-end/01-01
    provides: Docker Elasticsearch runtime with seeded activities index
provides:
  - FastAPI app shell on `app.main:app`
  - `GET /dashboard/summary` tracer endpoint with three timer blocks
  - Four fake-client correctness tests
affects:
  - phase-01-bench-harness
  - phase-02-option-a
tech-stack:
  added: [fastapi, uvicorn, elasticsearch-py, pytest, httpx, ruff, mypy]
  patterns: [sync-fastapi-route, fake-elasticsearch-test-client, parseable-timer-context]
key-files:
  created:
    - pyproject.toml
    - app/__init__.py
    - app/main.py
    - app/es.py
    - app/timing.py
    - app/routes/dashboard.py
    - tests/test_dashboard.py
  modified:
    - pyproject.toml
    - app/routes/dashboard.py
key-decisions:
  - "Kept the route synchronous and left only the N+1 count loop as the Phase 1 performance trap."
  - "Used a fake ES client for pytest so correctness tests do not require Docker."
  - "Constrained setuptools package discovery to app* so editable installs ignore docker/."
patterns-established:
  - "Endpoint functions are split into list_top_users, count_user_activities, and compute_org_summary for later trap-specific edits."
  - "FastAPI response typing uses typing_extensions.TypedDict for Python 3.11 compatibility."
requirements-completed:
  - REQ-correctness-preserved
  - REQ-no-out-of-scope-drift
duration: 6min
completed: 2026-05-06
---

# Phase 1 Plan 02 Summary

**Synchronous FastAPI tracer endpoint with fake-client tests and green Python gates**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-06T17:55:25Z
- **Completed:** 2026-05-06T18:01:23Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added the pinned Python project config, FastAPI app shell, ES client helper, and health check.
- Implemented `GET /dashboard/summary` with exactly `load_top_users`, `count_per_user`, and `compute_org_summary` timers.
- Preserved only trap #1: `count_per_user` performs one `_count` request per top user.
- Added four correctness tests using a fake ES client.
- Verified the live endpoint against the seeded Docker ES runtime.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Python project config and app shell** - `ce902e6` (feat)
2. **Task 2: Implement timer and dashboard endpoint with trap #1 only** - `8c5c251` (feat)
3. **Task 3: Add four correctness tests with fake ES client** - `da9717e` (test)

## Files Created/Modified

- `pyproject.toml` - Pinned dependencies, tool config, and package discovery.
- `app/main.py` - FastAPI app entry point and health check.
- `app/es.py` - Local-default Elasticsearch client helper.
- `app/timing.py` - Parseable stdout timer context manager.
- `app/routes/dashboard.py` - Tracer endpoint and ES query helpers.
- `tests/test_dashboard.py` - Four fake-client correctness tests.

## Decisions Made

The endpoint returns the `top_users` list sorted after the N+1 count loop, so the visible response contract stays correct even though the implementation remains intentionally inefficient. `compute_org_summary` already uses `bool.filter` plus `now-30d/d`, keeping trap #3 out of Phase 1.

## Deviations from Plan

### Auto-fixed Issues

**1. Packaging discovery blocked editable install**
- **Found during:** Task 3 verification
- **Issue:** setuptools tried to package both `app` and `docker` in the flat layout.
- **Fix:** Added `[build-system]` and `[tool.setuptools.packages.find] include = ["app*"]`.
- **Files modified:** `pyproject.toml`
- **Verification:** `uv run --no-project --with-editable . pytest` installs and runs.
- **Committed in:** `da9717e`

**2. Python 3.11 response typing failed under Pydantic**
- **Found during:** Task 3 verification
- **Issue:** `typing.TypedDict` response annotations failed under Python 3.11.
- **Fix:** Switched endpoint response TypedDicts to `typing_extensions.TypedDict`.
- **Files modified:** `app/routes/dashboard.py`
- **Verification:** `pytest` collects and passes on Python 3.11.15.
- **Committed in:** `da9717e`

---

**Total deviations:** 2 auto-fixed blocking compatibility issues.
**Impact on plan:** No scope creep; both fixes were necessary for the planned install and test gates.

## Issues Encountered

None beyond the two auto-fixed compatibility issues above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan `01-03` can add `tests/bench.sh`, README tracer instructions, and reference stubs against the now-running `uvicorn app.main:app --port 8765` path.

## Self-Check: PASSED

- `pytest` exits 0 with 4 tests.
- `ruff check app` exits 0.
- `mypy app` exits 0.
- Live `curl http://127.0.0.1:8765/dashboard/summary` returned `top_users` and `org_summary`.
- Uvicorn emitted exactly three timer lines for the live request.

---
*Phase: 01-tracer-slice-workshop-motion-end-to-end*
*Completed: 2026-05-06*
