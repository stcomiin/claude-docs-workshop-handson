---
status: diagnosed
phase: 02-option-a-complete-vertical
source:
  - .planning/phases/02-option-a-complete-vertical/02-01-SUMMARY.md
  - .planning/phases/02-option-a-complete-vertical/02-02-SUMMARY.md
  - .planning/phases/02-option-a-complete-vertical/02-03-SUMMARY.md
started: 2026-05-07T02:39:52Z
updated: 2026-05-07T02:47:04Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Stop any running workshop API or Docker services, clear ephemeral Elasticsearch state so the seed runs from scratch, then start the workshop runtime. Elasticsearch reaches green or yellow, the seed/mapping step completes without errors, `curl http://localhost:8765/dashboard/summary` returns live `top_users` and `org_summary` data, and the API logs show the expected three top-level timer lines.
result: pass
note: "`docker compose down -v` cleared state, `docker compose up -d --build` rebuilt and started ES/seed, seed exited 0, cluster health was green, `activities/_count` returned 50000, `/dashboard/summary` returned live `top_users` and `org_summary`, and uvicorn emitted the three expected timer names."

### 2. Phase 2 Hidden Trap Runtime Shape
expected: The shipped starting point contains all three physical traps while remaining correct: `username` is mapped as `text` with `fielddata: true` and a `keyword` subfield, `compute_org_summary` aggregates on parent `username`, the 30-day range is under `bool.must` with non-rounded `now-30d`/`now`, and the visible per-user `_count` loop is still present for the Option A fix.
result: pass
note: "Static inspection and live ES mapping both confirmed `username` is `text` with `fielddata: true` and a `keyword` subfield; `dashboard.py` still has the per-user count loop and `compute_org_summary` uses parent `username`, `bool.must`, and non-rounded `now-30d`/`now`."

### 3. Option A Baseline Measurement
expected: Before applying any participant fix, running the documented benchmark against the fresh runtime shows the Option A baseline band, roughly 5-10 seconds on the calibration target, with the response shape intact and timer output pointing to the visible N+1 path as the first investigation target.
result: issue
reported: "Live benchmark on this VM returned 3.817440s, 2.379250s, and 2.116197s instead of the documented 5-10s calibration-target band. The endpoint response shape was correct and timer output still identified `count_per_user` as dominant, with observed count timers around 3164.3ms, 3179.4ms, 2244.6ms, and 2012.1ms."
severity: major

### 4. README Option A Investigation Arc
expected: A participant can follow the README's 8-step Option A arc from setup through the pivot moment. The pivot prompt appears verbatim, pushes Claude to use the timer log instead of code-reading guesses, and leads to the visible per-user `_count` loop as the narrow fix target.
result: pass
note: "README contains the Option A 8-step arc, the pivot prompt verbatim, the 5-10s and 3-6s timing claims, and the expected N+1 fix commit string."

### 5. Falsification Prompt And Post-Fix Measurement
expected: The README includes the falsification prompt verbatim. After applying only the documented Option A fix and committing `fix: replace per-user _count loop with single terms aggregation`, `pytest`, `ruff`, and `mypy` remain green, `bench.sh` improves to the 3-6 second band, and the remaining slowness is treated as intentional for the longer path.
result: issue
reported: "In a detached temporary worktree, applying only the participant-style N+1 fix kept `uv run pytest -q`, `uv run ruff check app tests/test_dashboard.py`, and `uv run mypy app` green, but `bash tests/bench.sh` returned 0.133278s, 0.090577s, and 0.085241s. After clearing ES fielddata/query/request caches, it still returned 0.107204s, 0.070670s, and 0.069471s. The intended 3-6s remaining-drag band was not reproduced."
severity: major

### 6. Facilitator Option A Reference
expected: `reference/option-a-sample-run.md` works as a facilitator answer key for Option A: it explains expected Opus 4.7 behavior, where Sonnet 4.6 may diverge, what "step 3 not solved in one shot" looks like, when to intervene, and why not to teach the hidden fixes yet.
result: pass
note: "Reference contains `Step 3 not solved in one shot`, `Expected Opus 4.7 behavior`, `Where Sonnet 4.6 may diverge`, intervention guidance, and no hidden-fix instructions."

### 7. Regression And Trap-Shape Tests
expected: The local verification gates pass with the expanded Phase 2 test suite: `uv run pytest -q` reports six passing tests, the trap-shape tests assert the intended mapping and request body, `uv run ruff check app tests/test_dashboard.py` passes, and `uv run mypy app` passes.
result: pass
note: "`uv run pytest -q` passed with 6 tests, `uv run ruff check app tests/test_dashboard.py` passed, and `uv run mypy app` passed."

