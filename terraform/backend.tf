terraform {
  backend "s3" {
    bucket         = "terraform-state-aman-2026"
    key            = "devops/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
