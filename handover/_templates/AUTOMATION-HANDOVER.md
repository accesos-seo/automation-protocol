# Automation Handover Template

Canonical template path for automation handovers.

Expected generated file path:

```text
handover/automations/{automation_key}-HANDOVER.md
```

Minimum sections:

```text
Identity
Current build state
GitHub evidence
Supabase evidence
Registered components
Verification SQL
Checklist before pending_final_validation
Checklist before final tests
Checklist after final tests
Checklist before activation
Rollback notes
Security notes
```

Security rules:

```text
activation_guarded = true during construction
final_tests require explicit user authorization
controlled_activation requires explicit user authorization
real secrets must not be stored in GitHub
```

For the full previous template content, see the repository history for `handover/_template-AUTOMATION-HANDOVER.md` before the handover folder reorganization.
