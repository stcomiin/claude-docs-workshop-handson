# BMAD Existing Codebase Workshop

In this workshop, you will use the BMAD Method to understand an existing codebase before changing it.

You will work on this dashboard, a small OSINT monitoring app with:

- a React/Vite frontend
- an Express API
- SQLite persistence
- WebSocket updates
- scheduled collectors
- Vitest tests

## What You Will Build

You will add a **Test** action to each collector in the Settings screen.

When a user clicks **Test**, the UI should call the existing collector test API and show the result beside that collector.

This feature is a good workshop example because the backend route and frontend API helper already exist, but the UI does not expose them yet. Your job is to use BMAD to capture the existing project context, choose the right workflow depth, and implement the missing UI without changing the backend or database.

## BMAD References

This workshop follows the current BMAD guidance for established projects:

- Install BMAD with `npx bmad-method install`.
- Generate existing-project context with `bmad-generate-project-context`.
- Use `bmad-quick-dev` for small, well-understood changes.
- Use the full workflow for larger changes: PRD, architecture, epics/stories, sprint planning, dev story, and code review.

Official docs:

- https://docs.bmad-method.org/how-to/install-bmad/
- https://docs.bmad-method.org/how-to/established-projects/
- https://docs.bmad-method.org/reference/workflow-map/
- https://docs.bmad-method.org/how-to/quick-fixes/

## Shared Setup

Run all shell commands from this directory:

```bash
cd one-shot-task-dashboard-bmad-workshop
ls
```

You should see files like:

```text
package.json
server/
src/
vite.config.ts
vitest.config.ts
```

Install dependencies:

```bash
npm install
```

Run the existing tests:

```bash
npm test
```

You should see Vitest run the existing test suite.

Run the production build:

```bash
npm run build
```

You should see TypeScript and Vite complete successfully. Vite may print a chunk-size warning; that warning is okay for this workshop.

If this workshop copy is not already a git repository, initialize it:

```bash
git init
git add .
git commit -m "Workshop starting point"
```

Check your status:

```bash
git status --short
```

You should see no changed files before starting the BMAD workflow.

## Install BMAD

From the workshop directory, run:

```bash
npx bmad-method install
```

During the interactive install:

- install into the current directory
- include the BMAD Method module
- select your AI IDE or CLI integration
- accept the default output folder unless your facilitator says otherwise

After installation, you should see BMAD files such as:

```text
_bmad/
_bmad-output/
```

Depending on your IDE, you may also see generated skill files under a tool-specific directory, such as:

```text
.agents/skills/
.claude/skills/
.cursor/skills/
```

If your AI assistant was already running before BMAD was installed, restart or reload it from this workshop directory so it can discover the generated BMAD skills.

If you are unsure what BMAD installed or what to run next, ask your AI assistant:

```text
bmad-help
```

## Choose A Path

Use **Option A** for a 30-40 minute hands-on section.

Use **Option B** for a longer session where you want to practice more of the BMAD phase lifecycle.

## Option A: Shorter BMAD Quick Dev Task

This option uses `bmad-quick-dev` to clarify intent, create a bounded spec, implement, review, and present one small feature.

If you get stuck, use `reference/option-a-sample-run.md` as a troubleshooting reference. Do not open it first if you want the full exercise.

### A1. Generate Project Context

Ask BMAD to inspect the existing app and create project context:

```text
bmad-generate-project-context
```

Review the generated file:

```bash
sed -n '1,220p' _bmad-output/project-context.md
```

Confirm it captured the important app facts:

- frontend components live under `src/components`
- API helpers live in `src/lib/api.ts`
- Express routes live under `server/routes`
- SQLite setup lives under `server/db`
- tests use Vitest

### A2. Commit BMAD Setup And Context

`bmad-quick-dev` expects a clean working tree before it starts implementation. BMAD installation and project-context generation create files, so commit them before continuing:

```bash
git status --short
git add _bmad _bmad-output/project-context.md
for dir in .agents .claude .cursor; do
  if [ -d "$dir" ]; then git add "$dir"; fi
done
git commit -m "Install BMAD and generate project context"
git status --short
```

If your installer created another tool-specific BMAD directory, add that directory before committing. You should see no changed files before running quick-dev.

### A3. Find The Existing Implementation Path

Before asking for code changes, inspect the relevant files:

```bash
sed -n '1,220p' src/lib/api.ts
sed -n '1,220p' server/routes/collectors.ts
sed -n '1,260p' src/components/settings/CollectorManager.tsx
```

Confirm:

- `server/routes/collectors.ts` has a collector test route
- `src/lib/api.ts` has `api.testCollector(id)`
- `src/components/settings/CollectorManager.tsx` renders collector rows
- the UI does not yet expose a Test action

### A4. Run Quick Dev

Ask BMAD to implement the small feature:

```text
bmad-quick-dev Add a Test action to each collector row in Settings. Reuse the existing api.testCollector(id) helper. Show pending state only for the clicked collector, then show the success or error message beside that collector. Do not add backend routes or database changes.
```

BMAD may ask clarifying questions or present a short spec. Keep the scope tight:

- update the existing `CollectorManager` UI
- keep result state local to the settings component
- reuse `api.testCollector(id)`
- do not add a backend route
- do not change the database schema

If BMAD reaches its review step and your AI runtime cannot launch isolated review agents, BMAD may write review prompt files under:

```text
_bmad-output/implementation-artifacts/
```

Run those prompts in separate AI sessions, or ask your facilitator whether to authorize subagents for the review step.

