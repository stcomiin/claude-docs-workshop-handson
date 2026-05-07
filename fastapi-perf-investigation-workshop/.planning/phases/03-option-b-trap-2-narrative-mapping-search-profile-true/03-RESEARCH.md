# Phase 3: Option B Trap #2 Narrative - Research

**Researched:** 2026-05-07
**Domain:** FastAPI + Elasticsearch performance workshop Option B steps 9-10
**Confidence:** HIGH for docs/test planning; live timing still requires Docker calibration

## User Constraints

No `CONTEXT.md` exists for this phase. Planning proceeds from `.planning/ROADMAP.md`,
`.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/intel/*`, Phase 2
artifacts, the current runtime files, and the source SPEC.

### Locked Scope From Roadmap And Intel

- Extend the existing Option A slice into Option B steps 9 and 10.
- The participant has already applied fix #1 on their branch:
  `fix: replace per-user _count loop with single terms aggregation`.
- README must teach the next measured investigation: re-measure, observe
  `compute_org_summary` as the dominant remaining cost, then use
  `_search?profile=true` or the Elasticsearch slow log.
- The investigation must lead to trap #2: `username_distribution` aggregates on
  parent `username`, while `docker/seed/mappings.json` maps `username` as
  `text` with `fielddata: true` and an already-existing `username.keyword`
  subfield.
- The participant fix is to switch the aggregation field from `username` to
  `username.keyword`. No re-index is needed because the keyword subfield already
  exists in the shipped mapping.
- The expected participant commit string is exactly:
  `fix: aggregate on username.keyword to avoid fielddata on text field`.
- Post-fix-2 timing target is the calibration example band `200-500 ms`, with
  relative improvement plus timer/profile evidence as the binding local pass
  condition.
- Trap #3 remains physically present after this phase: `compute_org_summary`
  still uses query context via `bool.must` and non-rounded `now-30d` / `now`.
  Phase 3 must not teach the `now-30d/d` or filter-context fix.
- Preserve no-shipped-agent-files: do not create `CLAUDE.md` or `AGENTS.md`.
- Do not introduce out-of-scope topics: async/await refactors, ES cluster ops,
  reindex strategy drills, production deployment, frontend, auth, vector/ML/ESQL.

### The Agent's Discretion

- `reference/option-a-sample-run.md` may be extended rather than renamed. Keeping
  the filename avoids link churn and is permitted by the roadmap.
- Static pytest coverage may assert README/reference strings and the intentional
  pre-fix runtime trap shape. Live ES timing stays manual because the project
  already treats timing as hardware-dependent.
- README command snippets may use direct `curl` calls to localhost ES because the
  workshop runtime disables ES security for local-only use.

## Summary

Phase 3 is primarily a workshop narrative and validation slice. The shipped app
should still contain trap #2 before the participant acts; the deliverable change
is that README and the facilitator reference now explain how to prove that trap
with Elasticsearch instrumentation and apply the second participant commit.

The main planning risk is accidentally implementing the `username.keyword` fix
in the workshop starting code. That would remove the hidden trap from the
participant experience. Plans should instead update README/reference/test
artifacts so execution preserves the pre-fix runtime and documents the expected
participant branch outcome.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Option B steps 9-10 participant flow | Documentation | CLI/workshop process | README owns participant commands and stop conditions. |
| Trap #2 evidence path | Documentation | Elasticsearch runtime | Profile/slow log plus mapping inspection prove the non-code-visible cause. |
| Facilitator answer key | Reference docs | Workshop process | Facilitators need expected Opus/Sonnet behavior and intervention points. |
| Trap-boundary regression guards | Tests | Runtime/docs | Pytest can statically protect docs and pre-fix trap shape without Docker. |

## Standard Stack

No new dependency is required.

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | App, tests, and seed scripts |
| FastAPI | 0.136.1 | Existing dashboard endpoint |
| Elasticsearch server | 9.3.3 Docker image | Local seeded data store |
| `elasticsearch` Python client | 9.3.0 | API-to-ES transport |
| pytest / ruff / mypy | 9.0.3 / 0.15.12 / 1.20.2 | Verification gates |
| `curl` / `docker compose logs` | local CLI | Participant instrumentation commands |

## Architecture Patterns

### Pattern: Docs Extend The Participant Branch, Not The Shipped Starting Point

The repo remains the workshop starting point. It keeps:

```python
"username_distribution": {"terms": {"field": "username", "size": 10}}
```

Option B steps 9-10 tell the participant to change that field to:

```python
"username_distribution": {"terms": {"field": "username.keyword", "size": 10}}
```

The docs should make clear that this is commit 2 on the participant branch,
after commit 1 has already fixed the visible per-user count loop.

### Pattern: `_search?profile=true` Against The Same Aggregation Shape

README should provide a copyable local command that profiles the same logical
work as `compute_org_summary`:

```bash
curl -s -X POST 'http://localhost:9200/activities/_search?pretty&profile=true' \
  -H 'Content-Type: application/json' \
  -d '{
    "size": 0,
    "track_total_hits": true,
    "query": {
      "bool": {
        "must": [
          {"range": {"created_at": {"gte": "now-30d", "lt": "now"}}}
        ]
      }
    },
    "aggs": {
      "unique_users": {"cardinality": {"field": "user_id"}},
      "username_distribution": {"terms": {"field": "username", "size": 10}}
    }
  }'
```

