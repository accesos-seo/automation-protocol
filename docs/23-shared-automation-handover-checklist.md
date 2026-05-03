# 23 - Shared Automation Handover Checklist

## Propósito

Definir el checklist mínimo que debe quedar documentado para cada automatización compartida antes de pasar a pruebas finales o activación.

Este documento evita que el estado quede disperso entre README, Supabase, scripts y conversaciones.

## Archivo requerido por automatización

Cada automatización debe tener un handover propio:

```text
handover/automations/{automation_key}-HANDOVER.md
```

Ejemplo:

```text
handover/automations/cliente-area-proceso-HANDOVER.md
```

La plantilla base vive en:

```text
handover/_templates/AUTOMATION-HANDOVER.md
```

## Política de autonomía para IA

Antes de generar o actualizar handovers, la IA debe atender:

```text
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
```

Dentro de un bloque aprobado, la IA debe ejecutar sin nueva pregunta:

```text
create_github_file_in_repository
create_pull_request_in_github_repository
create_or_update_github_readme
add_comment_to_github
add_supabase_script
```

Estas acciones se documentan en el handover como evidencia al cerrar el bloque.

## Script recomendado

Generar el handover inicial con:

```powershell
.\scripts\powershell\shared-automation\New-SharedAutomationHandover.ps1 `
  -AutomationKey "REPLACE_WITH_AUTOMATION_KEY" `
  -AutomationName "REPLACE_WITH_AUTOMATION_NAME" `
  -ProtocolName "REPLACE_WITH_PROTOCOL_NAME" `
  -CommitSha "REPLACE_WITH_COMMIT_SHA"
```

El script escribe por defecto en:

```text
handover/automations/{automation_key}-HANDOVER.md
```

## Regla principal

El handover es la fuente humana de transferencia operativa.

Supabase es la fuente de estado runtime.

GitHub es la fuente versionada de código y documentación.

## Identidad mínima

Registrar:

```text
automation_key = REPLACE_WITH_AUTOMATION_KEY
automation_name = REPLACE_WITH_AUTOMATION_NAME
protocol_name = REPLACE_WITH_PROTOCOL_NAME
runtime = shared_supabase_runtime
project_ref = lwurzjrghzwzxbhrulyn
repository = accesos-seo/automation-protocol
repository_path = automations/REPLACE_WITH_AUTOMATION_KEY
handover_path = handover/automations/REPLACE_WITH_AUTOMATION_KEY-HANDOVER.md
```

## Estado esperado antes de pruebas finales

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
```

## Evidencia GitHub

Registrar:

```text
commit_sha = REPLACE_WITH_COMMIT_SHA
manifest_path = automations/REPLACE_WITH_AUTOMATION_KEY/deployment/manifest.json
readme_path = automations/REPLACE_WITH_AUTOMATION_KEY/README.md
agent_paths = automations/REPLACE_WITH_AUTOMATION_KEY/agents/
skill_paths = automations/REPLACE_WITH_AUTOMATION_KEY/skills/
routing_rules_path = automations/REPLACE_WITH_AUTOMATION_KEY/routing-rules/
handover_path = handover/automations/REPLACE_WITH_AUTOMATION_KEY-HANDOVER.md
```

## Evidencia Supabase

Registrar después de crear draft y componentes:

```text
automation_id = REPLACE_WITH_AUTOMATION_ID
agent_ids = REPLACE_WITH_AGENT_IDS
skill_ids = REPLACE_WITH_SKILL_IDS
config_ids = REPLACE_WITH_CONFIG_IDS
rule_ids = REPLACE_WITH_RULE_IDS
audit_log_ids = REPLACE_WITH_AUDIT_LOG_IDS
runtime_event_ids = REPLACE_WITH_RUNTIME_EVENT_IDS
execution_task_ids = REPLACE_WITH_EXECUTION_TASK_IDS
```

## Componentes esperados

### Agentes

```text
orchestrator
```

### Skills

```text
intake-analysis
```

### Configs

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

### Reglas

```text
default-runtime-route
```

## Checklist antes de pending_final_validation

```text
[ ] Scaffold generado
[ ] Handover inicial generado
[ ] Archivos creados en GitHub
[ ] Manifest validado
[ ] Payload de componentes construido
[ ] Draft creado en Supabase
[ ] Componentes registrados
[ ] Estado movido a scaffolded
[ ] Estado movido a components_registered
[ ] Estado movido a pending_final_validation
[ ] activation_guarded sigue true
[ ] Secrets no expuestos en GitHub
[ ] Verification SQL generado/revisado
```

## Checklist antes de pruebas finales

```text
[ ] Handover actualizado
[ ] automation_registry revisado
[ ] agent_registry revisado
[ ] skill_registry revisado
[ ] deployment_configs revisado sin valores secretos
[ ] automation_rules revisado
[ ] audit_logs revisado
[ ] no hay tasks stuck
[ ] LOCAL_TEST_TOKEN disponible solo en entorno seguro
[ ] usuario autorizó explícitamente pruebas finales
```

## Checklist después de pruebas finales

```text
[ ] Resultado de create-shared-automation-local-test documentado
[ ] runtime_events documentados
[ ] execution_tasks documentadas
[ ] audit_logs documentados
[ ] errores o fallback documentados
[ ] decisión de activación registrada
```

## Checklist antes de activación

```text
[ ] final_tests_passed = true
[ ] runtime_events_reviewed = true
[ ] execution_tasks_reviewed = true
[ ] audit_logs_reviewed = true
[ ] handover_updated = true
[ ] status puede moverse a validated
[ ] activación aprobada explícitamente
```

## Checklist post-activación

```text
[ ] status = active
[ ] health_status = healthy
[ ] activation_guarded = false
[ ] primera ejecución real monitoreada
[ ] sin tasks stuck
[ ] sin exposición de secrets
[ ] rollback plan disponible
```

## Consultas sugeridas

Generar SQL con:

```powershell
.\scripts\powershell\shared-automation\Get-SharedAutomationVerificationSql.ps1 `
  -AutomationKey "REPLACE_WITH_AUTOMATION_KEY"
```

## Política de cierre

No cerrar una automatización como lista si el handover no contiene:

```text
estado actual
evidencia GitHub
evidencia Supabase
componentes registrados
resultado de verificación
pendientes claros
```
