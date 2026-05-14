# GSD workshop: FastAPI full-stack template

This workshop guides you through running GSD on an unfamiliar codebase — `fastapi/full-stack-fastapi-template`. It is a thin guide: you'll clone the template yourself, run GSD against it, and end up with a real fork you can keep iterating after the workshop.

## What you will build

**Suggested feature (you can substitute your own):** Add item categories with a filter on the items list. See the main guide's "Hands-on Lab: Same Feature, Both Workflows" section for the full description.

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

1. Clone the template to a working directory of your choice (this directory is just a guide — your real work happens in the clone):

   ```bash
   git clone https://github.com/fastapi/full-stack-fastapi-template.git fastapi-template-gsd
   cd fastapi-template-gsd
   git checkout -b workshop-gsd   # branch off so your work commits cleanly
   ```

2. Edit the template's shipped `.env` for your local values:
   - `PROJECT_NAME` — anything you like
   - `SECRET_KEY` — generate with

     ```bash
     python -c "import secrets; print(secrets.token_urlsafe(32))"
     ```

   - `FIRST_SUPERUSER` — your email
   - `FIRST_SUPERUSER_PASSWORD` — a strong password
   - Leave `SMTP_HOST` empty to disable email; mailcatcher is available for local SMTP testing if you want it.

3. Start the stack.

   This step has four parts. Do them in order — each one prepares the stack for the next.

   **3.1 — Disable the Playwright service in `compose.override.yml`.**

   The Playwright service runs browser-based end-to-end tests against the stack. It pulls a large image and isn't needed for this workshop, so comment it out to save time and disk space.

   Open `compose.override.yml` in the template root. Find the `playwright:` block (around line 107) and prefix every line with `#`. After commenting, the block should look like this:

   ```yaml
   #  playwright:
   #    build:
   #      context: .
   #      dockerfile: frontend/Dockerfile.playwright
   #      args:
   #        - VITE_API_URL=http://backend:8000
   #        - NODE_ENV=production
   #    ipc: host
   #    depends_on:
   #      - backend
   #      - mailcatcher
   #    env_file:
   #      - .env
   #    environment:
   #      - VITE_API_URL=http://backend:8000
   #      - MAILCATCHER_HOST=http://mailcatcher:1080
   #      # For the reports when run locally
   #      - PLAYWRIGHT_HTML_HOST=0.0.0.0
   #      - CI=${CI}
   #    volumes:
   #      - ./frontend/blob-report:/app/frontend/blob-report
   #      - ./frontend/test-results:/app/frontend/test-results
   #    ports:
   #      - 9323:9323
   ```

   **3.2 — Create the Traefik network.**

   The stack uses Traefik (a reverse proxy) and expects a Docker network named `traefik-public` to exist before it starts. Create it once with:

   ```bash
   docker network create traefik-public
   ```

   If you've created it before, Docker will print an "already exists" error you can safely ignore.

   **3.3 — Build the backend and frontend images locally.**

   This compiles your local copy of the code into Docker images instead of pulling pre-built ones from a registry:

   ```bash
   docker compose build
   ```

   First build takes a few minutes.

   **3.4 — Start everything.**

   ```bash
   docker compose up --watch
   ```

   First boot runs Alembic migrations (~2-3 min). If image pulls fail with a Docker Hub rate-limit error, run `docker login` first — anonymous pulls are limited to 100 per 6h per IP.

4. Open `http://localhost:5173` and log in with the superuser credentials. Confirm the items module renders.

5. Baseline checks (record results before any agent work):

   ```bash
   # Backend (stack must be up)
   docker compose exec backend pytest

   # Frontend static check (does NOT require the stack)
   cd frontend && npm install && npm run build
   ```

   The frontend's Playwright E2E suite (`npm test` inside `frontend/`) requires the full Docker stack to be running and is slow. Skip it for the baseline; run it after your feature work if you want end-to-end coverage.

6. Start a fresh Claude Code or Codex session in the cloned directory (not in this workshop guide directory).

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

Then paste the Existing-Codebase Rule block into your chosen workflow prompt:

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

## Verify

Use the central guide's **Final Review Checklist** section to confirm the change is shippable.

## References

- Central guide: `claude-docs/content/docs/existing-codebase-workflows.md`
- GSD brownfield projects: <https://mintlify.wiki/gsd-build/get-shit-done/guides/brownfield-projects>
- FastAPI full-stack template: <https://github.com/fastapi/full-stack-fastapi-template>
