# ROADMAP.md — FastAPI Perf Workshop

> Phases derived from the 7 v1 requirements (`.planning/REQUIREMENTS.md`) and
> 18 structural constraints (`.planning/intel/constraints.md`). Each phase is a
> **vertical slice** that delivers a thinner-but-runnable form of the workshop
> end-to-end — tracer-bullet style. Subsequent phases extend the slice; they do
> not introduce a new layer.
>
> The directory layout in `CON-deliverable-directory-layout` is established in
> full at Phase 1 (as stubs); each later phase deepens specific files.
> Granularity: standard (5-8 phases). Total: 5 phases.

---

## Phasing rationale

The deliverable's natural decomposition by directory (docker → app → tests →
README → preflight) is a horizontal layering: nothing integrates until the
final phase, the bulk of pedagogy lives in one phase, and risks (Windows
Docker, uvicorn `--reload` poisoning bench, timer-log parsing, ES cache state)
all surface at the very end.

This roadmap re-cuts the work as **tracer-bullet vertical slices**:

| Phase | What's true after this phase |
|---|---|
| 1 | The workshop *motion* runs end-to-end against trap #1 alone. Integration risk burned down. |
| 2 | Option A (~45 min) lands the takeaway with all three traps physically present but only #1 narratively engaged. |
| 3 | Option B steps 9–10 land trap #2's investigation + fix. |
| 4 | Option B steps 11–12 land trap #3's fix; ES DSL primer, Appendix B, closing-slide restatement, and all 5 failure-mode runbook entries complete the deliverable. |
| 5 | Dual-model pre-flight (Opus 4.7 + Sonnet 4.6) validates the integrated workshop on a fresh clone. |

Constraints `CON-docker-image-contract` (50k seed) and `CON-three-layered-perf-traps`
(all three defects physically present) bind on the **distributed** image at
Phase 2 onward; Phase 1's tracer image is a facilitator-only validation
artifact, not a participant-distributed artifact.

---

## Phases

- [ ] **Phase 1: Tracer Slice — Workshop Motion End-to-End** — full directory layout stubbed, 50k seed, trap #1 (visible N+1) only, three timer blocks, 4 pytest tests, 3-run bench, README stub with the pivot prompt, and a 10-minute facilitator walkthrough that proves the motion on Mac/Windows/Linux.
- [ ] **Phase 2: Option A Complete Vertical** — traps #2 and #3 added physically (not narratively engaged), full Option A 8-step arc in README, falsification prompt, Option A entry in `reference/option-a-sample-run.md`. After this phase, a participant can run Option A end-to-end against Opus 4.7 and walk away with the takeaway.
- [ ] **Phase 3: Option B Trap #2 Narrative — Mapping & `_search?profile=true`** — Option B steps 9-10 in README, mapping-inspection arc, `_search?profile=true` / slow log instructions, trap #2 entry in answer-key, post-fix-2 timing band (200–500 ms) confirmed.
- [ ] **Phase 4: Option B Trap #3 + Workshop Polish** — Option B steps 11-12, comment block instruction at top of `dashboard.py`, ES DSL primer, Appendix B translate-to-your-world, closing-slide stack-agnostic restatement, all 5 failure-mode runbook entries. Post-fix-3 band (50–150 ms cached / 200–400 ms cold) confirmed.
- [ ] **Phase 5: Dual-Model Pre-Flight Validation** — 24-hour pre-flight against Opus 4.7 (target) and Sonnet 4.6 (fallback) on a fresh clone with the published image; all 5 failure-mode runbook entries either non-triggering or recoverable.

---

## Phase Details

### Phase 1: Tracer Slice — Workshop Motion End-to-End

**Goal**: A facilitator on a fresh laptop (Mac, Windows + WSL2, or Linux) can run a 10-minute end-to-end walkthrough — `docker compose up -d` → `uvicorn` → `curl /dashboard/summary` → `bash tests/bench.sh` → pivot prompt → Claude proposes the N+1 fix → apply fix → re-bench → measurable improvement → `pytest` still green — and observe that every integration seam in the workshop's runtime works. Every directory and file from `CON-deliverable-directory-layout` exists, even if many are stubbed pending later phases.

**Depends on**: Nothing (first phase).

**Requirements**: REQ-no-out-of-scope-drift, REQ-correctness-preserved.

