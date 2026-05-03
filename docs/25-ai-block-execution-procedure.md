# 25 - AI Block Execution Procedure

## Purpose

Define how an AI agent should work in execution blocks without stopping after every small task, while preserving safety, traceability and user control.

This procedure is intended for long operational sessions involving GitHub, Supabase and automation lifecycle tasks.

## Recommended block size

Default comfortable block:

```text
5 to 9 tasks per block
```

Maximum recommended block:

```text
12 tasks per block
```

Do not exceed 12 operational tasks in a single block unless the tasks are read-only or purely documentary.

## Why this range

A block of 5 to 9 tasks is large enough to avoid exhausting step-by-step approval fatigue, but small enough to keep:

```text
context clear
state auditable
errors isolated
rollback possible
security boundaries intact
```

## Block categories

### Safe read-only block

Can include up to 12 tasks.

Examples:

```text
read files
inspect PRs
verify manifests
check logs
prepare payloads
summarize status
```

### Documentation block

Can include 5 to 10 tasks.

Examples:

```text
create docs
update handovers
update README minimally
open PR
merge PR after approval
```

### GitHub write block

Can include 5 to 8 tasks.

Examples:

```text
create branch
create files
update docs
open PR
review diff
merge PR if explicitly approved
```

Rules:

```text
never write directly to main
use branch + PR
prefer small commits
report final commit/PR IDs
```

### Supabase registration block

Can include 5 to 9 tasks.

Examples:

```text
verify project
check existing records
insert automation_registry
insert agent_registry
insert skill_registry
insert deployment_configs
insert automation_rules
insert audit/runtime/task evidence
verify counts
```

Rules:

```text
no new Supabase project
use project_ref = lwurzjrghzwzxbhrulyn
no real secrets in tables
keep activation_guarded = true
stop before final tests
stop before activation
```

### High-risk runtime block

Requires separate explicit authorization and should be smaller: 1 to 3 tasks.

Examples:

```text
final runtime tests
controlled activation
disable or pause automation
rollback
schema migrations
Edge Function deployment
```

## Standard block protocol

Before executing a block, the AI should state:

```text
block_goal
scope
allowed systems
forbidden actions
expected outputs
```

During execution, the AI should:

```text
execute tasks sequentially
continue after successful tasks
use small safe operations when tools block larger operations
not stop for every successful step
stop only on safety boundary, missing permission, destructive risk or unclear authorization
```

After execution, the AI should report:

```text
tasks completed
records/files changed
IDs created
state reached
errors or tool limitations
next recommended block
```

## Automatic stop conditions

The AI must stop and report before continuing if any of the following occur:

```text
action would expose or store a real secret
action would execute final tests without explicit authorization
action would activate automation without explicit authorization
action would set activation_guarded = false
action would create a new Supabase project
action would write directly to main
action would delete records or code
action would modify production runtime outside the requested block
action requires credentials the user has not approved in the platform UI
tool safety controls block repeated attempts
```

## Approval model

The user can approve a whole block with:

```text
go
vamos
hazlo
continúa
```

That approval applies only to the declared block scope.

It does not imply permission for:

```text
final tests
activation
secret storage
new Supabase project creation
direct main writes
destructive changes
```

## Recommended operating rhythm

Use this cycle:

```text
1. Present next block of 5 to 9 tasks.
2. Wait for user go.
3. Execute the full block without stopping after each small task.
4. Report outcome with evidence IDs.
5. Present next block.
```

## Current project safety defaults

```text
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
activation_guarded = true
final_tests = deferred
controlled_activation = not_authorized
secrets_location = Supabase Secrets or secure environment only
```

## Current known connector behavior

GitHub writes should use:

```text
branch + PR
```

Avoid direct writes to `main`.

If a large write is blocked, retry once with a smaller safe write. If it still fails, stop and report the exact blocked operation.

Supabase SQL should prefer small, auditable statements over large transactions when connector filters block large payloads.

## Success definition

A block is successful when:

```text
all allowed tasks completed
state is verified
no forbidden action occurred
handover or documentation is updated when needed
next block is clear
```
