# 15 - Shared Runtime New Automation Checklist

## Objetivo

Crear nuevas automatizaciones dentro del mismo proyecto Supabase usando `automation_key` como separación lógica, sin crear un proyecto Supabase nuevo por cada proceso.

Estado base requerido:

```text
phase_3_runtime_hardening_validated
runtime_state = active
runtime_health = healthy
activation_guarded = false
```

## Principio operativo

El proyecto Supabase funciona como runtime compartido.

Cada automatización debe distinguirse por:

```text
automation_key
```

No se debe crear un nuevo proyecto Supabase salvo que exista una razón explícita de aislamiento, cumplimiento, riesgo, facturación o límites técnicos reales.

## Reglas de seguridad

- No pegar secrets en chat.
- No subir secrets a GitHub.
- No guardar valores reales de claves en documentación.
- Usar Supabase Secrets o entorno seguro para credenciales reales.
- GitHub solo guarda código, manifests, documentación, schemas y nombres de variables.
- Supabase guarda estado operativo, jobs, eventos, logs, registros y metadata.
- Pedir confirmación explícita antes de:
  - `DROP TABLE`.
  - `TRUNCATE`.
  - borrados masivos.
  - abrir RLS sobre datos sensibles.
  - rotar o exponer secretos.
  - crear recursos con costo adicional.

## Checklist de alta de nueva automatización

### 1. Definición inicial

- [ ] Definir `automation_key` único.
- [ ] Definir `automation_name`.
- [ ] Definir `protocol_name`.
- [ ] Definir objetivo de negocio.
- [ ] Definir entradas esperadas.
- [ ] Definir salidas esperadas.
- [ ] Definir eventos disparadores.
- [ ] Definir integraciones externas.
- [ ] Definir criterios de éxito.
- [ ] Definir riesgos y bloqueos.

Ejemplo recomendado de naming:

```text
cliente-area-proceso
```

Ejemplos:

```text
acme-sales-intake
acme-support-triage
internal-content-pipeline
```

### 2. Intake / evidencia fuente

Tablas relacionadas:

- `witnesses`
- `source_records`
- `source_snapshots`
- `source_usage_log`

Checklist:

- [ ] Registrar fuente inicial.
- [ ] Registrar briefing o contenido base.
- [ ] Asociar evidencia al protocolo si aplica.
- [ ] Guardar hash o referencia de fuente cuando corresponda.
- [ ] Evitar guardar secretos dentro de `raw_content` o snapshots.

### 3. Protocolo

Tabla relacionada:

- `automation_protocols`

Checklist:

- [ ] Crear o actualizar protocolo.
- [ ] Registrar `project_summary`.
- [ ] Registrar `problem_definition`.
- [ ] Registrar `input_definition`.
- [ ] Registrar `output_definition`.
- [ ] Registrar `business_rules`.
- [ ] Registrar `validations`.
- [ ] Registrar `integrations`.
- [ ] Registrar `success_metrics`.
- [ ] Registrar `risks`.
- [ ] Confirmar `handoff_ready_for_scaffold` cuando proceda.

### 4. Scaffold

Tablas relacionadas:

- `scaffold_jobs`
- `scaffold_files`
- `scaffold_artifacts`
- `scaffold_validation_reports`

Checklist:

- [ ] Crear job de scaffold.
- [ ] Generar estructura de archivos en GitHub.
- [ ] Registrar archivos generados.
- [ ] Registrar artifacts.
- [ ] Ejecutar validación de scaffold.
- [ ] Registrar errores, warnings y configs pendientes.
- [ ] No avanzar a deploy si existen errores bloqueantes.

### 5. Registro de automatización

Tabla principal:

- `automation_registry`

Campos mínimos esperados:

```text
automation_key
automation_name
protocol_name
repo_strategy
status
health_status
version
repository_url
repository_path
commit_sha
runtime_config
activation_guarded
metadata
```

Checklist:

- [ ] Insertar o actualizar registro en `automation_registry`.
- [ ] Confirmar que `automation_key` es único.
- [ ] Registrar `repository_url`.
- [ ] Registrar `repository_path`.
- [ ] Registrar `commit_sha` cuando exista commit.
- [ ] Definir `status` inicial.
- [ ] Definir `health_status` inicial.
- [ ] Mantener `activation_guarded = true` hasta validar.

Estados sugeridos:

```text
scaffolded
pending_configs
ready_for_deploy
deployed
validated
active
paused
failed
```

### 6. Registro de agentes

Tabla relacionada:

- `agent_registry`

Checklist:

- [ ] Registrar agente orquestador si aplica.
- [ ] Registrar agente validador si aplica.
- [ ] Registrar agente deployer si aplica.
- [ ] Registrar agentes especializados.
- [ ] Asociar `automation_key`.
- [ ] Asociar `runtime_function` cuando aplique.
- [ ] Registrar capabilities.
- [ ] Registrar required configs.

### 7. Registro de skills

Tabla relacionada:

- `skill_registry`

Checklist:

