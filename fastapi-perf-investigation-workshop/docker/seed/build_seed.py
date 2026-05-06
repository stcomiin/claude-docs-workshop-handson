from __future__ import annotations

import argparse
import json
import random
from datetime import UTC, datetime, timedelta
from pathlib import Path


DEFAULT_COUNT = 50000
USER_COUNT = 1000
ORG_COUNT = 8
ACTIVITY_TYPES = ("search", "export", "login", "dashboard_view", "alert_ack")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build deterministic ES seed NDJSON.")
    parser.add_argument("--output", default="documents.ndjson", help="Output NDJSON path")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT, help="Document count")
    return parser.parse_args()


def iter_documents(count: int):
    rng = random.Random(20260506)
    base = datetime(2026, 5, 6, tzinfo=UTC)

    for i in range(count):
        user_num = (i % USER_COUNT) + 1
        org_num = (i % ORG_COUNT) + 1
        activity_id = f"act_{i + 1:05d}"
        created_at = base - timedelta(
            days=rng.randrange(0, 60),
            hours=rng.randrange(0, 24),
            minutes=rng.randrange(0, 60),
            seconds=rng.randrange(0, 60),
        )

        yield {
            "activity_id": activity_id,
            "user_id": f"u_{user_num:04d}",
            "username": f"user_{user_num:04d}",
            "org_id": f"org_{org_num:02d}",
            "activity_type": ACTIVITY_TYPES[i % len(ACTIVITY_TYPES)],
            "created_at": created_at.isoformat().replace("+00:00", "Z"),
            "duration_ms": rng.randrange(20, 2500),
            "value": round(rng.uniform(1.0, 1000.0), 2),
        }


def write_bulk_ndjson(output: Path, count: int) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        for doc in iter_documents(count):
            action = {"index": {"_index": "activities", "_id": doc["activity_id"]}}
            f.write(json.dumps(action, separators=(",", ":")) + "\n")
            f.write(json.dumps(doc, separators=(",", ":")) + "\n")


def main() -> None:
    args = parse_args()
    if args.count <= 0:
        raise SystemExit("--count must be positive")
    write_bulk_ndjson(Path(args.output), args.count)


if __name__ == "__main__":
    main()
