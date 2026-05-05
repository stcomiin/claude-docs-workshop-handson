# Decisions

No ADRs were ingested. SPECs do not produce locked decisions; they produce constraints (see `constraints.md`). Per agent process: "If the SPEC discusses considered alternatives with a chosen path, capture as constraints, not locked decisions."

The following entries are **non-locked design choices** the SPEC explicitly justifies via considered-alternatives analysis. They are recorded here for traceability but they are NOT locked — a future ADR may revise them. Where a downstream consumer needs to bind on them, treat them as constraints (already mirrored in `constraints.md` where structurally relevant).

---

## DESIGN-CHOICE-backend-stack-elasticsearch

- **Source:** `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md` §6, §4
- **Status:** Proposed (SPEC, not locked)
- **Scope:** Database/datastore for the workshop exercise
- **Choice:** Elasticsearch (single-node, Docker-distributed)
- **Rationale (from SPEC):** Matches the audience's production stack (search, observability, log analytics). ES perf gotchas (mapping-as-config, `query` vs `filter` context) resist code-reading shortcuts — both factors strengthen the lesson.
- **Considered alternatives rejected:**
  - **SQLite + pandas-as-database traps** — lesson would survive but mismatch participants' production stack; SQLite traps are textbook patterns Claude Opus 4.7 recognizes from training data on first read, defeating the "force the agent to prove with data" lesson.
  - **OIDC on FastAPI endpoints** — pure backend security; excludes data scientists; mostly copy-from-docs work; setup pain (external IdP).
  - **Notebook → tested production module (Marimo)** — mechanical refactoring; agents finish too quickly; less unique investigation lesson; deferred as Option B candidate.
  - **Python collector with parallel agents** — echoes existing TS dashboard exercise; teaches pattern-following, already covered.
- **Note:** No ADR locks this. If a future ADR ratifies "Elasticsearch as workshop datastore," this choice gets promoted to a locked decision. Until then, downstream plans bind on `CON-three-layered-perf-traps` (which encodes the ES-specific traps) rather than this choice abstractly.

---

## DESIGN-CHOICE-pedagogy-investigation-discipline

- **Source:** §2, §3, §12
- **Status:** Proposed (SPEC, not locked)
- **Scope:** What the workshop teaches
- **Choice:** Investigation discipline ("force the agent to prove its hypotheses with measurement before accepting them") via a deliberately slow endpoint with three layered perf traps.
- **Rationale (from SPEC):** Existing handsons teach pattern-following ("understand the codebase, follow conventions, stay in scope"). This handson teaches investigation discipline. Together they cover the two halves of competent agentic coding.
- **Note:** Not locked. The portable artifacts (pivot + falsification prompts) are intentionally stack-agnostic — see `CON-pivot-and-falsification-prompts` and Appendix B in the source SPEC.

---

## DESIGN-CHOICE-target-model-opus-4-7

- **Source:** §7.1, §13, §14
- **Status:** Proposed (SPEC, not locked)
- **Scope:** Workshop's primary supported Claude model
- **Choice:** Opus 4.7 is the design target; Sonnet 4.6 is a supported fallback.
- **Rationale (from SPEC):** Sonnet 4.6 is more likely to skip slow log / `?profile=true` and propose surface-level fixes — the workshop's pivot moment is sharper on Opus 4.7. Facilitator must validate the script against both at pre-flight.
- **Note:** This binds the facilitator pre-flight (see `CON-facilitator-preflight`); it's not a locked architectural decision.

---

## DESIGN-CHOICE-docker-as-distribution

- **Source:** §7, §14, Appendix A
- **Status:** Proposed (SPEC, not locked)
- **Scope:** Workshop artifact distribution mechanism
- **Choice:** Pre-built Docker image as the primary distribution artifact (alternative: `docker save` tarball for bandwidth-constrained venues).
- **Rationale (from SPEC):** The participants' production stack is ES, and Docker is the cleanest way to ship a pre-seeded, mapping-broken ES single-node cluster. Per Appendix A: "New — no precedent in existing BMAD/GSD/research-report exercises. Justified because..."
- **Note:** Not locked. If future workshops standardize on a different distribution mechanism (e.g., dev containers, cloud-hosted), this gets revisited.

---

## DESIGN-CHOICE-no-claude-md-shipped

- **Source:** §14
- **Status:** Proposed (SPEC, not locked)
- **Scope:** Workshop repo contents
- **Choice:** No `CLAUDE.md` / `AGENTS.md` is shipped with the workshop.
- **Rationale (from SPEC):** Part of the lesson is that the agent must discover the structure on its own. Adding context files would short-circuit the investigation.
- **Note:** Captured as `CON-no-claude-md-shipped` in constraints.md as well — it is structural for downstream plans.
