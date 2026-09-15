<#!
.SYNOPSIS
Creates a local, non-secret Terraform input file and produces a read-only NHN Cloud plan.

.DESCRIPTION
API credentials stay only in this PowerShell process as TF_VAR_* environment variables.
The generated terraform.tfvars contains infrastructure identifiers but is ignored by Git.
This script never runs terraform apply.
#>

[CmdletBinding()]
param(
  [string]$TerraformPath = "terraform"
)

$ErrorActionPreference = "Stop"

function Read-Required([string]$Prompt) {
  do {
    $value = Read-Host $Prompt
  } while ([string]::IsNullOrWhiteSpace($value))

  return $value.Trim()
}

function Escape-TfString([string]$Value) {
  return $Value.Replace("\", "\\").Replace('"', '\"')
}

if (-not (Get-Command $TerraformPath -ErrorAction SilentlyContinue) -and -not (Test-Path -LiteralPath $TerraformPath)) {
  throw "Terraform was not found. Install it from https://developer.hashicorp.com/terraform/install or provide -TerraformPath."
}

$nhnUserName = Read-Required "NHN Cloud ID"
$nhnTenantId = Read-Required "NHN Tenant ID"
$nhnAuthUrl = Read-Required "NHN Identity URL"
$apiPassword = Read-Host "NHN API password" -AsSecureString

$networkId = Read-Required "Existing VPC UUID"
$subnetId = Read-Host "Existing subnet UUID (optional; leave empty for automatic allocation)"
$keyPairName = Read-Required "Existing SSH key-pair name"
$sshAllowedCidr = Read-Required "Your public IPv4 CIDR (for example 203.0.113.10/32)"

$subnetLine = if ([string]::IsNullOrWhiteSpace($subnetId)) { "" } else { "subnet_id        = `"$(Escape-TfString $subnetId.Trim())`"" }

$tfvars = @"
network_id       = "$(Escape-TfString $networkId)"
$subnetLine
key_pair_name    = "$(Escape-TfString $keyPairName)"
ssh_allowed_cidr = "$(Escape-TfString $sshAllowedCidr)"
"@

[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "terraform.tfvars"), $tfvars, [System.Text.UTF8Encoding]::new($false))

$passwordBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiPassword)
try {
  $env:TF_VAR_nhn_user_name = $nhnUserName
  $env:TF_VAR_nhn_tenant_id = $nhnTenantId
  $env:TF_VAR_nhn_auth_url = $nhnAuthUrl
  $env:TF_VAR_nhn_api_password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordBstr)

  & $TerraformPath init -input=false
  & $TerraformPath fmt -check
  & $TerraformPath validate
  & $TerraformPath plan -input=false -out homepage.tfplan
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordBstr)
  Remove-Item Env:TF_VAR_nhn_user_name, Env:TF_VAR_nhn_tenant_id, Env:TF_VAR_nhn_auth_url, Env:TF_VAR_nhn_api_password -ErrorAction SilentlyContinue
}
