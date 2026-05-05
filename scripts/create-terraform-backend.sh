#!/usr/bin/env bash
set -euo pipefail

# Creates S3 bucket and DynamoDB table for Terraform remote state (ap-south-1)
# Run this with AWS CLI configured for an account with permissions to create these resources.

BUCKET="terraform-state-aman-2026"
TABLE="terraform-locks"
REGION="ap-south-1"

echo "Creating S3 bucket: $BUCKET in $REGION"
aws s3api create-bucket \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint=$REGION || true

echo "Enabling versioning"
aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration Status=Enabled

echo "Enabling server-side encryption (AES256)"
aws s3api put-bucket-encryption --bucket "$BUCKET" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

echo "Blocking public access"
aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration '{"BlockPublicAcls": true, "IgnorePublicAcls": true, "BlockPublicPolicy": true, "RestrictPublicBuckets": true}'

echo "Creating DynamoDB table: $TABLE"
aws dynamodb create-table \
  --table-name "$TABLE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" || true

echo "Done. Wait for DynamoDB table to become ACTIVE before using Terraform."