**Success Criteria** (what must be TRUE):
  1. The complete directory layout from `CON-deliverable-directory-layout` exists: `docker/` (Dockerfile, docker-compose.yml, seed/), `app/` (`__init__.py`, `main.py`, `es.py`, `timing.py`, `routes/dashboard.py`), `tests/` (`test_dashboard.py`, `bench.sh`), `reference/`, `pyproject.toml`, `README.md`, `.gitignore`. Files not yet authored in this phase exist as minimal stubs that don't break verification gates.
  2. `docker compose -f docker/docker-compose.yml up -d` brings up a single-node ES cluster on `localhost:9200` reaching status `green` or `yellow` within 30-90 s cold or ~10 s warm. The image ships `ES_JAVA_OPTS=-Xms512m -Xmx512m` by default. The seeded `activities` index contains ~50k synthetic documents (per `CON-docker-image-contract`).
  3. Only **trap #1** (N+1 `_count` loop in `top_users` construction) is physically present. The `username` field is correctly mapped as `keyword` (no trap #2). The 30-day date range in `compute_org_summary` is correctly under `filter` context (no trap #3). `compute_org_summary` returns real numbers from real ES requests, not stubs.
  4. `uvicorn` against the Phase-1 ES container, `curl http://localhost:8765/dashboard/summary` returns the response shape from `CON-endpoint-response-shape` (`top_users` + `org_summary` with all required fields). The uvicorn console emits exactly three `[timer] <name> <Nms>ms` lines per request per `CON-pre-instrumented-timing`. Trap #1 alone produces a noticeably-slow baseline (≈5-8 s on calibration hardware).
  5. All four verification gates pass on as-shipped tracer code: `pytest` (4 tests from `CON-test-suite-shape`), `bash tests/bench.sh` (3-run curl loop per `CON-bench-script`), `ruff check app`, `mypy app`.
  6. The README stub contains: the setup prerequisites from `CON-setup-prerequisites` (Docker, three terminals, Python 3.11+, Git Bash/WSL for Windows, port 9200/8765, `--reload` caveat), the verbatim **pivot prompt** from `CON-pivot-and-falsification-prompts`, a 10-minute tracer walkthrough showing one find-and-fix cycle for the N+1 trap, and an explicit "tracer slice — Option A and Option B not yet present" callout.
  7. After applying the N+1 fix in the tracer walkthrough, `pytest` / `ruff` / `mypy` stay green and `bench.sh` shows measurable improvement.
  8. No `CLAUDE.md` / `AGENTS.md` is shipped (`CON-no-claude-md-shipped`). Nothing in code or README drills into out-of-scope topics from `CON-out-of-scope` (async/await, cluster ops, reindex strategies, prod deploy, frontend, auth, vector / ML / ESQL).

**Plans**:

**Wave 1**

- [x] `01-01` — Docker ES image, Compose runtime, keyword mapping, and 50k deterministic seed pipeline.
- [x] `01-02` — FastAPI app, `/dashboard/summary`, three timer blocks, trap #1 only, and four correctness tests.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] `01-03` — bench harness, README tracer walkthrough, reference stub, and ignore rules.

---

### Phase 2: Option A Complete Vertical

**Goal**: A participant on a fresh laptop reads the README, follows the Option A 8-step arc against Opus 4.7, produces one commit (`fix: replace per-user _count loop with single terms aggregation`), observes the 5–10 s → 3–6 s improvement band, and can articulate the one-sentence takeaway plus name both portable prompts. Traps #2 and #3 are physically present but not narratively engaged in Option A — they exist so post-Option-A-fix timing matches `CON-expected-timings` and so Phase 3/4 can extend the slice without changing the starting point.

**Depends on**: Phase 1.

**Requirements**: REQ-measured-fix-option-a, REQ-investigation-discipline-takeaway.

