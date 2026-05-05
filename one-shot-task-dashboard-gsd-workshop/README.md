# GSD existing codebase workshop

In this workshop, you will use GSD to understand an existing codebase before changing it.

You will work on `one-shot-task-dashboard`, a small OSINT dashboard with:

- a React/Vite frontend
- an Express API
- SQLite persistence
- WebSocket updates
- scheduled collectors
- Vitest tests

## What you will build

You will add a **Test** action to each collector in the Settings screen.

When a user clicks **Test**, the UI should call the existing collector test API and show the result beside that collector.

This feature is a good workshop example because the backend route and frontend API helper already exist, but the UI does not expose them yet. Your job is to use GSD to find that path through the existing codebase before implementing the missing UI.

## Shared setup

Use a bash shell. On Windows, that means Git Bash or WSL.

Run all commands from this directory:

```bash
cd one-shot-task-dashboard-gsd-workshop
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

You should see no changed files before starting the GSD workflow.

## Choose a path

Use **Option A** for a 20-25 minute hands-on section.

Use **Option B** for a longer session where you want to practice the full GSD phase lifecycle.

## Option A: shorter GSD quick task

This option uses `/gsd-quick` to plan, implement, summarize, and track one small feature without going through the full phase workflow.

For this option, the project must already have GSD project context. Check for it:

```bash
test -f .planning/ROADMAP.md && echo "GSD project context found"
```

If you see `GSD project context found`, continue to Step A1.

If `.planning/ROADMAP.md` does not exist, ask your facilitator whether this directory should already be pre-bootstrapped. If you are doing the exercise standalone, run the bootstrap steps in Option B through **Step B2**, then return here.

### A1. Review the existing codebase map

Check the codebase map:

```bash
ls .planning/codebase
```

You should see documents similar to:

```text
ARCHITECTURE.md
CONCERNS.md
CONVENTIONS.md
INTEGRATIONS.md
STACK.md
STRUCTURE.md
TESTING.md
```

Use the map to find the expected implementation path:

```text
src/components/settings/CollectorManager.tsx
src/lib/api.ts
server/routes/collectors.ts
```

Before running the quick task, confirm:

- `server/routes/collectors.ts` has a collector test route
- `src/lib/api.ts` has a collector test helper
- `src/components/settings/CollectorManager.tsx` renders collector rows

### A2. Run the quick task

Ask GSD to implement the small feature:

```text
/gsd-quick Add a Test action to each collector row in Settings. Reuse the existing api.testCollector(id) helper. Show pending state only for the clicked collector, then show the success or error message beside that collector. Do not add backend routes or database changes.
```

You should see GSD create a quick task under:

```text
.planning/quick/
```

The quick task should create a plan, execute the code change, write a summary, update project state, and make one or more commits.

### A3. Inspect the result

Check the recent commits:

```bash
git log --oneline -5
```

You should see a recent quick-task commit.

Check the changed source files:

```bash
git show --stat --oneline HEAD
```

The feature should be mostly or entirely in:

```text
src/components/settings/CollectorManager.tsx
```

Check the quick task artifacts:

```bash
find .planning/quick -maxdepth 2 -type f | sort
```

You should see files such as a quick-task `PLAN.md` and `SUMMARY.md`.

### A4. Verify the feature

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

Open the frontend URL printed by Vite.

Manual check:

1. Go to Settings.
2. Find the Collectors section.
3. Click **Test** on one collector.
4. Confirm only that collector shows a pending state.
5. Confirm the row shows a success or error message after the request finishes.
6. Confirm Enable, Edit, and Delete still work as before.

### A5. Finish Option A

Review what GSD helped you do:

- Which map file helped you find the right component?
- Did `/gsd-quick` stay within the requested scope?
- What did `.planning/quick/` capture?
- Did tests and manual checks prove the feature works?

## Option B: longer full phase workflow

This option uses the full GSD flow: map, initialize, add a phase, spec, discuss, plan, execute, verify, and review.

### B1. Map the existing codebase

Ask GSD to inspect the app before planning any changes:

```text
/gsd-map-codebase
Focus on the app stack, server API, database schema, collector pipeline, frontend state, websocket flow, and test coverage.
```

You should see GSD create a codebase map under:

```text
.planning/codebase/
```

Check the generated files:

```bash
ls .planning/codebase
```

You should see documents similar to:

```text
ARCHITECTURE.md
CONCERNS.md
CONVENTIONS.md
INTEGRATIONS.md
STACK.md
STRUCTURE.md
TESTING.md
```

Before continuing, open the generated map and answer:

- Where is the frontend entry point?
- Where are API routes registered?
- Where is SQLite initialized?
- Where is collector scheduling handled?
- What tests already exist?

### B2. Initialize GSD project context

Create project-level GSD context:

```text
/gsd-new-project
This is an existing OSINT dashboard used for a workshop. Use the codebase map as source context. Keep the first milestone focused on small, safe improvements that help participants learn the architecture.
```

If GSD asks for the project goal, use:

```text
Teach participants how to use GSD on an existing codebase by mapping architecture, selecting a bounded improvement, planning the change, implementing it, and verifying behavior with tests and manual checks.
```

You should see GSD create files such as:

```text
.planning/PROJECT.md
.planning/ROADMAP.md
.planning/STATE.md
```

Open the roadmap:

```bash
sed -n '1,220p' .planning/ROADMAP.md
```

You should see the current milestone and planned phases.

### B3. Add the workshop phase

Add the feature as a GSD phase:

```text
/gsd-add-phase
Expose the existing collector test endpoint in the Settings UI. Each collector row should have a Test action. Clicking it should call api.testCollector(id), show pending state for that collector, and display either the success message or an error message near that collector.
```

You should see GSD update the roadmap and create a phase directory.

Find the phase number:

```bash
sed -n '1,260p' .planning/ROADMAP.md
```

Use that phase number in the next commands. The examples below use `<phase-number>` as a placeholder.

### B4. Write the phase spec

Clarify what the feature must do:

```text
/gsd-spec-phase <phase-number>
```

Answer GSD's questions using this intent:

```text
Each collector row in Settings should have a Test action. Clicking Test should call the existing api.testCollector(id) helper, show a loading state only for that collector, then show either the success message or an error message beside that collector. Existing enable, edit, and delete actions should keep working.
```

You should see GSD write a spec file in the phase directory, commonly named like `<phase-number>-SPEC.md`.

Check that the spec includes acceptance criteria like:

- each collector row has a Test action
- the Test action calls `api.testCollector(id)`
- only the selected collector shows pending state
- success and error results are visible near the selected collector
- existing collector actions still work
- `npm test` and `npm run build` pass

### B5. Discuss implementation decisions

Ask GSD to turn the spec into implementation decisions:

```text
/gsd-discuss-phase <phase-number>
```

You should see GSD inspect the existing code and ask about any unclear implementation choices.

Keep the decisions small:

- use the existing `api.testCollector(id)` helper
- update the existing `CollectorManager` UI
- keep result state local to the settings component
- do not add a new backend route
- do not change the database schema

You should see GSD write a context file in the phase directory, commonly named like `<phase-number>-CONTEXT.md`.

### B6. Plan the change

Ask GSD to create the implementation plan:

```text
/gsd-plan-phase <phase-number>
```

You should see GSD create a plan file in the phase directory.

Before executing, check that the plan points to the expected files:

```text
src/components/settings/CollectorManager.tsx
src/lib/api.ts
server/routes/collectors.ts
```

The plan should not require a new database table, migration, scheduler rewrite, or new backend endpoint.

### B7. Execute the plan

Run the phase implementation:

```text
/gsd-execute-phase <phase-number> --interactive
```

You should see GSD make a small code change, usually centered on:

```text
src/components/settings/CollectorManager.tsx
```

Check the changed files:

```bash
git diff --stat
```

You should see a small diff for the collector test UI.

### B8. Verify the implementation

Run the automated checks:

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

Open the frontend URL printed by Vite.

Manual check:

1. Go to Settings.
2. Find the Collectors section.
3. Click **Test** on one collector.
4. Confirm only that collector shows a pending state.
5. Confirm the row shows a success or error message after the request finishes.
6. Confirm Enable, Edit, and Delete still work as before.

### B9. Review the change

Ask GSD to review the files changed in this phase:

```text
/gsd-code-review <phase-number> --depth=quick
```

You should see GSD write a review artifact in the phase directory and summarize any findings.

If GSD finds issues, fix them:

```text
/gsd-code-review-fix <phase-number>
```

Then run verification again:

```bash
npm test
npm run build
```

### B10. Finish Option B

Check the final status:

```bash
git status --short
```

You should see the code changes and GSD planning artifacts from the workshop.

Review what GSD helped you discover:

- which codebase map file was most useful
- which files GSD selected for the feature
- whether the implementation stayed within the phase scope
- whether tests and manual checks proved the feature works
