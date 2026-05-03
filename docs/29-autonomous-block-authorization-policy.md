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

The AI is empowered to create repository files, branches, pull requests, operational metadata and new database tables when they are needed to complete the approved block.

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
CREATE TABLE when a new table is required by the approved block
CREATE INDEX when needed for the new or existing table design
COMMENT ON TABLE/COLUMN for documentation
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

## Explicit empowerment rule

The AI has standing authorization to perform these actions without asking again when they are necessary for the approved block:

```text
create any needed file in the GitHub repository
create a dedicated GitHub branch
create a GitHub pull request
create a new Supabase table when the table is required by the architecture or by the approved work block
create supporting indexes for that table
create comments/documentation for that table
```

The reason is operational: the AI has the project context and is expected to make the needed implementation decisions inside the approved scope.

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

## GitHub minimum action standard

For GitHub, the AI should not ask for permission for routine repository operations inside an approved block.

Minimum expected GitHub actions:

```text
1. Create a dedicated branch.
2. Create or update every repository file needed by the block.
3. Make the required documentation/script/manifest/code changes.
4. Add or update handover evidence.
5. Open a pull request.
6. Report branch, PR number, files changed and next block.
```

The AI must not write directly to `main` unless the user explicitly authorizes it and the repository policy allows it.

## Supabase minimum action standard

For Supabase, the AI should not ask for permission for routine registry, verification and table-creation operations inside an approved block.

Minimum expected Supabase actions:

```text
1. Run read-only verification first.
2. Apply only the non-destructive INSERT/UPDATE operations needed by the approved block.
3. Create a new table if the approved block requires one and no suitable table exists.
4. Create supporting indexes/comments for the new table when appropriate.
5. Verify resulting rows and table existence.
6. Verify Storage if packages were uploaded.
7. Record evidence in handover documentation.
```

## Table creation guardrails

Creating a new table is authorized when it is needed, but it must follow these guardrails:

```text
use IF NOT EXISTS when practical
prefer additive schema design
include created_at/updated_at when useful
include automation_key or project scoping when relevant
avoid storing real secrets
avoid destructive migrations
verify information_schema after creation
document the table purpose and columns
record evidence in a handover
```

## Reporting rule

The AI should report after completing the block, not after each micro-action.

A report must include:

```text
what changed
where it changed
PR number or branch when applicable
Supabase records changed when applicable
Supabase tables created when applicable
Storage paths when applicable
what was not executed
next recommended block
```

## Safety default

If an action is ambiguous, classify it as follows:

```text
read-only = safe
GitHub branch/PR/docs/files = safe
metadata INSERT/UPDATE = safe when scoped to the approved block
CREATE TABLE = safe when scoped to the approved block and non-destructive
Storage upload of generated skill packages = safe when scoped to the approved block
secrets/destructive/activation/cost/breaking schema changes = stop and ask
```

## Applicability

This policy applies to this repository and should be copied forward to future automation projects unless the user defines stricter rules.
