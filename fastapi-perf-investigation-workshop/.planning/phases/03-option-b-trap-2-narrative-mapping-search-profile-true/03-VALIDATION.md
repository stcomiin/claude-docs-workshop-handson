---
phase: 3
slug: option-b-trap-2-narrative-mapping-search-profile-true
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-07
---

# Phase 3 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | pytest 9.0.3 |
| Config file | `pyproject.toml` |
| Quick run command | `pytest` |
| Full suite command | `pytest && ruff check app && mypy app` |
| Live smoke command | `docker compose -f docker/docker-compose.yml up -d --build && bash tests/bench.sh` |
| Estimated runtime | pytest/lint/type under 30s; live smoke depends on Docker cold start |

## Sampling Rate

- After every docs task: run that task's grep verification.
- After every test task: run `pytest tests/test_dashboard.py -x`.
- After every plan wave: run `pytest && ruff check app && mypy app`.
- Before `$gsd-verify-work`: run the full suite plus live Docker/uvicorn/bench
  profile smoke when Docker is available.
- Max feedback latency: under 30s for Python checks; Docker timing checks are
  manual/laptop-dependent.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | REQ-investigation-uses-instrumentation | T-03-01 | Slow-log `0ms` scoped to local troubleshooting | static/docs | `grep -q '_search?profile=true' README.md && grep -q 'index.search.slowlog.threshold.query.trace' README.md` | yes | pending |
| 3-01-02 | 01 | 1 | REQ-investigation-uses-instrumentation | T-03-02 | Docs keep trap #3 out of Phase 3 fix | static/docs | `grep -q 'fix: aggregate on username.keyword to avoid fielddata on text field' README.md && ! grep -q 'fix: move date range to filter context' README.md` | yes | pending |
| 3-02-01 | 02 | 1 | REQ-investigation-uses-instrumentation | T-03-03 | Reference distinguishes local workshop commands from production guidance | static/docs | `grep -q 'Option B steps 9-10' reference/option-a-sample-run.md && grep -q 'username.keyword' reference/option-a-sample-run.md` | yes | pending |
| 3-02-02 | 02 | 1 | REQ-investigation-uses-instrumentation | T-03-04 | Facilitator reference preserves Phase 4 boundary | static/docs | `grep -q 'Trap #3 remains' reference/option-a-sample-run.md` | yes | pending |
| 3-03-01 | 03 | 2 | REQ-investigation-uses-instrumentation | T-03-05 | Tests use local files only and no live ES credentials | unit/static | `pytest tests/test_dashboard.py -x` | yes | pending |
| 3-03-02 | 03 | 2 | REQ-investigation-uses-instrumentation | T-03-06 | Runtime stays pre-fix for participant investigation | unit/static | `pytest && ruff check app && mypy app` | yes | pending |

## Wave 0 Requirements

Existing infrastructure covers this phase:

- `pyproject.toml` includes pytest, ruff, and mypy.
- `tests/test_dashboard.py` exists and already uses a fake ES client.
- `tests/bench.sh` exists and remains the three-run latency harness.
- `README.md` and `reference/option-a-sample-run.md` exist.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `_search?profile=true` exposes aggregation evidence on the running container | REQ-investigation-uses-instrumentation | Requires live Docker ES and current cache/heap state | Start ES and uvicorn, run the README profile command, confirm output includes profile data for the `username_distribution` aggregation and leads to mapping inspection. |
| Slow log captures the profiled search when thresholds are set to `0ms` | REQ-investigation-uses-instrumentation | Requires ES container logs | Enable README slow-log settings, run `bash tests/bench.sh`, inspect `docker compose -f docker/docker-compose.yml logs es`, then reset thresholds to `-1`. |
| Post-fix-2 timing improves toward the 200-500 ms calibration band while trap #3 remains | REQ-investigation-uses-instrumentation | Requires participant fix on a temporary branch and live bench | Change only the aggregation field from `username` to `username.keyword`, restart uvicorn, run `pytest`, `ruff check app`, `mypy app`, then `bash tests/bench.sh`; confirm timing improves and runs 2/3 do not show request-cache hit behavior yet. |

## Validation Sign-Off

- [x] All tasks have automated verify commands or documented manual Docker checks.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 requirements already covered by earlier phases.
- [x] No watch-mode flags in verification commands.
- [x] Feedback latency for Python checks is under 30s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending Phase 3 execution and UAT
