# 21 - Shared Automation Final Test Closeout Guide

## Propósito

Definir el bloque final de pruebas para cerrar la construcción del pipeline de automatizaciones compartidas.

Este documento no autoriza ejecutar pruebas durante construcción. Solo establece el procedimiento que se usará cuando el bloque de construcción haya terminado.

## Documento rector

```text
docs/17-deferred-final-test-plan.md
```

## Script oficial

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
```

Este script queda reservado para el cierre final. No debe ejecutarse durante construcción.

Ejemplo de uso:

```powershell
$env:SUPABASE_URL = "https://lwurzjrghzwzxbhrulyn.supabase.co"
$env:LOCAL_TEST_TOKEN = "REPLACE_WITH_LOCAL_TEST_TOKEN"

.\scripts\powershell\shared-automation\Invoke-SharedAutomationFinalTests.ps1
```

## Precondiciones obligatorias

Antes de ejecutar pruebas finales, confirmar:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
manifest validado
component payload generado
componentes registrados
handover creado
secrets configurados en Supabase Secrets
sin valores secretos en GitHub
```

## Prueba final 1 - Alta controlada de automatización temporal

Automation key reservado:

```text
validation-shared-runtime-001
```

Objetivo:

Validar que el runtime compartido puede crear una automatización nueva sin crear proyecto Supabase adicional.

Función puente:

```text
create-shared-automation-local-test
```

Payload:

```json
{
  "automation_key": "validation-shared-runtime-001",
  "automation_name": "Validation Shared Runtime 001",
  "protocol_name": "Validation Shared Runtime Protocol",
  "default_skill_key": "intake-analysis",
  "metadata": {
    "purpose": "final_validation",
    "source": "final_test_closeout_guide"
  }
}
```

Headers requeridos:

```text
x-test-token = LOCAL_TEST_TOKEN
```

Resultado esperado:

```text
ok = true
proxy_status = 200
result.ok = true
```

## Prueba final 2 - Verificación SQL de inserts

El script oficial imprime estas consultas para revisión.

```sql
select automation_key, status, health_status, activation_guarded
from public.automation_registry
where automation_key = 'validation-shared-runtime-001';
```

```sql
select automation_key, config_key, is_secret, config_status
from public.deployment_configs
where automation_key = 'validation-shared-runtime-001';
```

```sql
select automation_key, rule_key, status
from public.automation_rules
where automation_key = 'validation-shared-runtime-001';
```

Criterio de éxito:

```text
automation_registry contiene el registro
deployment_configs contiene OPENROUTER_API_KEY placeholder
automation_rules contiene default-runtime-route
activation_guarded = true
```

## Prueba final 3 - Validación runtime controlada

Ejecutar una solicitud mínima por el runtime validado previamente.

Función esperada:

```text
runtime-router-local-test
```

Evento sugerido:

```json
{
  "automation_key": "validation-shared-runtime-001",
  "event_type": "runtime.hardening.validation",
  "payload": {
    "message": "Final validation event"
  }
}
```

Criterio de éxito:

```text
runtime event registrado
task creada o fallback documentado
sin task atascada
resultado determinístico o fallback esperado
```

## Prueba final 4 - Verificación de runtime_events

```sql
select automation_key, event_type, status, created_at
from public.runtime_events
where automation_key = 'validation-shared-runtime-001'
order by created_at desc
limit 20;
```

## Prueba final 5 - Verificación de execution_tasks

```sql
select automation_key, task_type, status, created_at, updated_at
from public.execution_tasks
where automation_key = 'validation-shared-runtime-001'
order by created_at desc
limit 20;
```

Criterio de éxito:

```text
no hay tareas stuck/running indefinidas
errores esperados están documentados
```

## Prueba final 6 - Auditoría

```sql
select entity_type, entity_id, action, actor_type, created_at
from public.audit_logs
where action in (
  'create_shared_automation',
  'register_shared_automation_components',
  'update_shared_automation_build_state'
)
order by created_at desc
limit 50;
```

## Resultado de cierre

El bloque de pruebas se considera exitoso si:

```text
create-shared-automation-local-test retorna ok = true
inserts base confirmados
runtime final produce evento/tarea esperada o fallback documentado
no hay tasks atascadas
no se expusieron secrets
handover actualizado con evidencia
```

## Después de pruebas

No activar automáticamente.

Primero actualizar handover con:

```text
automation_id
config_ids
rule_ids
runtime_event_ids
task_ids
audit_log_ids
resultado final
```

Luego ejecutar checklist de activación controlada:

```text
docs/22-shared-automation-controlled-activation-checklist.md
```

Script asociado:

```text
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
```

## Limpieza

No borrar la automatización temporal sin confirmación explícita.

Si se decide limpiar, documentar:

```text
qué se borra
por qué se borra
query usada
responsable
fecha
```
