# Agency Automation Control

Protocolo compacto para documentar, validar, activar, pausar y auditar automatizaciones de la agencia.

## Fuente de verdad

```text
GitHub = documentación, manifests, handovers, skills, scripts y lógica versionada.
Supabase = estado vivo, activación/desactivación, eventos, runs, trazabilidad y dashboard.
```

## Supabase

```text
project_ref = lwurzjrghzwzxbhrulyn
schema = agency_automations
```

## Documentos mínimos

```text
docs/00-index.md
docs/01-ai-context-router.md
docs/02-agency-automation-protocol.md
docs/03-slack-escalation-standard.md
docs/04-supabase-control-schema.md
docs/05-handover-standard.md
```

## Estados operativos

```text
draft
designed
ready_for_build
active
paused
disabled
archived
```

## Tipos de automatización

```text
logic
agent_swarm
hybrid
manual_protocol
```

## Regla de handover

Los handovers históricos deben usar hora Bogotá.

```text
handover/Registros_Historicos/YYYY/MM-Mes/YYYY-MM-DD_HH-MM_BOG_Titulo_Descriptivo.md
```

## Regla Slack base

```text
Nivel 1 = líder/responsable directo
Nivel 2 = interno-equipo-seo / C09SN85SGKC
Nivel 3 = alerts-operaciones / C0B1B3V4ZB5
```
