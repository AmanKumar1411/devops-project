#!/bin/bash
set -euo pipefail

echo "=== DOCKER BUILD STEP ==="

docker build -t devops-backend:v1 ./backend
docker build -t devops-frontend:v1 ./frontend

echo "Docker images built successfully"