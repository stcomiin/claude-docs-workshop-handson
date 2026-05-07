# Phase 4: Option B Trap #3 + Workshop Polish - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 completes the Option B participant path after the trap #2 mapping fix. It adds Option B steps 11-12 for the remaining cache trap, the non-spoiler dashboard comment-block instruction, the ES DSL primer, Appendix B translation table, the closing stack-agnostic lesson restatement, and all five facilitator failure-mode runbook entries. The shipped workshop must still start in the intentionally slow pre-fix state; this phase documents and verifies the participant's final fix path without turning the starting code into the finished answer.

</domain>

<decisions>
## Implementation Decisions

### Trap #3 evidence gate
- **D-01:** Step 11 should require measurement before diagnosis: after participant commit 2, the participant reruns the `tests/bench.sh` harness or the same request sequence and observes that repeated runs do not show stable request-cache warm-up. Code-reading alone is not accepted.
- **D-02:** The diagnosis is the two coupled defects already locked by the source SPEC: the 30-day range is under `bool.must` query context, and it uses non-rounded `now-30d`/`now`. The participant-facing explanation should explicitly say that either half alone is insufficient.
- **D-03:** The accepted fix is narrow: move the 30-day range into `bool.filter` and round the date math to day boundaries (`now-30d/d` and `now/d`) for the relevant `compute_org_summary` search body. Do not broaden into ES cluster tuning, reindexing, async FastAPI work, or production cache architecture.

### Participant fix and dashboard comment block
- **D-04:** Keep the shipped starting `app/routes/dashboard.py` non-spoilery. If a top-of-file comment is added before participants work, it should be a blank/template instruction for the final before/after notes, not the completed answers.
- **D-05:** The completed before/after comment block belongs to the participant's final Option B commit and to the facilitator reference answer path. It should document all three fixes in order: N+1 count loop, `username.keyword`, and query-context/date-rounding cache fix.
- **D-06:** The expected third participant commit message remains exactly `fix: move date range to filter context, round now to day for cache hit`.

### README polish and portable artifacts
- **D-07:** `README.md` remains the participant-facing canonical flow. Add a concise one-page ES DSL primer near the early setup/orientation sections so participants can understand only the DSL used in this workshop: `term`, `terms`, `range`, `match_all`, `bool`/`must`/`filter`, `aggs.terms`, and `aggs.date_histogram`.
- **D-08:** Extend the existing Option B section in place. Steps 11-12 should continue directly after steps 9-10, preserve the evidence-first tone, state the post-fix-3 target band, and close with the final measurement narrative.
- **D-09:** Add the closing stack-agnostic restatement and Appendix B translation table to README. Appendix B should map ES workshop primitives to Postgres/SQL, MongoDB, and Spark/Trino/dbt equivalents, while explicitly saying the pivot and falsification prompts are stack-agnostic.

### Facilitator reference and failure-mode runbook
- **D-10:** Keep `reference/option-a-sample-run.md` as the canonical facilitator support file for continuity with earlier phases and roadmap references. Do not rename it during this phase unless planning finds a hard reason and updates every reference.
- **D-11:** Extend the reference with Option B steps 11-12: expected evidence, common Opus/Sonnet divergence, the exact two-part fix, post-fix-3 verification, and the completed dashboard comment-block example.
- **D-12:** Add all five required failure-mode runbook entries to the reference: Claude finds the cause too fast; fix does not measurably help; bench numbers do not change; Docker/ES fails to start or reach green/yellow; ES request cache is already warm and masks trap #3.

### Verification and starting-state protection
- **D-13:** Preserve the shipped starting-state trap guards. `pytest` on the unmodified workshop should still prove the starting code has parent `username`, `bool.must`, and unrounded `now-30d` where appropriate.
- **D-14:** Participant post-fix verification should continue the Phase 3 marker convention: after participants make fixes that intentionally break starting-state guards, docs should direct them to `pytest -m "not starting_state"`, plus `ruff check app`, `mypy app`, and the `tests/bench.sh` harness.
- **D-15:** Planning should include static coverage for new README/reference content and a detached/temp participant-style verification or equivalent for the commit-3 path and 50-150 ms cached / 200-400 ms cold expectation. That verification must not mutate the shipped starting point.

