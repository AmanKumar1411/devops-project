#!/bin/bash
set -euo pipefail

echo "=== BUILD STEP ==="

cd backend
go mod tidy
go build ./...

echo "Backend build completed"
