---
phase: 2
slug: option-a-complete-vertical
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-06
---

# Phase 2 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | pytest 9.0.3 |
| Config file | `pyproject.toml` |
| Quick run command | `pytest` |
| Full suite command | `pytest && ruff check app && mypy app` |
| Live smoke command | `docker compose -f docker/docker-compose.yml up -d --build && curl -fsS http://localhost:8765/dashboard/summary && bash tests/bench.sh` |
| Estimated runtime | pytest/lint/type under 30s; live smoke depends on Docker cold start |

## Sampling Rate

- After every task commit: run `pytest` for code/test tasks, or the task's grep
  verification for docs-only tasks.
- After every plan wave: run `pytest && ruff check app && mypy app`.
- Before `$gsd-verify-work`: run the full suite plus live Docker/uvicorn/bench
  smoke when Docker is available.
- Max feedback latency: under 30s for Python checks; Docker timing checks are
  manual/laptop-dependent.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | REQ-measured-fix-option-a | T-02-01 | Seed remains synthetic and local-only | static/integration | `grep -q '"fielddata": true' docker/seed/mappings.json && grep -q 'mapping_matches_phase2' docker/seed/seed.py` | yes | pending |
| 2-01-02 | 01 | 1 | REQ-measured-fix-option-a | T-02-02 | Endpoint keeps no user input and no auth | unit/static | `pytest && ruff check app && mypy app` | yes | pending |
| 2-02-01 | 02 | 2 | REQ-measured-fix-option-a | T-02-03 | Tests use fake ES and no real credentials | unit | `pytest tests/test_dashboard.py -x` | yes | pending |
| 2-02-02 | 02 | 2 | REQ-measured-fix-option-a | T-02-04 | Trap-shape assertions prevent accidental removal | unit/static | `pytest && ruff check app && mypy app` | yes | pending |
| 2-03-01 | 03 | 2 | REQ-investigation-discipline-takeaway | T-02-05 | Docs label bad code as local workshop traps | static/docs | `grep -q 'Now design a measurement whose result would \*falsify\*' README.md` | yes | pending |
| 2-03-02 | 03 | 2 | REQ-investigation-discipline-takeaway | T-02-06 | Reference does not ship hidden agent instructions | static/docs | `test ! -f CLAUDE.md && test ! -f AGENTS.md` | yes | pending |

## Wave 0 Requirements

Existing Phase 1 infrastructure covers this phase:

- `pyproject.toml` includes pytest, ruff, and mypy.
- `tests/test_dashboard.py` exists and will be extended.
- `tests/bench.sh` exists and remains the three-run latency harness.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| As-shipped Option A baseline is slow and data-grounded | REQ-measured-fix-option-a | Timing varies by hardware, Docker cache, and ES heap state | Start ES and uvicorn, run `bash tests/bench.sh`, confirm the endpoint is observably slow on the local machine and timer output exposes `count_per_user` as the first bottleneck. Calibration target example: 5-10s. Current VM UAT rerun: 3.178s, 1.850s, 1.605s. |
| After the N+1 reference fix, timing improves substantially | REQ-measured-fix-option-a | Requires applying the participant fix and rerunning live ES | Apply only the terms-aggregation replacement for per-user counts, restart uvicorn, run `bash tests/bench.sh`, and confirm `count_per_user` falls substantially with all gates green. Calibration target example: 3-6s. Current VM UAT rerun after fix and ES cache clear: 0.114s, 0.098s, 0.085s. |
| Option A arc reads correctly for a facilitator | REQ-investigation-discipline-takeaway | Human workshop flow quality | Follow README steps 1-8 and cross-check with `reference/option-a-sample-run.md`. |

## Live Calibration Evidence

Phase 2 UAT on 2026-05-07 verified that absolute timing bands are not portable
across environments, while the measured Option A lesson still holds:

- Fresh Docker cold start: ES reached green, seed exited 0, and
  `activities/_count` returned 50000.
- Starting `bash tests/bench.sh`: 3.178s, 1.850s, 1.605s.
- Starting timer evidence: `count_per_user` dominated with observed timings
  around 2723ms, 2725ms, 1741ms, and 1518ms.
- Temporary-worktree Option A fix: `uv run pytest -q`, `uv run ruff check app
  tests/test_dashboard.py`, and `uv run mypy app` stayed green.
- Post-cache-clear post-fix `bash tests/bench.sh`: 0.114s, 0.098s, 0.085s.

For Phase 2, the pass condition is relative improvement plus timer evidence.
The 5-10s and 3-6s bands remain calibration examples for target pre-flight, not
universal local-laptop assertions.

## Validation Sign-Off

- [x] All tasks have automated verify commands or documented manual Docker checks.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 requirements already covered by Phase 1 infrastructure.
- [x] No watch-mode flags in verification commands.
- [x] Feedback latency for Python checks is under 30s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** complete after Phase 2 UAT gap closure on 2026-05-07
