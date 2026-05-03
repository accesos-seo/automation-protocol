<#
.SYNOPSIS
Pauses a shared automation through the protected build state updater.

.DESCRIPTION
Use this script for controlled rollback to paused when runtime issues are observed after activation or during validation.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot\Invoke-SharedAutomationFunction.ps1"

param(
    [Parameter(Mandatory = $true)] [string] $AutomationKey,
    [Parameter(Mandatory = $true)] [string] $Reason,
    [Parameter(Mandatory = $false)] [string] $SupabaseUrl = $env:SUPABASE_URL,
    [Parameter(Mandatory = $false)] [string] $AuthToken = $env:SUPABASE_AUTH_TOKEN
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) { throw "SUPABASE_URL is required. Pass -SupabaseUrl or set environment variable." }
if ([string]::IsNullOrWhiteSpace($AuthToken)) { throw "SUPABASE_AUTH_TOKEN is required. Pass -AuthToken or set environment variable." }

$paused = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "update-shared-automation-build-state" `
    -Payload @{
        automation_key = $AutomationKey
        target_state   = "paused"
        evidence       = @{
            pause_reason = $Reason
        }
        notes          = "Paused through Disable-SharedAutomation.ps1."
    }

$sql = @"
select automation_key, status, health_status, activation_guarded, updated_at
from public.automation_registry
where automation_key = '$AutomationKey';

select entity_type, entity_id, action, actor_type, old_value, new_value, created_at
from public.audit_logs
where action = 'update_shared_automation_build_state'
order by created_at desc
limit 20;
"@

@{
    ok = $true
    automation_key = $AutomationKey
    pause_reason = $Reason
    paused_result = $paused
    verification_sql = $sql
} | ConvertTo-Json -Depth 50
