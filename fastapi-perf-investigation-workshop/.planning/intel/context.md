# Context

Background, audience, and conventions context derived from the SPEC. Each topic is keyed and attributed to the source.

---

## Topic: Workshop background — gap this exercise fills

- **Source:** `docs/superpowers/specs/2026-05-04-fastapi-perf-investigation-handson-design.md` §1

The existing handson portion of the workshop has three exercises:

1. **GSD existing-codebase exercise** — TS/React/Express OSINT dashboard, add a Test button.
2. **BMAD existing-codebase exercise** — same dashboard, BMAD workflow.
3. **Research and report generation** — parallel agents + document skills.

All three lean frontend (React UI changes) or document-output (Word/PDF/PPT/XLSX). None speak directly to backend developers or data scientists who want to know what agentic coding does for *their* day-to-day work.

This handson fills that gap with a backend-Python exercise built around the lesson the existing handsons don't exercise: **forcing the agent to prove its hypotheses with measurement before accepting them.**

---

## Topic: Why this lesson, for this audience

- **Source:** §3

Synthesized across leading agentic-coding writeups (Eric J. Ma's "How to do agentic data science", ClickHouse engineering blog, Armin Ronacher's agentic coding recommendations, AI Hero "Real Engineers" cohort, MIT Missing Semester 2026, iximiuz' production take):

- Investigation is where coding agents **shine most** — they skim logs faster than humans and propose plausible hypotheses quickly.
- Investigation is also where they **fail most consistently** — they produce many wrong-but-plausible hypotheses and will defend them under casual questioning.
- The discipline that closes the gap is "prove it with data." Backend devs and data scientists both work in domains where this discipline matters more than in pure UI work, because their work is judged by *measured outcomes* (latency, throughput, statistical correctness) rather than visible UI behavior.

The existing handsons teach **pattern-following** ("understand the codebase, follow conventions, stay in scope"). This one teaches **investigation discipline**. Together they cover the two halves of competent agentic coding.

---

## Topic: Audience

- **Source:** §4

- **Primary:** backend developers and data engineers in Elasticsearch-based stacks (search, observability, log analytics).
- **Secondary:** data scientists who query Elasticsearch via Kibana or Python clients.
- **Assumed knowledge:** basic familiarity with `curl`, `pip` / `uv`, virtualenvs, Docker (or willingness to install Docker Desktop), reading stack traces. Working knowledge of Elasticsearch query DSL helpful but not required — the workshop README provides a 1-page primer.
- **Not assumed:** prior FastAPI experience, prior performance-engineering background, or deep Elasticsearch internals knowledge (the perf gotchas in this exercise are the very things experienced devs miss).
- **Why ES specifically:** the audience's production stack uses Elasticsearch. Investigation discipline is exercised on the tools participants will face Monday morning, not on a stand-in. ES also has the convenient property that several of its perf gotchas (mapping-as-config, query-vs-filter context) are not visible from reading the request code — which makes the discipline actually do work, instead of being theatre on top of textbook antipatterns Claude already recognizes.

---

## Topic: Format — Option A vs Option B convention

- **Source:** §5

Two paths, both starting from the same setup:

- **Option A (~40-45 min)** — investigation discipline + one measured fix (the visible N+1 trap), with a Popper-style falsification step. Lands the core lesson.
- **Option B (~70-75 min)** — full perf-engineering loop including the two *invisible* traps (text-mapped agg, `query` vs `filter` context); participant ends with a measurably faster endpoint they can explain step by step *and* with two fixes they could not have found by code-reading alone.

This matches the Option A / Option B convention already used in the GSD and BMAD workshop READMEs.

---

## Topic: The pivot moment — pedagogical core (step 4)

- **Source:** §9.1

This is the **pedagogical core** of the exercise. Claude's first hypothesis without data may be:

- "Probably need a higher `refresh_interval` on the index"
- "FastAPI's overhead — switch to the async ES client"
- "ES is slow on 50k docs — bulk requests would help"
- "The aggregation needs `_source` filtering"

Any of those *might* help. Participants don't know which. The pivot prompt forces Claude to read the timing logs, find that `count_per_user` dominates the wall-clock initially, and propose the actually-correct fix (replace the per-user `_count` loop with a single `terms` aggregation). Fixing that doesn't make the endpoint fast — it just shifts the dominant cost to `compute_org_summary`, which contains the two invisible traps. *That's* where the investigation discipline does real work, because reading `dashboard.py` reveals neither.

The falsification step (step 5) hardens the discipline further: even after Claude has data, it must design a measurement that *would have shown the hypothesis wrong* and run it. This is Popper's actual scientific method — confirmation is cheap; surviving falsification is what makes a hypothesis load-bearing. Roughly half the time the first data-grounded hypothesis collapses under its own falsification test, which is exactly the lesson moment.

The lesson is portable: **don't accept the first plausible hypothesis. Force proof. Then try to disprove the proof.**

---

## Topic: Mapping to existing workshop conventions

- **Source:** Appendix A

| Convention | This handson |
|---|---|
| Top-level directory naming | `fastapi-perf-investigation-workshop/` (matches `one-shot-task-dashboard-bmad-workshop/`) |
| Option A / Option B time budget | 40-45 min / 70-75 min (matches BMAD's 30-40 min / longer) |
| `reference/option-a-sample-run.md` | Yes (matches BMAD) |
| Verification via tests + manual | Yes (`pytest` + `bench.sh` + manual smoke) |
| Existing-codebase pedagogy | Yes — endpoint exists, participant investigates and improves |
| Single bounded scope | Yes — one endpoint, no scope creep |
| Pre-built Docker image as workshop artifact | New — no precedent in existing BMAD/GSD/research-report exercises. Justified because the participants' production stack is ES, and Docker is the cleanest way to ship a pre-seeded, mapping-broken ES single-node cluster. |

---

## Topic: Translate-to-your-world (Appendix B)

- **Source:** Appendix B

The workshop tech (Elasticsearch + FastAPI) matches the participants' production stack. This appendix exists for the case where a participant *also* works with adjacent stacks and wants to carry the discipline across:

| Workshop primitive (ES) | Postgres / SQL | MongoDB | Spark / Trino / dbt |
|---|---|---|---|
| `bash tests/bench.sh` | `pgbench`, query timing, APM percentile widget | `mongostat`, query timing | `EXPLAIN`, Spark UI, dbt run timing |
| `_search?profile=true` + slow log | `EXPLAIN ANALYZE`, `auto_explain`, slow query log | `db.system.profile`, `explain("executionStats")` | Spark UI stage view, Trino query plan, dbt `--debug` |
| Named timer blocks (`with timer("phase"):`) | Sentry/Datadog/New Relic span names; pg span events | APM span names | Spark stage timing, dbt model timing |
| Mapping-as-config (text vs keyword bug) | DB indexes, column types, partial indexes | Index definitions, sparse indexes | Partition columns, file format, Z-order columns |
| `query` vs `filter` cache context | Materialized views, query-result caches, prepared-statement plans | hint(), index intersection | Result caching layers, broadcast hints, predicate pushdown |
| Pivot prompt (*"Prove that. Read the instrumentation."*) | Identical wording | Identical | Identical |
| Falsification prompt (*"Design a measurement that would falsify..."*) | Identical | Identical | Identical |

The two prompts are stack-agnostic. The instrumentation that fills them in differs by domain; the discipline does not.

The portable habit, restated for any audience:

> When an agent says "the bottleneck is X," ask it to (1) prove with the instrumentation your stack provides, (2) design a measurement that would *falsify* the hypothesis, and (3) only propose a fix after both. Instrumentation differs by stack. Discipline does not.

---

## Topic: Risks and mitigations registry

- **Source:** §13

| Risk | Mitigation |
|---|---|
| Hardware variance distorts numbers | Express improvements as relative ("got 6x faster"), not absolute |
| Claude solves the first trap (N+1) instantly from code-reading | Designed in: trap #1 is intentionally visible; the lesson on trap #1 is *practicing the discipline on a known answer*. Traps #2 and #3 are not visible from `dashboard.py`, so the discipline does real work in steps 9-11 of Option B. Falsification step in step 5 also stress-tests easy answers. |
| Opus 4.7 vs Sonnet 4.6 behavior split | Target model is Opus 4.7. Sonnet 4.6 is supported fallback but more likely to skip slow log / `?profile=true` and propose surface-level fixes — facilitator must validate the script against both at pre-flight |
| Docker not installed or Docker Desktop not running | Workshop README states Docker as prerequisite; participants pre-pull image before session; facilitator has fallback procedure |
| ES container OOM on low-memory laptops | Image ships with `ES_JAVA_OPTS=-Xms512m -Xmx512m` by default; setup notes warn 8GB-RAM participants |
| ES image pull bandwidth at venue | Pre-workshop instructions require pulling image at home; facilitator brings USB stick with `docker save` tarball as fallback |
| ES version drift (image rebuild needed) | Image tagged with semver (`v1.0.0`); `pyproject.toml` pins `elasticsearch-py`; image rebuild documented |
| Windows participants cannot run `bash bench.sh` | README requires Git Bash or WSL; Docker Desktop with WSL2 backend recommended |
| Three-terminal setup overwhelms small screens | Setup notes (Section 7.1) state the requirement up front; recommend tile windows or `tmux` / Windows Terminal panes |
| `uvicorn --reload` adds file-watcher noise or accidental restarts during benchmark comparisons | Setup notes recommend restarting without `--reload` for benchmark comparisons and treating the first post-restart iteration as warm-up |
| Port 9200 (ES) or 8765 (FastAPI) already in use | `docker-compose.yml` and `app/es.py` document remap; troubleshooting in `reference/option-a-sample-run.md` |
| `uv pip install -e .` PATH issues on Windows | Document `pip install -e .` fallback; verify `uv` is on PATH in setup notes |
| Participant copy-pastes Option A sample run | Same convention as existing BMAD/GSD handsons — sample run is troubleshooting, not the answer key |
| Claude gets stuck in a debugging spiral | Workshop README warns: if Claude has been wrong twice in a row, restart the session. Real production discipline. |
| Seed data small enough that ES caches everything and traps don't surface | Pre-flight tunes seed size and refresh behavior so traps #2 and #3 are observable on laptop-class hardware |
| FastAPI / `elasticsearch-py` version mismatches | `pyproject.toml` pins versions; image and client tested together; `uv` recommended in setup |
| Participant lacks Python 3.11+ | README states minimum version up front, with `uv python install` instructions |
| Participant has never written ES query DSL | README ships 1-page primer on `term`, `terms`, `range`, `bool/must/filter`, `aggs.terms`, `aggs.date_histogram` |
| Lesson stays "ES-specific" in non-ES participants' heads | Appendix B translates workshop primitives to Postgres / MongoDB / Spark equivalents |

---

## Topic: Open questions

- **Source:** §17

None remaining after self-review.
