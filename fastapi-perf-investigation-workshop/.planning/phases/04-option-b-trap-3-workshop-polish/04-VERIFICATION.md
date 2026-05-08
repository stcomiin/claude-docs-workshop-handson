---
phase: 04-option-b-trap-3-workshop-polish
status: passed
verified: 2026-05-07
requirements:
  - REQ-measured-fix-option-b
  - REQ-portable-prompt-artifacts
score: 7/7
human_verification: []
---

# Phase 4 Verification

## Goal

A participant who has completed Option B through fix #2 can continue into
steps 11-12, diagnose trap #3 from repeated benchmark/cache evidence, apply
the two-part filter-context plus rounded-date fix as commit 3, record the full
three-fix evidence trail, and leave with complete workshop polish artifacts:
ES DSL primer, Appendix B translation table, closing lesson, facilitator
answer key, and failure-mode runbook.

## Result

Status: passed.

## Must-Have Checks

| Check | Evidence | Status |
|-------|----------|--------|
| README documents Option B steps 11-12 | `README.md` contains `Option B: steps 11-12`, the exact third commit, `now-30d/d`, and `50-150 ms cached / 200-400 ms cold` | Passed |
| README contains the ES DSL primer | `README.md` contains `## Elasticsearch Query DSL Primer`, `bool.filter`, and `aggs.date_histogram` | Passed |
| README contains portable artifacts | `README.md` contains `## Closing Lesson`, `## Appendix B: Translate To Your World`, `Postgres / SQL`, `MongoDB`, and `Spark / Trino / dbt` | Passed |
| Source note template is present and non-spoiler | First 30 lines of `app/routes/dashboard.py` contain `Final Option B notes` and omit `username.keyword`, `now-30d/d`, and the commit-3 answer | Passed |
| Facilitator reference covers trap #3 | `reference/option-a-sample-run.md` contains `Option B steps 11-12`, `Expected trap #3 investigation path`, `Cache evidence`, the completed comment example, and model divergence guidance | Passed |
| Facilitator runbook contains all five failure modes | `reference/option-a-sample-run.md` contains all required headings, including Docker health recovery and warm request-cache recovery | Passed |
| Shipped exercise boundaries remain intact | `tests/test_dashboard.py` still asserts the starting-state runtime uses `bool.must`, unrounded `now-30d`, and parent `username`; no `CLAUDE.md` or `AGENTS.md` files ship | Passed |

## Automated Verification

- `uv run pytest` - passed, 12 tests.
- `uv run ruff check app` - passed.
- `uv run mypy app` - passed.
- `test ! -f CLAUDE.md && test ! -f AGENTS.md` - passed.
- `node /home/hermes-vm-admin/.codex/get-shit-done/bin/gsd-tools.cjs verify phase-completeness 4` - passed, 3 plans / 3 summaries.
- `node /home/hermes-vm-admin/.codex/get-shit-done/bin/gsd-tools.cjs verify schema-drift 4` - passed, no schema drift.
- Codebase drift gate - skipped, no codebase structure map exists.
- Code review gate - passed clean, 0 findings in `04-REVIEW.md`.

## Live Timing Check

Docker was available locally with the seeded `activities` index at 50,000
documents. A temporary git worktree applied the three participant fixes without
mutating the shipped source branch. In that temp worktree:

- `uv run pytest -m "not starting_state"` - passed, 11 selected tests.
- `uv run ruff check app` - passed.
- `uv run mypy app` - passed.
- After clearing the local Elasticsearch request cache and starting uvicorn
  without `--reload`, the bench script returned:
  - cold: `0.394660s`
  - repeated: `0.151080s`
  - repeated: `0.115679s`

The measured cold/cached split matches the Phase 4 target band.

## Notes

- Bare `pytest` is not installed on this shell's PATH; verification used
  `uv run pytest`, which resolves the project-pinned pytest environment.
- The live timing check used a throwaway worktree and was removed after
  verification, so the main branch still ships the intended unsolved exercise
  source.

## VERIFICATION PASSED
