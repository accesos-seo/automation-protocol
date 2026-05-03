<#
.SYNOPSIS
Runs the deferred final validation checks for the shared automation runtime.

.DESCRIPTION
This script is intentionally for the final closeout block only. Do not run during construction.
It calls the controlled local-test bridge and prints SQL verification queries to execute/review.

.REQUIREMENTS
- SUPABASE_URL or -SupabaseUrl
- LOCAL_TEST_TOKEN or -LocalTestToken
- Optional SUPABASE_AUTH_TOKEN if you later extend this script to call JWT-protected functions.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
    [Parameter(Mandatory = $false)] [string] $AutomationKey = "validation-shared-runtime-001",
    [Parameter(Mandatory = $false)] [string] $AutomationName = "Validation Shared Runtime 001",
    [Parameter(Mandatory = $false)] [string] $ProtocolName = "Validation Shared Runtime Protocol",
    [Parameter(Mandatory = $false)] [string] $DefaultSkillKey = "intake-analysis",
    [Parameter(Mandatory = $false)] [string] $SupabaseUrl = $env:SUPABASE_URL,
    [Parameter(Mandatory = $false)] [string] $LocalTestToken = $env:LOCAL_TEST_TOKEN
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) { throw "SUPABASE_URL is required. Pass -SupabaseUrl or set environment variable." }
if ([string]::IsNullOrWhiteSpace($LocalTestToken)) { throw "LOCAL_TEST_TOKEN is required. Pass -LocalTestToken or set environment variable." }

Write-Warning "This script is for FINAL TEST CLOSEOUT only. Do not run during construction."

$uri = "$($SupabaseUrl.TrimEnd('/'))/functions/v1/create-shared-automation-local-test"
$headers = @{
    "Content-Type" = "application/json"
    "x-test-token" = $LocalTestToken
}

$payload = @{
    automation_key    = $AutomationKey
    automation_name   = $AutomationName
    protocol_name     = $ProtocolName
    default_skill_key = $DefaultSkillKey
    metadata          = @{
        purpose = "final_validation"
        source  = "Invoke-SharedAutomationFinalTests.ps1"
    }
}

$result = Invoke-RestMethod `
    -Uri $uri `
    -Method POST `
    -Headers $headers `
    -Body ($payload | ConvertTo-Json -Depth 30)

$queries = @"
-- Verify automation registry
select automation_key, status, health_status, activation_guarded, created_at, updated_at
from public.automation_registry
where automation_key = '$AutomationKey';

-- Verify deployment configs
select automation_key, config_key, is_secret, config_status, created_at
from public.deployment_configs
where automation_key = '$AutomationKey'
order by created_at desc;

-- Verify automation rules
select automation_key, rule_key, status, created_at
from public.automation_rules
where automation_key = '$AutomationKey'
order by created_at desc;

-- Verify runtime events
select automation_key, event_type, status, created_at
from public.runtime_events
where automation_key = '$AutomationKey'
order by created_at desc
limit 20;

-- Verify execution tasks
select automation_key, task_type, status, created_at, updated_at
from public.execution_tasks
where automation_key = '$AutomationKey'
order by created_at desc
limit 20;

-- Verify audit logs
select entity_type, entity_id, action, actor_type, created_at
from public.audit_logs
where action in (
  'create_shared_automation',
  'register_shared_automation_components',
  'update_shared_automation_build_state'
)
order by created_at desc
limit 50;
"@

@{
    ok = $true
    warning = "Final test script executed. Review SQL queries and evidence before activation."
    function_result = $result
    verification_sql = $queries
    next_document = "docs/22-shared-automation-controlled-activation-checklist.md"
} | ConvertTo-Json -Depth 50
