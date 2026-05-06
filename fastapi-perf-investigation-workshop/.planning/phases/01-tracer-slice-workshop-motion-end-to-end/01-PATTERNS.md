# Phase 1: Pattern Map

**Mapped:** 2026-05-06
**Phase:** 1 - Tracer Slice - Workshop Motion End-to-End

## Summary

No existing FastAPI or Elasticsearch implementation exists in this repository.
The closest reusable patterns are workshop documentation conventions from the
GSD/BMAD dashboard exercises and the reference sample-run shape from BMAD.
Implementation plans should therefore be explicit about Python/FastAPI structure
and should use local workshop docs only for README tone, setup flow, and sample
run organization.

## Planned Files And Closest Analogs

| Planned file | Role | Closest analog | Reuse guidance |
|--------------|------|----------------|----------------|
| `README.md` | Workshop instructions | `../one-shot-task-dashboard-gsd-workshop/README.md` and `../one-shot-task-dashboard-bmad-workshop/README.md` | Use direct setup commands, Option A/B framing, clean-shell assumptions, and verification sections. |
| `reference/option-a-sample-run.md` | Facilitator reference stub | `../one-shot-task-dashboard-bmad-workshop/reference/option-a-sample-run.md` | Keep as troubleshooting/reference, not a spoiler-heavy main path. |
| `.gitignore` | Workshop ignore rules | `../one-shot-task-dashboard-gsd-workshop/.gitignore` | Include Python caches, virtualenvs, generated seed NDJSON, and local env files. |
| `docker/*` | ES local runtime | No repo analog | Follow Elastic official Docker docs and the project SPEC. |
| `app/*` | FastAPI app | No repo analog | Follow standard FastAPI package structure. |
| `tests/test_dashboard.py` | Correctness tests | Existing dashboard uses colocated test files but not Python | Keep tests fast and fake ES instead of requiring Docker. |
| `tests/bench.sh` | Latency harness | No repo analog | Use the exact three-run curl loop from `CON-bench-script`. |

## Documentation Patterns To Preserve

The existing workshop READMEs use:

- A concise opening that tells participants what they will build.
- A shared setup section before path-specific work.
- Shell commands in fenced `bash` blocks.
- "If you get stuck" reference material placed under `reference/`.
- Verification commands grouped near the task they validate.

Phase 1 README should follow those conventions but should be explicit that this
is only the tracer slice and that Option A/Option B are not yet present.

## Implementation Pattern Risks

- Do not copy frontend/dashboard wording from the TS exercises into this backend
  workshop.
- Do not add `CLAUDE.md` or `AGENTS.md` even though other agent workflows often
  benefit from them; the SPEC intentionally forbids shipping those files.
- Do not make README overly complete for Option A/B in Phase 1. Phase 1 owns the
  pivot prompt and tracer walkthrough only.

## PATTERN MAPPING COMPLETE
