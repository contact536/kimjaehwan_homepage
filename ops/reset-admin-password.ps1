param(
  [string]$Server = 'ubuntu@133.186.240.44',
  [string]$SshKeyPath = (Join-Path $env:USERPROFILE '.ssh\kimjaehwan_nhn_rsa')
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $SshKeyPath)) { throw 'NHN SSH private key was not found.' }

function Read-Plaintext([System.Security.SecureString]$Secret) {
  $pointer = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secret)
  try { return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

$first = Read-Host '새 관리자 비밀번호 (8~128자)' -AsSecureString
$second = Read-Host '새 비밀번호 확인' -AsSecureString
$password = Read-Plaintext $first
$confirmation = Read-Plaintext $second
if ($password.Length -lt 8 -or $password.Length -gt 128) {
  $password = $null; $confirmation = $null
  throw '비밀번호는 8~128자로 입력해야 합니다.'
}
if ($password -cne $confirmation) {
  $password = $null; $confirmation = $null
  throw '두 비밀번호가 일치하지 않습니다.'
}
$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($password))
$password = $null; $confirmation = $null; $first.Dispose(); $second.Dispose()

try {
  $encoded | & ssh -o BatchMode=yes -o ConnectTimeout=8 -i $SshKeyPath $Server 'sudo -u kimhomepage /usr/bin/node --experimental-strip-types /srv/kimjaehwan-homepage/ops/reset-admin-password.mjs'
  if ($LASTEXITCODE -ne 0) { throw 'NHN 서버에서 비밀번호를 변경하지 못했습니다.' }
  Write-Output '비밀번호가 변경되었습니다. https://kimjaehwan.com/admin/ 에서 새 비밀번호로 로그인하세요.'
} finally {
  $encoded = $null
}
