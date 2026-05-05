# Requirements

No PRDs were ingested. The single SPEC, however, declares workshop-level participant outcomes in §2, §3, and §12 that function as requirements (what participants leave the workshop *with*). They are extracted here so the roadmapper can plan against them.

Each requirement traces back to its SPEC source. None have multiple competing acceptance variants (single-doc ingest), so the `competing-variants` bucket in the conflicts report is empty by construction.

---

## REQ-investigation-discipline-takeaway

- **Source:** `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md` §2, §12
- **Description:** Participants leave the workshop able to apply the investigation discipline: "When an agent says 'this is slow because X,' the right answer is never 'OK, fix X' — it's 'prove that's where the time is, then fix the proven cause.'"
- **Acceptance criteria:**
  - Participant can articulate the takeaway in one sentence at the wrap-up.
  - Participant has practiced both the **pivot prompt** and the **falsification prompt** at least once during the exercise.
  - Participant ends the session with a clear before/after measurement narrative they can speak: *"the bottleneck was X (per the logs); we fixed it by Y; the new measurement is Z."*
- **Scope:** Workshop pedagogical outcome (Option A and Option B)

---

## REQ-portable-prompt-artifacts

- **Source:** §9.2, §12, Appendix B
- **Description:** Participants leave with two stack-agnostic prompts they can reuse on Monday on their own production code: the **pivot prompt** ("prove that hypothesis with data") and the **falsification prompt** ("design a measurement that would falsify"). Both prompts are reproduced in workshop README.
- **Acceptance criteria:**
  - Both exact prompt strings appear in the workshop README.
  - The closing-slide stack-agnostic restatement appears in the README.
  - Appendix B (Translate to your world) includes a column mapping each ES primitive to Postgres / MongoDB / Spark equivalents — but explicitly notes the *prompts themselves are stack-agnostic*.
- **Scope:** Workshop README content (workshop's portable take-aways)

---

## REQ-measured-fix-option-a

- **Source:** §9, §11
- **Description:** Option A participants end with a measurably faster endpoint after exactly one fix (the visible N+1 trap), with falsification step exercised.
- **Acceptance criteria:**
  - `pytest` green
  - `bash tests/bench.sh` shows measurable improvement vs. baseline (typically 5–10s → 3–6s per `CON-expected-timings`)
  - `ruff check app` and `mypy app` green
  - Participant has executed the falsification prompt at least once
  - One commit shape on participant's branch: `fix: replace per-user _count loop with single terms aggregation`
- **Scope:** Option A end-state

---

## REQ-measured-fix-option-b

- **Source:** §10, §11, §16
- **Description:** Option B participants end with an endpoint roughly 50–100× faster than as-shipped, with three pieces of evidence that each fix did what was claimed, and with two of three fixes that they could not have found by reading the source alone (mapping-as-config and `query` vs `filter`).
- **Acceptance criteria:**
  - All Option A acceptance criteria satisfied
  - Endpoint reaches the 50–150 ms cached / 200–400 ms cold band per `CON-expected-timings`
  - Three commits on participant's branch:
    - `fix: replace per-user _count loop with single terms aggregation`
    - `fix: aggregate on username.keyword to avoid fielddata on text field`
    - `fix: move date range to filter context for request-cache hit`
  - Comment block at top of `dashboard.py` documents before/after for each fix
  - Participant has discussed Monday-equivalents (per Appendix B)
- **Scope:** Option B end-state

---

## REQ-correctness-preserved

- **Source:** §8.4, §11
- **Description:** No fix may break correctness. The endpoint MUST remain functionally correct throughout the exercise.
- **Acceptance criteria:**
  - The 4 pytest tests in `tests/test_dashboard.py` (response shape, sort order, non-negative numerics, JSON-serializable) MUST be green at start and after every fix.
- **Scope:** All steps of Option A and Option B

---

## REQ-investigation-uses-instrumentation

- **Source:** §8.2, §9 (steps 4 and 6), §10 (step 9)
- **Description:** Participants exercise the discipline of *reading* and *adding* instrumentation rather than guessing. The exercise forces them to use the pre-instrumented timer output, then add finer-grained timers inside the dominant phase, then enable ES-specific instrumentation (`_search?profile=true` and slow log) for traps #2 and #3.
- **Acceptance criteria:**
  - In step 4 of Option A, Claude has actually read the timer log output from the uvicorn console (verified by the participant via the pivot prompt).
  - In step 6 of Option A (when granularity insufficient), Claude has added finer-grained timers inside the dominant phase.
  - In step 9 of Option B, Claude has enabled `_search?profile=true` or the slow log.
- **Scope:** Workshop pedagogical mechanic (the "instrumentation discipline" half of the lesson)

---

## REQ-no-out-of-scope-drift

- **Source:** §15
- **Description:** The workshop and its artifacts MUST NOT teach or implement anything in the out-of-scope list (async/await, ES cluster ops, reindex migrations, k8s/production deploy, frontend, authn/authz, ES vector search / ML / ESQL).
- **Acceptance criteria:**
  - Workshop README and `dashboard.py` do not introduce async/await refactoring.
  - No commit on the participant's clean-run branch touches sharding, replica strategy, or auth.
  - No outbound mention of vector search / ML / ESQL.
- **Scope:** Workshop scope guardrail
