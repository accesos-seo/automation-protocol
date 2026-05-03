# Intake Analysis Skill

## Identidad

```text
skill_key = intake-analysis
skill_name = Intake Analysis Skill
automation_key = REPLACE_WITH_AUTOMATION_KEY
runtime_location = github
```

## Propósito

Analizar la entrada inicial de una automatización y convertirla en una estructura operativa mínima para routing, validación y ejecución.

## Entradas

```json
{
  "raw_request": "Texto o payload original",
  "source": "origen_del_evento",
  "metadata": {}
}
```

## Salidas

```json
{
  "summary": "Resumen operativo",
  "detected_intent": "intención detectada",
  "required_actions": [],
  "missing_information": [],
  "next_skill_key": null
}
```

## Reglas

- No exponer secretos.
- No asumir credenciales disponibles.
- Registrar gaps como `missing_information`.
- Mantener salida JSON serializable.
- Para pruebas finales, registrar evidencia en `runtime_events` y `execution_tasks`.

## Configs requeridas

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

## Registro Supabase

Este skill se registra en:

```text
skill_registry
```

mediante:

```text
register-shared-automation-components
```
