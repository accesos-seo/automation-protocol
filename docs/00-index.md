# 00 - Documentation Index

## Propósito

Índice maestro de documentación del protocolo de automatizaciones y del runtime compartido Supabase.

Este índice organiza la lectura por orden operativo, no solo por número de archivo.

## Estado actual del protocolo

```text
status = phase_3_runtime_hardening_validated
runtime_state = active
runtime_health = healthy
shared_runtime = built
final_tests_for_new_automations = deferred
powershell_scripts = built
handover_generator = built
verification_sql_script = built
handover_checklist = built
ai_handover = built
block_execution_procedure = built
autonomous_action_allowlist = built
example_shared_automation = registered_pending_final_validation
whatsapp_meta_pattern = documented
```

## Lectura rápida

Para entender el estado actual del sistema:

```text
README.md
docs/01-ai-context-router.md
docs/00-index.md
docs/24-ai-handover-next-steps.md
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
docs/18-shared-automation-build-pipeline.md
docs/19-shared-automation-operational-flow.md
docs/20-shared-automation-powershell-operator-guide.md
```

Para automatizaciones de WhatsApp/Meta, leer adicionalmente:

```text
docs/27-whatsapp-meta-automation-pattern.md
```

## Política de autonomía IA

Antes de ejecutar bloques operativos, la IA debe atender:

```text
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
docs/01-ai-context-router-autonomy-addendum.md
```

Acciones automáticas dentro de un bloque aprobado:

```text
add_supabase_script
create_github_file_in_repository
create_pull_request_in_github_repository
create_or_update_github_readme
add_comment_to_github
```

Estas acciones no requieren nueva pregunta al usuario cuando son necesarias para cumplir el bloque aprobado. La IA debe ejecutarlas, registrar evidencia y reportar al cierre del bloque.

## Ruta oficial para crear una nueva automatización compartida

Leer en este orden:

```text
1. docs/01-ai-context-router.md
2. docs/25-ai-block-execution-procedure.md
3. docs/26-ai-autonomous-action-allowlist.md
4. docs/24-ai-handover-next-steps.md
5. docs/18-shared-automation-build-pipeline.md
6. docs/19-shared-automation-operational-flow.md
7. docs/20-shared-automation-powershell-operator-guide.md
8. docs/23-shared-automation-handover-checklist.md
9. automations/_template/README.md
10. handover/_templates/AUTOMATION-HANDOVER.md
```

Si la automatización usa WhatsApp, Meta Cloud API o webhook de entrega, agregar:

```text
11. docs/27-whatsapp-meta-automation-pattern.md
```

Scripts asociados:

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

## Ruta de pruebas finales

Leer solo cuando termine la construcción y se autorice el cierre de pruebas:

```text
1. docs/17-deferred-final-test-plan.md
2. docs/21-shared-automation-final-test-closeout-guide.md
3. docs/22-shared-automation-controlled-activation-checklist.md
4. docs/23-shared-automation-handover-checklist.md
```

Scripts asociados:

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

## Documentos principales del runtime compartido

### 01 - AI Context Router

```text
docs/01-ai-context-router.md
```

Define qué documentos mínimos debe cargar una IA según intención.

### 17 - Deferred Final Test Plan

```text
docs/17-deferred-final-test-plan.md
```

Define la decisión operativa de diferir pruebas hasta el final.

### 18 - Shared Automation Build Pipeline

```text
docs/18-shared-automation-build-pipeline.md
```

Define arquitectura, funciones Edge, estados y separación lógica por `automation_key`.

### 19 - Shared Automation Operational Flow

```text
docs/19-shared-automation-operational-flow.md
```

Define el orden exacto de llamadas para construir nuevas automatizaciones.

### 20 - Shared Automation PowerShell Operator Guide

```text
docs/20-shared-automation-powershell-operator-guide.md
```

Guía de ejecución desde PowerShell con payloads, scripts oficiales y consultas SQL no destructivas.

### 21 - Final Test Closeout Guide

```text
docs/21-shared-automation-final-test-closeout-guide.md
```

