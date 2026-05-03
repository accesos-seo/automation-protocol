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
verification_sql_script = built
handover_checklist = built
ai_handover = built
```

## Lectura rápida

Para entender el estado actual del sistema:

```text
README.md
docs/01-ai-context-router.md
docs/00-index.md
docs/24-ai-handover-next-steps.md
docs/18-shared-automation-build-pipeline.md
docs/19-shared-automation-operational-flow.md
docs/20-shared-automation-powershell-operator-guide.md
```

## Ruta oficial para crear una nueva automatización compartida

Leer en este orden:

```text
1. docs/01-ai-context-router.md
2. docs/24-ai-handover-next-steps.md
3. docs/18-shared-automation-build-pipeline.md
4. docs/19-shared-automation-operational-flow.md
5. docs/20-shared-automation-powershell-operator-guide.md
6. docs/23-shared-automation-handover-checklist.md
7. automations/_template/README.md
8. handover/_template-AUTOMATION-HANDOVER.md
```

Scripts asociados:

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
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

Define la evidencia mínima que debe quedar documentada por cada automatización.

### 24 - AI Handover and Next Steps

```text
docs/24-ai-handover-next-steps.md
```

Define instrucciones para una nueva IA, estado actual, rutas de contexto y próximos pasos.

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
handover/_template-AUTOMATION-HANDOVER.md
examples/shared-automation/example-manifest.json
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
crear script PowerShell New-SharedAutomationHandover.ps1
actualizar handover/_template-AUTOMATION-HANDOVER.md
actualizar docs/23 con el nuevo script
crear script para preparar carpeta automations/{automation_key} localmente
```
