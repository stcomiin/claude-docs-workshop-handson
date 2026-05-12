# FastAPI template workshop migration — design

**Date:** 2026-05-12
**Status:** Draft for review
**Audience:** Workshop maintainer (Jeremy) and workshop facilitators
**Companion guide:** `claude-docs/content/docs/existing-codebase-workflows.md` (the published curriculum these workshops are the runnable substrate for)

---

## 1. Background

The workshop repo currently contains four hand-on directories:

1. `fastapi-perf-investigation-workshop/` — FastAPI + Elasticsearch perf-debugging exercise. Teaches measured investigation discipline (pivot prompt, falsification prompt) on Elasticsearch-specific perf traps.
2. `one-shot-task-dashboard/` — Express + SQLite + WebSocket + cron-based OSINT app. Source baseline; no workshop content attached.
3. `one-shot-task-dashboard-bmad-workshop/` — copy of #2 used to teach the BMAD Method on an existing codebase. Feature target: "expose existing collector test endpoint in Settings UI."
4. `one-shot-task-dashboard-gsd-workshop/` — copy of #2 used to teach GSD on an existing codebase. Same feature target as the BMAD copy.

This is four separate codebases to maintain, with two distinct tech stacks (Python/ES and TS/Express). The workshops that matter today are the BMAD and GSD existing-codebase exercises; the Elasticsearch perf workshop has its own value but is being retired in this refactor to reduce maintenance.

The published guide `existing-codebase-workflows.md` already specifies what the lab should look like: same feature (Item Categories with Filter) run through both BMAD and GSD on the FastAPI full-stack template. The workshop repo's job is to be the runnable substrate for that lab.

## 2. The takeaway (single sentence)

> Experience the difference between BMAD and GSD by adding the same small feature on the same existing codebase using each workflow.

## 3. Audience

- **Primary:** developers attending the existing-codebase-workflows workshop, with Claude Code or Codex installed and either BMAD or GSD set up.
- **Assumed knowledge:** basic familiarity with `git`, Docker, Python/Node toolchains; ability to read FastAPI and React/TypeScript code; willingness to follow the central guide alongside the workshop README.
- **Not assumed:** prior knowledge of FastAPI, SQLModel, TanStack Router, or shadcn/ui. Discovery of these patterns is part of the exercise.

## 4. Format

Two workshop directories, each a fork of `fastapi/full-stack-fastapi-template` pinned to a specific upstream commit. Same starting codebase, same suggested feature, different workflow:

| Directory | Workflow taught | Both paths from the central guide |
|---|---|---|
| `fastapi-template-bmad-workshop/` | BMAD Method | Short via `/bmad-quick-dev`; Full via `/bmad-create-prd` → `/bmad-create-architecture` → `/bmad-create-epics-and-stories` → `/bmad-sprint-planning` → `/bmad-create-story` → `/bmad-dev-story` → `/bmad-code-review` |
| `fastapi-template-gsd-workshop/` | GSD | Short via `/gsd-quick`; Full via `/gsd-map-codebase` → `/gsd-new-project` → `/gsd-spec-phase` → `/gsd-discuss-phase` → `/gsd-plan-phase` → `/gsd-execute-phase` → `/gsd-verify-work` → `/gsd-code-review` → `/gsd-ship` |

Both forks are independent dirs (not branches or overlays) — the user's stated requirement so participants experience them as distinct workshops.

## 5. The suggested feature

**Item Categories with Filter**, as documented in the central guide. Each item can optionally belong to one category; the items list has a category filter dropdown; each row shows a badge tinted by the category color.

- **Database:** new `categories` table; nullable `category_id` FK on `items`; one Alembic revision.
- **Backend:** new `routes/categories.py` mirroring `routes/items.py`; one new query parameter on `read_items`.
- **Frontend:** category select on add/edit forms; category column with badge; filter dropdown above the table; OpenAPI client regeneration.
- **Tests:** route tests for categories; updated frontend smoke test.

### 5.1 The "this is a suggestion" framing

The README does not mandate the categories feature. It opens with:

> **Suggested feature (you can substitute your own):** Add item categories with a filter on the items list. See [Existing Codebase Workflows → Hands-on Lab](https://claude-docs.devbionics.com/docs/existing-codebase-workflows#hands-on-lab-same-feature-both-workflows) for the full feature description.
>
> The point of this workshop is to experience the [BMAD / GSD] workflow on the FastAPI template. If you'd rather practice on a different small feature — an item priority, due date, notes field, "favorite" star — go ahead, as long as it stays within the Existing-Codebase Rule below.

## 6. The Existing-Codebase Rule block (ships in both READMEs)

A short, concept-level guardrail using the 5-field shape from the central guide. Length matches the guide's Refresh-Feed example (~12 lines). Devs handcrafting their own version for a substituted feature should spend ~60 seconds.

````markdown
## Existing-Codebase Rule for this workshop

Paste this block into your `/gsd-quick`, `/bmad-quick-dev`, or full-method
prompt when you ask the workflow to plan or implement. If you substitute
your own feature, rewrite each field to match.

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
````

## 7. What gets shipped

### 7.1 Repo layout after migration

```
claude-docs-workshop-handson/
├── README.md                              # NEW — short top-level orientation,
│                                          # lists surviving workshops, links central guide
├── fastapi-template-bmad-workshop/        # RENAMED + REPLACED — template fork
│   ├── ...full FastAPI template contents at pinned SHA...
│   └── README.md                          # NEW — workshop-specific instructions
├── fastapi-template-gsd-workshop/         # RENAMED + REPLACED — template fork
│   ├── ...full FastAPI template contents at pinned SHA...
│   └── README.md                          # NEW — workshop-specific instructions
├── research-report-generation-workflow-completed/  # UNCHANGED — unrelated workshop
└── research-report-generation-workflow-starter/    # UNCHANGED — unrelated workshop
```

**Removed:**
- `fastapi-perf-investigation-workshop/` — entire directory (perf workshop retired)
- `one-shot-task-dashboard/` — source baseline, no workshop attached
- `docs/` — held the now-dead perf-workshop spec; deleted in a follow-up commit after this spec has served the design-review purpose

### 7.2 Pinned upstream SHA

FastAPI template `master` at `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f` (2026-04-16). Recorded in each workshop README's Setup section so all participants start from the same baseline.

### 7.3 Workshop README skeleton (same in both)

```
1. Title — "Workshop: BMAD (or GSD) on a FastAPI template fork"
2. What this workshop is — 1 paragraph + link to central guide
3. What you will build — 1 sentence + "this is a suggestion" framing
4. Existing-Codebase Rule — the 12-line filled-in block from §6
5. Setup — clone, env, baseline checks, seed user (see §8)
6. Run the workflow — workshop-specific (BMAD or GSD; short or full path)
7. Verify — link to central guide's Final Review Checklist
8. References — link to guide, BMAD docs, GSD docs
```

Principle: anything not specific to the runnable harness lives in the central guide. The workshop README is the substrate; the guide is the curriculum.

## 8. Setup steps (same in both READMEs)

1. Clone or copy the FastAPI template at the pinned commit into the workshop dir.
2. Set up `.env` from `.env.example`: project name, DB password, secret key, first-superuser email + password, SMTP off.
3. `docker compose up --watch` to bring up Postgres, backend, frontend, adminer, mailcatcher.
4. Wait for DB ready; backend auto-runs Alembic migrations on startup.
5. Log in at `http://localhost:5173` with the env superuser; confirm the items module renders.
6. Baseline checks (run before any agent work, record results):
   - `docker compose exec backend pytest`
   - `cd frontend && npm install && npm test && npm run build`
7. If the dir isn't already a git repo, `git init && git add . && git commit -m "Workshop starting point at template SHA <sha>"`.
8. Start a fresh agent session in this directory.

Record any baseline failures so participants can compare against post-implementation state.

## 9. Maintenance model

**Pin to a single upstream SHA at fork time, no automatic updates.** Workshop content is stable across cohorts. Manual refresh every ~6 months: pull upstream into a clean fork, re-run setup, republish. Drift is intentional and bounded.

Considered alternatives:
- Tracking upstream `master` with weekly merges — high maintenance, workshop scripts break on upstream renames.
- Copier-based regeneration (the template supports it) — cleaner update path but adds copier setup per cohort, overkill for the cadence.

## 10. Migration plan — commits in order

Each step is its own commit so a reviewer can isolate deletions from additions.

1. New branch: `feat/refactor-to-fastapi-template`.
2. **This spec is committed first** at `docs/superpowers/specs/2026-05-12-fastapi-template-workshop-migration-design.md`. (Brainstorming-flow "Write design doc" step — happens before any code changes.)
3. Commit: delete `fastapi-perf-investigation-workshop/`.
4. Commit: delete `one-shot-task-dashboard/`.
5. Commit: empty + repopulate `one-shot-task-dashboard-bmad-workshop/` with the template fork at the pinned SHA, then rename the dir to `fastapi-template-bmad-workshop/`. Add the workshop README.
6. Commit: same for the GSD workshop dir.
7. Commit: top-level repo `README.md` listing surviving workshops and linking the central guide.
8. Commit (follow-up, post-review): delete `docs/` once this spec has served its purpose.

## 11. Considered alternatives (and why this one)

| Alternative | Why not |
|---|---|
| **Keep perf workshop on a new stack (Postgres N+1 / FastAPI async traps)** | The user retired the perf workshop. The stack-agnostic discipline (measure first, falsify) is portable and could be revived on a future cycle on Postgres or FastAPI, but it is out of scope for this refactor. |
| **One canonical template fork + BMAD/GSD as branches or overlay dirs** | Lowest maintenance, but the user explicitly wants BMAD and GSD as separate dirs so participants experience them as distinct workshops. |
| **Different features per workshop (BMAD = small frontend-only, GSD = end-to-end CRUD)** | Contaminates the methodology comparison. The central guide pairs the workshops on the same feature on purpose. |
| **A heavier suggested feature (e.g. user-defined priority enum, soft-delete on items)** | Out of band with the published guide. The guide commits to "Item Categories with Filter" as the worked example. The "this is a suggestion" framing lets participants substitute without us inventing a second canonical feature. |

## 12. Out of scope

- Updating the central guide `existing-codebase-workflows.md` — that's a separate workstream in the `claude-docs` repo.
- Building a third workshop variant (e.g. Cursor, Cline) — easy to add later by copying one of the two existing forks; not part of this migration.
- Auto-deploying the workshop dirs to a hosted environment — workshops run locally per participant.
- Pre-generating an "answer key" branch in either workshop — participants who get stuck can ask facilitators or read the FastAPI template's existing items module as the reference pattern.
- Long-form facilitator notes — covered by the central guide and the existing `reference/option-a-sample-run.md` pattern can be added later if needed.

---

## Approval

Reviewer (workshop maintainer): pending
Date approved: pending
