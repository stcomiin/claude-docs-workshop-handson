# FastAPI template workshop migration — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four current workshop directories with two FastAPI template forks (BMAD and GSD variants), each pinned to the same upstream SHA, each with a workshop-specific README; delete the retired Elasticsearch perf workshop and the OSINT baseline; leave `docs/` for a follow-up deletion post-merge.

**Architecture:** Each surviving workshop dir is an independent fork of `fastapi/full-stack-fastapi-template` at commit `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f` (2026-04-16). Both forks contain identical template code; only the workshop README differs (BMAD commands vs GSD commands). Migration is a series of one-purpose commits on branch `feat/refactor-to-fastapi-template`. Central pedagogy (curriculum, "what to notice", final checklist) lives in the published guide `existing-codebase-workflows.md`; the workshop READMEs link to it rather than duplicate.

**Tech Stack:** Git (branch + commits), `git clone --no-checkout` + `git checkout <sha>` + `rm -rf .git` to fetch a pinned template snapshot without polluting workshop-repo git history. PowerShell on Windows (per environment), bash equivalents noted where commands differ.

**Spec reference:** `docs/superpowers/specs/2026-05-12-fastapi-template-workshop-migration-design.md`

---

## Task 1: Create migration branch

**Files:** none (git state change only)

- [ ] **Step 1: Verify clean working tree**

Run: `git status --short`
Expected: no output (clean tree).

If anything is uncommitted, stop and commit or stash before proceeding.

- [ ] **Step 2: Create and switch to migration branch**

Run: `git switch -c feat/refactor-to-fastapi-template`
Expected: `Switched to a new branch 'feat/refactor-to-fastapi-template'`

- [ ] **Step 3: Confirm branch**

Run: `git branch --show-current`
Expected: `feat/refactor-to-fastapi-template`

No commit yet — the spec is already committed on `main` and will be on this branch's ancestor history.

---

## Task 2: Delete the retired Elasticsearch perf workshop

**Files:**
- Delete: `fastapi-perf-investigation-workshop/` (entire directory)

- [ ] **Step 1: Confirm the directory exists**

Run: `Test-Path fastapi-perf-investigation-workshop`
Expected: `True`

- [ ] **Step 2: Remove the directory with git**

Run: `git rm -r fastapi-perf-investigation-workshop`
Expected: a long list of `rm 'fastapi-perf-investigation-workshop/...'` entries.

- [ ] **Step 3: Verify the deletion is staged**

Run: `git status --short | Select-String "^D"`
Expected: many `D  fastapi-perf-investigation-workshop/...` lines.

- [ ] **Step 4: Commit**

Run:
```powershell
git commit -m "chore(workshops): retire fastapi-perf-investigation-workshop`n`nElasticsearch-specific perf workshop is being retired in favor of the FastAPI`ntemplate-based BMAD/GSD workshops. The stack-agnostic measure-first discipline`nis documented in the central guide and may be revived on a future cycle."
```
Expected: a single commit with one `delete mode` entry per file under the dir.

- [ ] **Step 5: Verify**

Run: `git log --oneline -1`
Expected: the chore commit just made.

Run: `Test-Path fastapi-perf-investigation-workshop`
Expected: `False`

---

## Task 3: Delete the OSINT baseline directory

**Files:**
- Delete: `one-shot-task-dashboard/` (entire directory)

- [ ] **Step 1: Confirm the directory exists**

Run: `Test-Path one-shot-task-dashboard`
Expected: `True`

- [ ] **Step 2: Remove with git**

Run: `git rm -r one-shot-task-dashboard`
Expected: long list of `rm 'one-shot-task-dashboard/...'`.

- [ ] **Step 3: Commit**

Run:
```powershell
git commit -m "chore(workshops): remove one-shot-task-dashboard OSINT baseline`n`nNo workshop content was attached to this baseline. The BMAD and GSD workshops`nare being rebased onto the FastAPI full-stack template, so the Express/SQLite`nOSINT codebase is no longer needed in this repo."
```

- [ ] **Step 4: Verify**

