---
phase: 01-tracer-slice-workshop-motion-end-to-end
reviewed_at: "2026-05-07T01:13:25Z"
status: findings
depth: standard
files_reviewed: 14
findings:
  critical: 0
  warning: 5
  info: 1
  total: 6
---

# Phase 1 Code Review

## Scope

Reviewed Phase 1 source and workshop-facing files derived from the three Phase
1 summaries:

- `.gitignore`
- `README.md`
- `app/__init__.py`
- `app/es.py`
- `app/main.py`
- `app/routes/dashboard.py`
- `app/timing.py`
- `docker/Dockerfile`
- `docker/docker-compose.yml`
- `docker/seed/build_seed.py`
- `docker/seed/mappings.json`
- `docker/seed/seed.py`
- `pyproject.toml`
- `tests/bench.sh`
- `tests/test_dashboard.py`

PR comments reviewed:

- PR #1: merged planning PR comments about `--reload` benchmark guidance.
- PR #2: open Phase 1 PR comments about seed timeout, growth calculation,
  top-user date scope, ES client reuse, and `typing-extensions`.

## Findings

### WR-01: Bulk seed requests use a 10-second network timeout

**Severity:** Warning
**File:** `docker/seed/seed.py`

The shared `request()` helper uses `urlopen(..., timeout=10)` for every
Elasticsearch request, including the 50k-document `_bulk?refresh=true` load.
That bulk request can legitimately exceed 10 seconds on slower Docker Desktop
setups, which can make the workshop fail before participants reach the app.

**Recommendation:** Use a longer default request timeout for seed operations,
or allow callers to override the timeout for the bulk path.

### WR-02: `list_top_users` chooses candidates across all time

**Severity:** Warning
**File:** `app/routes/dashboard.py`

`list_top_users()` aggregates top users without the same 30-day date window used
by `count_user_activities()` and `compute_org_summary()`. This can select
historically active users who have no current-period activity, forcing the N+1
loop to spend work counting users that will later sort to zero.

**Recommendation:** Add the same current-period range filter to the top-user
candidate aggregation while preserving the visible N+1 count loop.

### WR-03: Growth rate clamps declines and treats zero-prior growth as zero

**Severity:** Warning
**File:** `app/routes/dashboard.py`

`growth_rate_vs_prior_30d` clamps negative values to `0.0`, so declines are
hidden. It also reports `0.0` when the prior period is zero and the current
period is positive. The current Phase 1 test asserts non-negative numerics, but
that test only proves the value is serializable and bounded for the fake data;
it does not require suppressing real declines.

**Recommendation:** Compute raw growth when prior total is positive, return
`1.0` for zero-to-positive growth, and return `0.0` only when both periods are
zero. Update tests to assert the intended behavior directly.

### WR-04: Elasticsearch client is recreated per request

**Severity:** Warning
**File:** `app/es.py`

`get_es_client()` creates a new `Elasticsearch` client every time the endpoint
is called. That defeats client connection pooling across requests and injects
unrelated overhead into the performance exercise.

**Recommendation:** Cache a module-level client keyed by the configured ES URL.

### WR-05: Direct `typing_extensions` import is not declared

**Severity:** Warning
**File:** `pyproject.toml`

`app/routes/dashboard.py` imports `typing_extensions.TypedDict`, but
`typing-extensions` is not listed as a direct dependency. It may arrive
transitively, but the project directly imports it and should declare it.

**Recommendation:** Add a pinned `typing-extensions` dependency.

### IR-01: `--reload` benchmark guidance is imprecise

**Severity:** Info
**Files:** `README.md`, planning/spec references

PR #1 correctly notes that manual restart does not remove cold-start overhead;
it only avoids `--reload` file-watcher overhead and accidental reloads during a
benchmark. The current wording implies manual restart itself fixes the first
post-change benchmark.

**Recommendation:** Tell participants to use `--reload` for initial sanity
only, restart without `--reload` for benchmarks, and treat the first run as
warm-up when comparing numbers.

## Non-Findings

- The visible N+1 count loop is intentional and should remain in Phase 1.
- The Phase 1 `username` keyword mapping is intentional; text/fielddata mapping
  belongs to Phase 2.
- The Phase 1 `compute_org_summary()` filter-context date shape is intentional;
  query-context/non-rounded date behavior belongs to Phase 2+.
