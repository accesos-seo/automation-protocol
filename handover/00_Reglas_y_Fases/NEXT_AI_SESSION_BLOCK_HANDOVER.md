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
handover/00_Reglas_y_Fases/NEXT_AI_SESSION_BLOCK_HANDOVER.md
handover/01_Plantillas/_template-AUTOMATION-HANDOVER.md
```

## Repositorio actual

```text
repository = accesos-seo/automation-protocol
main_commit_sha = 43d16a2b0b04189cb3066e81811353ddb09c8187
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
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

## Regla de organización de handovers

```text
handover/00_Reglas_y_Fases/        reglas, fases, configuración y continuidad de IA
handover/01_Plantillas/            plantillas y ejemplos reutilizables
handover/Registros_Historicos/     handovers reales ejecutados, ordenados por año y mes
```

## SOP para registros históricos

Guardar cada handover real en:

```text
handover/Registros_Historicos/YYYY/MM-Mes/YYYY-MM-DD_HH-MM_ContextoDelHandover.md
```

Ejemplo:

```text
handover/Registros_Historicos/2026/05-Mayo/2026-05-03_19-30_Handover_Reorganizacion.md
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
borrar registros runtime
escribir directo a main
```
