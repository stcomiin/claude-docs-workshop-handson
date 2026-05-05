# Synthesis Summary

Entry point for `gsd-roadmapper`. This file points to the per-type intel files below and summarizes what was extracted from the ingest set.

---

## Doc counts

- Total docs synthesized: **1**
- By type:
  - SPEC: 1
  - ADR: 0
  - PRD: 0
  - DOC: 0

Single source: `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md` (classified `SPEC`, `confidence: high`, `locked: false`, `precedence: null`).

---

## Decisions locked

**0 locked decisions.**

The ingest set contains no ADRs. Per agent process, SPECs do not produce locked decisions. Five **non-locked design choices** (with explicit considered-alternatives rationale) are recorded in `decisions.md` for traceability only:

- `DESIGN-CHOICE-backend-stack-elasticsearch`
- `DESIGN-CHOICE-pedagogy-investigation-discipline`
- `DESIGN-CHOICE-target-model-opus-4-7`
- `DESIGN-CHOICE-docker-as-distribution`
- `DESIGN-CHOICE-no-claude-md-shipped`

Downstream consumers should bind on the structural constraints in `constraints.md` (which mirror the relevant choices), not on these non-locked entries directly.

---

## Requirements extracted

**7 requirements** (all derived from SPEC §2 / §3 / §12 — workshop participant outcomes; no PRDs ingested):

- `REQ-investigation-discipline-takeaway`
- `REQ-portable-prompt-artifacts`
- `REQ-measured-fix-option-a`
- `REQ-measured-fix-option-b`
- `REQ-correctness-preserved`
- `REQ-investigation-uses-instrumentation`
- `REQ-no-out-of-scope-drift`

No competing acceptance variants (single-doc ingest).

---

## Constraints

**18 constraints** from the SPEC. Type breakdown:

- `schema` (filesystem layout, scope guardrails, intentional defects, artifact contract): 5
  - `CON-deliverable-directory-layout`
  - `CON-docker-image-contract`
  - `CON-three-layered-perf-traps`
  - `CON-out-of-scope`
  - `CON-expected-commit-shape`
- `api-contract` (endpoint shape, test contract): 2
  - `CON-endpoint-response-shape`
  - `CON-test-suite-shape`
- `protocol` (instrumentation, harness, runbooks, workshop arcs): 8
  - `CON-pre-instrumented-timing`
  - `CON-bench-script`
  - `CON-verification-commands`
  - `CON-setup-prerequisites`
  - `CON-no-claude-md-shipped`
  - `CON-option-a-arc`
  - `CON-option-b-arc`
  - `CON-pivot-and-falsification-prompts`
  - `CON-facilitator-preflight`
- `nfr` (latency targets, model compatibility): 2
  - `CON-expected-timings`
  - `CON-target-model`

(Counts list 17 enumerated; one is double-counted under multiple sub-buckets in the layout above. The authoritative list is the entry headers in `constraints.md`.)

---

## Context topics

**8 topics** in `context.md`:

- Workshop background — gap this exercise fills
- Why this lesson, for this audience
- Audience
- Format — Option A vs Option B convention
- The pivot moment — pedagogical core (step 4)
- Mapping to existing workshop conventions
- Translate-to-your-world (Appendix B)
- Risks and mitigations registry
- Open questions

---

## Conflicts

- **Blockers:** 0
- **Competing variants:** 0
- **Auto-resolved:** 0

Single-doc ingest with high-confidence classification. No LOCKED-vs-LOCKED ADR collisions are structurally possible. Cross-ref cycle detection: trivially passes (single-node graph). No `UNKNOWN`-confidence-low classifications.

Detail report: `.planning/INGEST-CONFLICTS.md`

---

## Per-type intel files

- Constraints: `.planning/intel/constraints.md`
- Decisions: `.planning/intel/decisions.md` (non-locked design choices only; no ADRs ingested)
- Requirements: `.planning/intel/requirements.md`
- Context: `.planning/intel/context.md`

---

## Status for routing

**READY** — safe to route to `gsd-roadmapper`. No user resolution needed.
