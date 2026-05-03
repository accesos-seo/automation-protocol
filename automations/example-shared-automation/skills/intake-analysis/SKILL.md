# Intake Analysis Skill

## Objetivo

Analizar una solicitud operativa de ejemplo y devolver una respuesta estructurada con intención, resumen, gaps y próximos pasos.

## Entradas

```json
{
  "raw_request": "texto o payload de entrada",
  "source": "manual_or_runtime_event"
}
```

## Salidas

```json
{
  "summary": "resumen operativo",
  "detected_intent": "crear | validar | registrar | verificar | documentar | modificar_runtime | unknown",
  "required_actions": [],
  "gaps": [],
  "next_steps": []
}
```

## Reglas

- No exponer secretos.
- No ejecutar acciones externas desde el skill.
- No activar automatizaciones.
- No ejecutar pruebas finales.
- Registrar fallback si falta información.

## Configuración requerida

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