### 8. Shipped Artifact Guardrails
expected: The deliverable does not ship `CLAUDE.md` or `AGENTS.md`, and the README/reference stay inside the workshop scope without drilling into async/await, cluster operations, reindex strategies, production deployment, frontend, auth, vector/ML, or ESQL topics.
result: pass
note: "`CLAUDE.md` and `AGENTS.md` are absent. Out-of-scope terms only appear in the README scope-guardrail list, not as instructions."

## Summary

total: 8
passed: 6
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Before applying any participant fix, the documented benchmark should show the Option A baseline band, roughly 5-10 seconds on the calibration target, while timer output points to the visible N+1 path."
  status: failed
  reason: "User-run UAT reported: live benchmark on this VM returned 3.817440s, 2.379250s, and 2.116197s instead of the documented 5-10s calibration-target band. The endpoint response shape was correct and timer output still identified `count_per_user` as dominant, with observed count timers around 3164.3ms, 3179.4ms, 2244.6ms, and 2012.1ms."
  severity: major
  test: 3
  root_cause: "The Phase 2 live timing calibration was not run before marking the phase complete. On this VM, the 50k-document/1000-user seed and Elasticsearch runtime execute the visible N+1 loop in about 2-4s rather than the documented 5-10s band. The structural trap is present, but the absolute baseline band is not portable to this environment."
  artifacts:
    - path: "tests/bench.sh"
      issue: "Three-run harness confirmed a faster-than-documented baseline on the current VM."
    - path: "app/routes/dashboard.py"
      issue: "`count_per_user` remains the dominant measured timer, so the investigation target is still correct even though the absolute band is low."
    - path: "docker/seed/build_seed.py"
      issue: "Seed shape is fixed at 50k documents across 1000 users, which is not enough to reproduce the documented baseline on this VM."
  missing:
    - "Recalibrate the seed/query/runtime shape against the target workshop machine or published image so the baseline lands in the intended teaching band."
    - "Alternatively revise README/reference language to make relative improvement the explicit acceptance criterion for non-calibration hardware."
  debug_session: "inline: phase-2-live-timing-uat-2026-05-07"

- truth: "After applying only the documented Option A N+1 fix, the verification gates should stay green and `bench.sh` should improve into the 3-6 second band, leaving intentional remaining slowness for the longer path."
  status: failed
  reason: "User-run UAT reported: in a detached temporary worktree, applying only the participant-style N+1 fix kept `uv run pytest -q`, `uv run ruff check app tests/test_dashboard.py`, and `uv run mypy app` green, but `bash tests/bench.sh` returned 0.133278s, 0.090577s, and 0.085241s. After clearing ES fielddata/query/request caches, it still returned 0.107204s, 0.070670s, and 0.069471s. The intended 3-6s remaining-drag band was not reproduced."
  severity: major
  test: 5
  root_cause: "After the visible per-user `_count` loop is removed, the remaining Phase 2 hidden traps are too cheap in the current seed/runtime: `load_top_users` measured about 60-101ms and `compute_org_summary` about 7-10ms, even after clearing ES caches. The `username` text-fielddata aggregation and non-rounded query-context date are structurally present, but they do not create the intended 3-6s post-fix drag with the current 50k-document dataset on this VM."
  artifacts:
    - path: "app/routes/dashboard.py"
      issue: "The participant-style N+1 fix reduced `count_per_user` to about 0.1-0.2ms in the temporary worktree."
    - path: "docker/seed/mappings.json"
      issue: "Trap #2 mapping is present but did not create measurable remaining drag at current seed scale."
    - path: "docker/seed/build_seed.py"
      issue: "The 50k-document seed does not make traps #2 and #3 expensive enough after the N+1 loop is removed in this environment."
    - path: "README.md"
      issue: "Documentation promises a 3-6s post-fix band that live UAT did not reproduce."
  missing:
    - "Tune the hidden-trap workload so the post-N+1-fix runtime remains materially slow on the target environment without breaking the 50k-document distribution constraint."
    - "Add a live timing calibration note or gate before Phase 2 is treated as fully shipped."
    - "Keep the documented Option A story aligned with measured behavior: either restore the 3-6s remaining-drag band or document relative/hardware-dependent timing explicitly."
  debug_session: "inline: phase-2-live-timing-uat-2026-05-07"

## Fix Plans

| Gap | Root Cause | Fix Plan |
|-----|------------|----------|
| Baseline benchmark below documented band | Phase 2 was marked complete without live calibration on this runtime; 50k docs / 1000 users produced a 2-4s baseline here. | `02-04` |
| Post-N+1-fix runtime too fast | Hidden traps #2 and #3 are structurally present but too cheap after the visible N+1 loop is removed. | `02-04` |