- [ ] Registrar cada `skill_key`.
- [ ] Asociar `automation_key`.
- [ ] Registrar `skill_source_path`.
- [ ] Registrar `skill_version`.
- [ ] Registrar `commit_sha`.
- [ ] Registrar `runtime_location`.
- [ ] Registrar configs requeridas.
- [ ] Confirmar estado activo o pendiente.

### 8. Reglas y configuración

Tablas relacionadas:

- `automation_rules`
- `deployment_configs`

Checklist:

- [ ] Registrar reglas de routing.
- [ ] Registrar reglas de negocio versionadas.
- [ ] Registrar configs requeridas.
- [ ] Separar configs secretas de configs no secretas.
- [ ] Marcar `is_secret = true` para credenciales.
- [ ] Mantener valores reales fuera de tablas públicas y GitHub.
- [ ] Resolver configs bloqueantes antes de activación.

### 9. Deploy

Tablas relacionadas:

- `deployment_jobs`
- `deployment_logs`

Funciones relacionadas:

- `create-deployment-job`
- `generate-deployment-plan`
- `validate-deployment-handoff`
- `resolve-deployment-configs`
- `register-agents`
- `activate-automation`

Checklist:

- [ ] Crear deployment job.
- [ ] Generar deployment plan.
- [ ] Validar handoff.
- [ ] Resolver configs.
- [ ] Registrar agentes.
- [ ] Registrar logs por paso.
- [ ] Registrar commit de GitHub.
- [ ] No activar si hay pending configs bloqueantes.

### 10. Prueba runtime

Funciones relacionadas:

- `runtime-router`
- `skill-executor`
- `runtime-router-local-test` para prueba manual controlada.

Tablas relacionadas:

- `execution_tasks`
- `runtime_events`

Checklist:

- [ ] Ejecutar prueba con `automation_key` nuevo.
- [ ] Confirmar respuesta `ok = true`.
- [ ] Confirmar task en `execution_tasks`.
- [ ] Confirmar eventos en `runtime_events`.
- [ ] Confirmar `runtime.execution_completed` o fallback aceptado.
- [ ] Confirmar que no quedan tareas `running` colgadas.
- [ ] Documentar task IDs.

Payload base de prueba:

```json
{
  "automation_key": "NUEVO_AUTOMATION_KEY",
  "event_type": "manual.trigger",
  "input": {
    "source": "shared_runtime_new_automation_test",
    "raw_request": "Prueba controlada de nueva automatización sobre runtime compartido."
  }
}
```

### 11. Activación

Checklist:

- [ ] Confirmar que no hay configs bloqueantes.
- [ ] Confirmar prueba runtime exitosa.
- [ ] Confirmar documentación mínima.
- [ ] Actualizar `automation_registry.status`.
- [ ] Actualizar `automation_registry.health_status`.
- [ ] Cambiar `activation_guarded` solo cuando sea seguro.
- [ ] Registrar evento de activación.

### 12. Documentación final

Checklist:

- [ ] Crear informe de la automatización.
- [ ] Crear handover específico.
- [ ] Registrar comandos PowerShell usados si aplican.
- [ ] Registrar errores y soluciones.
- [ ] Registrar próximos pasos.
- [ ] Mantener documentación sin secretos.

## PowerShell recomendado para prueba manual

Usar solo cuando sea necesario o cuando el conector no permita probar directamente.

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
        source = "shared_runtime_new_automation_test"
        raw_request = "Prueba controlada de nueva automatización sobre runtime compartido."
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod `
    -Uri $FUNCTION_URL `
    -Method POST `
    -Headers $headers `
    -Body $body

$response | ConvertTo-Json -Depth 20
```

Nota: el token mostrado es un placeholder operativo documentado previamente para entorno de prueba. En producción debe usarse un secreto fuerte gestionado en Supabase Secrets y nunca documentar el valor real.

## SQL de verificación

```sql
select id, automation_key, status, health_status, activation_guarded, runtime_config, created_at, updated_at
from public.automation_registry
where automation_key = 'NUEVO_AUTOMATION_KEY';
```

```sql
select id, automation_key, task_type, task_status, status, error_message, output_payload, created_at, completed_at
from public.execution_tasks
where automation_key = 'NUEVO_AUTOMATION_KEY'
order by created_at desc
limit 10;
```

```sql
select event_type, automation_key, execution_task_id, event_payload, created_at
from public.runtime_events
where automation_key = 'NUEVO_AUTOMATION_KEY'
order by created_at desc
limit 30;
```

## Criterio de listo

Una nueva automatización queda lista cuando:

- [ ] Existe en `automation_registry`.
- [ ] Tiene `automation_key` único.
- [ ] Tiene agentes registrados si aplica.
- [ ] Tiene skills registrados si aplica.
- [ ] Tiene reglas/configs registradas.
- [ ] No tiene secrets expuestos.
- [ ] Tiene prueba runtime documentada.
- [ ] Tiene handover o informe operativo.
- [ ] Está activada o queda explícitamente guardada con razón.

## Resultado esperado de esta estrategia

El límite de proyectos Supabase deja de ser el cuello de botella inmediato, porque múltiples automatizaciones pueden vivir en el mismo runtime compartido separadas por `automation_key` y auditadas con tablas operativas existentes.