If BMAD review finds edge-case issues, let BMAD apply the patch, rerun `npm test` and `npm run build`, and rerun review until there are no remaining findings.

### A5. Inspect The Result

Check the recent commits:

```bash
git log --oneline -5
```

Check changed files:

```bash
git show --stat --oneline HEAD
git show -- src/components/settings/CollectorManager.tsx
```

The feature should be mostly or entirely in:

```text
src/components/settings/CollectorManager.tsx
```

Check BMAD output artifacts:

```bash
find _bmad-output -maxdepth 3 -type f | sort
```

You should see implementation artifacts such as a quick-dev spec, summary, review notes, or deferred work depending on your BMAD version and selected modules.

### A6. Verify The Feature

Run:

```bash
npm test
npm run build
```

Both commands should pass.

Run the app:

```bash
npm run seed
npm run dev
```

Run `npm run seed` once per fresh workshop database. If you reseed the same copy repeatedly, sample collectors and items may duplicate; remove `data/osint.db*` before reseeding if you want a clean local dataset.

Open the frontend URL printed by Vite.

Manual check:

1. Go to Settings.
2. Find the Collectors section.
3. Click **Test** on one collector.
4. Confirm only that collector shows a pending state.
5. Confirm the row shows a success or error message after the request finishes.
6. Confirm Enable, Edit, and Delete still work as before.

### A7. Finish Option A

Review what BMAD helped you do:

- Did `project-context.md` capture the existing codebase conventions?
- Did `bmad-quick-dev` ask enough questions before implementing?
- Did the generated spec stay within the requested scope?
- Did BMAD defer unrelated findings instead of expanding the task?
- Did tests and manual checks prove the feature works?

## Option B: Longer BMAD Method Workflow

This option uses more of the BMAD Method: project context, PRD, architecture, epics/stories, sprint planning, implementation, and review.

For this workshop feature, the full workflow is intentionally more process than the change strictly needs. That is useful when the learning goal is to practice BMAD artifacts and handoffs.

### B1. Generate Project Context

Ask BMAD to inspect the existing project:

```text
bmad-generate-project-context
```

Review:

```bash
sed -n '1,220p' _bmad-output/project-context.md
```

Before continuing, answer:

- Where is the frontend entry point?
- Where are API routes registered?
- Where is SQLite initialized?
- Where is collector scheduling handled?
- What tests already exist?

### B2. Ask BMAD For Workflow Guidance

Ask BMAD what workflow depth it recommends:

```text
bmad-help I have an existing React and Express dashboard. I want to expose an existing collector test endpoint in the Settings UI as a small workshop feature. Should I use quick-dev or the full BMAD Method?
```

For this longer option, continue with the full method even if BMAD recommends `bmad-quick-dev`.

### B3. Create A Focused PRD

Ask BMAD to create a small PRD:

```text
bmad-create-prd
```

Use this intent:

```text
Expose the existing collector test endpoint in the Settings UI. Each collector row should have a Test action. Clicking it should call api.testCollector(id), show pending state only for that collector, and display either the success message or an error message near that collector. Existing enable, edit, and delete actions should keep working. This is an existing-codebase workshop feature, so do not add backend routes or database changes.
```

The PRD should include acceptance criteria like:

- each collector row has a Test action
- the Test action calls `api.testCollector(id)`
- only the selected collector shows pending state
- success and error results are visible near the selected collector
- existing collector actions still work
- `npm test` and `npm run build` pass

### B4. Create A Lightweight Architecture

Ask BMAD to create the architecture:

```text
bmad-create-architecture
```

Keep the solution constrained:

- no new database table
- no migration
- no scheduler change
- no new backend endpoint
- frontend state remains local to `CollectorManager`
- reuse the existing API helper

Before continuing, check that the architecture points to the expected files:

```text
src/components/settings/CollectorManager.tsx
src/lib/api.ts
server/routes/collectors.ts
```

### B5. Create Epics And Stories

Ask BMAD to split the PRD into implementation work:

```text
bmad-create-epics-and-stories
```

For this workshop, one story is enough:

```text
As an analyst configuring collectors, I want to test a collector from Settings so I can confirm its configuration without leaving the dashboard.
```

The story should not include backend route creation or database changes.

### B6. Check Implementation Readiness

Ask BMAD to check readiness:

```text
bmad-check-implementation-readiness
```

Resolve any blocker before coding. Acceptable concerns for this workshop:

- no dedicated UI test exists yet
- manual verification is required
- backend test route is simple and already covered indirectly by route inspection

### B7. Initialize Sprint Tracking

Ask BMAD to initialize sprint status:

```text
bmad-sprint-planning
```

Then check:

```bash
find _bmad-output -name 'sprint-status.yaml' -print
```

### B8. Create And Implement The Story

Ask BMAD to prepare the next story:

```text
bmad-create-story
```

Then ask BMAD to implement it:

```text
bmad-dev-story
```

The implementation should be small and centered on:

```text
src/components/settings/CollectorManager.tsx
```

Check the changed files:

```bash
git diff --stat
```

### B9. Verify And Review

Run:

```bash
npm test
npm run build
```

Then ask BMAD to review the change:

```text
bmad-code-review
```

If BMAD requests changes, apply them and rerun:

```bash
npm test
npm run build
```

### B10. Finish Option B

Check final status:

```bash
git status --short
```

Review what BMAD helped you discover:

- which project context details mattered most
- whether the PRD and architecture stayed aligned with the existing app
- whether the story gave enough implementation context
- whether review findings were scoped to this change
- whether tests and manual checks proved the feature works
