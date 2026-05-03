# 16 - Shared Runtime Implementation Runbook

## Propósito

Este runbook convierte el plan de runtime compartido en acciones ejecutables para dar de alta automatizaciones nuevas dentro del mismo proyecto Supabase.

El objetivo operativo es dejar de depender de crear un proyecto Supabase nuevo por cada proceso. La separación lógica se hará por `automation_key`.

## Estado base requerido

```text
status = phase_3_runtime_hardening_validated
runtime_state = active
runtime_health = healthy
activation_guarded = false
```

## Fase A — Preparar alta de automatización

### A1. Elegir automation_key

Formato recomendado:

```text
cliente-area-proceso
```

Reglas:

- Debe ser único.
- Debe estar en minúsculas.
- Debe evitar espacios.
- Debe evitar nombres genéricos como `test`, `demo`, `automation`.
- Debe representar cliente, área y proceso.

Ejemplo:

```text
acme-sales-intake
```

### A2. Crear carpeta versionada

Ruta recomendada:

```text
automations/{automation_key}/
```

Estructura mínima:

```text
automations/{automation_key}/README.md
automations/{automation_key}/agents/
automations/{automation_key}/skills/
automations/{automation_key}/routing-rules/
automations/{automation_key}/deployment/
automations/{automation_key}/evidence/
```

## Fase B — SQL base para registro operativo

> Reemplazar todos los valores `NUEVO_*` antes de ejecutar.

### B1. Verificar que automation_key no exista

```sql
select id, automation_key, automation_name, status, health_status, created_at
from public.automation_registry
where automation_key = 'NUEVO_AUTOMATION_KEY';
```

Debe devolver cero filas antes de insertar una automatización nueva.

### B2. Insertar automation_registry

```sql
insert into public.automation_registry (
  automation_key,
  automation_name,
  protocol_name,
  repo_strategy,
  status,
  health_status,
  version,
  repository_url,
  repository_path,
  runtime_config,
  activation_guarded,
  metadata
)
values (
  'NUEVO_AUTOMATION_KEY',
  'NUEVO_AUTOMATION_NAME',
  'NUEVO_PROTOCOL_NAME',
  'monorepo',
  'scaffolded',
  'pending_validation',
  '0.1.0',
  'https://github.com/accesos-seo/automation-protocol',
  'automations/NUEVO_AUTOMATION_KEY',
  jsonb_build_object(
    'runtime', 'shared_supabase_runtime',
    'runtime_router', 'runtime-router',
    'skill_executor', 'skill-executor',
    'project_ref', 'lwurzjrghzwzxbhrulyn'
  ),
  true,
  jsonb_build_object(
    'created_by', 'assistant_runbook',
    'source_status', 'phase_3_runtime_hardening_validated'
  )
)
returning id, automation_key, status, health_status, activation_guarded;
```

### B3. Registrar deployment config placeholder

```sql
insert into public.deployment_configs (
  automation_key,
  config_key,
  config_type,
  is_required,
  is_secret,
  config_status,
  description,
  metadata
)
values
(
  'NUEVO_AUTOMATION_KEY',
  'OPENROUTER_API_KEY',
  'secret',
  true,
  true,
  'managed_in_supabase_secrets',
  'Secret usado por Edge Functions. No guardar el valor real en tablas ni GitHub.',
  jsonb_build_object('runtime', 'shared')
)
returning id, automation_key, config_key, is_secret, config_status;
```

### B4. Registrar regla base de routing

```sql
insert into public.automation_rules (
  automation_key,
  rule_key,
  rule_type,
  rule_version,
  rule_config,
  status
)
values (
  'NUEVO_AUTOMATION_KEY',
  'default-runtime-route',
  'runtime_routing',
  '0.1.0',
  jsonb_build_object(
    'runtime_router', 'runtime-router',
    'skill_executor', 'skill-executor',
    'default_skill_key', 'intake-analysis'
  ),
  'active'
)
returning id, automation_key, rule_key, status;
```

## Fase C — Prueba runtime manual con PowerShell

Usar PowerShell solo si el conector no puede ejecutar la prueba directamente.

```powershell
$ErrorActionPreference = "Stop"

$SUPABASE_URL = "https://lwurzjrghzwzxbhrulyn.supabase.co"
$FUNCTION_URL = "$SUPABASE_URL/functions/v1/runtime-router-local-test"

$headers = @{
    "x-test-token" = "swarm-local-test"
    "Content-Type" = "application/json"
}

$body = @{
    automation_key = "NUEVO_AUTOMATION_KEY"
    event_type = "manual.trigger"
    input = @{
        source = "shared_runtime_implementation_runbook"
        raw_request = "Prueba de nueva automatización en runtime compartido."
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod `
    -Uri $FUNCTION_URL `
    -Method POST `
    -Headers $headers `
    -Body $body

$response | ConvertTo-Json -Depth 20
```

## Fase D — Verificación posterior

### D1. Revisar tareas

```sql
select id, automation_key, task_type, task_status, status, error_message, output_payload, created_at, completed_at
from public.execution_tasks
where automation_key = 'NUEVO_AUTOMATION_KEY'
order by created_at desc
limit 10;
```

### D2. Revisar eventos

```sql
select event_type, automation_key, execution_task_id, event_payload, created_at
from public.runtime_events
where automation_key = 'NUEVO_AUTOMATION_KEY'
order by created_at desc
limit 30;
```

### D3. Validar que no queden tareas colgadas

```sql
select id, automation_key, task_type, task_status, status, created_at
from public.execution_tasks
where automation_key = 'NUEVO_AUTOMATION_KEY'
  and coalesce(task_status, status) = 'running'
order by created_at desc;
```

## Fase E — Activación controlada

Solo después de prueba satisfactoria:

```sql
update public.automation_registry
set
  status = 'validated',
  health_status = 'healthy',
  activation_guarded = false,
  updated_at = now(),
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'validated_at', now(),
    'validation_source', 'shared_runtime_implementation_runbook'
  )
where automation_key = 'NUEVO_AUTOMATION_KEY'
returning id, automation_key, status, health_status, activation_guarded;
```

## Fase F — Documentación mínima por automatización

Crear:

```text
automations/{automation_key}/README.md
handover/{automation_key}-HANDOVER.md
```

Contenido mínimo:

- automation_key.
- objetivo.
- entradas.
- salidas.
- agentes.
- skills.
- configs requeridas.
- prueba runtime.
- task IDs.
- eventos observados.
- estado final.
- próximos pasos.

## Criterio de cierre

Una nueva automatización queda lista cuando:

```text
automation_registry.status = validated o active
automation_registry.health_status = healthy
activation_guarded = false o razón documentada
runtime_events contiene evento final válido
execution_tasks no tiene tareas running colgadas
handover específico existe en GitHub
```

## Prohibiciones operativas

No ejecutar sin confirmación explícita:

- `DROP TABLE`.
- `TRUNCATE`.
- borrados masivos.
- cambios de RLS que abran datos sensibles.
- exposición o rotación de secrets.
- creación de recursos con costo adicional.

## Siguiente mejora técnica recomendada

Crear una Edge Function helper segura para alta de automatizaciones compartidas:

```text
create-shared-automation
```

Responsabilidad:

- validar `automation_key`.
- insertar `automation_registry`.
- insertar configs placeholder.
- insertar regla base.
- registrar audit log.
- devolver checklist de validación.

La función no debe recibir ni guardar valores reales de secrets.