**Success Criteria** (what must be TRUE):
  1. **Trap #2** is physical: `docker/seed/mappings.json` defines `username` as a multi-field `{"type": "text", "fielddata": true, "fields": {"keyword": {"type": "keyword"}}}`, and `compute_org_summary`'s `terms` aggregation targets the parent `username` (text + fielddata) path rather than the already-present `username.keyword` subfield. The agg runs (because `fielddata: true` is enabled) but loads fielddata onto the JVM heap on every request — slow, not failing. Diagnosable only via `_search?profile=true`, slow log, or mapping inspection — invisible from `dashboard.py`. (The `fielddata: true` setting is load-bearing: without it the agg would error rather than be slow, breaking the "slow but correct" premise.)
  2. **Trap #3** is physical: the 30-day date range filter for `unique_users_30d` in `compute_org_summary` sits under `query` context (`bool.must`) AND uses millisecond-precise `now-30d` instead of day-rounded `now-30d/d`. Two coupled cache misses fall out: `query` context skips the segment-level filter cache and runs scoring; the non-deterministic `now` produces a different request-body cache key on every request. The aggs sub-request uses `size: 0` (correct) so the request cache is *eligible* — the trap is purely about query-context + non-rounded date. Diagnosable only by running `bench.sh` and noticing runs 2 and 3 are not faster than run 1.
  3. As-shipped baseline matches `CON-expected-timings` Option A band: 5–10 s on the calibration laptop. After the Option A reference fix (single `terms` aggregation replacing the N+1), bench shows the 3–6 s post-fix band — traps #2 and #3 still drag because they're not addressed in Option A.
  4. `compute_org_summary` is structured so finer-grained timers can be added inside without restructuring (per `CON-pre-instrumented-timing`'s extension-friendly requirement). Two of three traps (#2 and #3) remain invisible from `dashboard.py` reading alone.
  5. README contains the verbatim Option A 8-step arc per `CON-option-a-arc`, including the pivot moment at step 4 and the falsification step at step 5. Both portable prompts (pivot + falsification) appear in README verbatim per `CON-pivot-and-falsification-prompts`.
  6. `reference/option-a-sample-run.md` exists as a facilitator answer-key documenting the Option A expected investigation path: how Claude is expected to behave at each step, where Sonnet 4.6 may diverge, what "step 3 not solved in one shot" looks like.
  7. After Option A in the reference run: one commit on the participant branch (`fix: replace per-user _count loop with single terms aggregation`), `pytest` / `ruff` / `mypy` green, `bench.sh` shows the 5–10 s → 3–6 s improvement band, participant articulates the one-sentence takeaway.
  8. No `CLAUDE.md` / `AGENTS.md` shipped. Out-of-scope respected.

**Plans**: TBD.

---

### Phase 3: Option B Trap #2 Narrative — Mapping & `_search?profile=true`

**Goal**: A participant who has just completed Option A can continue into Option B steps 9–10, diagnose trap #2 (text-mapped `username` aggregation) via `_search?profile=true` or the slow log, apply the mapping fix as commit 2 (`fix: aggregate on username.keyword to avoid fielddata on text field`), and observe the 200–500 ms post-fix-2 timing band per `CON-expected-timings`. Trap #3 is still in place — that's Phase 4.

**Depends on**: Phase 2.

**Requirements**: REQ-investigation-uses-instrumentation (this phase brings it to full satisfaction by adding the `_search?profile=true` / slow log step from Option B step 9).

**Success Criteria** (what must be TRUE):
  1. README contains the verbatim Option B steps 9 and 10 per `CON-option-b-arc`: re-measure after fix #1, dominant cost shifts to `compute_org_summary`, Claude investigates via `_search?profile=true` or slow log, profile reveals fielddata loading on `username`, mapping inspection finds `username` mapped as `text` with `fielddata: true` AND a `username.keyword` subfield already present in the multi-field, Claude switches the aggregation from `username` to `username.keyword` (no re-index needed because the subfield already exists), participant re-measures.
  2. README documents how to enable the ES slow log and how to run `_search?profile=true` against the running container. These instructions are part of the workshop's instrumentation discussion, not a separate appendix.
  3. `reference/option-a-sample-run.md` (renamed or extended as appropriate) documents the Option B trap #2 expected investigation path: profile/slow-log reveals fielddata loading on `username`; mapping inspection reveals `username` as `text + fielddata: true` with the `keyword` subfield already exposed in the multi-field; the canonical fix is to switch the aggregation to `username.keyword` — no re-index needed because the subfield already exists. Post-fix-2 expected timing band: 200–500 ms.
  4. After Option B steps 9-10 in the reference run: a second commit on the participant branch (`fix: aggregate on username.keyword to avoid fielddata on text field`), `pytest` / `ruff` / `mypy` green, `bench.sh` shows the 200–500 ms post-fix-2 band.
  5. Trap #3 (`query` context + non-rounded `now-30d`) is still physically present; post-fix-2 bench runs do not yet exhibit request-cache hits between runs 1, 2, 3.

**Plans**: TBD.

---

### Phase 4: Option B Trap #3 + Workshop Polish

**Goal**: A participant who has completed Option B through fix #2 can continue into steps 11–12, diagnose trap #3 (`query` context + non-rounded `now-30d` → both filter cache and request cache miss) by noticing bench runs 2 and 3 don't hit either cache, apply the two-part cache fix as commit 3 (`fix: move date range to filter context, round now to day for cache hit`), document before/after in a comment block at the top of `dashboard.py`, and observe the 50–150 ms cached / 200–400 ms cold timing band — the workshop's 50-100x improvement target. Workshop content is now complete: ES DSL primer, Appendix B translate-to-your-world, closing-slide stack-agnostic restatement, all 5 facilitator failure-mode runbook entries.

**Depends on**: Phase 3.

**Requirements**: REQ-measured-fix-option-b, REQ-portable-prompt-artifacts.

**Success Criteria** (what must be TRUE):
  1. README contains the verbatim Option B steps 11 and 12 per `CON-option-b-arc`: same request twice, second run not cached, diagnose two coupled defects (`must` block under `query` context AND non-rounded `now-30d` date math), move the date range to `filter` context AND round to `/d` (`now-30d/d`), re-bench, second request now cached. Comment block documenting before/after for each of the three fixes is added at the top of `dashboard.py` per `CON-expected-commit-shape`.
  2. README contains the 1-page ES DSL primer covering `term`, `terms`, `range`, `match_all`, `bool`/`must`/`filter`, `aggs.terms`, `aggs.date_histogram` per `CON-setup-prerequisites`.
  3. README contains Appendix B (Translate to your world) with a column mapping each ES primitive to Postgres / MongoDB / Spark equivalents, with explicit note that *the prompts themselves are stack-agnostic* per `CON-pivot-and-falsification-prompts`.
  4. README contains the closing-slide stack-agnostic restatement of the lesson per `CON-pivot-and-falsification-prompts`.
  5. After Option B in the reference run: three commits in the order specified by `CON-expected-commit-shape`, `pytest` / `ruff` / `mypy` green, `bench.sh` shows the 50–150 ms cached / 200–400 ms cold band, comment block at the top of `dashboard.py` documents before/after for each of the three fixes, participant has discussed Monday-equivalents per Appendix B.
  6. `reference/option-a-sample-run.md` contains all 5 failure-mode runbook entries from `CON-facilitator-preflight`: (a) Claude finds the cause too fast, (b) fix doesn't measurably help, (c) bench numbers don't change, (d) Docker image won't start / cluster doesn't reach green/yellow, (e) ES request cache warm from prior bench masking trap #3.
  7. The deliverable contains no `CLAUDE.md` / `AGENTS.md` (`CON-no-claude-md-shipped`); nothing in README or sample run drills into out-of-scope topics (`CON-out-of-scope`).

**Plans**: TBD.

---

### Phase 5: Dual-Model Pre-Flight Validation

**Goal**: A facilitator running through the integrated workshop on a fresh clone with the published Docker image, 24 hours before a session, can confirm the deliverable lands the lesson against Opus 4.7 (target) and Sonnet 4.6 (supported fallback), with timings in the expected bands and all five failure-mode runbook entries either non-occurring or successfully recoverable. This phase validates an already-integrated workshop — not a brand-new assembly — because Phases 1–4 each produced a runnable slice.

**Depends on**: Phase 4.

**Requirements**: validation phase — gates end-to-end correctness across phases 1–4; no single requirement owned, but the developer-facing success metric depends on this gate.

**Success Criteria** (what must be TRUE):
  1. On a fresh clone with the published image, the facilitator runs Option A end-to-end against Opus 4.7 and observes: (a) Claude does NOT solve step 3 in one shot, (b) Claude does NOT find traps #2 and #3 from code-reading alone, (c) the pivot prompt at step 4 forces Claude to read the timer log, (d) baseline 5–10 s and post-fix 3–6 s timings land within the expected bands per `CON-expected-timings`.
  2. The same Option A run repeated against Sonnet 4.6 fallback lands the lesson — even if Sonnet is more likely to skip the slow log / `?profile=true`, the facilitator confirms the pivot moment still occurs and the fix is still measurable, with notes on where Sonnet behaviour diverges (so the facilitator can guide live).
  3. The facilitator runs Option B end-to-end against Opus 4.7 and reaches the 50–150 ms cached / 200–400 ms cold band, producing all three commits from `CON-expected-commit-shape` in the expected order.
  4. The pre-workshop email has been sent at least 1 week prior to participants, including the Docker prerequisite, the image pull command, and a 5-minute "did it pull and run?" smoke test. The image is tagged with semver and pushed to the registry.
  5. Each of the five failure-mode runbook entries in `reference/option-a-sample-run.md` has been validated against a reproducible trigger condition during pre-flight (or explicitly noted as "not triggered in this pre-flight, watch live").

**Plans**: TBD.

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tracer Slice — Workshop Motion End-to-End | 3/3 | Verifying | - |
| 2. Option A Complete Vertical | 0/0 | Not started | - |
| 3. Option B Trap #2 Narrative — Mapping & `_search?profile=true` | 0/0 | Not started | - |
| 4. Option B Trap #3 + Workshop Polish | 0/0 | Not started | - |
| 5. Dual-Model Pre-Flight Validation | 0/0 | Not started | - |
