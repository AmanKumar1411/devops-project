# DevOps Project

## Overview

This repository contains:

- Backend: Go HTTP API (`backend/main.go`)
- Frontend: static HTML/CSS/JS app (`frontend/`)
- Infrastructure as Code: Terraform (`terraform/`)
- CI/CD automation: GitHub Actions (`.github/workflows/`)

## Service Endpoints

The backend currently exposes:

- `/api/hello`
- `/api/health`
- `/api/time`
- `/api/products`
- `/api/echo`

## Workflow Files

### 1) CI Quality Gate

File: `.github/workflows/ci.yml`

Purpose:

- Run lint and format checks
- Run backend unit tests
- Run Playwright E2E tests
- Run security scan job (Trivy)

### 2) Release Build And Deploy (Legacy EC2 flow)

File: `.github/workflows/release.yml`

Purpose:

- Build and push backend/frontend images to ECR
- Deploy by SSH to an EC2 host

Note: This workflow is kept for backward compatibility.

### 3) ECS Deploy Pipeline (New)

File: `.github/workflows/ecs-deploy.yml`

Purpose:

- Run tests and upload test reports
- Run Terraform init/validate/plan/apply
- Build and push Docker images to ECR
- Force ECS service rollout and verify stability

Execution order in this workflow:

1. `tests`
2. `terraform_apply`
3. `build_and_push`
4. `deploy_to_ecs`

## Required GitHub Secrets

Configure these in repository settings:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (recommended for temporary credentials)
- `AWS_REGION`

Additional secrets are required by the legacy EC2 release workflow (`release.yml`):

- `EC2_SSH_KEY`
- `EC2_USER`
- `EC2_PUBLIC_IP`
- `AWS_ACCOUNT_ID`

## Terraform Notes

Main infra is defined in:

- `terraform/main.tf`
- `terraform/provider.tf`

Current Terraform resources include:

- S3 bucket with versioning, encryption, and public access block
- ECR repository
- ECS cluster, task definitions, and services
- CloudWatch log group
- IAM execution role and attachment

### About `variables.tf` and `outputs.tf`

Both files can be empty without breaking Terraform. They are optional.

- Keep `variables.tf` when you want configurable inputs (region, names, subnet IDs, image URIs).
- Keep `outputs.tf` when you want useful values printed after apply (bucket name, ECS cluster name, service ARNs).

If you are not using variables/outputs yet, empty files are not required and can be deleted safely.

## Local Development

### Prerequisites

- Go 1.22+
- Node.js 20+
- npm

### Useful Commands

Install root dependencies:

```bash
npm install
```

Run backend locally:

```bash
go run ./backend
```

Run backend tests:

```bash
cd backend && go test ./...
```

Run frontend lint:

```bash
npm run lint:frontend
```

Run formatting checks:

```bash
npm run format:check
```

Run E2E tests:

```bash
npm run test:e2e
```

Run backend smoke script:

```bash
bash scripts/test.sh
```

## Repository Hygiene

- Ignore rules were updated in `.gitignore`, `backend/.dockerignore`, and `frontend/.dockerignore`.
- Terraform local/state artifacts should remain untracked.
