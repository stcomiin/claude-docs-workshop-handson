# Phase 4: Option B Trap #3 + Workshop Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 4-Option B Trap #3 + Workshop Polish
**Areas discussed:** Trap #3 evidence gate, Participant fix and dashboard comment block, README polish and portable artifacts, Facilitator reference and failure-mode runbook, Verification and starting-state protection

---

## Trap #3 Evidence Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Repeated-bench evidence gate | Use repeated bench/request-cache behavior as the participant proof before diagnosis. | ✓ |
| Deep ES internals walkthrough | Teach lower-level cache internals before the fix. | |
| Code-reading diagnosis | Let participants infer the fix from `dashboard.py`. | |

**User's choice:** `[auto]` Selected recommended default: repeated-bench evidence gate.
**Notes:** This keeps the phase aligned with the workshop's measurement-first lesson and avoids turning trap #3 into a static code-reading exercise.

## Participant Fix And Dashboard Comment Block

| Option | Description | Selected |
|--------|-------------|----------|
| Non-spoiler template plus reference answer | Keep starting code non-spoilery; document the completed answer in the participant final commit/reference path. | ✓ |
| Ship the completed answer comment | Put the completed before/after answers in starting `dashboard.py`. | |
| Put the comment only in README | Avoid touching `dashboard.py` at all. | |

**User's choice:** `[auto]` Selected recommended default: non-spoiler template plus reference answer.
**Notes:** Shipping the completed answer in source would weaken the hidden-trap pedagogy.

## README Polish And Portable Artifacts

| Option | Description | Selected |
|--------|-------------|----------|
| README-centered participant flow | Add ES DSL primer, steps 11-12, closing restatement, and Appendix B to README. | ✓ |
| Separate docs files | Split polish into extra docs. | |
| Facilitator-reference-only polish | Keep participant README short and place most content in the reference. | |

**User's choice:** `[auto]` Selected recommended default: README-centered participant flow.
**Notes:** README is already the participant path and should stay canonical.

## Facilitator Reference And Failure-Mode Runbook

| Option | Description | Selected |
|--------|-------------|----------|
| Extend existing reference file | Continue using `reference/option-a-sample-run.md` for facilitator support. | ✓ |
| Rename reference file | Rename to a broader Option A/B reference. | |
| Split runbook into a new document | Create a separate runbook file. | |

**User's choice:** `[auto]` Selected recommended default: extend existing reference file.
**Notes:** Existing roadmap and docs references point to this file; continuity is more valuable than a cleaner name during this phase.

## Verification And Starting-State Protection

| Option | Description | Selected |
|--------|-------------|----------|
| Starting-state tests plus detached participant verification | Preserve shipped trap guards and verify the final participant path separately. | ✓ |
| Only static docs checks | Verify text coverage only. | |
| Mutate shipped code to final fixed state | Turn the starting workshop into the final answer. | |

**User's choice:** `[auto]` Selected recommended default: starting-state tests plus detached participant verification.
**Notes:** This protects both halves of the deliverable: the starting exercise and the expected participant end state.

## the agent's Discretion

- Exact Markdown section names and placement.
- Exact copy-paste formatting for long shell commands.
- Exact static test function names and organization.

## Deferred Ideas

None.
