# Phase 2: Option A Complete Vertical - Research

**Researched:** 2026-05-06
**Domain:** FastAPI + Elasticsearch performance workshop Option A starting point
**Confidence:** HIGH for planning; timing bands still require live laptop calibration

## User Constraints

No `CONTEXT.md` exists for this phase. Planning proceeds from `.planning/ROADMAP.md`,
`.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/intel/*`, the
Phase 1 summaries, and the source SPEC.

### Locked Scope From Roadmap And Intel

- Add trap #2 physically: `docker/seed/mappings.json` defines `username` as
  `{"type": "text", "fielddata": true, "fields": {"keyword": {"type": "keyword"}}}`.
- Keep the endpoint aggregation targeting parent `username`, not
  `username.keyword`, so fielddata is loaded and the endpoint stays slow but
  correct.
- Add trap #3 physically: the 30-day `created_at` range for
  `unique_users_30d` runs in query context under `bool.must` and uses
  millisecond-precise `now-30d`, not `now-30d/d`.
- Preserve the Phase 1 visible N+1 `_count` loop as the Option A fix target.
- Preserve exactly the three top-level timer blocks: `load_top_users`,
  `count_per_user`, and `compute_org_summary`.
- Complete the Option A 8-step arc in `README.md`, including the pivot prompt
  and falsification prompt verbatim.
- Complete `reference/option-a-sample-run.md` as the Option A facilitator
  answer key, including expected Claude behavior, Sonnet divergence, and what
  "step 3 not solved in one shot" looks like.
- Do not narratively engage Option B fixes in README Option A content.
- Do not ship `CLAUDE.md` or `AGENTS.md`.
- Do not introduce out-of-scope topics: async/await refactors, ES cluster ops,
  reindex strategy drills, production deployment, frontend, auth, vector/ML/ESQL.

### The Agent's Discretion

- The exact internal shape of `compute_org_summary` may change if it preserves
  the response contract and leaves trap #2 and trap #3 physically present.
- Tests may assert the intentional trap shape by inspecting mapping JSON and
  fake-client request bodies.
- Live timing calibration may remain a facilitator/manual check because
  hardware variance is expected.

## Summary

Phase 2 converts the Phase 1 tracer into the real Option A starting point. The
implementation should be deliberately slow in three layers: the existing N+1
loop, a `username` text aggregation with `fielddata: true`, and query-context
date math using non-rounded `now`. Option A still teaches and fixes only the
visible N+1 bottleneck; the two hidden traps remain as physical drag so the
post-fix timing band lands around 3-6 seconds and Phases 3/4 can extend the
same slice.

The highest-risk implementation detail is seed idempotency. Phase 1 only
reseeded when the document count was wrong, so an existing named Docker volume
would keep the old keyword-only mapping after `mappings.json` changes. Phase 2
must update `docker/seed/seed.py` to detect the Phase 2 mapping shape and
recreate the index when the mapping is stale. Without that, a fresh clone works
but local iterative runs silently miss trap #2.

**Primary recommendation:** create three plans: `02-01` for runtime trap
introduction, `02-02` for correctness and trap-shape tests, and `02-03` for the
complete Option A README/reference path.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Hidden ES mapping trap | Database/Storage | Docker seed runtime | The slow behavior depends on index mapping, not route code alone. |
| Hidden query/cache trap | API/Backend | Database/Storage | `dashboard.py` sends a valid but cache-hostile ES query. |
| Visible N+1 trap | API/Backend | Database/Storage | The Option A fix target remains the per-user count loop. |
| Correctness and trap-shape tests | Test infrastructure | API/Backend | Tests keep the endpoint correct and prevent accidental removal of traps. |
| Option A workshop arc | Documentation | CLI/workshop process | README and reference guide the participant behavior and expected outcomes. |

## Standard Stack

Phase 2 uses the Phase 1 pinned stack; no new dependency is required.

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Python | 3.11+ | App and seed scripts | Already established in Phase 1 and required by the SPEC. |
| FastAPI | 0.136.1 | Dashboard endpoint | Existing Phase 1 app surface. |
| Uvicorn | 0.46.0 | Local ASGI server | Existing participant runtime command. |
| Elasticsearch server | 9.3.3 Docker image | Local seeded data store | Existing Compose runtime. |
| `elasticsearch` Python client | 9.3.0 | API-to-ES transport | Existing app dependency. |
| pytest / ruff / mypy | 9.0.3 / 0.15.12 / 1.20.2 | Verification gates | Existing Phase 1 quality gates. |

## Architecture Patterns

### Runtime Data Flow

```text
docker compose up -d
  -> seed service checks activities mapping and count
  -> stale Phase 1 mapping triggers index delete/recreate
  -> Phase 2 mapping loads username as text + fielddata + keyword subfield

GET /dashboard/summary
  -> load_top_users timer: terms agg on user_id + top_hits username
  -> count_per_user timer: one count request per candidate user (trap #1)
  -> compute_org_summary timer:
       - last 30d search uses bool.must range now-30d..now (trap #3)
       - username_distribution terms agg targets username (trap #2)
       - prior 30d count/search preserves growth calculation
```

### Pattern: Stale Mapping Detection In Seed Script

The seed script should inspect `GET /activities/_mapping` before accepting an
existing index. The required shape is:

```json
{
  "username": {
    "type": "text",
    "fielddata": true,
    "fields": {
      "keyword": {"type": "keyword"}
    }
  }
}
```

If the document count is 50000 but `username` is still `keyword`, the script
must delete and recreate the index. This keeps local reruns consistent with
fresh participant clones.

