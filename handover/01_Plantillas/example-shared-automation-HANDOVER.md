# Example Shared Automation - Example Handover Template

## Purpose

Reusable example for a shared automation handover. This file is a template/example, not the canonical historical execution record.

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

## Expected state before final validation

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
final_tests = not_executed
controlled_activation = not_authorized
```

## Historical record naming rule

When this becomes a real execution handover, save it under:

```text
handover/Registros_Historicos/YYYY/MM-Mes/YYYY-MM-DD_HH-MM_ContextoDelHandover.md
```

## Security notes

```text
No real secrets in GitHub.
No final tests without explicit authorization.
No activation without explicit authorization.
```