Define el cierre de pruebas finales y verificación SQL/runtime.

### 22 - Controlled Activation Checklist

```text
docs/22-shared-automation-controlled-activation-checklist.md
```

Define validación, activación controlada, monitoreo inicial y rollback a `paused`.

### 23 - Shared Automation Handover Checklist

```text
docs/23-shared-automation-handover-checklist.md
```

Define la evidencia mínima que debe quedar documentada por cada automatización y referencia el generador de handover.

### 24 - AI Handover and Next Steps

```text
docs/24-ai-handover-next-steps.md
```

Define instrucciones para una nueva IA, estado actual, rutas de contexto y próximos pasos.

### 25 - AI Block Execution Procedure

```text
docs/25-ai-block-execution-procedure.md
```

Define cómo ejecutar bloques sin detenerse en cada microtarea, manteniendo controles de seguridad.

### 26 - AI Autonomous Action Allowlist

```text
docs/26-ai-autonomous-action-allowlist.md
```

Define acciones automáticas que la IA debe ejecutar sin volver a preguntar dentro de un bloque aprobado.

### 27 - WhatsApp Meta Automation Pattern

```text
docs/27-whatsapp-meta-automation-pattern.md
```

Define el patrón general para automatizaciones WhatsApp/Meta con cola auditable, `pg_cron`, `pg_net`, Edge Functions, webhook de estados, dashboard, deduplicación, hardening y migración desde implementaciones legacy de envío directo.

## Funciones Edge del pipeline compartido

```text
generate-shared-automation-scaffold
validate-shared-automation-manifest
build-components-payload-from-manifest
build-shared-automation-draft
create-shared-automation
register-shared-automation-components
update-shared-automation-build-state
create-shared-automation-local-test
```

## Scripts PowerShell oficiales

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
```

## Plantillas y ejemplos

```text
automations/_template/README.md
automations/_template/agents/orchestrator.md
automations/_template/skills/intake-analysis/SKILL.md
automations/_template/routing-rules/default-runtime-route.json
automations/_template/deployment/manifest.json
automations/example-shared-automation/README.md
automations/example-shared-automation/deployment/manifest.json
handover/README.md
handover/_templates/AUTOMATION-HANDOVER.md
handover/automations/example-shared-automation-HANDOVER.md
handover/ai-sessions/NEXT_AI_SESSION_BLOCK_HANDOVER.md
examples/shared-automation/example-manifest.json
```

## Diagnóstico de escritura GitHub

```text
branch diagnóstica = test/ai-write-diagnostic
PR diagnóstica = #4 draft
resultado = create_branch, create_file y create_pull_request OK
rama preferida bloqueada = feature/shared-automation-handover
rama alternativa usada = ai-shared-automation-handover
PR final mergeado = #6
resultado script handover = New-SharedAutomationHandover.ps1 aplicado correctamente con escritura segura reducida
```

## Registro Supabase actual

```text
automation_key = example-shared-automation
automation_id = e4b53127-2a30-489b-8253-4d1a659f68c0
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
final_tests = not_executed
activation = not_executed
```

## Estados de automatización compartida

```text
draft_scaffold_generated
scaffolded
components_registered
pending_final_validation
validated
active
paused
```

## Regla de seguridad

Durante construcción:

```text
activation_guarded = true
```

No activar hasta tener:

```text
final_tests_passed = true
runtime_events_reviewed = true
execution_tasks_reviewed = true
audit_logs_reviewed = true
handover_updated = true
```

## Separación de responsabilidades

GitHub:

```text
código
documentación
skills
manifests
routing rules
handover
plantillas
scripts PowerShell
examples
```

Supabase:

```text
automation_registry
agent_registry
skill_registry
deployment_configs
automation_rules
audit_logs
runtime_events
execution_tasks
```

Secrets:

```text
Supabase Secrets o entorno seguro
nunca GitHub
nunca tablas públicas
```

## Próximo bloque recomendado

Continuar con:

```text
verificación SQL no destructiva
preparar paquete de final validation sin ejecutar pruebas finales
mantener final tests diferidos
mantener activation_guarded = true
```
