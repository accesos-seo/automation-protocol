# Supabase Control Schema

## Proyecto

```text
project_ref = lwurzjrghzwzxbhrulyn
schema = agency_automations
```

## Tablas

```text
automation_blueprints = registro maestro de automatizaciones
agent_groups = grupos de agentes reutilizables
automation_agents = agentes asociados a una automatización
notification_channels = canales Slack/email/etc.
automation_schedules = horarios locales y UTC
automation_runs = ejecuciones reales, pruebas y dry-runs
automation_events = eventos y auditoría
handover_index = índice de handovers versionados en GitHub
project_tasks = mapa de trabajo del protocolo
```

## Vista dashboard

```text
agency_automations.v_automation_dashboard
```

Uso:

```text
ver estado actual
ver automatizaciones activas o pausadas
ver última ejecución
ver último evento
ver cantidad de agentes y horarios
```

## Función activar/desactivar

```text
agency_automations.set_automation_enabled(
  p_automation_key text,
  p_enabled boolean,
  p_reason text,
  p_actor text
)
```

La función debe:

```text
actualizar is_enabled
cambiar status a active o paused
registrar evento en automation_events
mantener trazabilidad
```

## Regla de fuente de verdad

Supabase manda sobre el estado runtime.

GitHub puede documentar intención o diseño, pero el estado vivo se consulta en Supabase.
