# Shared Automation Template

Este directorio sirve como plantilla para nuevas automatizaciones ejecutadas dentro del runtime compartido Supabase.

## Identidad

```text
automation_key = REPLACE_WITH_AUTOMATION_KEY
automation_name = REPLACE_WITH_AUTOMATION_NAME
protocol_name = REPLACE_WITH_PROTOCOL_NAME
runtime = shared_supabase_runtime
```

## Objetivo

Describir aquí el objetivo operativo de la automatización.

## Entradas esperadas

- Entrada principal:
- Fuente:
- Formato:
- Validaciones mínimas:

## Salidas esperadas

- Salida principal:
- Destino:
- Formato:
- Condiciones de éxito:

## Agentes

Los agentes se definen en:

```text
automations/REPLACE_WITH_AUTOMATION_KEY/agents/
```

## Skills

Los skills se definen en:

```text
automations/REPLACE_WITH_AUTOMATION_KEY/skills/
```

## Reglas de routing

Las reglas se definen en:

```text
automations/REPLACE_WITH_AUTOMATION_KEY/routing-rules/
```

## Configuración

Los valores reales de secretos no se guardan aquí.

Registrar solo nombres de variables y estado:

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

## Estado operativo

```text
status = scaffolded
health_status = pending_validation
activation_guarded = true
```

## Pruebas

Las pruebas finales se ejecutan al cierre del bloque de construcción, según:

```text
docs/17-deferred-final-test-plan.md
```

## Handover

Crear un handover específico en:

```text
handover/REPLACE_WITH_AUTOMATION_KEY-HANDOVER.md
```
