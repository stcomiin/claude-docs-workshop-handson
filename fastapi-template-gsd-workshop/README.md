# Workshop: GSD on a FastAPI template fork

This workshop is the runnable substrate for the GSD walkthrough in the central guide:

> **Existing Codebase Workflows → Run It Through GSD** — see `claude-docs/content/docs/existing-codebase-workflows.md` (replace with the public deploy URL once available).

Read the central guide first, then come back here for the codebase and the suggested feature.

## What you will build

**Suggested feature (you can substitute your own):** Add item categories with a filter on the items list. See the central guide's "Hands-on Lab: Same Feature, Both Workflows" section for the full description.

The point of this workshop is to experience the **GSD** workflow on an unfamiliar codebase. If you'd rather practice on a different small feature — item priority, due date, notes field, "favorite" star — go ahead, as long as it stays within the Existing-Codebase Rule below.

## Existing-Codebase Rule for this workshop

Paste this block into your `/gsd-quick` or full-method prompt when you ask the workflow to plan or implement. If you substitute your own feature, rewrite each field to match.

```text
Goal:
Add item categories with a filter on the items list.

Likely area:
Items module, new categories module, an Alembic migration, items list
and item form on the frontend, and the auto-generated API client.

Hard limits:
Do not change auth or user management.
Do not refactor the items module beyond adding the filter.

Patterns to follow:
Mirror the existing items CRUD pattern. Match existing model, route,
test, form, and badge conventions.

Verify:
Run the backend tests and the frontend test and build commands.
Manually verify the migration upgrades and downgrades cleanly, and
that filtering works for items with and without categories.
```

## Setup

This workshop is forked from `fastapi/full-stack-fastapi-template` at commit `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f` (2026-04-16).

1. Edit the template's shipped `.env` for your local values:
   - `PROJECT_NAME` — anything you like
   - `SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `FIRST_SUPERUSER` — your email
   - `FIRST_SUPERUSER_PASSWORD` — a strong password
   - Leave `SMTP_HOST` empty to disable email.

2. (Optional, only if you cloned this directory standalone outside the parent workshop repo) Initialize git so GSD has a clean working tree to track:

   ```bash
   git status --short || (git init && git add . && git commit -m "Workshop starting point at template SHA 13652b51")
   ```

   If this directory is already inside a git repo, skip this step.

3. Start the stack:

   ```bash
   docker compose up --watch
   ```

   First boot pulls images and runs Alembic migrations (~2-3 min). If pulls fail with a Docker Hub rate-limit error, run `docker login` first — anonymous pulls are limited to 100 per 6h per IP.

4. Open `http://localhost:5173` and log in with the superuser credentials. Confirm the items module renders.

5. Baseline checks (record results before any agent work):

   ```bash
   # Backend (stack must be up)
   docker compose exec backend pytest

   # Frontend static check (does NOT require the stack)
   cd frontend && npm install && npm run build
   ```

   The frontend's Playwright E2E suite (`npm test` inside `frontend/`) requires the full Docker stack to be running and is slow. Skip it for the baseline; run it after your feature work if you want end-to-end coverage.

6. Start a fresh Claude Code or Codex session in this directory.

## Run the workflow

Two paths from the central guide:

| Path | Time | Commands |
|---|---|---|
| Short | 20-25 min | `/gsd-quick` with the Existing-Codebase Rule pasted in |
| Full | 60-90 min | `/gsd-map-codebase` → `/gsd-new-project` → `/gsd-spec-phase` → `/gsd-discuss-phase` → `/gsd-plan-phase` → `/gsd-execute-phase` → `/gsd-verify-work` → `/gsd-code-review` → `/gsd-ship` |

Before invoking either, map the codebase:

```text
/gsd-map-codebase
```

Then paste the Existing-Codebase Rule block above into your chosen workflow prompt.

## Verify

Use the central guide's **Final Review Checklist** section to confirm the change is shippable.

## References

- Central guide: `claude-docs/content/docs/existing-codebase-workflows.md`
- GSD brownfield projects: https://mintlify.wiki/gsd-build/get-shit-done/guides/brownfield-projects
- FastAPI full-stack template: https://github.com/fastapi/full-stack-fastapi-template
