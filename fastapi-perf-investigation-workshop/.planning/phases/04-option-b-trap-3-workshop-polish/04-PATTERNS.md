# Phase 4: Pattern Map

**Mapped:** 2026-05-07
**Phase:** 4 - Option B Trap #3 + Workshop Polish

## Summary

Phase 4 extends the same delivery pattern used in Phases 2 and 3: participant
instructions live in `README.md`, facilitator guidance lives in
`reference/option-a-sample-run.md`, tests statically protect required prose and
runtime trap boundaries, and the shipped source remains a starting point rather
than the solved participant branch.

## Planned Files And Closest Analogs

| Planned file | Role | Closest analog | Reuse guidance |
|--------------|------|----------------|----------------|
| `README.md` | Participant Option B steps 11-12, ES DSL primer, Appendix B, closing restatement | Existing Option A and Option B steps 9-10 sections | Extend in place; keep commands copyable and preserve evidence-first wording. |
| `app/routes/dashboard.py` | Shipped starting source and final-notes template location | Current timer-wrapped FastAPI route module | Add only non-spoiler final-note scaffolding if needed; do not apply participant fixes to shipped code. |
| `reference/option-a-sample-run.md` | Facilitator answer key and runbook | Existing Option A / trap #2 reference sections | Extend in place with trap #3 path, model divergence, post-fix-3 checks, and five failure modes. |
| `tests/test_dashboard.py` | Static docs checks and fake-client guards | Phase 3 README/reference tests and `starting_state` trap guard | Add Phase 4 assertions; keep tests Docker-free and fake-client based. |
| `pyproject.toml` | Test marker config | Existing `starting_state` marker registration | No expected change unless new markers are introduced. |

## Shared Patterns To Preserve

- Participant docs use exact commit messages in fenced `text` blocks.
- Timing bands are calibration examples; relative improvement plus evidence is
  binding.
- Starting-state tests prove intentional traps remain in the shipped workshop.
- Participant post-fix docs use `pytest -m "not starting_state"`.
- No `CLAUDE.md` or `AGENTS.md` is shipped.
- Avoid frontend, auth, async/await, reindex-strategy drills, ES cluster ops,
  vector/ML/ESQL, or production deployment.

## Implementation Pattern Risks

- Putting the completed before/after comment in shipped `dashboard.py` spoils
  the hidden-trap lesson.
- Fixing `compute_org_summary()` in the shipped branch destroys the workshop
  starting point.
- Adding Appendix B only to the facilitator reference fails
  `REQ-portable-prompt-artifacts`; it must be in README.
- Static docs tests that assert too little can let the phase appear complete
  while omitting the runbook or closing restatement.

## PATTERN MAPPING COMPLETE
