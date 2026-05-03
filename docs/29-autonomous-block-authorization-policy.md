# Autonomous Block Authorization Policy

## Purpose

Establish a permanent execution policy for AI agents working on this protocol and future projects.

The AI must work by approved blocks, not by asking the user to confirm every micro-action.

This applies to both:

```text
GitHub operations
Supabase operations
```

## Core rule

When the user approves a block with language such as `go`, `continua`, `hazlo`, `sigue`, or an equivalent instruction, the AI must execute all safe actions needed to complete that block without asking for repeated confirmation.

The AI should only stop for destructive, high-risk, secret-related, cost-related, or activation-related actions.

## Actions authorized without repeated confirmation

The following actions are considered safe once they are part of an approved block.

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
create documentation files
update documentation files
create or update handovers
create scripts
update scripts when non-destructive
generate manifests
generate checksums
commit documentation evidence to a branch
open PRs for review
```

### Skills and Storage safe actions

```text
package skills
generate skill.zip bundles
generate SHA256SUMS
generate package manifests
upload skill packages to Supabase Storage bucket skills
verify uploaded storage.objects
document storage evidence
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
modificar esquemas DDL
alterar politicas RLS
activar automatizaciones
ejecutar pruebas finales runtime
cambiar activation_guarded = false
cambiar status = active
ejecutar rollback destructivo
realizar acciones con coste no aprobado
modificar datos productivos sensibles
escribir directo a main
```

## GitHub minimum action standard

For GitHub, the AI should not ask for permission for routine repository operations inside an approved block.

Minimum expected GitHub actions:

```text
1. Create a dedicated branch.
2. Make the required documentation/script/manifest changes.
3. Add or update handover evidence.
4. Open a pull request.
5. Report branch, PR number, files changed and next block.
```

The AI must not write directly to `main` unless the user explicitly authorizes it and the repository policy allows it.

## Supabase minimum action standard

For Supabase, the AI should not ask for permission for routine registry and verification operations inside an approved block.

Minimum expected Supabase actions:

```text
1. Run read-only verification first.
2. Apply only the non-destructive INSERT/UPDATE operations needed by the approved block.
3. Verify resulting rows.
4. Verify Storage if packages were uploaded.
5. Record evidence in handover documentation.
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
GitHub branch/PR/docs = safe
metadata INSERT/UPDATE = safe when scoped to the approved block
Storage upload of generated skill packages = safe when scoped to the approved block
secrets/destructive/activation/cost/schema = stop and ask
```

## Applicability

This policy applies to this repository and should be copied forward to future automation projects unless the user defines stricter rules.
