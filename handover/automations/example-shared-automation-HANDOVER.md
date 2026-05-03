# Example Shared Automation - Operational Handover

## Context router reference

Read first:

```text
docs/01-ai-context-router.md
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
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
handover_path = handover/automations/example-shared-automation-HANDOVER.md
```

## Current build state

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
final_tests = deferred
controlled_activation = not_authorized
```

## GitHub evidence

```text
branch = ai/reorganize-handovers-autonomy-block
commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
main_commit_sha = 43d16a2b0b04189cb3066e81811353ddb09c8187
manifest_path = automations/example-shared-automation/deployment/manifest.json
readme_path = automations/example-shared-automation/README.md
agent_paths = automations/example-shared-automation/agents/orchestrator.md
skill_paths = automations/example-shared-automation/skills/intake-analysis/SKILL.md
routing_rules_path = automations/example-shared-automation/routing-rules/default-runtime-route.json
handover_generator_path = scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
handover_path = handover/automations/example-shared-automation-HANDOVER.md
```

## Autonomous execution policy

```text
Routine GitHub file creation, pull request creation, README updates, GitHub comments and Supabase-script additions are automatic inside an approved block.
Policy source = docs/26-ai-autonomous-action-allowlist.md
```

## Supabase evidence

Registration executed in shared Supabase runtime:

```text
automation_id = e4b53127-2a30-489b-8253-4d1a659f68c0
agent_ids = a14c94de-f683-42e8-8e1e-ea89511804f0
skill_ids = 0b90a73e-c721-40b8-8938-8de3de6bc54b
config_ids = 75ef3548-4655-48b3-847c-d5fa816ed753
rule_ids = d2fb22f9-7206-44d7-9438-570a03cb94a8
audit_log_ids = c526e8f3-4652-491f-afb4-61d6f179624f
runtime_event_ids = ee6c74e3-82f1-4c65-a195-40f5208d1a46
execution_task_ids = 2112c12f-20c7-4d23-942f-323b6eed210e
```

## Registered components

```text
agent = orchestrator
skill = intake-analysis
config = OPENROUTER_API_KEY managed in Supabase Secrets or secure environment
rule = default-runtime-route
```

## Verification SQL

Non-destructive verification executed from Supabase connector.

Result summary:

```text
automation_registry_reviewed = true
agent_registry_reviewed = partially_reviewed_by_count_or_schema
skill_registry_reviewed = partially_reviewed_by_count_or_schema
deployment_configs_reviewed = partially_reviewed_without_secret_values
automation_rules_reviewed = partially_reviewed_by_count_or_schema
audit_logs_reviewed = partially_reviewed_by_entity_id
runtime_events_reviewed = partially_reviewed_by_count_or_schema
execution_tasks_reviewed = partially_reviewed_by_count_or_schema
stuck_tasks_task_status = 0
automation_status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
```

Connector note:

```text
A first multi-result query exposed schema mismatches for runtime_events.status and audit_logs.automation_key.
The verification was retried with schema-aware non-destructive SQL.
The Supabase connector returned the final automation state and stuck_tasks_task_status = 0.
```

## Checklist before pending_final_validation

```text
[x] Scaffold files prepared in GitHub-compatible structure
[x] Handover initial prepared
[x] Files committed in GitHub branch
[x] Manifest validated
[x] Component payload built
[x] Draft created in Supabase
[x] Components registered
[x] State moved to scaffolded
[x] State moved to components_registered
[x] State moved to pending_final_validation
[x] activation_guarded remains true in manifest
[x] Secrets not exposed in GitHub
[x] Verification SQL generated/reviewed
```

## Checklist before final tests

```text
[x] Handover updated with Supabase registration IDs
[x] automation_registry reviewed
[x] agent_registry partially reviewed
[x] skill_registry partially reviewed
[x] deployment_configs reviewed without secret values
[x] automation_rules partially reviewed
[x] audit_logs partially reviewed
[x] no stuck tasks
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
