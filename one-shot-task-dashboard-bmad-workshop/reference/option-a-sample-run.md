# Option A Sample Run Reference

Use this only if you get stuck during Option A. It summarizes one successful run without replacing the workshop exercise.

## Expected Commit Shape

A clean Option A run usually creates commits like:

```text
Workshop starting point
Install BMAD and generate project context
feat: add collector test action
```

The exact hashes and filenames may differ by BMAD version and selected AI integration.

## Expected BMAD Artifacts

After installing BMAD and generating context, expect files like:

```text
_bmad/
_bmad-output/project-context.md
.agents/skills/          # Codex
.claude/skills/          # Claude Code
.cursor/skills/          # Cursor
```

After quick-dev, expect implementation artifacts under:

```text
_bmad-output/implementation-artifacts/
```

A successful quick-dev spec should end with `status: 'done'`, checked-off implementation tasks, verification commands, and a Suggested Review Order.

## What The Feature Should Touch

The intended code change is centered on:

```text
src/components/settings/CollectorManager.tsx
```

The existing helper and backend route should already be present and usually should not need changes:

```text
src/lib/api.ts
server/routes/collectors.ts
```

## Review Findings From The Validation Run

The review agents found useful edge cases that are easy to miss:

- Overlapping Test clicks can cause stale or confusing pending state if all requests share one global request id.
- A success message should be cleared or invalidated when the collector is saved or deleted.
- Saving or deleting a collector while a test is in flight should invalidate the in-flight request using current state, not a stale render closure.

A robust solution can keep one active test at a time, disable other Test buttons while the request is pending, clear matching results on save/delete, and track the currently active test in a ref so async save/delete handlers invalidate the latest request state.

## Verification That Passed

The validation run passed:

```bash
npm test
npm run build
npm run seed
npm run dev
```

Runtime smoke checks:

- frontend returned HTTP 200
- `POST /api/collectors/:id/test` returned a success payload

## Troubleshooting Notes

- Commit BMAD setup and `project-context.md` before running `bmad-quick-dev`; quick-dev expects a clean tree.
- If BMAD installs skills while your AI assistant is already running, restart or reload from the workshop directory.
- If review finds patch-level issues, apply the patch, rerun `npm test` and `npm run build`, then rerun review.
- Run `npm run seed` once per fresh database. Re-running it in the same copy can duplicate sample rows.
- Do not commit `node_modules`, `dist`, or `data/*.db*`.
