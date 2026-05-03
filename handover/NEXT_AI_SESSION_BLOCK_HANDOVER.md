# Next AI Session Block Handover

## Purpose

Give a new ChatGPT/AI session enough context to continue `automation-protocol` without rereading the full repository.

This handover also documents the preferred working style: execute approved blocks of tasks rather than stopping after every small operation.

## Read first

```text
README.md
docs/01-ai-context-router.md
docs/00-index.md
docs/25-ai-block-execution-procedure.md
handover/example-shared-automation-HANDOVER.md
```

Do not load final-test or activation docs unless the user explicitly authorizes that phase.

## Current repository

```text
repository = accesos-seo/automation-protocol
main_commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
```

## Current completed work

```text
PR #6 merged: shared automation handover generator and example
PR #7 merged: post-merge documentation status cleanup
New-SharedAutomationHandover.ps1 is in main
example-shared-automation is in main
```

## Supabase registration completed

The example automation has been registered in the shared Supabase project.

```text
automation_key = example-shared-automation
automation_id = e4b53127-2a30-489b-8253-4d1a659f68c0
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
```

Created or verified records:

```text
automation_registry = 1
agent_registry = 1
skill_registry = 1
deployment_configs = 1
automation_rules = 1
runtime_events = 1
execution_tasks = 1
audit_logs = 1
```

Important IDs:

```text
agent_id = a14c94de-f683-42e8-8e1e-ea89511804f0
skill_id = 0b90a73e-c721-40b8-8938-8de3de6bc54b
deployment_config_id = 75ef3548-4655-48b3-847c-d5fa816ed753
automation_rule_id = d2fb22f9-7206-44d7-9438-570a03cb94a8
execution_task_id = 2112c12f-20c7-4d23-942f-323b6eed210e
runtime_event_id = ee6c74e3-82f1-4c65-a195-40f5208d1a46
audit_log_id = c526e8f3-4652-491f-afb4-61d6f179624f
```

## Current safety status

```text
final_tests = not_executed
activation = not_executed
activation_guarded = true
controlled_activation = not_authorized
secrets_stored = false
new_supabase_project_created = false
```

`OPENROUTER_API_KEY` is only a secret reference in `deployment_configs`; no real secret value was stored.

## Preferred block execution method

Use blocks of:

```text
5 to 9 tasks
```

Maximum comfortable block:

```text
12 tasks
```

Stop before:

```text
final tests
activation
activation_guarded = false
secret storage
direct main writes
new Supabase project creation
destructive changes
```

Use GitHub branch + PR for repository updates.
Use small auditable SQL statements for Supabase if larger blocks are blocked by connector safety controls.

## Next recommended block

Execute a documentation sync block:

```text
1. Create a branch for handover sync.
2. Update handover/example-shared-automation-HANDOVER.md with Supabase IDs.
3. Update docs/00-index.md if needed to reference docs/25-ai-block-execution-procedure.md.
4. Update docs/01-ai-context-router.md if needed to route block-execution/handover tasks.
5. Open PR.
6. Merge PR after user approval.
```

Do not run final tests or activation in that block.

## Block after that

Prepare final validation package, but do not execute final tests:

```text
1. Generate verification SQL.
2. Verify Supabase records.
3. Check for stuck execution_tasks.
4. Check runtime_events and audit_logs.
5. Update handover with verification result.
6. Ask user for separate authorization before final tests.
```

## Forbidden without explicit separate authorization

```text
Invoke-SharedAutomationFinalTests.ps1
create-shared-automation-local-test
Enable-SharedAutomationControlledActivation.ps1
activation_guarded = false
status = active
```
