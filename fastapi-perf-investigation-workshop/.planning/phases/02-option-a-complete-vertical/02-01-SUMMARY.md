---
phase: 02-option-a-complete-vertical
plan: "01"
subsystem: runtime
tags: [elasticsearch, seed-data, fastapi, performance-traps]
requires:
  - phase: 01-tracer-slice-workshop-motion-end-to-end/01-01
    provides: Docker Elasticsearch runtime with seeded activities index
  - phase: 01-tracer-slice-workshop-motion-end-to-end/01-02
    provides: FastAPI dashboard endpoint and fake-client tests
provides:
  - Phase 2 username text fielddata mapping with keyword subfield
  - Stale mapping detection in seed startup
  - Option A starting endpoint with all three physical traps
affects:
  - phase-02-tests
  - phase-02-docs
tech-stack:
  added: []
  patterns: [mapping-shape-reseed-guard, query-context-cache-trap]
key-files:
  created: []
  modified:
    - docker/seed/mappings.json
    - docker/seed/seed.py
    - app/routes/dashboard.py
    - tests/test_dashboard.py
    - .gitignore
key-decisions:
  - "Existing local activities indexes are accepted only when count and Phase 2 mapping shape both match."
  - "compute_org_summary now carries the hidden text-field aggregation and query-context date trap while count_per_user remains the visible N+1 fix target."
requirements-completed:
  - REQ-measured-fix-option-a
  - REQ-investigation-discipline-takeaway
duration: 9min
completed: 2026-05-07
---

# Phase 2 Plan 01 Summary

**Phase 2 runtime starting point with hidden Elasticsearch traps and stale-mapping reseed guard**

## Performance

- **Duration:** 9 min
- **Started:** 2026-05-06T23:59:40Z
- **Completed:** 2026-05-07T00:08:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Changed `docker/seed/mappings.json` so `username` is `text` with
  `fielddata: true` and a `keyword` subfield.
- Added `mapping_matches_phase2()` to the seed script so existing Phase 1 local
  indexes are deleted and recreated when the mapping is stale.
- Changed `compute_org_summary` to use `bool.must`, non-rounded `now-30d`, and
  a parent `username` terms aggregation.
- Preserved the visible N+1 count loop and exactly three top-level timer names.
- Kept the Python gate green after adapting the fake ES count path.

## Task Commits

1. **Task 1: Change username mapping and reseed stale local indexes** -
   `2ca09b7` (`feat(02-01): add Phase 2 mapping reseed guard`)
2. **Task 2: Move compute_org_summary to the Phase 2 hidden trap shape** -
   `9af468f` (`feat(02-01): add hidden runtime traps`)

## Files Created/Modified

- `docker/seed/mappings.json` - Phase 2 username multi-field mapping.
- `docker/seed/seed.py` - mapping-shape detection before accepting existing
  indexes.
- `app/routes/dashboard.py` - org summary query now carries traps #2 and #3.
- `tests/test_dashboard.py` - fake count path accepts the prior-period query.
- `.gitignore` - ignores local `uv run` verification artifacts.

## Decisions Made

The seed service now treats a correct document count with the wrong mapping as a
stale runtime, not a valid seed. This prevents existing Docker volumes from
silently missing trap #2 after Phase 2.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Fake ES client did not support the new prior-period count body**
- **Found during:** Task 2 verification
- **Issue:** `pytest` failed because `FakeElasticsearch.count()` expected
  `bool.filter`, while the Phase 2 prior-period count uses `bool.must`.
- **Fix:** Added support for both `filter` and `must` query lists and returned
  `{"count": 30}` for range-only prior-period counts.
- **Files modified:** `tests/test_dashboard.py`
- **Verification:** `uv run pytest -q` passed.
- **Commit:** `9af468f`

**2. [Rule 3 - Blocking Issue] Verification created local uv artifacts**
- **Found during:** Task 2 verification
- **Issue:** `uv run` generated `uv.lock` and package egg-info files as local
  verification artifacts.
- **Fix:** Added `uv.lock` and `*.egg-info/` to `.gitignore`.
- **Files modified:** `.gitignore`
- **Verification:** `git status --short` no longer reports those generated
  files.
- **Commit:** `9af468f`

**Total deviations:** 2 auto-fixed blocking issues.
**Impact:** No scope change; both fixes were required to keep the planned gates
green in this local execution environment.

## Issues Encountered

None remaining.

## User Setup Required

None for planning execution. Live timing verification still requires Docker to
be running, as documented in the plan.

## Next Phase Readiness

Plan `02-02` can now extend `tests/test_dashboard.py` to make the Phase 2 trap
shape explicit and regression-proof.

## Self-Check: PASSED

- `grep -q '"fielddata": true' docker/seed/mappings.json` passes.
- `grep -q 'def mapping_matches_phase2' docker/seed/seed.py` passes.
- `grep -q '"field": "username"' app/routes/dashboard.py` passes.
- `grep -q 'now-30d' app/routes/dashboard.py` passes.
- `! grep -q 'now-30d/d' app/routes/dashboard.py` passes.
- `uv run pytest -q` passes with 4 tests.
- `uv run ruff check app` passes.
- `uv run mypy app` passes.

---
*Phase: 02-option-a-complete-vertical*
*Completed: 2026-05-07*
