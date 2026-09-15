<#!
.SYNOPSIS
Creates a local, non-secret Terraform input file and produces a read-only NHN Cloud plan.

.DESCRIPTION
API credentials stay only in this PowerShell process as TF_VAR_* environment variables.
The generated terraform.tfvars contains infrastructure identifiers but is ignored by Git.
Without -Apply, this script only produces a Terraform plan. With -Apply, it
applies the newly generated plan in the same credential-bearing process.
#>

[CmdletBinding()]
param(
  [string]$TerraformPath = "terraform",
  [switch]$Apply,
  [switch]$ReplaceInstance
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

function Get-SavedTfVar([string]$Name) {
  $path = Join-Path $PSScriptRoot "terraform.tfvars"
  if (-not (Test-Path -LiteralPath $path)) { return $null }
  $match = [regex]::Match((Get-Content -LiteralPath $path -Raw), "(?m)^\s*$([regex]::Escape($Name))\s*=\s*`"(?<value>[^`"]+)`"\s*$")
  if ($match.Success) { return $match.Groups['value'].Value }
  return $null
}

function Get-NhnTokenAndCatalog([string]$AuthUrl, [string]$UserName, [string]$TenantId, [string]$Password) {
  $body = @{
    auth = @{
      passwordCredentials = @{ username = $UserName; password = $Password }
      tenantId = $TenantId
    }
  } | ConvertTo-Json -Depth 5
  return Invoke-RestMethod -Method Post -Uri ("{0}/tokens" -f $AuthUrl.TrimEnd('/')) -ContentType "application/json" -Body $body
}

function Get-NhnEndpoint($Catalog, [string]$Type, [string]$Region) {
  $service = @($Catalog | Where-Object { $_.type -eq $Type }) | Select-Object -First 1
  if ($null -eq $service) { return $null }
  $endpoint = @($service.endpoints | Where-Object { $_.region -eq $Region }) | Select-Object -First 1
  if ($null -eq $endpoint) { $endpoint = @($service.endpoints | Select-Object -First 1) }
  if ($endpoint -is [array]) { $endpoint = $endpoint[0] }
  return $endpoint.publicURL
}

if (-not (Get-Command $TerraformPath -ErrorAction SilentlyContinue) -and -not (Test-Path -LiteralPath $TerraformPath)) {
  throw "Terraform was not found. Install it from https://developer.hashicorp.com/terraform/install or provide -TerraformPath."
}

$nhnUserName = Read-Required "NHN Cloud ID"
$nhnTenantId = Read-Required "NHN Tenant ID"
$nhnAuthUrl = Read-Required "NHN Identity URL"
$apiPassword = Read-Host "NHN API password" -AsSecureString

$networkId = Get-SavedTfVar "network_id"
if ([string]::IsNullOrWhiteSpace($networkId)) { $networkId = Read-Required "Existing VPC UUID" }
$subnetId = Get-SavedTfVar "subnet_id"
$keyPairName = Get-SavedTfVar "key_pair_name"
if ([string]::IsNullOrWhiteSpace($keyPairName)) { $keyPairName = Read-Required "Existing SSH key-pair name" }
$sshPublicKeyPath = Get-SavedTfVar "ssh_public_key_path"
if ([string]::IsNullOrWhiteSpace($sshPublicKeyPath)) { $sshPublicKeyPath = Read-Required "Local SSH public-key path" }
try {
  $currentPublicIp = (Invoke-RestMethod -Uri "https://api.ipify.org").Trim()
  if ($currentPublicIp -notmatch "^\d{1,3}(\.\d{1,3}){3}$") { throw "The public-IP service returned an invalid IPv4 address." }
  $sshAllowedCidr = "$currentPublicIp/32"
  Write-Host "SSH will be restricted to the current public IP: $sshAllowedCidr"
} catch {
  Write-Warning "Could not determine the current public IP automatically."
  $sshAllowedCidr = Read-Required "Your public IPv4 CIDR (for example 203.0.113.10/32)"
}

$subnetLine = if ([string]::IsNullOrWhiteSpace($subnetId)) { "" } else { "subnet_id        = `"$(Escape-TfString $subnetId.Trim())`"" }

$tfvars = @"
network_id       = "$(Escape-TfString $networkId)"
$subnetLine
key_pair_name    = "$(Escape-TfString $keyPairName)"
ssh_public_key_path = "$(Escape-TfString $sshPublicKeyPath)"
ssh_allowed_cidr = "$(Escape-TfString $sshAllowedCidr)"
"@

[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "terraform.tfvars"), $tfvars, [System.Text.UTF8Encoding]::new($false))

$passwordBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiPassword)
try {
  $env:TF_VAR_nhn_user_name = $nhnUserName
  $env:TF_VAR_nhn_tenant_id = $nhnTenantId
  $env:TF_VAR_nhn_auth_url = $nhnAuthUrl
  $env:TF_VAR_nhn_api_password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordBstr)

  $retiredVolumeId = $null
  $nhnToken = $null
  $volumeEndpoint = $null

  & $TerraformPath init -input=false

  if ($ReplaceInstance) {
    $currentInstanceId = & $TerraformPath output -raw instance_id
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($currentInstanceId)) { throw "Could not identify the current instance for replacement." }
    $identity = Get-NhnTokenAndCatalog $nhnAuthUrl $nhnUserName $nhnTenantId $env:TF_VAR_nhn_api_password
    $nhnToken = $identity.access.token.id
    $computeEndpoint = Get-NhnEndpoint $identity.access.serviceCatalog "compute" "KR1"
    $volumeEndpoint = Get-NhnEndpoint $identity.access.serviceCatalog "volumev3" "KR1"
    if ([string]::IsNullOrWhiteSpace($volumeEndpoint)) { $volumeEndpoint = Get-NhnEndpoint $identity.access.serviceCatalog "volumev2" "KR1" }
    if ([string]::IsNullOrWhiteSpace($computeEndpoint) -or [string]::IsNullOrWhiteSpace($volumeEndpoint)) { throw "Could not locate NHN compute or volume API endpoints." }
    $attachments = Invoke-RestMethod -Method Get -Uri ("{0}/servers/{1}/os-volume_attachments" -f $computeEndpoint.TrimEnd('/'), $currentInstanceId) -Headers @{ "X-Auth-Token" = $nhnToken }
    $retiredVolumeId = @($attachments.volumeAttachments | Select-Object -First 1).volumeId
    if ([string]::IsNullOrWhiteSpace($retiredVolumeId)) { throw "Could not identify the current boot volume for cleanup." }
    $stateEntries = & $TerraformPath state list
    if ($stateEntries -notcontains "nhncloud_compute_keypair_v2.homepage") {
      & $TerraformPath import -input=false nhncloud_compute_keypair_v2.homepage $keyPairName
      if ($LASTEXITCODE -ne 0) { Write-Host "Key pair is not registered yet; Terraform will create it." }
    }
    Write-Host "The current boot volume will be deleted after the replacement succeeds: $retiredVolumeId"
  }

  & $TerraformPath fmt -check
  & $TerraformPath validate
  & $TerraformPath plan -input=false -out homepage.tfplan
  if ($Apply) {
    & $TerraformPath apply -input=false homepage.tfplan
    if ($ReplaceInstance -and -not [string]::IsNullOrWhiteSpace($retiredVolumeId)) {
      $deleteUri = "{0}/volumes/{1}" -f $volumeEndpoint.TrimEnd('/'), $retiredVolumeId
      $deleted = $false
      for ($attempt = 1; $attempt -le 12 -and -not $deleted; $attempt++) {
        try {
          Invoke-WebRequest -Method Delete -Uri $deleteUri -Headers @{ "X-Auth-Token" = $nhnToken } | Out-Null
          $deleted = $true
        } catch {
          if ($attempt -eq 12) { throw }
          Start-Sleep -Seconds 5
        }
      }
      Write-Host "Deleted retired boot volume: $retiredVolumeId"
    }
  }
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordBstr)
  Remove-Item Env:TF_VAR_nhn_user_name, Env:TF_VAR_nhn_tenant_id, Env:TF_VAR_nhn_auth_url, Env:TF_VAR_nhn_api_password -ErrorAction SilentlyContinue
}
