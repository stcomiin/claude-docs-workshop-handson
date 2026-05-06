from __future__ import annotations

from fastapi import FastAPI

from app.routes.dashboard import router as dashboard_router


app = FastAPI(title="FastAPI Perf Investigation Workshop")
app.include_router(dashboard_router)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
