[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidatePattern("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$")]
  [string]$Bucket,

  [string]$Server = "ubuntu@133.186.240.44",

  [string]$SshKeyPath = (Join-Path $env:USERPROFILE ".ssh\kimjaehwan_nhn_rsa"),

  [ValidateRange(7, 3650)]
  [int]$RetentionDays = 90
)

$ErrorActionPreference = "Stop"

if ($Bucket.StartsWith("xn--")) {
  throw "Bucket names cannot start with xn--."
}
if (-not (Test-Path -LiteralPath $SshKeyPath -PathType Leaf)) {
  throw "SSH private key not found: $SshKeyPath"
}

$accessKey = Read-Host -Prompt "NHN Object Storage S3 access key"
$secureSecret = Read-Host -Prompt "NHN Object Storage S3 secret key" -AsSecureString
$secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
try {
  $secretKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
}

if ([string]::IsNullOrWhiteSpace($accessKey) -or [string]::IsNullOrWhiteSpace($secretKey)) {
  throw "Both S3 credentials are required."
}

$environment = @(
  "NHN_OBJECT_STORAGE_BUCKET=$Bucket"
  "NHN_OBJECT_STORAGE_ACCESS_KEY=$accessKey"
  "NHN_OBJECT_STORAGE_SECRET_KEY=$secretKey"
  "NHN_OBJECT_STORAGE_ENDPOINT=https://kr1-api-object-storage.nhncloudservice.com"
  "NHN_OBJECT_STORAGE_REGION=KR1"
  "NHN_OBJECT_STORAGE_PREFIX=sqlite"
  "NHN_OBJECT_STORAGE_RETENTION_DAYS=$RetentionDays"
) -join [Environment]::NewLine

try {
  $environment | & ssh -i $SshKeyPath -o StrictHostKeyChecking=accept-new $Server "sudo tee /etc/kimjaehwan-homepage-backup.env >/dev/null && sudo chown root:kimhomepage /etc/kimjaehwan-homepage-backup.env && sudo chmod 640 /etc/kimjaehwan-homepage-backup.env && sudo systemctl start kimjaehwan-homepage-backup.service"
  if ($LASTEXITCODE -ne 0) {
    throw "Could not configure or verify the offsite backup on the server."
  }
  Write-Host "Offsite backup configuration installed and verified."
}
finally {
  $secretKey = $null
  $environment = $null
}
