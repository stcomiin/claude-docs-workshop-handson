# FastAPI Perf Investigation Workshop

This is the Option A path: a 40-45 minute performance investigation exercise
that teaches measured debugging, falsification, and one narrow fix for the
visible N+1 count loop.

The Elasticsearch container disables security for a single-node localhost
workshop runtime. Do not treat that setting as production guidance.

## Setup Prerequisites

- Docker Desktop or Docker Engine.
- Python 3.11+.
- Three terminals:
  - FastAPI / uvicorn logs.
  - Claude session in this directory.
  - Benchmark, curl, and verification commands.
- Windows participants need Git Bash or WSL for `bash` and `curl`.
- Elasticsearch uses port 9200.
- FastAPI uses port 8765.

Use `uvicorn app.main:app --port 8765 --reload` only for the first sanity check.
For benchmark comparisons after a fix, stop uvicorn and restart it without
`--reload`; the reloader's file watcher and accidental mid-bench restarts add
noise. Treat the first benchmark iteration after any restart as warm-up.

## Start The Runtime

From this directory:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

Install Python dependencies:

```bash
uv pip install -e .
```

Fallback:

```bash
python -m pip install -e .
```

Start FastAPI:

```bash
uvicorn app.main:app --port 8765 --reload
```

Sanity check the endpoint:

```bash
curl http://localhost:8765/dashboard/summary
```

Run the latency harness:

```bash
bash tests/bench.sh
```

Run the correctness and code gates:

```bash
pytest
ruff check app
mypy app
```

## Expected Timing

The pass condition is **relative improvement with timer evidence**, not an
absolute number on every laptop. Elasticsearch timings vary with CPU, Docker
resources, heap warm-up, OS file cache, and request-cache state.

On the calibration target, the starting runtime usually shows a 5-10 s
baseline and the post-Option-A-fix runtime usually lands around 3-6 s. On
faster machines, both numbers may be lower. That is fine if:

- `count_per_user` dominates the starting timer output.
- The one narrow Option A fix makes `count_per_user` fall substantially.
- `pytest`, `ruff`, and `mypy` stay green.

Stop after the Option A fix even if your machine makes the endpoint look fully
fast. Longer workshop paths use deeper instrumentation; do not chase them in
this exercise.

## Pivot Prompt

Prove that hypothesis with data. Run `bash tests/bench.sh`, then read the timing log output from the uvicorn console. Tell me which named timer block dominates the wall-clock time, and quote the numbers verbatim. Only after you have the numbers, propose the fix.

## Falsification Prompt

Now design a measurement whose result would *falsify* this hypothesis -- not confirm it. If you think `<phase X>` dominates, what would you expect to see if it actually didn't? Run that measurement and report what you find. Only proceed to a fix if the falsification attempt fails.

## Option A: 8-step investigation arc

1. Start Docker, install dependencies, start uvicorn, call the endpoint with
   curl, and confirm it is slow.
2. Run `bash tests/bench.sh`. Observe the baseline on your machine and read the
   timing log output in the uvicorn console.
3. In a fresh Claude session with this directory as the working directory, ask:
   `This endpoint at /dashboard/summary is slow. Where is the time going?`
4. Use the pivot prompt above. Claude must read the actual timer output, name
   the dominant timer block, and quote the numbers before proposing a fix.
5. Use the falsification prompt above. Claude must describe what result would
   disprove the hypothesis, run the measurement, and report the result.
6. If the existing timer blocks are not granular enough, have Claude add
   finer-grained timers inside the worst phase and re-run the benchmark.
7. Implement a fix for the top bottleneck only. Run `pytest`, restart uvicorn
   without `--reload`, and run `bash tests/bench.sh`. Compare warmed runs; the
   benchmark should improve substantially and `count_per_user` should no
   longer dominate.
8. Wrap up with the final measurement, the next fix Claude would investigate,
   and a short explanation of why the measured workflow changed the decision.

The expected participant commit is:

```text
fix: replace per-user _count loop with single terms aggregation
```

## Scope Guardrails

Option A stops after the single measured N+1 fix. Do not add async/await
refactoring, authentication, frontend work, production deployment steps,
Elasticsearch cluster operations, reindex strategy drills, vector search, ML
features, or ESQL.

Facilitators can use `reference/option-a-sample-run.md` when a session needs
troubleshooting support.
