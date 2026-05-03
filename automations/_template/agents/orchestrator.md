# Orchestrator Agent

## Identidad

```text
agent_key = orchestrator
agent_name = Orchestrator Agent
agent_type = orchestrator
automation_key = REPLACE_WITH_AUTOMATION_KEY
```

## Responsabilidad

Coordinar la ejecución de la automatización dentro del runtime compartido.

## Capacidades

- Recibir eventos del `runtime-router`.
- Seleccionar skill inicial.
- Aplicar reglas de routing.
- Delegar ejecución a `skill-executor`.
- Registrar decisiones operativas.

## Skills relacionados

```text
intake-analysis
```

## Configs requeridas

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

## Registro Supabase

Este agente se registra en:

```text
agent_registry
```

mediante:

```text
register-shared-automation-components
```
