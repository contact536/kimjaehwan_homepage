provider "nhncloud" {
  user_name = var.nhn_user_name
  tenant_id = var.nhn_tenant_id
  password  = var.nhn_api_password
  auth_url  = var.nhn_auth_url
  region    = var.region
}
