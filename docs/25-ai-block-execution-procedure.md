# 25 - AI Block Execution Procedure

## Purpose

Define how an AI agent should work in execution blocks without stopping after every small task, while preserving safety, traceability and user control.

## Core autonomy rule

The AI must not ask the user how many microtasks to execute inside an already approved operating phase.

The AI must decide the block size by reading this document, classifying the work type, executing the safe amount of tasks, and reporting only after the block is complete.

## No-repeat-confirmation rule

When a user approves or orders a working block with language such as `hazlo`, `continúa`, `monta`, `sigue`, `ejecuta`, `vamos` or equivalent, the AI must not ask again for routine implementation actions that are already inside the approved scope.

The following actions are explicitly automatic and must be performed without additional confirmation when needed by the block:

```text
add_supabase_script
create_github_file_in_repository
create_pull_request_in_github_repository
create_or_update_github_readme
add_comment_to_github
```

Reference policy:

```text
docs/26-ai-autonomous-action-allowlist.md
```

## Autonomous sizing matrix

```text
pure_read_only = up to 12 tasks
supabase_verification_read_only = up to 12 tasks
mostly_read_with_light_documentation = 8 to 10 tasks
documentation_only = 5 to 10 tasks
github_write_docs_only = 5 to 8 tasks
github_write_code_or_scripts = 4 to 6 tasks
supabase_registration = 5 to 9 tasks
mixed_github_and_supabase = 5 to 7 tasks
high_risk_runtime = 1 to 3 tasks only
```

## Mixed work rule

When a block contains different task types, use the most restrictive category.

Examples:

```text
12 read tasks -> allowed
8 reads + 2 doc updates -> 8 to 10 tasks
4 doc updates + PR + merge -> 5 to 8 tasks
3 Supabase inserts + 3 verification queries -> 5 to 9 tasks
3 GitHub writes + 3 Supabase writes -> 5 to 7 tasks
final test or activation -> separate high-risk block only
```

## Block planning algorithm

Before executing, the AI must:

```text
1. List the requested and logically necessary tasks internally.
2. Remove forbidden tasks unless separately authorized.
3. Classify each task: read, docs, GitHub write, Supabase write, high-risk runtime.
4. Select the most restrictive matching category.
5. Trim the block to the allowed range.
6. Execute in dependency order.
7. Save remaining tasks for the next block.
```

The AI should not present this internal task list for user confirmation unless a new approval boundary is reached.

## Standard operating rhythm

```text
1. Determine task category from this document.
2. Select block size automatically.
3. Present the block only when a new approval boundary is needed.
4. Execute the full approved block without stopping after each small task.
5. Report outcome with evidence IDs.
6. Present the next recommended block.
```

## Category rules

### Read-only

```text
limit = up to 12 tasks
examples = read files, inspect PRs, verify manifests, check logs, prepare payloads, summarize status
```

### Documentation

```text
limit = 5 to 10 tasks
examples = create docs, update handovers, update README minimally, open PR, add GitHub comment
```

### GitHub write

```text
limit = 5 to 8 tasks for docs
limit = 4 to 6 tasks for code/scripts
rules = branch + PR, never direct main, small commits, report PR/commit IDs
automatic = create files, create or update README, create PR, add relevant GitHub comments
```

### Supabase registration

```text
limit = 5 to 9 tasks
rules = use project_ref lwurzjrghzwzxbhrulyn, no new project, no real secrets, keep activation_guarded true
automatic = add Supabase scripts or non-destructive SQL needed for the approved block
```

### High-risk runtime

```text
limit = 1 to 3 tasks
requires = separate explicit authorization
examples = final tests, activation, rollback, destructive schema migrations, Edge Function deployment
```

## Automatic stop conditions

Stop and report if an action would:

```text
store or expose a real secret
execute final tests without explicit authorization
activate automation without explicit authorization
set activation_guarded = false
create a new Supabase project
write directly to main
delete records or code
modify production runtime outside scope
require unapproved platform permission
repeat a blocked tool action
```

## Approval model

A user `go`, `vamos`, `hazlo`, `continúa`, `monta`, `sigue` or `ejecuta` approves the declared or logically implied block scope.

It also approves routine implementation actions listed in:

```text
docs/26-ai-autonomous-action-allowlist.md
```

It does not approve:

```text
final tests
activation
secret storage
new Supabase project creation
direct main writes
destructive changes
```

## Current project defaults

```text
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
activation_guarded = true
final_tests = deferred
controlled_activation = not_authorized
secrets_location = Supabase Secrets or secure environment only
```

## Connector behavior

```text
GitHub = branch + PR, create files/README/PR/comments automatically within approved scope
Supabase = prefer small auditable SQL statements, add scripts automatically within approved scope
large blocked write = retry once smaller, then stop and report
```

## Success definition

```text
all allowed tasks completed
state verified
no forbidden action occurred
handover/docs updated when needed
next block clear
```
