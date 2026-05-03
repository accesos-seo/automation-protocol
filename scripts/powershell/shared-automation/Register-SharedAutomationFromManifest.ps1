<#
.SYNOPSIS
Validates a manifest, builds component payload, creates draft, registers components, and moves state to pending_final_validation.

.DESCRIPTION
This script follows the shared automation build flow. It does not execute final runtime tests and does not activate the automation.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot\Invoke-SharedAutomationFunction.ps1"

param(
    [Parameter(Mandatory = $true)] [string] $ManifestPath,
    [Parameter(Mandatory = $true)] [string] $CommitSha,
    [Parameter(Mandatory = $false)] [string] $SupabaseUrl = $env:SUPABASE_URL,
    [Parameter(Mandatory = $false)] [string] $AuthToken = $env:SUPABASE_AUTH_TOKEN
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) { throw "SUPABASE_URL is required. Pass -SupabaseUrl or set environment variable." }
if ([string]::IsNullOrWhiteSpace($AuthToken)) { throw "SUPABASE_AUTH_TOKEN is required. Pass -AuthToken or set environment variable." }
if (-not (Test-Path -LiteralPath $ManifestPath)) { throw "Manifest not found: $ManifestPath" }

$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$automationKey = [string] $manifest.automation_key
$automationName = [string] $manifest.automation_name
$protocolName = [string] $manifest.protocol_name
$defaultSkillKey = "intake-analysis"

if ($manifest.components.skills.Count -gt 0 -and $manifest.components.skills[0].skill_key) {
    $defaultSkillKey = [string] $manifest.components.skills[0].skill_key
}

$validation = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "validate-shared-automation-manifest" `
    -Payload @{ manifest = $manifest }

if ($validation.valid -ne $true) {
    $validation | ConvertTo-Json -Depth 50
    throw "Manifest validation failed."
}

$payloadResponse = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "build-components-payload-from-manifest" `
    -Payload @{ strict = $true; manifest = $manifest }

if ($payloadResponse.valid -ne $true) {
    $payloadResponse | ConvertTo-Json -Depth 50
    throw "Component payload build failed."
}

$draft = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "build-shared-automation-draft" `
    -Payload @{
        automation_key    = $automationKey
        automation_name   = $automationName
        protocol_name     = $protocolName
        default_skill_key = $defaultSkillKey
        commit_sha        = $CommitSha
        objective         = "Registered from manifest"
        inputs            = @()
        outputs           = @()
        metadata          = @{ build_source = "Register-SharedAutomationFromManifest.ps1" }
    }

$registered = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "register-shared-automation-components" `
    -Payload $payloadResponse.payload

$stateScaffolded = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "update-shared-automation-build-state" `
    -Payload @{
        automation_key = $automationKey
        target_state   = "scaffolded"
        commit_sha     = $CommitSha
        evidence       = @{ github_files_created = $true; manifest_validated = $true }
        notes          = "Scaffold files committed and manifest validated."
    }

$stateComponents = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "update-shared-automation-build-state" `
    -Payload @{
        automation_key = $automationKey
        target_state   = "components_registered"
        evidence       = @{ components_registered = $true }
        notes          = "Components registered from manifest."
    }

$statePending = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "update-shared-automation-build-state" `
    -Payload @{
        automation_key = $automationKey
        target_state   = "pending_final_validation"
        evidence       = @{ ready_for_final_tests = $true }
        notes          = "Build completed. Final tests deferred."
    }

@{
    ok = $true
    tests_deferred = $true
    automation_key = $automationKey
    validation = $validation
    component_payload_counts = $payloadResponse.counts
    draft = $draft
    registered = $registered
    state_scaffolded = $stateScaffolded
    state_components_registered = $stateComponents
    state_pending_final_validation = $statePending
} | ConvertTo-Json -Depth 50
