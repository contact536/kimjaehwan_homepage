variable "nhn_user_name" {
  description = "NHN Cloud ID. Set with TF_VAR_nhn_user_name, not in a committed file."
  type        = string
  sensitive   = true
}

variable "nhn_tenant_id" {
  description = "Tenant ID shown in Compute > Instance > Management > API Endpoint Setting."
  type        = string
  sensitive   = true
}

variable "nhn_api_password" {
  description = "API password generated in NHN Cloud."
  type        = string
  sensitive   = true
}

variable "nhn_auth_url" {
  description = "Identity URL shown in the NHN Cloud API Endpoint Setting screen."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "NHN Cloud region. KR1 is Korea (Pangyo)."
  type        = string
  default     = "KR1"
}

variable "availability_zone" {
  description = "Availability zone for the web instance."
  type        = string
  default     = "kr-pub-a"
}

variable "instance_name" {
  description = "Name assigned to the NHN Cloud instance."
  type        = string
  default     = "kimjaehwan-homepage"
}

variable "network_id" {
  description = "Existing company-project VPC UUID to attach."
  type        = string
}

variable "subnet_id" {
  description = "Optional existing subnet UUID. Leave unset to let NHN allocate a port IP on the selected VPC."
  type        = string
  default     = null
  nullable    = true
}

variable "key_pair_name" {
  description = "Existing NHN Cloud key-pair name. Terraform never generates or stores a private key."
  type        = string
}

variable "image_name" {
  description = "Exact Ubuntu image name displayed in NHN Cloud's Create Instance image list."
  type        = string
  default     = "Ubuntu Server 24.04.3 LTS (2026.03.10)"
}

variable "flavor_name" {
  description = "Exact approved non-U2 compute flavor name, for example the selected 2 vCPU / 4 GB flavor."
  type        = string
  default     = "m2.c2m4"
}

variable "root_volume_gb" {
  description = "Boot volume size in GB. NHN non-U2 block storage requires at least 20 GB."
  type        = number
  default     = 30

  validation {
    condition     = var.root_volume_gb >= 20
    error_message = "root_volume_gb must be at least 20 GB."
  }
}

variable "ssh_allowed_cidr" {
  description = "Trusted public IPv4 CIDR allowed to administer the server over SSH, typically x.x.x.x/32."
  type        = string

  validation {
    condition     = can(cidrnetmask(var.ssh_allowed_cidr))
    error_message = "ssh_allowed_cidr must be a valid IPv4 CIDR."
  }
}

variable "floating_ip_pool" {
  description = "NHN Cloud floating-IP pool name displayed in the console."
  type        = string
  default     = "Public Network"
}