### Pattern: Query Context Trap Without Breaking Correctness

`compute_org_summary` should keep `size: 0` on aggregation searches so the
request cache remains conceptually eligible once Phase 4 makes the body
deterministic. Use `bool.must` plus `now-30d` for the last-30-day query in Phase
2, and keep response values derived from ES results so pytest remains
meaningful.

### Pattern: Option A Docs Keep The Fix Narrow

README and reference docs should name the single expected participant commit:

```text
fix: replace per-user _count loop with single terms aggregation
```

The docs may say hidden drag remains after the Option A fix, but should not
teach the `username.keyword` or filter-context fixes in this phase's Option A
path.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mapping validation | String-only JSON greps in seed runtime | Parse mapping JSON returned by ES | Existing volumes need semantic stale-mapping detection. |
| Timing harness | New Python benchmark tool | Existing `tests/bench.sh` curl loop | The workshop teaches shell-visible measurements. |
| Test data source | Live Docker requirement for pytest | Fake ES client plus request-body assertions | Keeps pytest fast while preserving trap checks. |
| Option A troubleshooting | Hidden agent instructions | `reference/option-a-sample-run.md` | Matches existing workshop convention without shipping `AGENTS.md`. |

## Common Pitfalls

### Pitfall 1: Existing Docker Volume Keeps Phase 1 Mapping

**What goes wrong:** `mappings.json` changes but `activities` already exists
with `username` as `keyword`, so trap #2 is absent.
**Prevention:** seed script must recreate the index when the mapping shape does
not match Phase 2.

### Pitfall 2: Trap #3 Accidentally Breaks Growth Calculation

**What goes wrong:** the top-level query filters out prior 30-day documents
before `prior_30d` is computed.
**Prevention:** if using a last-30-day search for unique users, compute the
prior count with a separate range query or an equivalent aggregation that still
sees prior-period documents.

### Pitfall 3: Docs Spoil Option B

**What goes wrong:** Option A README/reference tells participants to switch to
`username.keyword` or move date filters to `filter` context.
**Prevention:** Phase 2 docs should stop after the N+1 fix and state that
remaining slowness is intentionally left for longer paths.

### Pitfall 4: Falsification Becomes A Decorative Prompt

**What goes wrong:** README includes the falsification prompt but does not make
participants run it before fixing.
**Prevention:** the Option A arc must place falsification at step 5 and require
the participant to report what result would disprove the hypothesis.

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
| REQ-measured-fix-option-a | Starting point has all three traps and remains correct | unit/static | `pytest && ruff check app && mypy app` | yes |
| REQ-measured-fix-option-a | Mapping uses text + fielddata + keyword subfield | unit/static | `pytest tests/test_dashboard.py -x` | yes |
| REQ-investigation-discipline-takeaway | README includes pivot and falsification prompts in the 8-step arc | docs/static | `grep -q 'Now design a measurement whose result would \\*falsify\\*' README.md` | yes |

### Sampling Rate

- Per task commit: `pytest` for code/test tasks; grep checks for docs tasks.
- Per wave merge: `pytest && ruff check app && mypy app`.
- Phase gate: full suite plus live Docker/uvicorn/bench smoke when Docker is
  available.

### Wave 0 Gaps

None. Existing Phase 1 test infrastructure covers the endpoint. Phase 2 extends
`tests/test_dashboard.py`.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth surface; local workshop only. |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | No protected resources; synthetic local data. |
| V5 Input Validation | low | Endpoint has no user-supplied input. |
| V6 Cryptography | no | No secrets or cryptographic workflows. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Security-disabled ES copied into production guidance | Information Disclosure | README/reference must label ES as localhost workshop runtime only. |
| Deliberately bad queries copied as recommended code | Tampering | Docs must call them intentional performance traps. |
| Existing local ES data accidentally queried | Information Disclosure | App defaults to localhost and tests use fake synthetic data. |

## Open Questions (RESOLVED)

1. **Should Phase 2 add a registry-pushed image tag?** RESOLVED: no. Phase 5
   owns published-image validation and distribution.
2. **Should Phase 2 document Option B fixes?** RESOLVED: no. Phase 2 may say
   hidden drag remains, but Phase 3/4 own the deeper narrative.

## Sources

### Primary

- Local SPEC: `../docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md`
- Local constraints: `.planning/intel/constraints.md`
- Local roadmap: `.planning/ROADMAP.md`
- Elastic text field / fielddata docs: https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text
- Elastic query/filter context docs: https://www.elastic.co/docs/reference/query-languages/query-dsl/query-filter-context
- Elastic node query cache docs: https://www.elastic.co/docs/reference/elasticsearch/configuration-reference/node-query-cache-settings
- Elastic shard request cache docs: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/shard-request-cache
- Elastic profile API docs: https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-profile

### Local Implementation

- `app/routes/dashboard.py`
- `docker/seed/mappings.json`
- `docker/seed/seed.py`
- `tests/test_dashboard.py`
- `.planning/phases/01-tracer-slice-workshop-motion-end-to-end/01-01-SUMMARY.md`
- `.planning/phases/01-tracer-slice-workshop-motion-end-to-end/01-02-SUMMARY.md`
- `.planning/phases/01-tracer-slice-workshop-motion-end-to-end/01-03-SUMMARY.md`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - existing Phase 1 pins and green gates.
- Architecture: HIGH - directly constrained by SPEC and current code.
- Pitfalls: HIGH - verified against local implementation and official Elastic docs.

**Research date:** 2026-05-06
**Valid until:** Phase 5 calibration or ES version change.

## RESEARCH COMPLETE
