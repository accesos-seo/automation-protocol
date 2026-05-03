# REPLACE_WITH_AUTOMATION_NAME - Operational Handover

## Context router reference

Before continuing work, read:

```text
docs/01-ai-context-router.md
docs/23-shared-automation-handover-checklist.md
```

Relevant intentions:

```text
crear | registrar | verificar | documentar
```

Do not load final-test or activation docs until the automation is in `pending_final_validation` and the user authorizes the next phase.

## Identity

```text
automation_key = REPLACE_WITH_AUTOMATION_KEY
automation_name = REPLACE_WITH_AUTOMATION_NAME
protocol_name = REPLACE_WITH_PROTOCOL_NAME
runtime = shared_supabase_runtime
project_ref = lwurzjrghzwzxbhrulyn
repository = accesos-seo/automation-protocol
repository_path = automations/REPLACE_WITH_AUTOMATION_KEY
```

## Current build state

Expected state before final tests:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
final_tests = deferred
controlled_activation = not_authorized
```

Current notes:

```text
build_notes = REPLACE_WITH_BUILD_NOTES
```

## GitHub evidence

```text
branch = REPLACE_WITH_BRANCH
commit_sha = REPLACE_WITH_COMMIT_SHA
manifest_path = automations/REPLACE_WITH_AUTOMATION_KEY/deployment/manifest.json
readme_path = automations/REPLACE_WITH_AUTOMATION_KEY/README.md
agent_paths = automations/REPLACE_WITH_AUTOMATION_KEY/agents/
skill_paths = automations/REPLACE_WITH_AUTOMATION_KEY/skills/
routing_rules_path = automations/REPLACE_WITH_AUTOMATION_KEY/routing-rules/
handover_path = handover/automations/REPLACE_WITH_AUTOMATION_KEY-HANDOVER.md
```

## Supabase evidence

Fill after draft/component registration:

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

### Agents

```text
orchestrator
```

### Skills

```text
intake-analysis
```

### Configs

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

### Routing rules

```text
default-runtime-route
```

## Verification SQL

Generate non-destructive SQL with:

```powershell
.\scripts\powershell\shared-automation\Get-SharedAutomationVerificationSql.ps1 `
  -AutomationKey "REPLACE_WITH_AUTOMATION_KEY"
```

Verification result summary:

```text
automation_registry_reviewed = false
agent_registry_reviewed = false
skill_registry_reviewed = false
deployment_configs_reviewed = false
automation_rules_reviewed = false
audit_logs_reviewed = false
runtime_events_reviewed = false
execution_tasks_reviewed = false
```

## Checklist before pending_final_validation

```text
[ ] Scaffold generated
[ ] Handover initial generated
[ ] Files created in GitHub
[ ] Manifest validated
[ ] Component payload built
[ ] Draft created in Supabase
[ ] Components registered
[ ] State moved to scaffolded
[ ] State moved to components_registered
[ ] State moved to pending_final_validation
[ ] activation_guarded remains true
[ ] Secrets not exposed in GitHub
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
[ ] LOCAL_TEST_TOKEN available only in secure environment
[ ] user explicitly authorized final tests
```

## Checklist after final tests

```text
[ ] create-shared-automation-local-test result documented
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
- Keep `activation_guarded = true` during construction.
