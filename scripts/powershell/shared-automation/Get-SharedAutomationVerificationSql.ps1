<#
.SYNOPSIS
Generates non-destructive SQL verification queries for a shared automation.

.DESCRIPTION
This script does not call Supabase and does not modify data. It prints read-only SQL queries scoped by automation_key.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
    [Parameter(Mandatory = $true)] [string] $AutomationKey,
    [Parameter(Mandatory = $false)] [int] $Limit = 50
)

if ([string]::IsNullOrWhiteSpace($AutomationKey)) { throw "AutomationKey is required." }
if ($AutomationKey -notmatch '^[a-z0-9][a-z0-9-]*[a-z0-9]$') { throw "AutomationKey must be lowercase kebab-case." }
if ($Limit -lt 1 -or $Limit -gt 500) { throw "Limit must be between 1 and 500." }

$sql = @"
-- Shared automation non-destructive verification
-- automation_key = $AutomationKey

-- 1. Automation registry
select id, automation_key, automation_name, protocol_name, status, health_status, activation_guarded, repository_path, commit_sha, created_at, updated_at
from public.automation_registry
where automation_key = '$AutomationKey';

-- 2. Agent registry
select id, automation_key, agent_key, agent_name, agent_type, status, definition_path, runtime_function, created_at, updated_at
from public.agent_registry
where automation_key = '$AutomationKey'
order by created_at desc
limit $Limit;

-- 3. Skill registry
select id, automation_key, skill_key, skill_name, skill_version, runtime_location, status, skill_source_path, created_at, updated_at
from public.skill_registry
where automation_key = '$AutomationKey'
order by created_at desc
limit $Limit;

-- 4. Deployment configs - values are intentionally not selected
select id, automation_key, config_key, config_type, is_required, is_secret, config_status, description, created_at, updated_at
from public.deployment_configs
where automation_key = '$AutomationKey'
order by created_at desc
limit $Limit;

-- 5. Automation rules
select id, automation_key, rule_key, rule_type, rule_version, status, rule_source_path, created_at, updated_at
from public.automation_rules
where automation_key = '$AutomationKey'
order by created_at desc
limit $Limit;

-- 6. Runtime events
select id, automation_key, event_type, status, created_at
from public.runtime_events
where automation_key = '$AutomationKey'
order by created_at desc
limit $Limit;

-- 7. Execution tasks
select id, automation_key, task_type, status, created_at, updated_at
from public.execution_tasks
where automation_key = '$AutomationKey'
order by created_at desc
limit $Limit;

-- 8. Recent audit logs by entity id if automation id exists
with target_automation as (
  select id
  from public.automation_registry
  where automation_key = '$AutomationKey'
)
select al.id, al.entity_type, al.entity_id, al.action, al.actor_type, al.created_at
from public.audit_logs al
where al.entity_id in (select id from target_automation)
   or al.new_value::text ilike '%$AutomationKey%'
   or al.old_value::text ilike '%$AutomationKey%'
order by al.created_at desc
limit $Limit;

-- 9. Stuck/running task check
select id, automation_key, task_type, status, created_at, updated_at
from public.execution_tasks
where automation_key = '$AutomationKey'
  and status in ('running', 'queued', 'pending')
order by created_at asc
limit $Limit;
"@

@{
    ok = $true
    automation_key = $AutomationKey
    limit = $Limit
    sql = $sql
} | ConvertTo-Json -Depth 10
