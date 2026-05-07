# REQUIREMENTS.md — FastAPI Perf Workshop

> Synthesized from a single SPEC. No PRDs ingested. Each requirement traces back
> to its SPEC source. Authoritative copies (with full §-references and acceptance
> criteria) live in `.planning/intel/requirements.md`.

---

## v1 Requirements

### REQ-investigation-discipline-takeaway

- **Source:** SPEC §2, §12
- **Description:** Participants leave the workshop able to apply the
  investigation discipline: when an agent says "this is slow because X,"
  the right answer is never "OK, fix X" — it is "prove that's where the time
  is, then fix the proven cause."
- **Acceptance criteria:**
  - Participant can articulate the takeaway in one sentence at the wrap-up.
  - Participant has practiced both the **pivot prompt** and the
    **falsification prompt** at least once during the exercise.
  - Participant ends with a clear before/after measurement narrative they can
    speak: *"the bottleneck was X (per the logs); we fixed it by Y; the new
    measurement is Z."*

### REQ-portable-prompt-artifacts

- **Source:** SPEC §9.2, §12, Appendix B
- **Description:** Participants leave with two stack-agnostic prompts (the
  pivot prompt and the falsification prompt) reproduced verbatim in the workshop
  README, plus the closing-slide stack-agnostic restatement and Appendix B's
  ES → Postgres / MongoDB / Spark translation table.
- **Acceptance criteria:**
  - Both exact prompt strings appear in the workshop README.
  - The closing-slide stack-agnostic restatement appears in the README.
  - Appendix B (Translate to your world) includes a column mapping each ES
    primitive to Postgres / MongoDB / Spark equivalents, and explicitly notes
    that *the prompts themselves are stack-agnostic*.

### REQ-measured-fix-option-a

- **Source:** SPEC §9, §11
- **Description:** Option A participants end with a measurably faster endpoint
  after exactly one fix (the visible N+1 trap), with the falsification step
  exercised.
- **Acceptance criteria:**
  - `pytest` green
  - `bash tests/bench.sh` shows measurable improvement vs. baseline (typically
    5–10 s → 3–6 s, per `CON-expected-timings`)
  - `ruff check app` and `mypy app` green
  - Participant has executed the falsification prompt at least once
  - One commit on the participant's branch:
    `fix: replace per-user _count loop with single terms aggregation`

### REQ-measured-fix-option-b

- **Source:** SPEC §10, §11, §16
- **Description:** Option B participants end with an endpoint roughly 50–100×
  faster than as-shipped, with three pieces of evidence that each fix did what
  was claimed, and with two of three fixes that they could not have found by
  reading source alone (mapping-as-config and `query` vs `filter`).
- **Acceptance criteria:**
  - All Option A acceptance criteria satisfied.
  - Endpoint reaches the 50–150 ms cached / 200–400 ms cold band per
    `CON-expected-timings`.
  - Three commits on the participant's branch:
    - `fix: replace per-user _count loop with single terms aggregation`
    - `fix: aggregate on username.keyword to avoid fielddata on text field`
    - `fix: move date range to filter context, round now to day for cache hit`
  - Comment block at the top of `dashboard.py` documents before/after for each
    fix.
  - Participant has discussed Monday-equivalents (per Appendix B).

### REQ-correctness-preserved

- **Source:** SPEC §8.4, §11
- **Description:** No fix may break correctness. The endpoint MUST remain
  functionally correct throughout the exercise.
- **Acceptance criteria:**
  - The 4 pytest tests in `tests/test_dashboard.py` (response shape, sort
    order, non-negative numerics, JSON-serializable) MUST be green at start
    and after every fix.

### REQ-investigation-uses-instrumentation

- **Source:** SPEC §8.2, §9 (steps 4 and 6), §10 (step 9)
- **Description:** Participants exercise the discipline of *reading* and
  *adding* instrumentation rather than guessing. The exercise forces use of
  the pre-instrumented timer output, then addition of finer-grained timers
  inside the dominant phase, then enabling ES-specific instrumentation
  (`_search?profile=true` and slow log) for traps #2 and #3.
- **Acceptance criteria:**
  - In step 4 of Option A, Claude has actually read the timer log output from
    the uvicorn console (verified by the participant via the pivot prompt).
  - In step 6 of Option A (when granularity insufficient), Claude has added
    finer-grained timers inside the dominant phase.
  - In step 9 of Option B, Claude has enabled `_search?profile=true` or the
    slow log.

### REQ-no-out-of-scope-drift

- **Source:** SPEC §15
- **Description:** The workshop and its artifacts MUST NOT teach or implement
  anything in the out-of-scope list (async/await, ES cluster ops, reindex
  migrations, k8s/production deploy, frontend, authn/authz, ES vector search /
  ML / ESQL).
- **Acceptance criteria:**
  - Workshop README and `dashboard.py` do not introduce async/await refactoring.
  - No commit on the participant's clean-run branch touches sharding, replica
    strategy, or auth.
  - No outbound mention of vector search / ML / ESQL.

---

## Traceability

Each v1 requirement is owned by the phase that **fully** satisfies its
acceptance criteria. Some requirements are partially satisfied by earlier
phases (the tracer-bullet shape means each phase delivers a thinner-but-runnable
form of the workshop end-to-end). Partial-satisfaction phases are noted in the
"Partially by" column. See `ROADMAP.md` for phase goals and success criteria.

| Requirement | Owned by | Partially by | Status |
|-------------|----------|--------------|--------|
| REQ-no-out-of-scope-drift | Phase 1 | (cross-cutting; maintained in 2/3/4) | Complete |
| REQ-correctness-preserved | Phase 1 | (maintained in 2/3/4) | Complete |
| REQ-measured-fix-option-a | Phase 2 | — | Pending |
| REQ-investigation-discipline-takeaway | Phase 2 | (closing-slide restatement in Phase 4) | Pending |
| REQ-investigation-uses-instrumentation | Phase 3 | Phase 2 (timer log read + finer-grained timers added) | Pending |
| REQ-measured-fix-option-b | Phase 4 | Phase 3 (commits 1+2 path enabled) | Pending |
| REQ-portable-prompt-artifacts | Phase 4 | Phase 1 (pivot prompt verbatim), Phase 2 (falsification prompt verbatim) | Pending |

**Coverage:** 7/7 requirements mapped. No orphans. No duplicates.

Phase 5 (dual-model pre-flight) is a validation phase that gates end-to-end
correctness across all prior phases; it does not own a single requirement
directly but is structurally required by `CON-facilitator-preflight` and the
developer-facing success metric.
