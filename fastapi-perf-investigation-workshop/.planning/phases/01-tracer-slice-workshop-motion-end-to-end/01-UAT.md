---
status: partial
phase: 01-tracer-slice-workshop-motion-end-to-end
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md]
started: 2026-05-07T01:26:04Z
updated: 2026-05-07T02:01:41Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running FastAPI server and Compose services, clear ephemeral Elasticsearch state, start Docker Compose and uvicorn from scratch, then confirm seed completion, green or yellow ES health, live `/dashboard/summary` data, and a working `tests/bench.sh` run.
result: pass

### 2. Seeded Elasticsearch Runtime
expected: Docker Compose starts a local Elasticsearch service on `127.0.0.1:9200`, the seed service exits successfully, `activities/_count` returns 50000 documents, and the Phase 1 mapping keeps `username` as keyword-only with no trap #2 fielddata shape.
result: blocked
blocked_by: other
reason: "Current workspace is after Phase 2. ES is green, seed exited 0, and activities/_count returns 50000, but username is intentionally mapped as text with fielddata true and a keyword subfield by Phase 2, so the historical Phase 1 keyword-only mapping assertion cannot be validated on current HEAD without checking out the Phase 1 completion state."

### 3. Dashboard Endpoint and Timers
expected: `GET /dashboard/summary` returns the required `top_users` and `org_summary` shape, and the uvicorn console emits exactly `load_top_users`, `count_per_user`, and `compute_org_summary` timer lines per request.
result: pass

### 4. Trap #1 Tracer Baseline
expected: `tests/bench.sh` sends exactly three curl requests, shows a visibly slow baseline driven by `count_per_user`, and the response stays compact by returning 10 top users after evaluating 1000 candidates.
result: pass

### 5. Automated Verification Gates
expected: `pytest`, `ruff check app`, `mypy app`, Docker Compose config validation, and the absence check for `CLAUDE.md` and `AGENTS.md` all pass on the as-shipped tracer slice.
result: pass

### 6. Tracer Walkthrough Docs
expected: `README.md` contains setup prerequisites, tracer-only scope, the pivot prompt, and a 10-minute walkthrough; `reference/option-a-sample-run.md` remains a Phase 1 stub without Option A or Option B spoilers.
result: blocked
blocked_by: other
reason: "Current workspace is after Phase 2. README.md now documents the Option A path and reference/option-a-sample-run.md is a full Option A facilitator answer key, so the historical Phase 1 tracer-only README and stub-reference assertions cannot be validated on current HEAD without checking out the Phase 1 completion state."

## Summary

total: 6
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 2

## Gaps

[none yet]
