# Intake Analysis Skill

## Objetivo

Analizar una solicitud de intake y devolver una estructura normalizada para el pipeline de automatizaciones compartidas.

## Entradas

```json
{
  "raw_request": "texto o payload original",
  "source": "manual | form | runtime_event | api",
  "metadata": {}
}
```

## Salidas

```json
{
  "summary": "resumen operativo",
  "detected_intent": "crear | validar | registrar | verificar | documentar | modificar_runtime | unknown",
  "readiness_score": 0,
  "required_actions": [],
  "gaps": [],
  "next_steps": []
}
```

## Reglas

- No exponer secretos.
- No activar automatizaciones.
- No ejecutar pruebas finales.
- No escribir en runtime desde el skill.
- Si falta información crítica, devolver gaps estructurados.
- Si la intención no es clara, usar `detected_intent = unknown`.

## Configuración requerida

```text
OPENROUTER_API_KEY = supabase_secret
AI_PROVIDER = runtime_config
AI_MODEL = runtime_config
```

## Runtime package esperado

```text
bucket = skills
path = automation-template/intake-analysis/0.1.0/skill.zip
```
