---
phase: 1
slug: tracer-slice-workshop-motion-end-to-end
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-06
---

# Phase 1 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | pytest 9.0.3 |
| Config file | `pyproject.toml` |
| Quick run command | `pytest` |
| Full suite command | `pytest && ruff check app && mypy app` |
| Live smoke command | `docker compose -f docker/docker-compose.yml up -d --build && curl -fsS http://localhost:8765/dashboard/summary && bash tests/bench.sh` |
| Estimated runtime | pytest/lint/type: under 30s; live smoke depends on Docker cold start |

## Sampling Rate

- After every task commit: run `pytest` if `pyproject.toml` and tests exist.
- After every plan wave: run `pytest && ruff check app && mypy app`.
- Before `$gsd-verify-work`: run the full suite plus the live Docker/uvicorn/bench smoke.
- Max feedback latency: under 30s for automated Python checks; Docker smoke is manual/laptop-dependent.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | REQ-correctness-preserved | T-01-01 | Local ES binds only localhost and generated data is synthetic | integration smoke | `docker compose -f docker/docker-compose.yml config` | yes | pending |
| 1-01-02 | 01 | 1 | REQ-correctness-preserved | T-01-02 | Seed script targets `http://es:9200` inside Compose only | integration smoke | `curl -fsS http://localhost:9200/activities/_count` after compose up | yes | pending |
| 1-02-01 | 02 | 1 | REQ-correctness-preserved | T-02-01 | Endpoint has no user input, auth, or remote production guidance | unit/API | `pytest` | yes | pending |
| 1-02-02 | 02 | 1 | REQ-no-out-of-scope-drift | T-02-02 | No async refactor, auth, frontend, vector, ML, or ESQL | static | `ruff check app && mypy app` | yes | pending |
| 1-03-01 | 03 | 2 | REQ-no-out-of-scope-drift | T-03-01 | README clearly says local-only, security-disabled workshop runtime | static/docs | `grep -R "Prove that hypothesis with data" README.md` | yes | pending |
| 1-03-02 | 03 | 2 | REQ-correctness-preserved | T-03-02 | Bench hits only localhost endpoint | smoke | `bash tests/bench.sh` | yes | pending |

## Wave 0 Requirements

Existing infrastructure is absent at phase start. Phase 1 creates the first test
infrastructure:

- `pyproject.toml` with pytest, ruff, and mypy configuration.
- `tests/test_dashboard.py` with exactly 4 correctness tests.
- `tests/bench.sh` with the three-run curl loop.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ES cold-start reaches green/yellow in 30-90s | REQ-correctness-preserved | Depends on Docker daemon and laptop resources | Run `docker compose -f docker/docker-compose.yml up -d --build`, then `curl -fsS http://localhost:9200/_cluster/health`. |
| Trap #1 produces a visibly slow baseline | REQ-correctness-preserved | Timing varies by hardware | Start uvicorn, run `bash tests/bench.sh`, confirm the baseline is slow enough for the workshop and timer output identifies `count_per_user`. |
| README tracer walkthrough is usable | REQ-no-out-of-scope-drift | Human workshop flow | Follow the 10-minute walkthrough from a fresh clone and confirm it does not require Option A/B content. |

## Validation Sign-Off

- [x] All tasks have automated verify commands or documented manual Docker checks.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 creates all missing test infrastructure.
- [x] No watch-mode flags in verification commands.
- [x] Feedback latency for Python checks is under 30s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending execution
