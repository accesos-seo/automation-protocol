# 25 - AI Block Execution Procedure v2

## Purpose

Define how an AI agent must execute approved work blocks without interrupting the user for every micro-action, while preserving safety, traceability and user control.

This procedure applies to:

```text
GitHub
Supabase Database
Supabase Storage
handover documentation
skill packaging
future automation projects based on this protocol
```

## Required companion policy

Before executing work, read:

```text
docs/29-autonomous-block-authorization-policy.md
```

That policy is the canonical approval boundary for what can proceed without repeated confirmation.

## Core autonomy rule

The AI must not ask the user to confirm each small task inside an approved operating block.

A user instruction such as:

```text
go
continua
sigue
hazlo
adelante
```

approves the safe actions required by the declared or logically implied block.

## Actions that do not require repeated confirmation

Inside an approved block, the AI may execute:

```text
SELECT queries in Supabase
audits
counts
comparisons
non-destructive INSERT/UPDATE of operational metadata
create GitHub branches
create GitHub PRs
create or update documentation
create or update handovers
create scripts
generate manifests
generate checksums
package skills
upload skill packages to Supabase Storage bucket skills
verify storage.objects
document evidence
```

## Actions that require a hard stop

The AI must stop and ask separately before:

```text
DELETE
DROP
TRUNCATE
borrar Storage
store or expose secrets
create a new Supabase project
create paid Supabase branches
modify schema DDL
change RLS policies
execute final runtime tests
activate automation
set activation_guarded = false
set status = active
write directly to main
destructive rollback
cost-incurring actions
```

## GitHub minimum process

For routine GitHub changes, the AI should automatically:

```text
1. Create a branch.
2. Apply the documentation, script, manifest or handover update.
3. Open a pull request.
4. Report PR number, branch, files changed and remaining tasks.
```

Do not ask before creating branches, docs, scripts, manifests, checksums, handovers or PRs if they are part of the approved block.

## Supabase minimum process

For routine Supabase work, the AI should automatically:

```text
1. Run verification SELECT queries.
2. Apply scoped non-destructive INSERT/UPDATE operations if needed.
3. Verify the result.
4. Document evidence in handover.
```

Do not ask before SELECT, audits, counts, comparisons, registry INSERT/UPDATE, or Storage verification if they are part of the approved block.

## Storage minimum process for skills

For skills, the AI should automatically:

```text
1. Compare GitHub skills against skill_registry.
2. Register missing skill metadata when scoped to the approved block.
3. Generate skill.zip packages.
4. Generate SHA256 checksums.
5. Upload skill packages to bucket skills when tool capability is available.
6. Verify storage.objects.
7. Document evidence.
```

Do not ask for each package or each Storage verification.

## Reporting rhythm

Report only after the block is complete or blocked by a hard-stop condition.

The report must include:

```text
completed tasks
changed files
PR or branch
Supabase records changed
Storage objects changed
what was not executed
why anything was blocked
next recommended block
```

## Success definition

```text
safe block completed
state verified
handover updated
no forbidden action executed
next block clear
```
