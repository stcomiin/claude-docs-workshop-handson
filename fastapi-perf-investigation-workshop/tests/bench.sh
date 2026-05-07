#!/usr/bin/env bash
set -euo pipefail

for i in 1 2 3; do
  curl -s -w "Response time: %{time_total}s\n" -o /dev/null http://localhost:8765/dashboard/summary
done