The expected teaching point is not deep Lucene internals. The profile output
should point attention at the aggregation work under `username_distribution`;
mapping inspection then explains why `username` loads fielddata and why
`username.keyword` is the no-reindex fix.

### Pattern: Slow Log As Alternative Instrumentation

README should also include a local-only slow-log path:

```bash
curl -s -X PUT 'http://localhost:9200/activities/_settings' \
  -H 'Content-Type: application/json' \
  -d '{
    "index.search.slowlog.threshold.query.trace": "0ms",
    "index.search.slowlog.threshold.fetch.trace": "0ms"
  }'

bash tests/bench.sh
docker compose -f docker/docker-compose.yml logs es | grep 'index.search.slowlog'

curl -s -X PUT 'http://localhost:9200/activities/_settings' \
  -H 'Content-Type: application/json' \
  -d '{
    "index.search.slowlog.threshold.query.trace": "-1",
    "index.search.slowlog.threshold.fetch.trace": "-1"
  }'
```

The docs must warn that `0ms` logs every matching local search and is for the
single-node workshop runtime only.

### Pattern: Mapping Inspection Confirms The Fix Path

The no-reindex path depends on the already-seeded multi-field:

```bash
curl -s 'http://localhost:9200/activities/_mapping?filter_path=*.mappings.properties.username' \
  | python -m json.tool
```

Expected evidence:

```json
"username": {
  "type": "text",
  "fielddata": true,
  "fields": {
    "keyword": {
      "type": "keyword"
    }
  }
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Profile evidence | New Python ES profiler helper | README `curl ... _search?profile=true` | Participants need stack-native instrumentation they can reuse. |
| Slow-log visibility | App logging wrapper | ES index slow-log settings plus `docker compose logs es` | Keeps the lesson in Elasticsearch instrumentation. |
| Mapping proof | String guesses from `dashboard.py` | `curl ... _mapping` and mapping JSON | Trap #2 lives in mapping config, not route code alone. |
| Timing assertions | Hard-coded pytest latency | Manual Docker/bench calibration | Timing is intentionally hardware-dependent. |

## Common Pitfalls

### Pitfall 1: Applying The Fix In The Shipped Runtime

**What goes wrong:** `app/routes/dashboard.py` is changed to
`username.keyword` during execution, removing the participant's trap #2.
**Prevention:** Plans should modify docs/tests and assert the starting point
still contains parent `username` before participant fixes.

### Pitfall 2: Teaching The Phase 4 Cache Fix Too Early

**What goes wrong:** README tells participants to move the date range to
`filter` context or round to `now-30d/d` in steps 9-10.
**Prevention:** Phase 3 docs stop after the keyword aggregation fix and state
that cache behavior remains unresolved for Phase 4.

### Pitfall 3: Treating `_search?profile=true` As Optional Decoration

**What goes wrong:** The docs name the command but still allow code-reading to
be the proof.
**Prevention:** Step 9 must require either profile output or slow-log evidence
before accepting the mapping hypothesis.

### Pitfall 4: Suggesting Reindexing

**What goes wrong:** Trap #2 becomes a production migration lesson.
**Prevention:** Docs must say no re-index is needed in this workshop because
`username.keyword` already exists in the seeded mapping.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | pytest 9.0.3 |
| Config file | `pyproject.toml` |
| Quick run command | `pytest` |
| Full suite command | `pytest && ruff check app && mypy app` |

### Phase Requirements To Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| REQ-investigation-uses-instrumentation | README documents `_search?profile=true` and slow-log instrumentation in Option B step 9 | static/docs | `pytest tests/test_dashboard.py -x` | yes |
| REQ-investigation-uses-instrumentation | Reference documents profile/slow-log -> mapping -> keyword fix path | static/docs | `pytest tests/test_dashboard.py -x` | yes |
| REQ-investigation-uses-instrumentation | Starting runtime still exposes trap #2 and trap #3 for participant investigation | unit/static | `pytest && ruff check app && mypy app` | yes |

### Sampling Rate

- Per docs task: run grep checks for exact required strings.
- Per test task: run `pytest tests/test_dashboard.py -x`.
- Per phase gate: run `pytest && ruff check app && mypy app`; live Docker
  profile/bench verification remains a manual calibration check.

### Wave 0 Gaps

None. Existing pytest/ruff/mypy infrastructure covers this phase. Phase 3 adds
static doc guards to the existing test file.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth surface; local workshop only. |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | No protected resources; synthetic local data. |
| V5 Input Validation | low | Endpoint has no user-supplied input. |
| V9 Communications | low | Localhost ES security-disabled note must remain explicit. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Security-disabled ES copied as production guidance | Information Disclosure | README labels ES security as local workshop-only. |
| Slow-log `0ms` command copied to production | Denial of Service | README scopes it to local troubleshooting and includes reset command. |
| Bad ES aggregation copied as recommendation | Tampering | Docs call parent `username` an intentional trap and instruct participant fix. |

## Sources

### Primary Local Sources

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/intel/constraints.md`
- `.planning/phases/02-option-a-complete-vertical/02-RESEARCH.md`
- `../docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md`
- `README.md`
- `reference/option-a-sample-run.md`
- `app/routes/dashboard.py`
- `docker/seed/mappings.json`
- `tests/test_dashboard.py`

### Official Elasticsearch Sources

- Profile API: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-profile
- Slow logs: https://www.elastic.co/docs/deploy-manage/monitor/logging-configuration/slow-logs
- Text field fielddata: https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text
- Multi-fields: https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/multi-fields

## RESEARCH COMPLETE
