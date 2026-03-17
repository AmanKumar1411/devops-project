#!/bin/bash
set -euo pipefail

echo "=== TEST STEP ==="

cd backend
node server.js &
SERVER_PID=$!

cleanup() {
	kill "$SERVER_PID" 2>/dev/null || true
}

trap cleanup EXIT

sleep 2
curl -f http://localhost:3000/api/hello

echo "Backend test passed"
