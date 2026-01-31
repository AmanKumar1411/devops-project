#!/bin/bash
set -e

echo "Checking AWS identity..."
aws sts get-caller-identity

echo "Listing EC2 instances..."
aws ec2 describe-instances --query 'Reservations[].Instances[].InstanceId'
