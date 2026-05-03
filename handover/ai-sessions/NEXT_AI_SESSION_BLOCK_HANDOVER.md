# Next AI Session Block Handover

## Regla de idioma obligatoria

Responder siempre al usuario en español.

## Leer primero

```text
README.md
docs/01-ai-context-router.md
docs/00-index.md
docs/25-ai-block-execution-procedure.md
handover/README.md
handover/ai-sessions/NEXT_AI_SESSION_BLOCK_HANDOVER.md
handover/automations/example-shared-automation-HANDOVER.md
```

## Repositorio actual

```text
repository = accesos-seo/automation-protocol
main_commit_sha = 292928f937c5dc5be9add37a8c793f034d425b8d
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
```

## Punto exacto de detención

```text
example-shared-automation está registrada en Supabase
estado = pending_final_validation
handover reorganizado en carpetas exclusivas en rama ai-reorganize-handovers
verificación SQL final aún no se ha ejecutado
pruebas finales aún no se han ejecutado
activación aún no se ha ejecutado
```

## Estado de seguridad actual

```text
final_tests = not_executed
activation = not_executed
activation_guarded = true
controlled_activation = not_authorized
secrets_stored = false
new_supabase_project_created = false
```

## Bloque siguiente recomendado

Actualizar referencias a las nuevas rutas:

```text
handover/_templates/AUTOMATION-HANDOVER.md
handover/automations/example-shared-automation-HANDOVER.md
handover/ai-sessions/NEXT_AI_SESSION_BLOCK_HANDOVER.md
```

Archivos candidatos:

```text
docs/00-index.md
docs/01-ai-context-router.md
docs/23-shared-automation-handover-checklist.md
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
README.md
```

## Prohibido sin autorización separada explícita

```text
Invoke-SharedAutomationFinalTests.ps1
create-shared-automation-local-test
Enable-SharedAutomationControlledActivation.ps1
activation_guarded = false
status = active
crear proyecto Supabase nuevo
guardar secretos reales
borrar registros
escribir directo a main
```
