# Option A sample run

This is a facilitator answer key for the Option A path. It should help keep
participants on the measured N+1 fix without revealing the longer-path fixes.

## Expected starting state

The participant starts from the as-shipped endpoint, a seeded local
Elasticsearch container, and three visible timer names in the uvicorn console:

- `load_top_users`
- `count_per_user`
- `compute_org_summary`

The first `bash tests/bench.sh` run should usually land in the 5-10 s band. The
endpoint is correct but slow.

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

The expected outcome is a measurable improvement from the 5-10 s starting band
to the 3-6 s post-fix band. Remaining slowness is expected after Option A and
should not be fixed in this path.

## Facilitator intervention points

- If Claude proposes a fix before quoting timer data, use the pivot prompt.
- If Claude cannot find the timer logs, point it to the uvicorn terminal.
- If Claude confirms the hypothesis but does not try to disprove it, use the
  falsification prompt.
- If Claude tries to fix more than the dominant bottleneck, bring it back to the
  expected commit.
- If the final benchmark improves but is still not fully fast, stop the path and
  preserve the remaining investigation for the longer workshop option.
