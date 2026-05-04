# 2026-05-04 15:50 BOG - Handover Fundacional Agency Automation Control

## 1. Identidad

```text
proyecto = Agency Automation Control
repository = accesos-seo/automation-protocol
base_path = agency-automation-control
project_ref = lwurzjrghzwzxbhrulyn
schema = agency_automations
automation_demo = agency_demo_validation_001
fecha_hora_local = 2026-05-04 15:50 BOG
zona_horaria = America/Bogota
utc_offset = UTC-5
fecha_hora_utc_equivalente = 2026-05-04 20:50 UTC
```

## 2. Objetivo del proyecto

Crear un sistema compacto y escalable para controlar automatizaciones de agencia.

```text
GitHub = documentación, manifests, handovers, skills, scripts y lógica versionada.
Supabase = estado vivo, activación/desactivación, eventos, runs, trazabilidad y dashboard.
```

El protocolo debe soportar:

```text
automatizaciones simples
automatizaciones con lógica pura
automatizaciones híbridas
automatizaciones con enjambre de agentes
protocolos manuales documentados
```

## 3. Estado real en Supabase

```text
schema = agency_automations
vista_dashboard = agency_automations.v_automation_dashboard
funcion_control = agency_automations.set_automation_enabled(...)
```

Tablas principales creadas:

```text
automation_blueprints
agent_groups
automation_agents
notification_channels
automation_schedules
automation_runs
automation_events
handover_index
project_tasks
```

Canales Slack registrados:

```text
Nivel 2 = interno-equipo-seo / C09SN85SGKC
Nivel 3 = alerts-operaciones / C0B1B3V4ZB5
Nivel 1 = líder o responsable directo por automatización
```

## 4. Automatización demo validada

```text
automation_key = agency_demo_validation_001
name = Agency Demo Validation 001
automation_type = hybrid
system_area = agency_operations
production = false
status_final = paused
is_enabled_final = false
activation_guarded = true
health_status = healthy
schedules_count = 1
```

Horario demo:

```text
cron_local = 0 9 * * 1-5
cron_utc = 0 14 * * 1-5
09:00 Colombia = 14:00 UTC
```

## 5. Evidencia validada

```text
[OK] Esquema agency_automations creado.
[OK] Vista dashboard creada.
[OK] Función activar/desactivar creada.
[OK] Canales Slack estándar registrados.
[OK] Mapa de tareas creado en project_tasks.
[OK] Documentación base creada en GitHub bajo agency-automation-control.
[OK] Manifest template creado.
[OK] Handover template creado.
[OK] Automatización demo registrada en Supabase.
[OK] Manifest demo creado en GitHub.
[OK] README demo creado en GitHub.
[OK] Dry-run demo registrado.
[OK] Evento dry_run_completed registrado.
[OK] Ciclo enable/disable probado.
[OK] Evento activation_pause_cycle_validated registrado.
[OK] Estado final seguro: paused / is_enabled false.
```

## 6. Archivos GitHub creados

```text
agency-automation-control/README.md
agency-automation-control/docs/00-index.md
agency-automation-control/docs/01-ai-context-router.md
agency-automation-control/docs/02-agency-automation-protocol.md
agency-automation-control/docs/03-slack-escalation-standard.md
agency-automation-control/docs/04-supabase-control-schema.md
agency-automation-control/docs/05-handover-standard.md
agency-automation-control/automations/_template/manifest.json
agency-automation-control/handover/_templates/automation-handover.md
agency-automation-control/automations/agency_demo_validation_001/manifest.json
agency-automation-control/automations/agency_demo_validation_001/README.md
```

## 7. Riesgos actuales

```text
riesgo_1 = El proyecto vive temporalmente como carpeta dentro de automation-protocol, no como repositorio independiente.
riesgo_2 = RLS todavía no está definido para agency_automations.
riesgo_3 = Falta decidir si se mantendrá este proyecto dentro del repo actual o se moverá a un repo nuevo.
riesgo_4 = Aún no se ha probado una automatización real de producción bajo este protocolo.
```

## 8. Pendientes

```text
[PENDIENTE] Definir si el repo final será independiente o permanecerá como módulo del repo automation-protocol.
[PENDIENTE] Validar diseño final del esquema agency_automations.
[PENDIENTE] Definir políticas RLS y permisos.
[PENDIENTE] Crear consultas dashboard operativas.
[PENDIENTE] Definir flujo para agent_swarm con roles mínimos.
[PENDIENTE] Registrar primera automatización real de agencia bajo este protocolo.
[PENDIENTE] Congelar versión V1 del protocolo.
```

## 9. Decisiones tomadas

```text
1. El esquema correcto es agency_automations.
2. No se usará swarm_agents como nombre de esquema.
3. Supabase será fuente de verdad del estado runtime.
4. GitHub será fuente de verdad documental/versionada.
5. Los handovers históricos usarán hora Bogotá y sufijo BOG.
6. Las automatizaciones podrán ser logic, agent_swarm, hybrid o manual_protocol.
7. La demo quedó pausada y no productiva después de validar activación/desactivación.
```

## 10. Siguiente paso exacto

```text
Revisar y cerrar la fase de seguridad: definir RLS/permisos mínimos para agency_automations antes de registrar automatizaciones reales de producción.
```

## 11. Bloque corto para siguiente IA

```text
Proyecto: Agency Automation Control.
Repo actual: accesos-seo/automation-protocol.
Base path: agency-automation-control.
Supabase: lwurzjrghzwzxbhrulyn.
Schema: agency_automations.
Estado: bootstrap documental y base de datos creados; demo agency_demo_validation_001 validada con dry-run y ciclo enable/disable.
Estado final demo: paused, is_enabled false, activation_guarded true, health_status healthy, production false.
Slack estándar: Nivel 2 interno-equipo-seo C09SN85SGKC; Nivel 3 alerts-operaciones C0B1B3V4ZB5; Nivel 1 responsable directo.
Regla horaria: America/Bogota UTC-5; para Supabase cron UTC, sumar 5 horas a la hora Colombia.
Siguiente tarea: definir RLS/permisos y validar diseño del esquema antes de primera automatización real.
No asumir producción activa sin evidencia en agency_automations.
```