Run: `Test-Path one-shot-task-dashboard`
Expected: `False`

---

## Task 4: Delete the OSINT BMAD workshop directory

**Files:**
- Delete: `one-shot-task-dashboard-bmad-workshop/` (entire directory; will be replaced by `fastapi-template-bmad-workshop/` in Task 5)

- [ ] **Step 1: Confirm the directory exists**

Run: `Test-Path one-shot-task-dashboard-bmad-workshop`
Expected: `True`

- [ ] **Step 2: Remove with git**

Run: `git rm -r one-shot-task-dashboard-bmad-workshop`
Expected: long list of deletions.

- [ ] **Step 3: Commit**

Run:
```powershell
git commit -m "chore(workshops): remove osint-based bmad workshop dir`n`nThe BMAD workshop is being rebased onto the FastAPI template. The old`nExpress/SQLite OSINT version is removed wholesale; a new fastapi-template-bmad-workshop`ndir replaces it in the next commit."
```

---

## Task 5: Create the BMAD workshop dir from the FastAPI template

**Files:**
- Create: `fastapi-template-bmad-workshop/` (populated from `fastapi/full-stack-fastapi-template` at SHA `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f`)
- Create: `fastapi-template-bmad-workshop/README.md` (workshop-specific README, overwrites the template's README.md)

- [ ] **Step 1: Clone the template (without checkout) into the target directory**

Run:
```powershell
git clone --no-checkout https://github.com/fastapi/full-stack-fastapi-template.git fastapi-template-bmad-workshop
```
Expected: `Cloning into 'fastapi-template-bmad-workshop'... done.`

- [ ] **Step 2: Check out the pinned SHA**

Run:
```powershell
git -C fastapi-template-bmad-workshop checkout 13652b51ea0acca7dfe243ac25e2bbdc066f3c4f
```
Expected: a "detached HEAD" notice referencing the SHA.

- [ ] **Step 3: Verify the SHA matches**

Run: `git -C fastapi-template-bmad-workshop rev-parse HEAD`
Expected: `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f`

- [ ] **Step 4: Strip the template's `.git/` directory**

Run: `Remove-Item -Recurse -Force fastapi-template-bmad-workshop\.git`
Expected: no output; directory removed.

Verify: `Test-Path fastapi-template-bmad-workshop\.git`
Expected: `False`

- [ ] **Step 5: Spot-check key template files exist**

Run:
```powershell
Test-Path fastapi-template-bmad-workshop\compose.yml
Test-Path fastapi-template-bmad-workshop\backend\app\main.py
Test-Path fastapi-template-bmad-workshop\frontend\package.json
```
Expected: `True` for all three.

- [ ] **Step 6: Overwrite the template's README with the workshop README**

Write `fastapi-template-bmad-workshop/README.md` with this exact content:

````markdown
# Workshop: BMAD on a FastAPI template fork

This workshop is the runnable substrate for the BMAD Method walkthrough in the central guide:

> **Existing Codebase Workflows → Run It Through BMAD** — see `claude-docs/content/docs/existing-codebase-workflows.md` (replace with the public deploy URL once available).

Read the central guide first, then come back here for the codebase and the suggested feature.

## What you will build

**Suggested feature (you can substitute your own):** Add item categories with a filter on the items list. See the central guide's "Hands-on Lab: Same Feature, Both Workflows" section for the full description.

The point of this workshop is to experience the **BMAD** workflow on an unfamiliar codebase. If you'd rather practice on a different small feature — item priority, due date, notes field, "favorite" star — go ahead, as long as it stays within the Existing-Codebase Rule below.

## Existing-Codebase Rule for this workshop

Paste this block into your `/bmad-quick-dev` or full-method prompt when you ask the workflow to plan or implement. If you substitute your own feature, rewrite each field to match.

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

1. Copy `.env` to your local values (the template ships a working `.env` for local dev — edit only what you need):
   - `PROJECT_NAME` — anything you like
   - `SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `FIRST_SUPERUSER` — your email
   - `FIRST_SUPERUSER_PASSWORD` — a strong password
   - Leave `SMTP_HOST` empty to disable email; mailcatcher is available for local SMTP testing if you want it.

2. Start the stack:

   ```bash
   docker compose up --watch
   ```

   First boot pulls images and runs Alembic migrations (~2-3 min).

3. Open `http://localhost:5173` and log in with the superuser credentials. Confirm the items module renders.

4. Baseline checks (record results before any agent work):

   ```bash
   docker compose exec backend pytest
   cd frontend && npm install && npm test && npm run build
   ```

5. Start a fresh Claude Code or Codex session in this directory.

## Run the workflow

Two paths from the central guide:

| Path | Time | Commands |
|---|---|---|
| Short | 30-40 min | `/bmad-quick-dev` with the Existing-Codebase Rule pasted in |
| Full | 60-90 min | `/bmad-create-prd` → `/bmad-create-architecture` → `/bmad-create-epics-and-stories` → `/bmad-sprint-planning` → `/bmad-create-story` → `/bmad-dev-story` → `/bmad-code-review` |

Before invoking either, install BMAD and generate project context:

```bash
npx bmad-method install
```

```text
/bmad-generate-project-context
```

Then paste the Existing-Codebase Rule block above into your chosen workflow prompt.

## Verify

Use the central guide's **Final Review Checklist** section to confirm the change is shippable.

## References

- Central guide: `claude-docs/content/docs/existing-codebase-workflows.md`
- BMAD established projects: https://docs.bmad-method.org/how-to/established-projects/
- FastAPI full-stack template: https://github.com/fastapi/full-stack-fastapi-template
````

- [ ] **Step 7: Stage everything**

Run:
```powershell
git add fastapi-template-bmad-workshop
```

Expected: many `A` (added) entries — the entire template tree plus the new README.

- [ ] **Step 8: Verify the README is the workshop version, not the template version**

Run:
```powershell
Select-String -Path fastapi-template-bmad-workshop\README.md -Pattern "Workshop: BMAD on a FastAPI template fork" -SimpleMatch
```
Expected: one matching line.

- [ ] **Step 9: Commit**

Run:
```powershell
git commit -m "feat(workshops): add fastapi-template-bmad-workshop`n`nFork of fastapi/full-stack-fastapi-template at 13652b51ea0acca7dfe243ac25e2bbdc066f3c4f`n(2026-04-16), with a workshop-specific README replacing the template README.`n`nThe workshop targets the BMAD Method on an unfamiliar codebase, using the`nItem Categories with Filter feature documented in the central guide as the`nsuggested exercise."
```

- [ ] **Step 10: Verify**

Run: `git log --oneline -1`
Expected: the `feat(workshops): add fastapi-template-bmad-workshop` commit.

---

## Task 6: Delete the OSINT GSD workshop directory

**Files:**
- Delete: `one-shot-task-dashboard-gsd-workshop/` (entire directory; will be replaced by `fastapi-template-gsd-workshop/` in Task 7)

- [ ] **Step 1: Confirm the directory exists**

Run: `Test-Path one-shot-task-dashboard-gsd-workshop`
Expected: `True`

- [ ] **Step 2: Remove with git**

Run: `git rm -r one-shot-task-dashboard-gsd-workshop`
Expected: long list of deletions.

- [ ] **Step 3: Commit**

Run:
```powershell
git commit -m "chore(workshops): remove osint-based gsd workshop dir`n`nMirror of the BMAD removal. A new fastapi-template-gsd-workshop dir replaces`nit in the next commit."
```

---

## Task 7: Create the GSD workshop dir from the FastAPI template

**Files:**
- Create: `fastapi-template-gsd-workshop/` (populated from template at the same pinned SHA)
- Create: `fastapi-template-gsd-workshop/README.md` (workshop-specific README; differs from BMAD only in the "Run the workflow" section)

- [ ] **Step 1: Clone the template (without checkout)**

Run:
```powershell
git clone --no-checkout https://github.com/fastapi/full-stack-fastapi-template.git fastapi-template-gsd-workshop
```

- [ ] **Step 2: Check out the pinned SHA**

Run:
```powershell
git -C fastapi-template-gsd-workshop checkout 13652b51ea0acca7dfe243ac25e2bbdc066f3c4f
```

- [ ] **Step 3: Verify SHA**

Run: `git -C fastapi-template-gsd-workshop rev-parse HEAD`
Expected: `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f`

- [ ] **Step 4: Strip the `.git/` directory**

Run: `Remove-Item -Recurse -Force fastapi-template-gsd-workshop\.git`

Verify: `Test-Path fastapi-template-gsd-workshop\.git`
Expected: `False`

- [ ] **Step 5: Spot-check key files**

Run:
```powershell
Test-Path fastapi-template-gsd-workshop\compose.yml
Test-Path fastapi-template-gsd-workshop\backend\app\main.py
Test-Path fastapi-template-gsd-workshop\frontend\package.json
```
Expected: `True` for all three.

- [ ] **Step 6: Overwrite the template's README with the GSD workshop README**

Write `fastapi-template-gsd-workshop/README.md` with this exact content:

````markdown
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

2. Start the stack:

   ```bash
   docker compose up --watch
   ```

3. Open `http://localhost:5173` and log in with the superuser credentials. Confirm the items module renders.

4. Baseline checks (record results before any agent work):

   ```bash
   docker compose exec backend pytest
   cd frontend && npm install && npm test && npm run build
   ```

5. Start a fresh Claude Code or Codex session in this directory.

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
````

- [ ] **Step 7: Stage everything**

Run:
```powershell
git add fastapi-template-gsd-workshop
```

- [ ] **Step 8: Verify the README is the workshop version**

Run:
```powershell
Select-String -Path fastapi-template-gsd-workshop\README.md -Pattern "Workshop: GSD on a FastAPI template fork" -SimpleMatch
```
Expected: one matching line.

- [ ] **Step 9: Commit**

Run:
```powershell
git commit -m "feat(workshops): add fastapi-template-gsd-workshop`n`nFork of fastapi/full-stack-fastapi-template at 13652b51ea0acca7dfe243ac25e2bbdc066f3c4f`n(2026-04-16), with a workshop-specific README replacing the template README.`n`nThe workshop targets GSD on an unfamiliar codebase, using the Item Categories`nwith Filter feature documented in the central guide as the suggested exercise."
```

- [ ] **Step 10: Verify**

Run: `git log --oneline -1`
Expected: the `feat(workshops): add fastapi-template-gsd-workshop` commit.

---

## Task 8: Write the top-level repo README

**Files:**
- Create: `README.md` (new top-level orientation; the repo does not currently have a top-level README)

- [ ] **Step 1: Confirm no top-level README exists**

Run: `Test-Path README.md`
Expected: `False`

If `True`, read it first and decide whether to keep, replace, or merge before proceeding.

- [ ] **Step 2: Write `README.md` with this exact content**

```markdown
# Claude Docs Workshop Handson

Runnable substrate for the workshops published in the Claude Docs guide.

| Workshop | Purpose |
|---|---|
| [`fastapi-template-bmad-workshop/`](fastapi-template-bmad-workshop/) | BMAD Method on an existing codebase — a FastAPI template fork. |
| [`fastapi-template-gsd-workshop/`](fastapi-template-gsd-workshop/) | GSD on an existing codebase — a FastAPI template fork. |
| [`research-report-generation-workflow-completed/`](research-report-generation-workflow-completed/) | Parallel-agent research and document generation (completed reference). |
| [`research-report-generation-workflow-starter/`](research-report-generation-workflow-starter/) | Parallel-agent research and document generation (starter). |

Both FastAPI workshops fork `fastapi/full-stack-fastapi-template` at commit `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f` (2026-04-16). They share the same codebase and the same suggested feature; only the workflow tooling differs (BMAD vs GSD), so participants can compare the two methods on identical inputs.

For curriculum, see the central guide `existing-codebase-workflows.md` in the `claude-docs` repo (replace with the public deploy URL once available).
```

- [ ] **Step 3: Stage and commit**

Run:
```powershell
git add README.md
git commit -m "docs: add top-level README listing surviving workshops"
```

- [ ] **Step 4: Verify**

Run: `git log --oneline -1`
Expected: the `docs: add top-level README` commit.

---

## Task 9: Smoke-verify the BMAD workshop boots

**Files:** none (verification only)

- [ ] **Step 1: Confirm Docker Desktop is running**

Run: `docker version --format '{{.Server.Version}}'`
Expected: a version string (Docker daemon reachable).

If Docker is not running, start Docker Desktop and wait until it's ready.

- [ ] **Step 2: Enter the BMAD workshop directory**

Run: `Set-Location fastapi-template-bmad-workshop`

- [ ] **Step 3: Bring up the stack**

Run: `docker compose up -d`
Expected: containers start successfully. First run pulls images (~2-3 min).

- [ ] **Step 4: Wait for backend health**

Run:
```powershell
$tries = 0
while ($tries -lt 30) {
  $r = try { Invoke-WebRequest -Uri http://localhost:8000/api/v1/utils/health-check/ -UseBasicParsing -ErrorAction Stop } catch { $null }
  if ($r -and $r.StatusCode -eq 200) { Write-Output "Backend up"; break }
  Start-Sleep 5
  $tries++
}
```
Expected: `Backend up` within 2.5 minutes.

- [ ] **Step 5: Verify frontend is reachable**

Run:
```powershell
(Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing).StatusCode
```
Expected: `200`.

- [ ] **Step 6: Tear down**

Run: `docker compose down -v`
Expected: containers and volumes removed.

- [ ] **Step 7: Return to repo root**

Run: `Set-Location ..`

No commit — this is a verification step. If anything failed, fix it before continuing.

---

## Task 10: Smoke-verify the GSD workshop boots

**Files:** none (verification only)

- [ ] **Step 1: Enter the GSD workshop directory**

Run: `Set-Location fastapi-template-gsd-workshop`

- [ ] **Step 2: Bring up the stack**

Run: `docker compose up -d`

- [ ] **Step 3: Wait for backend health** (same script as Task 9 Step 4)

Run:
```powershell
$tries = 0
while ($tries -lt 30) {
  $r = try { Invoke-WebRequest -Uri http://localhost:8000/api/v1/utils/health-check/ -UseBasicParsing -ErrorAction Stop } catch { $null }
  if ($r -and $r.StatusCode -eq 200) { Write-Output "Backend up"; break }
  Start-Sleep 5
  $tries++
}
```
Expected: `Backend up` within 2.5 minutes.

- [ ] **Step 4: Verify frontend**

Run:
```powershell
(Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing).StatusCode
```
Expected: `200`.

- [ ] **Step 5: Tear down**

Run: `docker compose down -v`

- [ ] **Step 6: Return to repo root**

Run: `Set-Location ..`

---

## Task 11: Push the migration branch and open a PR

**Files:** none (git push only)

- [ ] **Step 1: Review the full diff range**

Run: `git log --oneline main..HEAD`
Expected output (in order):
```
<sha> docs: add top-level README listing surviving workshops
<sha> feat(workshops): add fastapi-template-gsd-workshop
<sha> chore(workshops): remove osint-based gsd workshop dir
<sha> feat(workshops): add fastapi-template-bmad-workshop
<sha> chore(workshops): remove osint-based bmad workshop dir
<sha> chore(workshops): remove one-shot-task-dashboard OSINT baseline
<sha> chore(workshops): retire fastapi-perf-investigation-workshop
```

(Plus the two `docs(design)` commits from `main`'s ancestor history — those are already on `main`.)

- [ ] **Step 2: Push the branch**

Run: `git push -u origin feat/refactor-to-fastapi-template`

- [ ] **Step 3: Open the PR**

Run:
```powershell
gh pr create --title "Refactor workshops to FastAPI full-stack template forks" --body @'
## Summary
- Retire `fastapi-perf-investigation-workshop/` (Elasticsearch perf workshop).
- Remove `one-shot-task-dashboard/` baseline and both OSINT-based BMAD/GSD workshop dirs.
- Add `fastapi-template-bmad-workshop/` and `fastapi-template-gsd-workshop/`, each a fork of `fastapi/full-stack-fastapi-template` at SHA `13652b51ea0acca7dfe243ac25e2bbdc066f3c4f` (2026-04-16), with a workshop-specific README per dir.
- Add a top-level repo README listing surviving workshops.

Design spec: `docs/superpowers/specs/2026-05-12-fastapi-template-workshop-migration-design.md`
Implementation plan: `docs/superpowers/plans/2026-05-12-fastapi-template-workshop-migration.md`

## Test plan
- [x] `docker compose up -d` in `fastapi-template-bmad-workshop/` boots cleanly; backend health check returns 200; frontend reachable on :5173.
- [x] `docker compose up -d` in `fastapi-template-gsd-workshop/` boots cleanly; same checks pass.
- [ ] Reviewer manually inspects the workshop READMEs for accuracy.
- [ ] After merge: follow-up PR deletes `docs/` once the spec has served its review purpose.
'@
```

Expected: the `gh pr create` returns a PR URL.

- [ ] **Step 4: Note the PR URL for the user**

Print the PR URL so the user can open it.

---

## Follow-up (post-merge, NOT part of this branch)

### Task 12 (deferred): delete `docs/`

After the PR is merged and the spec + plan have served their review purpose:

- Open a new branch: `git switch -c chore/remove-design-docs`
- `git rm -r docs`
- Commit: `chore: remove superpowers design docs now that the migration is shipped`
- Push and open a PR.

This is intentionally split out because the design spec and plan are the merge-time review artifacts; deleting them in the same PR makes the PR harder to review.

---

## Self-review (writer's pass)

**1. Spec coverage:**

| Spec section | Plan task |
|---|---|
| §10.1 Branch | Task 1 |
| §10.3 Delete perf workshop | Task 2 |
| §10.4 Delete OSINT baseline | Task 3 |
| §10.5 Delete BMAD workshop dir | Task 4 |
| §10.6 Create BMAD workshop dir + README | Task 5 |
| §10.7 Delete GSD workshop dir | Task 6 |
| §10.8 Create GSD workshop dir + README | Task 7 |
| §10.9 Top-level repo README | Task 8 |
| §10.10 Delete `docs/` (follow-up) | Task 12 (deferred) |
| §6 Existing-Codebase Rule block in both READMEs | Embedded verbatim in Task 5 Step 6 and Task 7 Step 6 |
| §7.2 Pinned SHA recorded in workshop READMEs | Embedded in Task 5 Step 6 and Task 7 Step 6 Setup section |
| §7.3 Workshop README skeleton | Implemented in Task 5 Step 6 and Task 7 Step 6 |
| §8 Setup steps | Embedded in workshop READMEs |
| Verification (boot smoke test) | Tasks 9, 10 (added beyond spec — defensive) |

All spec items covered. Tasks 9-11 (smoke tests + PR) are additions beyond the spec, included as defensive verification before requesting review.

**2. Placeholder scan:** No "TBD", "TODO", or "fill in details" in any step. The workshop READMEs contain a "(replace with the public deploy URL once available)" parenthetical — that's an explicit, scoped placeholder for downstream cleanup, not a plan placeholder.

**3. Type consistency:** Not applicable — this is a refactor plan, not a code feature. File paths and SHAs are consistent across tasks.

**4. Ambiguity check:**
- "Edit the template's shipped `.env`" — confirmed by reading the FastAPI template repo: the template ships `.env` (not `.env.example`) at the repo root with placeholder values. Wording is correct.
- The workshop README example links (`claude-docs/content/docs/existing-codebase-workflows.md`) are intentionally repo-relative file references with a parenthetical noting the public URL is TBD. Reviewer will replace once the deploy URL is finalized.

---

## Execution

Plan complete. Saved to `docs/superpowers/plans/2026-05-12-fastapi-template-workshop-migration.md`.
