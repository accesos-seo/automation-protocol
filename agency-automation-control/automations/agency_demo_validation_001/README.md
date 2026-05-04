# Agency Demo Validation 001

## Propósito

Automatización demo no productiva para validar el protocolo `agency_automations`.

## Qué valida

```text
registro en Supabase
manifest en GitHub
canales Slack estándar
horario Colombia / UTC
activación controlada
pausa/desactivación
trazabilidad en eventos
handover final
```

## Estado inicial

```text
status = designed
is_enabled = false
activation_guarded = true
health_status = not_tested
production = false
```

## Supabase

```text
project_ref = lwurzjrghzwzxbhrulyn
schema = agency_automations
dashboard = agency_automations.v_automation_dashboard
```

## Slack

```text
Nivel 1 = responsable directo
Nivel 2 = interno-equipo-seo / C09SN85SGKC
Nivel 3 = alerts-operaciones / C0B1B3V4ZB5
```

## Horario demo

```text
09:00 Colombia = 14:00 UTC
cron_local = 0 9 * * 1-5
cron_utc = 0 14 * * 1-5
```

## No producción

Esta automatización no ejecuta acciones productivas. Solo existe para validar control, trazabilidad y documentación.
