# AI Context Router

Este archivo indica qué debe leer una IA antes de trabajar en este protocolo.

## Regla principal

No cargar todo el repositorio. Cargar solo los documentos necesarios según la tarea.

## Si la tarea es arquitectura

Leer:

```text
README.md
docs/00-index.md
docs/02-agency-automation-protocol.md
docs/04-supabase-control-schema.md
```

## Si la tarea es Slack o alertas

Leer:

```text
docs/03-slack-escalation-standard.md
automations/{automation_key}/manifest.json
```

## Si la tarea es handover

Leer:

```text
docs/05-handover-standard.md
handover/_templates/automation-handover.md
```

## Si la tarea es activar o pausar una automatización

Leer:

```text
docs/02-agency-automation-protocol.md
docs/04-supabase-control-schema.md
automations/{automation_key}/manifest.json
```

Luego consultar Supabase:

```text
schema = agency_automations
view = agency_automations.v_automation_dashboard
```

## Regla de seguridad

No asumir que una automatización está activa solo porque GitHub lo dice. Supabase es la fuente de verdad del estado runtime.
