"""
seed_items.py

Seed sample items into the running FastAPI stack so the items list has
something interesting to look at and the categories filter (once you build
it) has data to play with.

Usage (from your fastapi-template clone, with the stack up):
    python seed_items.py

Credentials are read from env vars (or the defaults below, which match the
template's shipped .env):
    FIRST_SUPERUSER          (default: admin@example.com)
    FIRST_SUPERUSER_PASSWORD (default: password)
    WORKSHOP_API             (default: http://localhost:8000/api/v1)

Idempotent: skips items whose title already exists.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = os.environ.get("WORKSHOP_API", "http://localhost:8000/api/v1")
EMAIL = os.environ.get("FIRST_SUPERUSER", "admin@example.com")
PASSWORD = os.environ.get("FIRST_SUPERUSER_PASSWORD", "password")

ITEMS = [
    {"title": "Buy groceries", "description": "Milk, bread, eggs"},
    {
        "title": "Read book",
        "description": "Finish Designing Data-Intensive Applications",
    },
    {"title": "Schedule dentist", "description": "Annual checkup"},
    {"title": "Pay rent", "description": "Due on the 1st"},
    {"title": "Plan trip", "description": "Tokyo in September"},
    {"title": "Renew passport", "description": "Expires in 6 months"},
    {"title": "Buy birthday gift", "description": "Mom's birthday next week"},
    {"title": "Fix kitchen tap", "description": "Leaking under the sink"},
    {"title": "Email accountant", "description": "Send last year's receipts"},
    {"title": "Reply to recruiter", "description": "Coffee chat about the role"},
    {"title": "Watch documentary", "description": "Saved on Netflix"},
    {"title": "Write blog post", "description": "Reflections on Q1"},
    {"title": "Order printer ink", "description": "Black and colour"},
    {"title": "Cancel gym", "description": "Switching to home workouts"},
    {"title": "Backup laptop", "description": "External drive plus cloud"},
]


def _send(req: urllib.request.Request) -> dict:
    """Send `req`, return parsed JSON (empty dict if body is empty)."""
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read()
    return json.loads(body) if body else {}


def login() -> str:
    form = urllib.parse.urlencode({"username": EMAIL, "password": PASSWORD}).encode(
        "utf-8"
    )
    req = urllib.request.Request(
        f"{API}/login/access-token",
        data=form,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    return _send(req)["access_token"]


def existing_titles(token: str) -> set[str]:
    qs = urllib.parse.urlencode({"skip": 0, "limit": 1000})
    req = urllib.request.Request(
        f"{API}/items/?{qs}",
        method="GET",
        headers={"Authorization": f"Bearer {token}"},
    )
    payload = _send(req)
    return {item["title"] for item in payload.get("data", [])}


def create_item(token: str, item: dict) -> None:
    body = json.dumps(item).encode("utf-8")
    req = urllib.request.Request(
        f"{API}/items/",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    _send(req)


def main() -> int:
    try:
        token = login()
    except urllib.error.URLError as e:
        print(f"Login failed: {e}", file=sys.stderr)
        print(
            f"Check that the stack is running at {API} and that "
            "FIRST_SUPERUSER/FIRST_SUPERUSER_PASSWORD match your .env.",
            file=sys.stderr,
        )
        return 1

    existing = existing_titles(token)
    created = skipped = 0
    for item in ITEMS:
        if item["title"] in existing:
            skipped += 1
            continue
        create_item(token, item)
        created += 1

    print(f"Seeded {created} item(s); skipped {skipped} that already existed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
