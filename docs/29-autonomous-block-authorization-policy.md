# Autonomous Block Authorization Policy

## Purpose

Establish a permanent execution policy for AI agents working on this protocol and future projects.

The AI must work by approved blocks, not by asking the user to confirm every micro-action.

This policy extends:

```text
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
```

## Core rule

When the user approves a block with language such as `go`, `continua`, `hazlo`, `sigue`, `adelante`, `ejecuta`, `monta`, or equivalent, the AI must execute all safe actions needed to complete that block without asking for repeated confirmation.

The AI should only stop for destructive, high-risk, secret-related, cost-related, or activation-related actions.

## Actions authorized without repeated confirmation

### Supabase safe actions

```text
SELECT queries
read-only audits
counts
comparisons
non-destructive verification queries
INSERT of operational metadata needed by the approved block
UPDATE of non-destructive operational metadata needed by the approved block
verifying storage.objects
verifying registry tables
verifying runtime_events
verifying execution_tasks
```

### GitHub safe actions

```text
create branches
create pull requests
create repository files
update repository files
create documentation files
update documentation files
create or update README files
create or update handovers
create scripts
update scripts when non-destructive
generate manifests
generate checksums
commit documentation evidence to a branch
open PRs for review
add comments to GitHub PRs/issues
```

### Skills and Storage safe actions

```text
package skills
generate skill.zip bundles
generate SHA256SUMS
generate package manifests
upload skill packages to Supabase Storage bucket skills when the required package files and credentials are available
verify uploaded storage.objects
document storage evidence
```

## Explicit empowerment rule

The AI has standing authorization to perform these actions without asking again when they are necessary for the approved block:

```text
create any needed file in the GitHub repository
create a dedicated GitHub branch
create a GitHub pull request
add a GitHub comment
create or update a README
add a Supabase script
run non-destructive Supabase verification SQL
```

## Actions that still require separate explicit authorization

The AI must stop and ask before executing any of these actions:

```text
DELETE
DROP
TRUNCATE
borrar objetos Storage
borrar ramas o codigo
crear proyecto Supabase nuevo
crear branch Supabase con coste
guardar secretos reales
exponer secretos
ALTER TABLE on existing production tables when it may break compatibility
DROP COLUMN
DROP TABLE
modificar politicas RLS restrictivas o productivas
activar automatizaciones
ejecutar pruebas finales runtime
cambiar activation_guarded = false
cambiar status = active
ejecutar rollback destructivo
realizar acciones con coste no aprobado
modificar datos productivos sensibles
escribir directo a main
```

## Reporting rule

The AI should report after completing the block, not after each micro-action.

A report must include:

```text
what changed
where it changed
PR number or branch when applicable
Supabase records changed when applicable
Storage paths when applicable
what was not executed
next recommended block
```

## Safety default

If an action is ambiguous, classify it as follows:

```text
read-only = safe
GitHub branch/PR/docs/files/comments = safe
metadata INSERT/UPDATE = safe when scoped to the approved block
Storage upload of generated skill packages = safe when scoped to the approved block and credentials/files are available
secrets/destructive/activation/cost/breaking schema changes = stop and ask
```
