# 14 - Next Phase Plan After Runtime Hardening

## Punto de partida

Estado base:

```text
phase_3_runtime_hardening_validated
```

Runtime:

```text
runtime_state = active
runtime_health = healthy
activation_guarded = false
```

Evidencia heredada:

```text
PR #3 = merged
merge_commit_sha = b589527f9294488c79bcb1382498eccb1bbf145a
runtime_task_id = c7eeff53-9318-4909-8bff-cdd5a5ba1b2c
skill_task_id = 2eb68441-9c24-4d49-b006-21a5b98d0489
completed_with_fallback = false
deterministic_route = true
final_event = runtime.execution_completed
```

## Objetivo de la siguiente fase

Convertir el runtime validado en una base repetible para nuevas automatizaciones sin depender de crear un proyecto Supabase nuevo por cada proceso.

La siguiente fase debe priorizar:

1. Reutilización del mismo proyecto Supabase.
2. Separación lógica por `automation_key`.
3. Registro formal de automatizaciones en `automation_registry`.
4. Registro de agentes en `agent_registry`.
5. Registro de skills en `skill_registry`.
6. Pruebas controladas por automatización.
7. Documentación operativa sin secretos.

## Estrategia recomendada

Usar el proyecto Supabase existente como runtime multi-automatización.

No crear un proyecto Supabase por cada automatización salvo que exista una razón fuerte de aislamiento, cumplimiento, facturación o riesgo.

Cada nueva automatización debe tener:

```text
automation_key
automation_name
protocol_name
status
health_status
runtime_config
activation_guarded
metadata
```

La tabla principal para distinguir automatizaciones es `automation_registry`, cuyo campo `automation_key` es único.

## Flujo propuesto para nuevas automatizaciones

### 1. Intake

Registrar la solicitud, fuente o briefing del proceso.

Tablas relacionadas:

- `witnesses`
- `source_records`
- `source_snapshots`
- `source_usage_log`

### 2. Protocolización

Crear o actualizar el protocolo de automatización.

Tabla relacionada:

- `automation_protocols`

### 3. Scaffold

Generar archivos, manifests, reglas, skills y documentación versionada.

Tablas relacionadas:

- `scaffold_jobs`
- `scaffold_files`
- `scaffold_artifacts`
- `scaffold_validation_reports`

### 4. Registro runtime

Registrar automatización, agentes, skills, reglas y configs.

Tablas relacionadas:

- `automation_registry`
- `agent_registry`
- `skill_registry`
- `automation_rules`
- `deployment_configs`

### 5. Deploy

Crear job de despliegue y registrar logs.

Tablas relacionadas:

- `deployment_jobs`
- `deployment_logs`

### 6. Activación

Activar solo si pasa validación y no hay configs bloqueantes.

Función relacionada:

- `activate-automation`

### 7. Ejecución

Ejecutar vía runtime compartido usando `automation_key`.

Funciones relacionadas:

- `runtime-router`
- `skill-executor`

Tablas relacionadas:

- `execution_tasks`
- `runtime_events`

## Criterio operativo

Una nueva automatización debe considerarse lista cuando:

- Existe en `automation_registry`.
- Tiene `automation_key` único.
- Tiene agentes y skills registrados.
- Sus configs requeridas están resueltas o marcadas como pendientes no bloqueantes.
- Tiene una prueba controlada con `runtime.execution_completed` o fallback aceptado documentado.
- No expone secretos en GitHub ni en documentación.

## Pendientes técnicos recomendados

- Agregar prueba automatizada para `runtime.hardening.validation`.
- Crear plantilla de alta de nueva automatización por `automation_key`.
- Crear checklist específico para nuevas automatizaciones sobre runtime compartido.
- Evaluar endpoint o función helper para crear registros base de `automation_registry`.
- Mantener PowerShell como vía de prueba/deploy solo cuando conectores no sean suficientes.

## Regla de seguridad

Los secrets reales deben vivir en Supabase Secrets o entorno seguro. GitHub solo debe guardar nombres de variables, documentación, código y configuración no sensible.

## Próximo documento sugerido

Crear:

```text
docs/15-shared-runtime-new-automation-checklist.md
```

Ese checklist debe definir el paso a paso para crear una nueva automatización dentro del mismo proyecto Supabase usando `automation_key` como separación lógica.
