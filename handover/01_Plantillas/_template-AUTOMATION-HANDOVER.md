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

## GitHub evidence

```text
branch = REPLACE_WITH_BRANCH
commit_sha = REPLACE_WITH_COMMIT_SHA
manifest_path = automations/REPLACE_WITH_AUTOMATION_KEY/deployment/manifest.json
readme_path = automations/REPLACE_WITH_AUTOMATION_KEY/README.md
handover_path = handover/Registros_Historicos/YYYY/MM-Mes/YYYY-MM-DD_HH-MM_ContextoDelHandover.md
```

## Supabase evidence

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
[ ] user explicitly authorized final tests
```

## Security notes

- Do not document real secret values.
- Secrets live in Supabase Secrets or secure environment only.
- Keep `activation_guarded = true` during construction.
