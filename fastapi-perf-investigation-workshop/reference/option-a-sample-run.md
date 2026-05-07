# Option A sample run

This is a facilitator answer key for the Option A path. It should help keep
participants on the measured N+1 fix without revealing the longer-path fixes.

## Expected starting state

The participant starts from the as-shipped endpoint, a seeded local
Elasticsearch container, and three visible timer names in the uvicorn console:

- `load_top_users`
- `count_per_user`
- `compute_org_summary`

The first `bash tests/bench.sh` run should make the endpoint feel slow and
should show `count_per_user` dominating the uvicorn timer output. On the
calibration target this usually lands in the 5-10 s band, but absolute timings
vary with Docker resources, CPU, ES heap state, OS file cache, and request
cache state. Relative improvement is the binding measure.

## Step-by-step Option A path

1. Start Docker with `docker compose -f docker/docker-compose.yml up -d --build`.
2. Install dependencies with `uv pip install -e .` or `python -m pip install -e .`.
3. Start FastAPI with `uvicorn app.main:app --port 8765 --reload`.
4. Confirm the endpoint responds with `curl http://localhost:8765/dashboard/summary`.
5. Run `bash tests/bench.sh` and read the uvicorn timer output.
6. Ask Claude: `This endpoint at /dashboard/summary is slow. Where is the time going?`
7. Use the README pivot prompt until Claude quotes timer data.
8. Use the README falsification prompt before any code change.
9. Implement only the top-bottleneck fix.
10. Run post-fix checks and manually restart uvicorn before the final benchmark.

## Step 3 not solved in one shot

Step 3 commonly produces a plausible hypothesis without quoted timer data.
Claude may suggest framework overhead, general Elasticsearch tuning, source
filtering, batching, or changing the client shape before it has read the logs.

The facilitator should keep the session at the pivot step until Claude quotes
`load_top_users`, `count_per_user`, and `compute_org_summary` timings and
identifies `count_per_user` as dominant. Guesses are not enough, even if the
guess later turns out to be correct.

## Expected Opus 4.7 behavior

Opus 4.7 should usually follow the pivot prompt, run `bash tests/bench.sh`, ask
the participant to inspect or paste the uvicorn timer output if needed, and
update its hypothesis from the measured numbers. The expected data-grounded
diagnosis is that the per-user count loop dominates the initial wall-clock
time.

For falsification, it should describe what would disprove the N+1 hypothesis
before the fix. A good falsification attempt would predict that if the per-user
counts are not the cause, the `count_per_user` timer would not dominate the
request or would not fall substantially after replacing the repeated counts
with one aggregate request.

## Where Sonnet 4.6 may diverge

Sonnet 4.6 may stop at a plausible code-reading diagnosis, skip the uvicorn
timer output, or propose broader rewrites. When that happens, use the pivot
prompt again and require quoted timer numbers before accepting the diagnosis.

It may also treat the falsification prompt as a restatement of confirmation.
Hold the line on the wording: the measurement must state what result would make
the hypothesis wrong.

## Expected Option A commit

The participant should make one narrow commit:

```text
fix: replace per-user _count loop with single terms aggregation
```

The fix target is the repeated per-user count work. Do not let the session
expand into broader Elasticsearch tuning, framework rewrites, or hidden
remaining costs.

## Post-fix checks

Run:

```bash
pytest
ruff check app
mypy app
```

Then stop uvicorn, start it again, and run:

```bash
bash tests/bench.sh
```

The expected outcome is a measurable improvement from the starting baseline,
with `count_per_user` falling substantially after the narrow fix. On the
calibration target this usually looks like 5-10 s before the fix and 3-6 s
after it. On faster machines, both numbers may be lower; a local UAT rerun on
2026-05-07 measured roughly 1.6-3.2 s before the fix and 85-114 ms after it.

That faster result still lands the Option A lesson if Claude used the timer
data, made exactly the expected commit, and kept the verification gates green.
Stop there even if the endpoint looks fully fast locally; longer workshop paths
use deeper instrumentation and must not be taught during Option A.

