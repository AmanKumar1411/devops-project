#!/bin/bash
set -e

echo "=== TEST STEP ==="

cd backend
node server.js &
SERVER_PID=$!

sleep 2
curl -f http://localhost:3000/api/hello

kill $SERVER_PID
echo "Backend test passed"
