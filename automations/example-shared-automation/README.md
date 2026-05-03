# Example Shared Automation

Automatización ejemplo para demostrar la estructura completa de una automatización compartida bajo el runtime Supabase común.

## Identidad

```text
automation_key = example-shared-automation
automation_name = Example Shared Automation
protocol_name = Example Shared Automation Protocol
runtime = shared_supabase_runtime
```

## Objetivo

Recibir una solicitud operativa de ejemplo, analizarla y devolver una estructura mínima con resumen, intención detectada, acciones requeridas y próximos pasos.

## Entradas esperadas

- Entrada principal: `raw_request`
- Fuente: evento o payload manual de construcción
- Formato: JSON serializable
- Validaciones mínimas: presencia de texto o payload fuente, sin valores secretos

## Salidas esperadas

- Salida principal: análisis estructurado
- Destino: runtime/event logs durante pruebas autorizadas
- Formato: JSON serializable
- Condiciones de éxito: intención detectada, acciones listadas, gaps documentados

## Agentes

```text
automations/example-shared-automation/agents/orchestrator.md
```

## Skills

```text
automations/example-shared-automation/skills/intake-analysis/SKILL.md
```

## Reglas de routing

```text
automations/example-shared-automation/routing-rules/default-runtime-route.json
```

## Manifest

```text
automations/example-shared-automation/deployment/manifest.json
```

## Configuración

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

No se guardan valores reales de secretos en GitHub.

## Estado operativo esperado

```text
status = scaffolded
health_status = pending_validation
activation_guarded = true
final_tests = deferred
```

## Handover

```text
handover/example-shared-automation-HANDOVER.md
```

## Restricción

Este ejemplo no ejecuta pruebas finales ni activación.
