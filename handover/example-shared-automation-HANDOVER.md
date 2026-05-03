# Example Shared Automation - Operational Handover

## Context router reference

Read first:

```text
docs/01-ai-context-router.md
docs/23-shared-automation-handover-checklist.md
```

Relevant intention:

```text
crear | registrar | verificar | documentar
```

Do not load final-test or activation docs until `pending_final_validation` and explicit user authorization.

## Identity

```text
automation_key = example-shared-automation
automation_name = Example Shared Automation
protocol_name = Example Shared Automation Protocol
runtime = shared_supabase_runtime
project_ref = lwurzjrghzwzxbhrulyn
repository = accesos-seo/automation-protocol
repository_path = automations/example-shared-automation
```

## Current build state

```text
status = scaffolded
health_status = pending_validation
activation_guarded = true
final_tests = deferred
controlled_activation = not_authorized
```

## GitHub evidence

```text
branch = ai-shared-automation-handover
commit_sha = REPLACE_WITH_FINAL_COMMIT_SHA
manifest_path = automations/example-shared-automation/deployment/manifest.json
readme_path = automations/example-shared-automation/README.md
agent_paths = automations/example-shared-automation/agents/orchestrator.md
skill_paths = automations/example-shared-automation/skills/intake-analysis/SKILL.md
routing_rules_path = automations/example-shared-automation/routing-rules/default-runtime-route.json
```

## Connector diagnostic note

```text
Diagnostic branch test/ai-write-diagnostic succeeded.
Draft PR #4 confirmed branch creation, file creation and PR creation.
Preferred branch feature/shared-automation-handover was blocked by connector safety controls during create_branch.
Fallback branch ai-shared-automation-handover was created and used for this work.
The PowerShell script file write was blocked by connector safety controls and remains pending for application from a write-enabled session or safe split strategy.
```

## Supabase evidence

Pending until registration is executed:

```text
automation_id = REPLACE_WITH_AUTOMATION_ID
agent_ids = REPLACE_WITH_AGENT_IDS
skill_ids = REPLACE_WITH_SKILL_IDS
config_ids = REPLACE_WITH_CONFIG_IDS
rule_ids = REPLACE_WITH_RULE_IDS
audit_log_ids = REPLACE_WITH_AUDIT_LOG_IDS
runtime_event_ids = REPLACE_WITH_RUNTIME_EVENT_IDS
execution_task_ids = REPLACE_WITH_EXECUTION_TASK_IDS
```

## Registered components

```text
agent = orchestrator
skill = intake-analysis
config = OPENROUTER_API_KEY managed in Supabase Secrets or secure environment
rule = default-runtime-route
```

## Verification SQL

Generate non-destructive SQL with:

```powershell
.\scripts\powershell\shared-automation\Get-SharedAutomationVerificationSql.ps1 `
  -AutomationKey "example-shared-automation"
```

## Checklist before pending_final_validation

```text
[x] Scaffold files prepared in GitHub-compatible structure
[x] Handover initial prepared
[ ] Files committed in GitHub
[ ] Manifest validated
[ ] Component payload built
[ ] Draft created in Supabase
[ ] Components registered
[ ] State moved to scaffolded
[ ] State moved to components_registered
[ ] State moved to pending_final_validation
[x] activation_guarded remains true in manifest
[x] Secrets not exposed in GitHub
[ ] Verification SQL generated/reviewed
```

## Checklist before final tests

```text
[ ] Handover updated
[ ] automation_registry reviewed
[ ] agent_registry reviewed
[ ] skill_registry reviewed
[ ] deployment_configs reviewed without secret values
[ ] automation_rules reviewed
[ ] audit_logs reviewed
[ ] no stuck tasks
[ ] final tests explicitly authorized by user
```

## Checklist after final tests

```text
[ ] local test result documented
[ ] runtime_events documented
[ ] execution_tasks documented
[ ] audit_logs documented
[ ] errors or fallback documented
[ ] activation decision recorded
```

## Checklist before activation

```text
[ ] final_tests_passed = true
[ ] runtime_events_reviewed = true
[ ] execution_tasks_reviewed = true
[ ] audit_logs_reviewed = true
[ ] handover_updated = true
[ ] status can move to validated
[ ] activation explicitly approved
```

## Rollback notes

```text
rollback_target_state = paused
rollback_script = scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
rollback_requires_user_authorization = true
```

## Security notes

- Do not document real secret values.
- Secrets live in Supabase Secrets or secure environment only.
- GitHub stores code, docs, manifests, skills, rules, scripts and handovers.
- Supabase stores runtime state, logs, events, tasks and registry metadata.
- Keep activation_guarded true during construction.
