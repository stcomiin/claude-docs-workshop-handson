# Phase 4: Research - Option B Trap #3 + Workshop Polish

**Researched:** 2026-05-07
**Status:** Ready for planning

## Phase Focus

Phase 4 finishes the long Option B workshop path without changing the shipped
starting point into the solved endpoint. The implementation work is mostly
documentation, source-comment scaffolding, static tests, and a temporary
participant-style verification path for the final cache fix.

## Findings

### Elasticsearch cache trap

- The current trap shape in `app/routes/dashboard.py` is aligned with the source
  SPEC: `compute_org_summary()` uses a `bool.must` range with `now-30d`/`now`
  and `size: 0` for the aggregation search body.
- Official Elastic bool-query docs distinguish `must` from `filter`: `must`
  contributes to scoring, while `filter` ignores scoring and is considered for
  caching. This supports teaching the fix as "move this non-scoring date
  constraint to filter context."
- Official shard request cache docs say the request cache normally applies to
  `size=0` search requests, caches totals/aggregations, uses the whole JSON body
  as the cache key, and most queries using `now` cannot be cached. This supports
  the two-part trap: `filter` alone is not enough if the body still changes on
  every request due to unrounded `now`.
- The participant-facing fix should be exact and narrow: in the 30-day
  aggregation search body, replace `query.bool.must` with `query.bool.filter`
  and change date math to `now-30d/d` and `now/d`.

### Evidence path

- The workshop should use the three-run `tests/bench.sh` pattern as the primary
  trap #3 evidence. After commit 2, runs 2 and 3 should not show stable cached
  behavior; after commit 3, repeated runs should show the cached path.
- Profile API remains useful as optional supporting evidence, but official docs
  warn it adds overhead and does not include network latency, queue time, or
  coordinating-node merge time. For Phase 4, it should not become the primary
  pass/fail mechanism for the cache trap.
- Slow-log guidance should stay scoped to local troubleshooting. Official docs
  say slow-log thresholds default to `-1`, search slow logs are per shard and
  phase, and slow logs should generally be enabled only while troubleshooting.

### Docs and source comments

- README is already the participant path. Keep the ES DSL primer and Appendix B
  there rather than splitting into another file.
- The existing `reference/option-a-sample-run.md` should be extended in place.
  The filename is now imperfect but stable; renaming it creates avoidable link
  churn.
- A completed top-of-file `dashboard.py` before/after comment would spoil the
  source-reading portion of the exercise. Use a non-answer template or
  instruction in shipped code; put the completed answer example in the
  facilitator reference.

### Verification implications

- Keep Docker-free tests for static docs and fake-client starting-state guards.
- Preserve the `starting_state` pytest marker: participant post-fix branches
  should use `pytest -m "not starting_state"` because the starting-state guard is
  supposed to fail after intentional fixes.
- Add static tests for Phase 4 README/reference coverage: ES DSL primer,
  Option B steps 11-12, exact commit 3, `now-30d/d`, Appendix B, closing
  restatement, and all five runbook entries.
- Include a manual or temp-worktree live verification for the final cache fix
  because the timing band depends on Docker, ES heap/cache state, uvicorn
  restart behavior, and local hardware.

## Validation Architecture

Use a two-layer validation strategy:

1. Static automated gates that run without Docker:
   - `pytest`
   - `ruff check app`
   - `mypy app`
   - static README/reference string assertions in `tests/test_dashboard.py`
   - fake-client assertions for the shipped starting-state trap shape
2. Live/manual cache verification:
   - Start Docker and uvicorn.
   - Apply the participant fix sequence in a temporary branch or worktree.
   - After commit 3, run `pytest -m "not starting_state"`, `ruff check app`,
     `mypy app`, and `tests/bench.sh`.
   - Confirm relative improvement and the target band: 50-150 ms cached /
     200-400 ms cold as calibration examples, not universal pass/fail numbers.

## Sources

- Elastic bool query docs: https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-bool-query
- Elastic shard request cache docs: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/shard-request-cache
- Elastic Profile API docs: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-profile
- Elastic slow log docs: https://www.elastic.co/docs/reference/elasticsearch/index-settings/slow-log

## RESEARCH COMPLETE