### the agent's Discretion
- Exact Markdown section names and placement are flexible as long as README remains easy to run top-to-bottom and the phase 4 required content is statically testable.
- Exact shell formatting for long `curl` commands is flexible, but commands should be copy-pasteable on Git Bash/WSL/Linux and consistent with existing README style.
- Exact static test names are flexible; coverage should be specific enough to prevent silently dropping the phase 4 participant flow, Appendix B, closing restatement, or runbook entries.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, constraints, dependency on Phase 3, and the fixed phase boundary.
- `.planning/PROJECT.md` — Core value, binding workshop constraints, expected timings, facilitator runbook, out-of-scope list, and current focus.
- `.planning/REQUIREMENTS.md` — Phase 4 owns `REQ-measured-fix-option-b` and `REQ-portable-prompt-artifacts`; also maintains correctness and no-scope-drift requirements.

### Authoritative source material
- `.planning/intel/constraints.md` — Binding constraints for trap #3, timing bands, ES DSL primer, Option B arc, facilitator preflight, out-of-scope topics, and expected commit shape.
- `.planning/intel/requirements.md` — Full requirement entries and acceptance criteria with source references.
- `.planning/intel/context.md` — Audience, pedagogy, Appendix B translation table, risks, and model-behavior context.
- `../docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md` — Source SPEC. Relevant sections: §8 trap definitions and timing, §10 Option B steps 11-12, §12 lesson restatement, §14 facilitator artifacts, §16 commit shape, Appendix B.

### Existing implementation and docs
- `README.md` — Participant-facing flow through Option A and Option B steps 9-10; phase 4 should extend this file rather than replace it.
- `reference/option-a-sample-run.md` — Facilitator answer key for Option A and Option B trap #2; phase 4 should extend it with trap #3 and failure modes.
- `app/routes/dashboard.py` — Starting-state trap implementation and target location for the participant's final comment-block instruction/template.
- `tests/test_dashboard.py` — Existing static docs checks and `starting_state` marker pattern to extend.
- `pyproject.toml` — Registered `starting_state` pytest marker.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `README.md`: Existing participant structure already covers setup, timing expectations, pivot/falsification prompts, Option A, and Option B steps 9-10. Phase 4 should append and polish rather than reframe the whole workshop.
- `reference/option-a-sample-run.md`: Existing facilitator reference already has model divergence notes, intervention points, post-fix checks, and a "Trap #3 remains" boundary. It is the right place for the runbook and expected final path.
- `tests/test_dashboard.py`: Provides `project_file()` helpers, static README/reference assertions, a fake ES client, and the `starting_state` marker convention.
- `app/routes/dashboard.py`: `compute_org_summary()` currently contains the remaining trap shape: `bool.must`, unrounded `now-30d`, parent `username` aggregation, and `size: 0` request-cache eligibility.
- `tests/bench.sh`: Three-run harness is already load-bearing for observing request-cache warm-up or lack of it.

### Established Patterns
- Participant docs use exact expected commit messages in fenced `text` blocks.
- Timing language treats absolute bands as calibration examples and relative improvement plus evidence as the binding pass condition.
- Shipped starting-state tests protect intentional traps; participant post-fix docs exclude those guards with `pytest -m "not starting_state"`.
- Scope guardrails are explicit and repeated where participants might drift into async, reindexing, auth, frontend, cluster ops, or production deployment.
- No `CLAUDE.md` or `AGENTS.md` is shipped.

### Integration Points
- `README.md` needs new sections for ES DSL primer, Option B steps 11-12, final measurement/closing restatement, Appendix B, and updated scope guardrails.
- `reference/option-a-sample-run.md` needs trap #3 answer path, post-fix-3 checks, completed comment-block example, and all five failure-mode entries.
- `tests/test_dashboard.py` should extend static assertions to lock phase 4 docs and preserve starting-state trap shape.
- `app/routes/dashboard.py` may receive only a non-spoiler final-notes template/instruction in the shipped starting code; the actual fixed code path should be verified outside the shipped starting point.

</code_context>

<specifics>
## Specific Ideas

- The final participant narrative should be: "the bottleneck was proven by measurement, each fix had its own evidence, and the final state reached the cached/cold timing target without breaking correctness."
- Appendix B should use the SPEC's existing primitive mapping: bench harness, Profile API/slow log, named timers, mapping-as-config, query-vs-filter cache context, pivot prompt, and falsification prompt.
- The runbook entry for warm request cache masking trap #3 should tell facilitators to reset/restart enough state to make cold vs cached behavior visible before judging whether the fix worked.

</specifics>

<deferred>
## Deferred Ideas

None — auto discussion stayed within the fixed Phase 4 scope.

</deferred>

---

*Phase: 04-option-b-trap-3-workshop-polish*
*Context gathered: 2026-05-07*
