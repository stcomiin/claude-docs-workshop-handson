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
expected: Starting from the completed Option A path, README.md exposes an "Option B: steps 9-10" continuation that tells the participant to re-run the benchmark, observe `compute_org_summary` as the next dominant timer, and require `_search?profile=true` or Elasticsearch slow-log evidence before accepting a fix.
result: pass
note: "Verified README.md contains `## Option B: steps 9-10`, starts after the expected Option A commit, instructs a benchmark rerun, identifies `compute_org_summary` as the shifted dominant cost, and requires `_search?profile=true` or Elasticsearch slow-log evidence before proposing a fix."

### 2. Elasticsearch Instrumentation Commands
expected: The README gives copyable `_search?profile=true`, slow-log enable/reset, and mapping-inspection commands that match the current `compute_org_summary` query shape and prove `username` is `text` with `fielddata: true` plus a `keyword` subfield.
result: issue
reported: "Live check against Elasticsearch 9.3.3 returned HTTP 400 for the README command `POST /activities/_search?pretty&profile=true`: `request [/activities/_search] contains unrecognized parameter: [profile]`. The same query succeeds when `\"profile\": true` is placed in the request body. The mapping-inspection command works and shows `username` as `text` with `fielddata: true` plus `keyword`; the slow-log enable/reset path works and logs the expected aggregation source."
severity: major

### 3. Trap #2 Fix And Stop Boundary
expected: The README instructs the participant to change only the `username_distribution` aggregation field from `username` to `username.keyword`, run the verification gates, expect relative improvement with a 200-500 ms calibration target, create the exact second commit message, and stop before diagnosing trap #3.
result: issue
reported: "README.md contains the requested trap #2 fix instructions, the 200-500 ms calibration target, the exact second commit message, and the stop-before-trap-3 boundary. However, executing the participant-style one-line `username` to `username.keyword` change in a detached temp worktree makes `uv run pytest` fail: `test_compute_org_summary_uses_query_context_unrounded_now_and_username_text_agg` still asserts `body[\"aggs\"][\"username_distribution\"][\"terms\"][\"field\"] == \"username\"`. `uv run ruff check app` and `uv run mypy app` pass."
severity: major

### 4. Facilitator Trap #2 Reference
expected: `reference/option-a-sample-run.md` gives the facilitator an Option B steps 9-10 answer key with profile/slow-log evidence requirements, mapping proof, expected Opus/Sonnet divergence, intervention guidance, the second commit, and a clear trap #3 boundary.
result: issue
reported: "The facilitator reference contains the Option B steps 9-10 answer key, mapping proof, Opus/Sonnet divergence guidance, intervention guidance, exact second commit, and trap #3 boundary. However, it repeats the invalid `_search?profile=true` profile form and also tells participants to re-run `pytest` after the `username.keyword` fix, which conflicts with the current trap-shape test that still expects `username`."
severity: major

### 5. Regression And Guardrail Gates
expected: The local gates pass with the Phase 3 test suite: `uv run pytest` reports nine passing tests, `uv run ruff check app` passes, `uv run mypy app` passes, static tests guard the README/reference coverage, runtime tests preserve the shipped trap shape, and no `CLAUDE.md` or `AGENTS.md` files ship.
result: pass
note: "`uv run pytest` passed with 9 tests, `uv run ruff check app` passed, `uv run mypy app` passed, and `test ! -e CLAUDE.md && test ! -e AGENTS.md` passed."

## Summary

total: 5
passed: 2
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "The README gives a copyable `_search?profile=true` command that profiles the current `compute_org_summary` query shape."
  status: failed
  reason: "Live check reported: Elasticsearch 9.3.3 rejects `POST /activities/_search?pretty&profile=true` with HTTP 400 and `unrecognized parameter: [profile]`."
  severity: major
  test: 2
  root_cause: "The README documents profiling as a URL query parameter, but this Elasticsearch runtime accepts the profile option in the request body as `\"profile\": true`."
  artifacts:
    - path: "README.md"
      issue: "Profile example uses `_search?pretty&profile=true`, which is not accepted by the workshop Elasticsearch runtime."
  missing:
    - "Move the profile flag into the JSON request body or provide a tested command form accepted by Elasticsearch 9.3.3."
  debug_session: "inline: phase-3-uat-test-2-profile-command-2026-05-07"

- truth: "After the participant changes only `username_distribution` from `username` to `username.keyword`, the README verification gates should pass."
  status: failed
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
    - "Either adjust participant-facing verification so the documented fix can pass, or split the trap-shape guard from the tests participants are told to run after the fix."
  debug_session: "inline: phase-3-uat-test-3-participant-fix-pytest-2026-05-07"

- truth: "The facilitator reference gives an accurate Option B steps 9-10 answer key for trap #2."
  status: failed
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
    - "Update facilitator guidance alongside README fixes so the evidence path and post-fix verification are executable."
  debug_session: "inline: phase-3-uat-test-4-reference-check-2026-05-07"

## Fix Plans

| Gap | Root Cause | Fix Plan |
|-----|------------|----------|
| Profile command rejected by Elasticsearch | README/reference use `profile=true` as a URL query parameter; Elasticsearch 9.3.3 accepts profiling as `"profile": true` in the JSON body. | `03-04` |
| Participant fix fails pytest | Default test suite protects the shipped pre-fix `username` trap shape while README tells participants to run pytest after changing the field to `username.keyword`. | `03-04` |
| Facilitator reference inherits executable-command gaps | Reference mirrors the rejected profile form and contradictory post-fix pytest guidance. | `03-04` |
