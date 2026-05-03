# Example Shared Automation - Operational Handover

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
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
final_tests = not_executed
controlled_activation = not_authorized
```

## GitHub evidence

```text
branch = ai-reorganize-handovers
main_commit_sha = 292928f937c5dc5be9add37a8c793f034d425b8d
registered_commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
manifest_path = automations/example-shared-automation/deployment/manifest.json
readme_path = automations/example-shared-automation/README.md
handover_path = handover/automations/example-shared-automation-HANDOVER.md
```

## Supabase evidence

```text
automation_id = e4b53127-2a30-489b-8253-4d1a659f68c0
agent_id = a14c94de-f683-42e8-8e1e-ea89511804f0
skill_id = 0b90a73e-c721-40b8-8938-8de3de6bc54b
deployment_config_id = 75ef3548-4655-48b3-847c-d5fa816ed753
automation_rule_id = d2fb22f9-7206-44d7-9438-570a03cb94a8
execution_task_id = 2112c12f-20c7-4d23-942f-323b6eed210e
runtime_event_id = ee6c74e3-82f1-4c65-a195-40f5208d1a46
audit_log_id = c526e8f3-4652-491f-afb4-61d6f179624f
```

## Registered components

```text
agent = orchestrator
skill = intake-analysis
config = OPENROUTER_API_KEY reference only; no secret value in GitHub
rule = default-runtime-route
```

## Checklist before pending_final_validation

```text
[x] Scaffold files prepared
[x] Handover initial prepared
[x] Files committed in GitHub
[x] Draft created in Supabase
[x] Components registered
[x] State moved to pending_final_validation
[x] activation_guarded remains true
[x] Secrets not exposed in GitHub
[ ] Verification SQL final generated/reviewed
```

## Pending blocks

```text
1. Update references to new handover paths.
2. Run non-destructive verification SQL.
3. Document verification result.
```

## Prohibited without explicit separate authorization

```text
Invoke-SharedAutomationFinalTests.ps1
create-shared-automation-local-test
Enable-SharedAutomationControlledActivation.ps1
activation_guarded = false
status = active
store real secrets
create new Supabase project
delete runtime records
```
