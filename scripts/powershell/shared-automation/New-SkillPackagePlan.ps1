param(
  [Parameter(Mandatory=$true)]
  [string]$AutomationKey,

  [Parameter(Mandatory=$true)]
  [string]$SkillKey,

  [Parameter(Mandatory=$true)]
  [string]$SkillSourcePath,

  [string]$Version = "0.1.0",

  [string]$OutputRoot = "dist/skills"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $SkillSourcePath)) {
  throw "Skill source path not found: $SkillSourcePath"
}

$packageDir = Join-Path $OutputRoot (Join-Path $AutomationKey (Join-Path $SkillKey $Version))
New-Item -ItemType Directory -Force -Path $packageDir | Out-Null

$zipPath = Join-Path $packageDir "skill.zip"
$manifestPath = Join-Path $packageDir "manifest.json"

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

Compress-Archive -Path $SkillSourcePath -DestinationPath $zipPath -Force

$hash = Get-FileHash -Path $zipPath -Algorithm SHA256
$storagePath = "$AutomationKey/$SkillKey/$Version/skill.zip"

$manifest = [ordered]@{
  automation_key = $AutomationKey
  skill_key = $SkillKey
  version = $Version
  source_path = $SkillSourcePath
  runtime_bucket = "skills"
  runtime_package_path = $storagePath
  sha256 = $hash.Hash.ToLowerInvariant()
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("o")
}

$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8

[pscustomobject]@{
  AutomationKey = $AutomationKey
  SkillKey = $SkillKey
  Version = $Version
  ZipPath = $zipPath
  ManifestPath = $manifestPath
  RuntimeBucket = "skills"
  RuntimePackagePath = $storagePath
  Sha256 = $hash.Hash.ToLowerInvariant()
}
