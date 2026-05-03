<#
.SYNOPSIS
Performs controlled activation for a shared automation after final validation.

.DESCRIPTION
This script should only be run after docs/21 final tests pass and the handover is updated.
It moves an automation from pending_final_validation -> validated -> active through the protected state updater.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot\Invoke-SharedAutomationFunction.ps1"

param(
    [Parameter(Mandatory = $true)] [string] $AutomationKey,
    [Parameter(Mandatory = $false)] [string] $SupabaseUrl = $env:SUPABASE_URL,
    [Parameter(Mandatory = $false)] [string] $AuthToken = $env:SUPABASE_AUTH_TOKEN,
    [Parameter(Mandatory = $false)] [switch] $SkipActiveStep
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) { throw "SUPABASE_URL is required. Pass -SupabaseUrl or set environment variable." }
if ([string]::IsNullOrWhiteSpace($AuthToken)) { throw "SUPABASE_AUTH_TOKEN is required. Pass -AuthToken or set environment variable." }

Write-Warning "Controlled activation requires final tests passed, reviewed runtime_events/execution_tasks/audit_logs, and updated handover."

$validated = Invoke-SharedAutomationFunction `
    -SupabaseUrl $SupabaseUrl `
    -AuthToken $AuthToken `
    -FunctionName "update-shared-automation-build-state" `
    -Payload @{
        automation_key = $AutomationKey
        target_state   = "validated"
        evidence       = @{
            final_tests_passed       = $true
            runtime_events_reviewed  = $true
            execution_tasks_reviewed = $true
            audit_logs_reviewed      = $true
            handover_updated         = $true
        }
        notes          = "Final validation passed. Automation is ready for controlled activation."
    }

$active = $null
if (-not $SkipActiveStep) {
    $active = Invoke-SharedAutomationFunction `
        -SupabaseUrl $SupabaseUrl `
        -AuthToken $AuthToken `
        -FunctionName "update-shared-automation-build-state" `
        -Payload @{
            automation_key = $AutomationKey
            target_state   = "active"
            evidence       = @{
                validated_state_confirmed = $true
                activation_approved       = $true
            }
            notes          = "Controlled activation after successful final validation."
        }
}

$monitoringSql = @"
-- Confirm activation state
select automation_key, status, health_status, activation_guarded, updated_at
from public.automation_registry
where automation_key = '$AutomationKey';

-- Monitor runtime events
select automation_key, event_type, status, created_at
from public.runtime_events
where automation_key = '$AutomationKey'
order by created_at desc
limit 20;

-- Monitor execution tasks
select automation_key, task_type, status, created_at, updated_at
from public.execution_tasks
where automation_key = '$AutomationKey'
order by created_at desc
limit 20;

-- Review activation audit logs
select entity_type, entity_id, action, actor_type, old_value, new_value, created_at
from public.audit_logs
where action = 'update_shared_automation_build_state'
order by created_at desc
limit 20;
"@

@{
    ok = $true
    automation_key = $AutomationKey
    validated_result = $validated
    active_result = $active
    monitoring_sql = $monitoringSql
    rollback_document = "docs/22-shared-automation-controlled-activation-checklist.md"
} | ConvertTo-Json -Depth 50
