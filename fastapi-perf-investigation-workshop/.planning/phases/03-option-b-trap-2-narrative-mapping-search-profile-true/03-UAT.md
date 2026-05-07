---
status: complete
phase: 03-option-b-trap-2-narrative-mapping-search-profile-true
source:
  - .planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-01-SUMMARY.md
  - .planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-02-SUMMARY.md
  - .planning/phases/03-option-b-trap-2-narrative-mapping-search-profile-true/03-03-SUMMARY.md
started: 2026-05-07T06:42:55Z
updated: 2026-05-07T08:28:37Z
---

## Current Test

[testing complete]

## Tests

### 1. README Option B Continuation
expected: Starting from the completed Option A path, README.md exposes an "Option B: steps 9-10" continuation that tells the participant to re-run the benchmark, observe `compute_org_summary` as the next dominant timer, and require Elasticsearch Profile API or slow-log evidence before accepting a fix.
result: pass
note: "Verified README.md contains `## Option B: steps 9-10`, starts after the expected Option A commit, instructs a benchmark rerun, identifies `compute_org_summary` as the shifted dominant cost, and requires Elasticsearch Profile API or slow-log evidence before proposing a fix."

### 2. Elasticsearch Instrumentation Commands
expected: The README gives copyable Profile API, slow-log enable/reset, and mapping-inspection commands that match the current `compute_org_summary` query shape and prove `username` is `text` with `fielddata: true` plus a `keyword` subfield.
result: pass
note: "After `03-04`, README.md uses `POST /activities/_search?pretty` with `\"profile\": true` in the request body. Live verification returned a response containing `profile`; mapping inspection worked; slow-log enable/reset worked and logged the expected aggregation source."

### 3. Trap #2 Fix And Stop Boundary
expected: The README instructs the participant to change only the `username_distribution` aggregation field from `username` to `username.keyword`, run the verification gates, expect relative improvement with a 200-500 ms calibration target, create the exact second commit message, and stop before diagnosing trap #3.
result: pass
note: "After `03-04`, README.md documents `pytest -m \"not starting_state\"` for post-fix verification. In a detached temp worktree with only the participant `username.keyword` fix applied, `uv run pytest -m \"not starting_state\"`, `uv run ruff check app`, and `uv run mypy app` all passed."

### 4. Facilitator Trap #2 Reference
expected: `reference/option-a-sample-run.md` gives the facilitator an Option B steps 9-10 answer key with profile/slow-log evidence requirements, mapping proof, expected Opus/Sonnet divergence, intervention guidance, the second commit, and a clear trap #3 boundary.
result: pass
note: "After `03-04`, the facilitator reference describes the Profile API body form, keeps the slow-log evidence path, documents the mapping proof, model divergence, second commit, and trap #3 boundary, and uses the same post-fix test command as README.md."

### 5. Regression And Guardrail Gates
expected: The local gates pass with the Phase 3 test suite: `uv run pytest` reports nine passing tests, `uv run ruff check app` passes, `uv run mypy app` passes, static tests guard the README/reference coverage, runtime tests preserve the shipped trap shape, and no `CLAUDE.md` or `AGENTS.md` files ship.
result: pass
note: "`uv run pytest` passed with 9 tests, `uv run ruff check app` passed, `uv run mypy app` passed, and `test ! -e CLAUDE.md && test ! -e AGENTS.md` passed."

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "The README gives a copyable Profile API command that profiles the current `compute_org_summary` query shape."
  status: resolved
  reason: "Live check reported: Elasticsearch 9.3.3 rejects `POST /activities/_search?pretty&profile=true` with HTTP 400 and `unrecognized parameter: [profile]`."
  severity: major
  test: 2
  root_cause: "The README documents profiling as a URL query parameter, but this Elasticsearch runtime accepts the profile option in the request body as `\"profile\": true`."
  artifacts:
    - path: "README.md"
      issue: "Profile example uses `_search?pretty&profile=true`, which is not accepted by the workshop Elasticsearch runtime."
  missing:
    - "[closed by 03-04] README/reference now use `\"profile\": true` in the JSON request body and live verification confirmed a `profile` response."
  debug_session: "inline: phase-3-uat-test-2-profile-command-2026-05-07"

- truth: "After the participant changes only `username_distribution` from `username` to `username.keyword`, the README verification gates should pass."
  status: resolved
  reason: "Detached temp worktree check reported: `uv run pytest` fails after the documented one-line fix because the Phase 3 runtime trap-shape test still expects the aggregation field to be `username`."
  severity: major
  test: 3
  root_cause: "The test suite is written to protect the shipped pre-fix workshop starting state, but README.md instructs participants to run the same pytest suite after applying the Phase 3 participant fix. The documented fix conflicts with `test_compute_org_summary_uses_query_context_unrounded_now_and_username_text_agg`."
  artifacts:
    - path: "README.md"
      issue: "Step 10 tells participants to run `pytest` after changing `username` to `username.keyword`."
    - path: "tests/test_dashboard.py"
      issue: "`test_compute_org_summary_uses_query_context_unrounded_now_and_username_text_agg` asserts the pre-fix `username` aggregation field."
  missing:
    - "[closed by 03-04] `starting_state` marks the shipped pre-fix trap-shape test; README/reference use `pytest -m \"not starting_state\"` after commit 2."
  debug_session: "inline: phase-3-uat-test-3-participant-fix-pytest-2026-05-07"

- truth: "The facilitator reference gives an accurate Option B steps 9-10 answer key for trap #2."
  status: resolved
  reason: "Reference check reported: the answer key has the expected sections, but repeats the invalid `_search?profile=true` profile form and the post-fix `pytest` gate that fails after the documented `username.keyword` change."
  severity: major
  test: 4
  root_cause: "The reference mirrors the README's untested profile syntax and participant post-fix verification instructions, so facilitator guidance inherits the same two Phase 3 UAT failures."
  artifacts:
    - path: "reference/option-a-sample-run.md"
      issue: "Uses `_search?profile=true` for the profile path against the workshop Elasticsearch runtime."
    - path: "reference/option-a-sample-run.md"
      issue: "Tells participants to run `pytest` after commit 2 even though the current test suite protects the pre-fix `username` trap shape."
  missing:
    - "[closed by 03-04] Facilitator guidance now mirrors the tested Profile API body form and post-fix verification command."
  debug_session: "inline: phase-3-uat-test-4-reference-check-2026-05-07"

## Fix Plans

| Gap | Root Cause | Fix Plan |
|-----|------------|----------|
| Profile command rejected by Elasticsearch | README/reference used `profile=true` as a URL query parameter; Elasticsearch 9.3.3 accepts profiling as `"profile": true` in the JSON body. | `03-04` complete |
| Participant fix failed pytest | Default test suite protects the shipped pre-fix `username` trap shape while README told participants to run pytest after changing the field to `username.keyword`. | `03-04` complete |
| Facilitator reference inherited executable-command gaps | Reference mirrored the rejected profile form and contradictory post-fix pytest guidance. | `03-04` complete |
