---
phase: 4
slug: option-b-trap-3-workshop-polish
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-07
---

# Phase 4 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | pytest 9.0.3 |
| Config file | `pyproject.toml` |
| Quick run command | `pytest tests/test_dashboard.py -x` |
| Full suite command | `pytest && ruff check app && mypy app` |
| Live smoke command | `docker compose -f docker/docker-compose.yml up -d --build && tests/bench.sh` |
| Estimated runtime | Static Python gates under 30s; live Docker timing depends on cold start and local hardware |

## Sampling Rate

- After every README/reference task: run the task's grep verification.
- After every test task: run `pytest tests/test_dashboard.py -x`.
- After every wave: run `pytest && ruff check app && mypy app`.
- Before verify-work: run the full suite and, when Docker is available, a
  participant-style post-fix-3 live bench in a temporary branch or worktree.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | REQ-portable-prompt-artifacts | T-04-01 | Primer avoids production/cluster/security advice | static/docs | `grep -q '## Elasticsearch Query DSL Primer' README.md` | yes | pending |
| 4-01-02 | 01 | 1 | REQ-measured-fix-option-b | T-04-02 | Step 11 keeps fix narrow and evidence-first | static/docs | `grep -q 'Option B: steps 11-12' README.md && grep -q 'fix: move date range to filter context, round now to day for cache hit' README.md` | yes | pending |
| 4-01-03 | 01 | 1 | REQ-measured-fix-option-b | T-04-03 | Source comment template does not reveal answers | static/code | `grep -q 'Final Option B notes' app/routes/dashboard.py` | yes | pending |
| 4-02-01 | 02 | 1 | REQ-measured-fix-option-b | T-04-04 | Reference gives facilitator-only completed path | static/docs | `grep -q 'Option B steps 11-12' reference/option-a-sample-run.md` | yes | pending |
| 4-02-02 | 02 | 1 | REQ-portable-prompt-artifacts | T-04-05 | Runbook captures local troubleshooting only | static/docs | `grep -q 'Failure-mode runbook' reference/option-a-sample-run.md` | yes | pending |
| 4-03-01 | 03 | 2 | REQ-portable-prompt-artifacts | T-04-06 | Pytest locks README portable artifacts | unit/static | `pytest tests/test_dashboard.py -x` | yes | pending |
| 4-03-02 | 03 | 2 | REQ-measured-fix-option-b | T-04-07 | Starting-state trap remains intact | unit/static | `pytest && ruff check app && mypy app` | yes | pending |

## Wave 0 Requirements

Existing infrastructure covers this phase:

- `pyproject.toml` registers `starting_state`.
- `tests/test_dashboard.py` uses a fake ES client and local file assertions.
- `tests/bench.sh` already performs three sequential requests.
- README and facilitator reference already exist.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Post-fix-3 cached/cold timing band | REQ-measured-fix-option-b | Requires Docker, uvicorn, ES cache state, and participant branch fixes | In a temporary branch or worktree, apply the three participant fixes, restart uvicorn without `--reload`, run `pytest -m "not starting_state"`, `ruff check app`, `mypy app`, and `tests/bench.sh`; confirm relative improvement and target 50-150 ms cached / 200-400 ms cold examples. |
| Warm cache masking failure mode | REQ-measured-fix-option-b | Requires manipulating ES cache or restart state | Run the bench before and after clearing/restarting enough ES/app state to show cold vs cached behavior; record facilitator intervention in the runbook. |

## Validation Sign-Off

- [x] All tasks have automated verify commands or documented manual Docker checks.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 requirements already covered by earlier phases.
- [x] No watch-mode flags in verification commands.
- [x] Feedback latency for Python checks is under 30s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending Phase 4 execution and UAT
