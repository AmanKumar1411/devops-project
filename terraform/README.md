# Terraform remote state and migration

This document explains how to configure Terraform remote state with S3 and DynamoDB locking, migrate existing local state, and import existing AWS resources.

Backend configuration

The backend is defined in `terraform/backend.tf`:

- bucket: `terraform-state-aman-2026`
- key: `devops/terraform.tfstate`
- region: `ap-south-1`
- dynamodb_table: `terraform-locks`

Create backend resources (one-time)

From a machine with AWS CLI configured and appropriate permissions, run:

```bash
./scripts/create-terraform-backend.sh
```

Initialize Terraform with the new backend and migrate local state

From the `terraform/` directory:

```bash
terraform init -reconfigure \
  -backend-config="bucket=terraform-state-aman-2026" \
  -backend-config="key=devops/terraform.tfstate" \
  -backend-config="region=ap-south-1" \
  -backend-config="dynamodb_table=terraform-locks" \
  -input=false
```

If prompted to copy local state to the new backend, approve the migration. After successful init, run:

```bash
terraform state list
terraform plan
```

Remove committed local state and provider cache from git (local step)

If `terraform.tfstate`, `terraform.tfstate.backup` or `.terraform/` were committed, remove them from the repo index and commit the change:

```bash
git rm --cached terraform/terraform.tfstate terraform/terraform.tfstate.backup || true
git rm --cached -r terraform/.terraform || true
git add .gitignore
git commit -m "Remove local Terraform state and provider cache; use S3 backend"
git push
```

Import existing AWS resources into Terraform state

If resources exist in AWS but Terraform doesn't have them in state, import them using the resource addresses in the code.
Examples (run from `terraform/`):

```bash
terraform import aws_s3_bucket.project_bucket aman-devops-project-bucket-2026-001
terraform import aws_ecr_repository.app_repo devops-project
terraform import aws_iam_role.ecs_task_execution_role ecsTaskExecutionRole
terraform import aws_cloudwatch_log_group.ecs_logs /ecs/devops-project
terraform import aws_ecs_cluster.main devops-cluster
# For ECS service imports you may need ARN or cluster/service names
# terraform import aws_ecs_service.backend_service arn:aws:ecs:ap-south-1:123456789012:service/devops-cluster/backend-service
```

After importing, run `terraform plan` and adjust Terraform configurations to match real attributes.

Best practices

- Do not commit `*.tfstate`, `.terraform/` or provider binaries. Keep them in `.gitignore`.
- Use S3 with encryption and versioning enabled for state.
- Use DynamoDB table for state locking to avoid concurrent runs.
- Use OIDC (recommended) in GitHub Actions to assume a role instead of storing long-lived AWS keys.
- Run `terraform fmt` and `terraform validate` in CI before `plan`.
- Produce and review `terraform plan -out=tfplan` and only `apply` approved plans.
- Use environment-specific state keys (e.g., `devops/${var.environment}/terraform.tfstate`).
