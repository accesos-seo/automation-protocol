<#
.SYNOPSIS
Generates scaffold content for a shared automation through Supabase Edge Function.

.DESCRIPTION
Calls generate-shared-automation-scaffold. This script does not create database records and does not run tests.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot\Invoke-SharedAutomationFunction.ps1"

param(
    [Parameter(Mandatory = $true)] [string] $AutomationKey,
    [Parameter(Mandatory = $true)] [string] $AutomationName,
    [Parameter(Mandatory = $true)] [string] $ProtocolName,
    [Parameter(Mandatory = $false)] [string] $Objective = "Objetivo operativo de la automatización.",
    [Parameter(Mandatory = $false)] [string[]] $Inputs = @("Entrada principal"),
    [Parameter(Mandatory = $false)] [string[]] $Outputs = @("Salida principal"),
    [Parameter(Mandatory = $false)] [string] $DefaultSkillKey = "intake-analysis",
    [Parameter(Mandatory = $false)] [string] $SupabaseUrl = $env:SUPABASE_URL,
    [Parameter(Mandatory = $false)] [string] $AuthToken = $env:SUPABASE_AUTH_TOKEN
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) { throw "SUPABASE_URL is required. Pass -SupabaseUrl or set environment variable." }
if ([string]::IsNullOrWhiteSpace($AuthToken)) { throw "SUPABASE_AUTH_TOKEN is required. Pass -AuthToken or set environment variable." }

$payload = @{
    automation_key    = $AutomationKey
    automation_name   = $AutomationName
    protocol_name     = $ProtocolName
    objective         = $Objective
    inputs            = $Inputs
    outputs           = $Outputs
    default_skill_key = $DefaultSkillKey
}

$response = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "generate-shared-automation-scaffold" `
    -Payload $payload

$response | ConvertTo-Json -Depth 50
