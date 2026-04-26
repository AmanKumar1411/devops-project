#!/bin/bash
set -euo pipefail

echo "=== TEST STEP ==="

cd backend

go build -o backend-service .

./backend-service &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}

trap cleanup EXIT

sleep 3

echo "Backend running on port 3000"

curl -f http://localhost:3000/api/hello

echo "Backend test passed"

exit 0