## Facilitator intervention points

- If Claude proposes a fix before quoting timer data, use the pivot prompt.
- If Claude cannot find the timer logs, point it to the uvicorn terminal.
- If Claude confirms the hypothesis but does not try to disprove it, use the
  falsification prompt.
- If Claude tries to fix more than the dominant bottleneck, bring it back to the
  expected commit.
- If the final benchmark improves but is still not fully fast, stop the path and
  preserve the remaining investigation for the longer workshop option.
- If the final benchmark improves so much that the endpoint looks fully fast on
  the local machine, still stop the path. Treat the absolute bands as
  calibration examples and preserve deeper investigation for the longer option.

## Option B steps 9-10

This extension starts after the participant has already made the expected
Option A commit:

```text
fix: replace per-user _count loop with single terms aggregation
```

### Expected trap #2 investigation path

The participant re-runs `bash tests/bench.sh`, reads the uvicorn timer output,
and sees the dominant remaining cost shift to `compute_org_summary`. Claude
must use the Elasticsearch Profile API or the Elasticsearch slow log before the
facilitator accepts the diagnosis.

The expected path is:

1. Profile API or slow-log evidence points to the `username_distribution`
   aggregation on `username`.
2. Mapping inspection shows `username` is `text` with `fielddata: true`.
3. The same mapping exposes an existing `username.keyword` subfield.
4. Claude changes only the aggregation field from `username` to
   `username.keyword`.
5. The participant re-runs `pytest`, `ruff check app`, `mypy app`, restarts
   uvicorn without `--reload`, and re-runs `bash tests/bench.sh`.

No re-index is needed because the keyword subfield already exists in the seeded
multi-field mapping.

### Profile or slow-log evidence

The profile path should use the same logical query as `compute_org_summary`,
with `POST /activities/_search?pretty` and `"profile": true` in the request
body. The slow-log path should set `index.search.slowlog.threshold.query.trace`
and `index.search.slowlog.threshold.fetch.trace` to `0ms`, run the bench
script, inspect `docker compose -f docker/docker-compose.yml logs es`, and
reset both thresholds to `-1`.

The facilitator should require quoted profile or slow-log evidence before
accepting any proposed fix. Code-reading alone is not enough for trap #2.

### Mapping inspection

The expected mapping evidence is:

```json
"username": {
  "type": "text",
  "fielddata": true,
  "fields": {
    "keyword": {"type": "keyword"}
  }
}
```

The important connection is that the aggregation on parent `username` loads
fielddata, while `username.keyword` is already available for the exact-value
terms aggregation.

### Expected Option B commit 2

The participant should make one narrow second commit:

```text
fix: aggregate on username.keyword to avoid fielddata on text field
```

The change target is the `username_distribution` aggregation field in
`app/routes/dashboard.py`. Keep the participant to the single aggregation-field change. Do not allow broad Elasticsearch tuning, framework
rewrites, async/await refactoring, sharding work, auth, frontend work, reindex
drills, vector search, ML, ESQL, or production deployment changes.

### Post-fix-2 checks

Run:

```bash
pytest -m "not starting_state"
ruff check app
mypy app
```

The `starting_state` tests intentionally protect the workshop's pre-fix trap
shape. Exclude them only after the participant has made commit 2 on their
branch.

Then stop uvicorn, start it again without `--reload`, and run:

```bash
bash tests/bench.sh
```

The calibration target after fix #2 is `200-500 ms`. Absolute timings vary by
machine; require relative improvement plus instrumentation evidence.

### Where models may diverge

Opus 4.7 should usually follow the profile or slow-log prompt, connect the
measured evidence to mapping inspection, and propose the keyword aggregation
fix. Sonnet 4.6 may stop at code-reading, propose broad ES tuning, or skip the
slow log/profile step. When that happens, keep the session on the evidence
gate until Claude produces quoted profile or slow-log evidence and explains how
the mapping proves the cause.

### Trap #3 remains

