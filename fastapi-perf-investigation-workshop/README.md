# FastAPI Perf Investigation Workshop

This is the Option A path plus the Option B trap #2 continuation: a
performance investigation exercise that teaches measured debugging,
falsification, and narrow Elasticsearch fixes proven by instrumentation.

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

## Option B: steps 9-10

Continue here only after finishing Option A and creating this first participant
commit:

```text
fix: replace per-user _count loop with single terms aggregation
```

9. Restart uvicorn without `--reload`, run `bash tests/bench.sh`, and read the
   uvicorn timer output again. The top-level bottleneck should have shifted
   away from `count_per_user`; `compute_org_summary` is now the dominant
   remaining cost. Do not accept a code-reading guess. Claude must prove the
   next hypothesis with the Elasticsearch Profile API or the Elasticsearch slow
   log before proposing a fix.

   To profile the same aggregation shape that `compute_org_summary` runs:

   ```bash
   curl -s -X POST 'http://localhost:9200/activities/_search?pretty' \
     -H 'Content-Type: application/json' \
     -d '{
       "profile": true,
       "size": 0,
       "track_total_hits": true,
       "query": {
         "bool": {
           "must": [
             {"range": {"created_at": {"gte": "now-30d", "lt": "now"}}}
           ]
         }
       },
       "aggs": {
         "unique_users": {"cardinality": {"field": "user_id"}},
         "username_distribution": {"terms": {"field": "username", "size": 10}}
       }
     }'
   ```

   Slow log alternative for the local workshop container:

   ```bash
   curl -s -X PUT 'http://localhost:9200/activities/_settings' \
     -H 'Content-Type: application/json' \
     -d '{
       "index.search.slowlog.threshold.query.trace": "0ms",
       "index.search.slowlog.threshold.fetch.trace": "0ms"
     }'

   bash tests/bench.sh
   docker compose -f docker/docker-compose.yml logs es | grep 'index.search.slowlog'

   curl -s -X PUT 'http://localhost:9200/activities/_settings' \
     -H 'Content-Type: application/json' \
     -d '{
       "index.search.slowlog.threshold.query.trace": "-1",
       "index.search.slowlog.threshold.fetch.trace": "-1"
     }'
   ```

   The `0ms` slow-log threshold records every matching local search. Use it only
   while troubleshooting this localhost workshop, then reset it to `"-1"`.

10. Inspect the mapping that made the profiled aggregation slow:

    ```bash
    curl -s 'http://localhost:9200/activities/_mapping?filter_path=*.mappings.properties.username' \
      | python -m json.tool
    ```

    Expected evidence:

    ```json
    "username": {
      "type": "text",
      "fielddata": true,
      "fields": {
        "keyword": {"type": "keyword"}
      }
    }
    ```

    The aggregation currently targets parent `username`, which loads fielddata
    for a text field. Change only the `username_distribution` aggregation field
    in `app/routes/dashboard.py` from `username` to `username.keyword`. No re-index needed: the `username.keyword` subfield already exists in the
    seeded multi-field mapping.

    Run:

    ```bash
    pytest -m "not starting_state"
    ruff check app
    mypy app
    ```

    The `starting_state` tests intentionally protect the workshop's pre-fix
    trap shape. Exclude them only after you have made the participant fix on
    your branch.

    Restart uvicorn without `--reload`, then run `bash tests/bench.sh` again.
    The calibration target after fix #2 is `200-500 ms`; local pass/fail is
    relative improvement plus timer/profile evidence.

    The expected second participant commit is:

    ```text
    fix: aggregate on username.keyword to avoid fielddata on text field
    ```

The third trap remains after step 10. Runs 2 and 3 of `bash tests/bench.sh`
should not show stable request-cache hits yet. Stop here; diagnosing the
remaining cache behavior belongs to the next Option B step.

## Scope Guardrails

Option A stops after the single measured N+1 fix. Option B steps 9-10 stop
after the `username.keyword` aggregation fix. Do not add async/await
refactoring, authentication, frontend work, production deployment steps,
Elasticsearch cluster operations, reindex strategy drills, vector search, ML
features, ESQL, or the later cache fix.

Facilitators can use `reference/option-a-sample-run.md` when a session needs
troubleshooting support.
