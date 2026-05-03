<#
.SYNOPSIS
Uploads generated skill.zip packages to Supabase Storage bucket skills.

.DESCRIPTION
This script is intentionally local/operator-side because the Supabase connector does not expose binary Storage upload.
It reads dist/skills/package-manifest.json, validates package existence and SHA256, then uploads each package to Supabase Storage using the Storage REST API.

SECURITY:
- Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the local environment.
- Does not print the service role key.
- Does not delete objects.
- Does not activate automations.
- Does not modify activation_guarded.

.EXAMPLE
$env:SUPABASE_URL = "https://PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "REPLACE_WITH_SECURE_VALUE"
.\scripts\powershell\shared-automation\Upload-SkillPackagesToSupabaseStorage.ps1 -ManifestPath dist\skills\package-manifest.json
#>

param(
    [Parameter(Mandatory = $false)] [string] $ManifestPath = "dist/skills/package-manifest.json",
    [Parameter(Mandatory = $false)] [string] $PackagesRoot = "dist/skills/packages",
    [Parameter(Mandatory = $false)] [string] $Bucket = "skills",
    [Parameter(Mandatory = $false)] [switch] $DryRun,
    [Parameter(Mandatory = $false)] [switch] $Upsert
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-FileSha256 {
    param([Parameter(Mandatory = $true)] [string] $Path)
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Join-StoragePackagePath {
    param(
        [Parameter(Mandatory = $true)] [string] $Root,
        [Parameter(Mandatory = $true)] [string] $RuntimePackagePath
    )

    $segments = $RuntimePackagePath -split '/'
    return Join-Path -Path $Root -ChildPath ($segments -join [System.IO.Path]::DirectorySeparatorChar)
}

if (-not (Test-Path -LiteralPath $ManifestPath)) {
    throw "Manifest not found: $ManifestPath"
}

$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json

if (-not $manifest.packages) {
    throw "Manifest contains no packages."
}

$supabaseUrl = $env:SUPABASE_URL
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $DryRun) {
    if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
        throw "SUPABASE_URL environment variable is required unless -DryRun is used."
    }
    if ([string]::IsNullOrWhiteSpace($serviceRoleKey)) {
        throw "SUPABASE_SERVICE_ROLE_KEY environment variable is required unless -DryRun is used."
    }
}

$results = @()

foreach ($package in $manifest.packages) {
    $runtimePackagePath = [string] $package.runtime_package_path
    $expectedSha = ([string] $package.sha256).ToLowerInvariant()
    $localPath = Join-StoragePackagePath -Root $PackagesRoot -RuntimePackagePath $runtimePackagePath

    if (-not (Test-Path -LiteralPath $localPath)) {
        throw "Package file missing: $localPath"
    }

    $actualSha = Get-FileSha256 -Path $localPath
    if ($actualSha -ne $expectedSha) {
        throw "SHA256 mismatch for $runtimePackagePath. Expected $expectedSha but got $actualSha"
    }

    $uploadUrl = ($supabaseUrl.TrimEnd('/')) + "/storage/v1/object/$Bucket/$runtimePackagePath"

    if ($DryRun) {
        $results += [pscustomobject]@{
            runtime_package_path = $runtimePackagePath
            local_path = $localPath
            sha256 = $actualSha
            uploaded = $false
            dry_run = $true
        }
        continue
    }

    $headers = @{
        "Authorization" = "Bearer $serviceRoleKey"
        "apikey" = $serviceRoleKey
        "Content-Type" = "application/zip"
        "x-upsert" = if ($Upsert) { "true" } else { "false" }
    }

    Invoke-RestMethod -Method Post -Uri $uploadUrl -Headers $headers -InFile $localPath | Out-Null

    $results += [pscustomobject]@{
        runtime_package_path = $runtimePackagePath
        local_path = $localPath
        sha256 = $actualSha
        uploaded = $true
        dry_run = $false
    }
}

[pscustomobject]@{
    ok = $true
    bucket = $Bucket
    manifest_path = $ManifestPath
    packages_root = $PackagesRoot
    package_count = $results.Count
    dry_run = [bool] $DryRun
    upsert = [bool] $Upsert
    results = $results
} | ConvertTo-Json -Depth 10
