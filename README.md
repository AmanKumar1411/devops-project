# DevOps Project

## Architecture

- Backend: Node.js + Express API serving `GET /api/hello`
- Frontend: Responsive HTML/CSS/JS UI calling backend API from button action
- CI/CD: GitHub Actions for quality gates, container image build, and EC2 deployment
- Deployment target: AWS EC2 host pulling images from AWS ECR

## Workflows

### CI Quality Gate

File: `.github/workflows/ci.yml`

Runs on both:

- `push`
- `pull_request`

Checks:

- Install dependencies (`npm install` root + backend)
- Lint (`eslint` backend + frontend JS)
- Format checks (`prettier --check`)
- Unit + integration tests (Jest)
- E2E bonus test (Playwright)

### Container Build Workflows

Files:

- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`

Purpose:

- Build multi-arch Docker images
- Push tagged images to ECR

### Deploy Workflow

File: `.github/workflows/deploy-cd.yml`

Purpose:

- SSH to EC2
- Pull latest backend/frontend images from ECR
- Restart containers (`docker rm -f ... || true`, then `docker run`)

## Frontend Design Decisions

- Refactored into reusable functions in `frontend/app.js`
- Separated structure and styling:
  - `frontend/index.html`
  - `frontend/styles.css`
- Responsive card-based UI with mobile-friendly spacing and typography
- Keeps direct API integration to backend endpoint

## Testing Strategy

### Unit Testing

- Tool: Jest
- Example: `backend/tests/unit/message.test.js`
- Validates isolated function behavior (`getHelloMessage`)

### Integration Testing

- Tool: Jest + Supertest
- Example: `backend/tests/integration/hello-api.test.js`
- Validates API wiring and response payload

### E2E Testing (Bonus)

- Tool: Playwright
- Example: `tests/e2e/user-flow.spec.js`
- User flow validated:
  - Open frontend
  - Click "Call Backend API"
  - Verify rendered backend response

## Linting / PR Checks

- ESLint config:
  - `backend/eslint.config.js`
  - `eslint.config.js`
- Prettier config:
  - `.prettierrc`
  - `backend/.prettierrc`
- PR lint failure enforced through `.github/workflows/ci.yml`

## Dependabot

Config file: `.github/dependabot.yml`

Configured updates:

- GitHub Actions dependencies
- npm dependencies at root
- npm dependencies for backend

## Idempotent Script Practices

Hardened scripts:

- `scripts/build.sh`
- `scripts/test.sh`
- `scripts/check-aws.sh`
- `scripts/docker-build.sh`

Improvements:

- `set -euo pipefail` for strict execution
- Safe cleanup in test script with `trap`
- Re-runnable behavior without inconsistent state

## Challenges and Tradeoffs

- Chose lightweight vanilla frontend (instead of React) to keep deployment simple and fast.
- Added testable backend structure (`app.js` + `server.js`) to support unit/integration tests without changing runtime behavior.
- Kept existing AWS deployment workflow and image pipelines while adding a separate quality-gate CI to satisfy PR requirements.

## Local Commands

- Backend install: `npm install --prefix backend`
- Backend lint: `npm run lint --prefix backend`
- Backend tests: `npm test --prefix backend`
- Root install (frontend lint/e2e tools): `npm install`
- Frontend lint: `npm run lint:frontend`
- Format check: `npm run format:check`
- E2E tests: `npm run test:e2e`
