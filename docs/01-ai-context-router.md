# 01 - AI Context Router

## Propósito

Reducir consumo de tokens y evitar que una IA lea documentación innecesaria.

Este documento funciona como router de contexto: primero se lee este archivo, luego solo el bloque documental necesario según la tarea.

## Regla principal

No leer todo el repositorio si la tarea es específica.

Usar esta matriz:

```text
intención de la tarea -> documentos mínimos necesarios
```

## Estado rápido del sistema

```text
protocol_status = phase_3_runtime_hardening_validated
runtime_state = active
runtime_health = healthy
shared_supabase_runtime = built
automation_creation_mode = shared_runtime_by_automation_key
final_tests_for_new_automations = deferred
activation_guarded_during_build = true
handover_generator = available_or_pending_review
example_shared_automation = available_in_branch_or_after_merge
```

## Si la tarea es entender el sistema completo

Leer:

```text
README.md
docs/00-index.md
docs/18-shared-automation-build-pipeline.md
```

No leer docs 19-22 salvo que se necesite operar, probar o activar.

## Si la tarea es crear una nueva automatización

Leer solo:

```text
docs/19-shared-automation-operational-flow.md
docs/20-shared-automation-powershell-operator-guide.md
docs/23-shared-automation-handover-checklist.md
automations/_template/deployment/manifest.json
examples/shared-automation/example-manifest.json
handover/_template-AUTOMATION-HANDOVER.md
```

Scripts relevantes:

```text
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

No leer:

```text
docs/21-shared-automation-final-test-closeout-guide.md
docs/22-shared-automation-controlled-activation-checklist.md
```

hasta que la automatización esté en `pending_final_validation`.

## Si la tarea involucra WhatsApp, Meta o mensajes externos auditables

Leer también:

```text
docs/27-whatsapp-meta-automation-pattern.md
```

Cargar este documento cuando la tarea mencione:

```text
WhatsApp
Meta Cloud API
webhook de Meta
mensajes a leads
notification_queue
accepted / delivered / read / failed
pg_cron + pg_net para envío
cola de notificaciones
```

Este documento debe leerse antes de crear triggers, Edge Functions, cron jobs o tableros relacionados con WhatsApp/Meta, para evitar envíos directos sin cola, sin `provider_message_id` o sin webhook de estados.

## Si la tarea es validar un manifest

Leer solo:

```text
docs/19-shared-automation-operational-flow.md
examples/shared-automation/example-manifest.json
supabase/functions/validate-shared-automation-manifest/index.ts
supabase/functions/build-components-payload-from-manifest/index.ts
```

## Si la tarea es operar desde PowerShell

Leer solo:

```text
docs/20-shared-automation-powershell-operator-guide.md
scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

## Si la tarea es documentar handover

Leer solo:

```text
docs/23-shared-automation-handover-checklist.md
handover/_template-AUTOMATION-HANDOVER.md
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
```

## Si la tarea es cerrar pruebas finales

Leer solo:

```text
docs/17-deferred-final-test-plan.md
docs/21-shared-automation-final-test-closeout-guide.md
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

No activar todavía.

## Si la tarea es activar o pausar una automatización

Leer solo:

```text
docs/22-shared-automation-controlled-activation-checklist.md
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

## Si la tarea es modificar Edge Functions

Leer solo la función afectada y, si aplica, su documento operativo:

```text
supabase/functions/{function-name}/index.ts
docs/18-shared-automation-build-pipeline.md
```

Si la función afectada envía WhatsApp o recibe webhooks de Meta, leer también:

```text
docs/27-whatsapp-meta-automation-pattern.md
```

## Si la tarea es revisar estado de una automatización

Leer/usar:

```text
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
handover/{automation_key}-HANDOVER.md
```

Consultar Supabase por `automation_key`.

## Si la tarea es diagnosticar escritura GitHub del conector

Usar rama nueva y PR draft. No escribir directo a `main`.

Referencia documentada:

```text
branch diagnóstica = test/ai-write-diagnostic
PR diagnóstica = #4 draft
rama alternativa usada = ai-shared-automation-handover
```

## Documentos que no deben cargarse por defecto

Estos documentos son de fase específica y no deben leerse salvo intención explícita:

```text
docs/21-shared-automation-final-test-closeout-guide.md
docs/22-shared-automation-controlled-activation-checklist.md
handover/*
Base_de_Conocimiento_PowerShell_Supabase_Runtime.docx
```

Excepción: cargar `handover/{automation_key}-HANDOVER.md` cuando la intención sea `verificar`, `documentar`, `probar_final`, `activar` o `pausar` para una automatización específica.

## Política de README

El README debe mantenerse como mapa ejecutivo, no como manual largo.

La documentación extensa debe vivir en:

```text
docs/
scripts/
examples/
automations/_template/
handover/
```

## Próxima acción para IA

Antes de actuar, identificar intención:

```text
crear | validar | registrar | verificar | probar_final | activar | pausar | documentar | modificar_runtime
```

Luego cargar solo los documentos indicados en este router.
