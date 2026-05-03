<#
.SYNOPSIS
Creates an initial handover file for a shared automation.

.DESCRIPTION
Local-only helper. It writes handover/automations/{automation_key}-HANDOVER.md by default.
It does not call Supabase, does not run final tests, and does not activate automations.
#>

param(
    [Parameter(Mandatory = $true)] [string] $AutomationKey,
    [Parameter(Mandatory = $true)] [string] $AutomationName,
    [Parameter(Mandatory = $true)] [string] $ProtocolName,
    [Parameter(Mandatory = $false)] [string] $CommitSha = "REPLACE_WITH_COMMIT_SHA",
    [Parameter(Mandatory = $false)] [string] $Repository = "accesos-seo/automation-protocol",
    [Parameter(Mandatory = $false)] [string] $ProjectRef = "lwurzjrghzwzxbhrulyn",
    [Parameter(Mandatory = $false)] [string] $DefaultSkillKey = "intake-analysis",
    [Parameter(Mandatory = $false)] [string] $OutputPath,
    [Parameter(Mandatory = $false)] [switch] $Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($AutomationKey -notmatch '^[a-z0-9][a-z0-9-]*[a-z0-9]$') {
    throw "AutomationKey must be lowercase kebab-case."
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path -Path (Join-Path -Path "handover" -ChildPath "automations") -ChildPath "$AutomationKey-HANDOVER.md"
}

if ((Test-Path -LiteralPath $OutputPath) -and -not $Force) {
    throw "Handover already exists: $OutputPath. Use -Force to overwrite."
}

$RepositoryPath = "automations/$AutomationKey"
$ManifestPath = "$RepositoryPath/deployment/manifest.json"
$ReadmePath = "$RepositoryPath/README.md"
$AgentPath = "$RepositoryPath/agents/orchestrator.md"
$SkillPath = "$RepositoryPath/skills/$DefaultSkillKey/SKILL.md"
$RulePath = "$RepositoryPath/routing-rules/default-runtime-route.json"
$HandoverPath = "handover/automations/$AutomationKey-HANDOVER.md"

$Lines = @(
    "# $AutomationName - Operational Handover",
    "",
    "## Context router reference",
    "",
    "Read first:",
    "",
    "```text",
    "docs/01-ai-context-router.md",
    "docs/25-ai-block-execution-procedure.md",
    "docs/26-ai-autonomous-action-allowlist.md",
    "docs/23-shared-automation-handover-checklist.md",
    "```",
    "",
    "## Identity",
    "",
    "```text",
    "automation_key = $AutomationKey",
    "automation_name = $AutomationName",
    "protocol_name = $ProtocolName",
    "runtime = shared_supabase_runtime",
    "project_ref = $ProjectRef",
    "repository = $Repository",
    "repository_path = $RepositoryPath",
    "handover_path = $HandoverPath",
    "```",
    "",
    "## Current build state",
    "",
    "```text",
    "status = pending_final_validation",
    "health_status = pending_final_validation",
    "activation_guarded = true",
    "final_tests = deferred",
    "controlled_activation = not_authorized",
    "```",
    "",
    "## GitHub evidence",
    "",
    "```text",
    "commit_sha = $CommitSha",
    "manifest_path = $ManifestPath",
    "readme_path = $ReadmePath",
    "agent_paths = $AgentPath",
    "skill_paths = $SkillPath",
    "routing_rules_path = $RulePath",
    "handover_path = $HandoverPath",
    "```",
    "",
    "## Supabase evidence",
    "",
    "Fill after draft and component registration:",
    "",
    "```text",
    "automation_id = REPLACE_WITH_AUTOMATION_ID",
    "agent_ids = REPLACE_WITH_AGENT_IDS",
    "skill_ids = REPLACE_WITH_SKILL_IDS",
    "config_ids = REPLACE_WITH_CONFIG_IDS",
    "rule_ids = REPLACE_WITH_RULE_IDS",
    "audit_log_ids = REPLACE_WITH_AUDIT_LOG_IDS",
    "runtime_event_ids = REPLACE_WITH_RUNTIME_EVENT_IDS",
    "execution_task_ids = REPLACE_WITH_EXECUTION_TASK_IDS",
    "```",
    "",
    "## Registered components",
    "",
    "```text",
    "agent = orchestrator",
    "skill = $DefaultSkillKey",
    "config = OPENROUTER_API_KEY managed in Supabase Secrets or secure environment",
    "rule = default-runtime-route",
    "```",
    "",
    "## Verification SQL",
    "",
    "Generate non-destructive SQL with:",
    "",
    "```powershell",
    ".\scripts\powershell\shared-automation\Get-SharedAutomationVerificationSql.ps1 -AutomationKey '$AutomationKey'",
    "```",
    "",
    "## Autonomous execution policy",
    "",
    "```text",
    "Routine GitHub, README, PR, comment and Supabase-script actions are automatic inside an approved block.",
    "See docs/26-ai-autonomous-action-allowlist.md.",
    "```",
    "",
    "## Construction checklist",
    "",
    "```text",
    "[ ] Scaffold generated",
    "[ ] Files created in GitHub",
    "[ ] Manifest validated",
    "[ ] Component payload built",
    "[ ] Draft created in Supabase",
    "[ ] Components registered",
    "[ ] State moved to pending_final_validation",
    "[ ] activation_guarded remains true",
    "[ ] Secrets not exposed in GitHub",
    "```",
    "",
    "## Final-test guard",
    "",
    "```text",
    "Invoke-SharedAutomationFinalTests.ps1 = not authorized yet",
    "Enable-SharedAutomationControlledActivation.ps1 = not authorized yet",
    "```",
    "",
    "## Security notes",
    "",
    "- Do not document real secret values.",
    "- Secrets live in Supabase Secrets or secure environment only.",
    "- GitHub stores code, docs, manifests, skills, rules, scripts and handovers.",
    "- Supabase stores runtime state, logs, events, tasks and registry metadata.",
    "- Keep activation_guarded true during construction."
)

$OutputDirectory = Split-Path -Path $OutputPath -Parent
if (-not [string]::IsNullOrWhiteSpace($OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}

$Lines | Set-Content -LiteralPath $OutputPath -Encoding UTF8

[pscustomobject]@{
    ok = $true
    tests_deferred = $true
    activation_guarded = $true
    output_path = $OutputPath
    automation_key = $AutomationKey
    commit_sha = $CommitSha
} | ConvertTo-Json -Depth 10