After commit 2, stop even if the endpoint still has visible remaining drag.
Runs 2 and 3 of `bash tests/bench.sh` still should not show stable
request-cache hits. That remaining issue is intentionally left for the later
Option B step and should be diagnosed by noticing repeated runs are not cached.

## Option B steps 11-12

This extension starts after the participant has already made the expected
second Option B commit:

```text
fix: aggregate on username.keyword to avoid fielddata on text field
```

### Expected trap #3 investigation path

The participant re-runs `bash tests/bench.sh` several times after commit 2 and
notices that the endpoint is much faster than the starting point, but repeated
runs do not settle into stable request-cache hits. Claude must connect that
remaining drag to the shape of the Elasticsearch query, not to a new framework
or infrastructure rewrite.

The accepted diagnosis is two-part:

1. The 30-day range lives in `bool.must`, so it runs in query context rather
   than filter context.
2. The range uses unrounded date math, `now-30d` to `now`, so repeated
   requests keep producing a moving range key.

Either half alone is insufficient. Moving the range to `bool.filter` without
rounding still leaves a moving time boundary, and rounding the range while
leaving it in `bool.must` still does not express the range as cache-friendly
filter context.

### Cache evidence

The facilitator should require quoted cache evidence before accepting the
diagnosis. Good evidence includes repeated request timings plus one of these
local Elasticsearch signals:

- Search profile or slow-log output showing the same `compute_org_summary`
  range query continuing to execute after commit 2.
- Request-cache stats before and after repeated identical dashboard requests
  showing misses or no useful hit growth.
- A controlled check where the same query body with a rounded filter range
  produces stable cached behavior.

The exact date range in the fix should be `now-30d/d` to `now/d`.

### Expected Option B commit 3

The participant should make one narrow third commit:

```text
fix: move date range to filter context, round now to day for cache hit
```

The code change target is the `created_at` range inside
`compute_org_summary`. Move the range from `bool.must` to `bool.filter` and
round the date math from `now-30d` / `now` to `now-30d/d` / `now/d`.

### Post-fix-3 checks

Run:

```bash
pytest -m "not starting_state"
ruff check app
mypy app
```

Then stop uvicorn, start it again without `--reload`, and run:

```bash
bash tests/bench.sh
bash tests/bench.sh
bash tests/bench.sh
```

The calibration target after fix #3 is `50-150 ms cached / 200-400 ms cold`.
Absolute timings vary by machine, but the important result is a visible
cold-vs-cached split after the two-part cache fix.

### Where models may diverge

Claude may keep reading Python code after commit 2 because the remaining issue
is easy to mistake for application overhead. Keep the session on repeated-run
evidence and Elasticsearch cache behavior until the model explains both the
query-context problem and the moving `now` range key.

Opus 4.7 should usually follow the cache-evidence prompt, inspect repeated
request behavior, and identify the paired `bool.filter` plus rounded-date
change. Sonnet 4.6 may over-focus on code-reading, async/await, sharding,
general cache tuning, or broad Elasticsearch advice. Do not accept the trap #3
diagnosis until the model provides quoted cache evidence and explains why the
two-part fix is necessary.

Reject async/await rewrites, sharding work, auth changes, frontend changes,
reindex drills, vector search, ML, ESQL, and broad rewrites during this step.
The only accepted code change is the cache-friendly range query.

### Completed dashboard.py comment example

After the participant finishes the full Option B path, the non-spoiler comment
template at the top of `app/routes/dashboard.py` can be filled in like this:

```python
# Final Option B notes (fill in after completing the exercise):
# - Fix 1 before/after evidence:
#   fix: replace per-user _count loop with single terms aggregation
# - Fix 2 before/after evidence:
#   fix: aggregate on username.keyword to avoid fielddata on text field
# - Fix 3 before/after evidence:
#   fix: move date range to filter context, round now to day for cache hit
```

Keep the filled example out of the shipped starting branch. It belongs in the
facilitator reference or in a participant's completed branch after the measured
work is done.
