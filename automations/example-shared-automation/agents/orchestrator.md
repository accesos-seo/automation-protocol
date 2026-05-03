# Orchestrator Agent

## Identidad

```text
agent_key = orchestrator
agent_name = Example Orchestrator Agent
agent_type = orchestrator
automation_key = example-shared-automation
```

## Responsabilidad

Coordinar el flujo de ejemplo dentro del runtime compartido: recibir el evento, seleccionar el skill inicial, aplicar la regla de routing y delegar la ejecución al `skill-executor`.

## Capacidades

- Recibir eventos desde `runtime-router`.
- Seleccionar `intake-analysis` como skill inicial.
- Aplicar `default-runtime-route`.
- Registrar decisiones operativas sin exponer secretos.
- Mantener la automatización en modo guarded durante construcción.

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
