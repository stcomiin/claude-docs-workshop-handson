# Phase 1 tracer reference

This facilitator reference covers the tracer slice only. It is not the full Option A answer key.

## Expected Starting Commands

```bash
docker compose -f docker/docker-compose.yml up -d --build
uv pip install -e .
uvicorn app.main:app --port 8765 --reload
curl http://localhost:8765/dashboard/summary
bash tests/bench.sh
```

## Expected Timer Names

The uvicorn console should emit these three names for each dashboard request:

- `load_top_users`
- `count_per_user`
- `compute_org_summary`

Before the tracer fix, `count_per_user` is expected to be the dominant block because it performs one count request per top user.

## Expected Verification Commands

```bash
pytest
ruff check app
mypy app
bash tests/bench.sh
```

## Facilitator Notes

- Keep the session focused on the visible N+1 count loop.
- Use the README pivot prompt if Claude proposes a fix before quoting timer data.
- After applying the N+1 fix, manually restart uvicorn before re-running the bench harness.
- Stop the walkthrough after the tracer fix and verification gates.

## Future phases

Option A/B sample-run details and the five failure-mode runbook entries are completed in later phases.
