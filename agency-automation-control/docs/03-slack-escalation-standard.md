# Slack Escalation Standard

## Objetivo

Estandarizar cómo las automatizaciones notifican, escalan y dejan evidencia operativa en Slack.

## Niveles

```text
Nivel 1 = líder o responsable directo de la automatización
Nivel 2 = interno-equipo-seo / C09SN85SGKC
Nivel 3 = alerts-operaciones / C0B1B3V4ZB5
```

## Regla de tono

Las notificaciones deben ser:

```text
operativas
preventivas
disimuladas
sin exposición agresiva
sin tono punitivo
orientadas a resolución
```

## Escalamiento recomendado

```text
Día 1 = notificación al líder/responsable directo
Día 3 = recordatorio al canal interno-equipo-seo
Día 7 = alerta a alerts-operaciones
```

## Campos mínimos de una alerta

```text
automation_key
cliente o área afectada
motivo
acción esperada
responsable sugerido
fecha local Bogotá
nivel de escalamiento
```

## Regla horaria

Colombia usa America/Bogota UTC-5.

Si Supabase cron está en UTC:

```text
hora_utc = hora_colombia + 5 horas
09:00 Colombia = 14:00 UTC
```
