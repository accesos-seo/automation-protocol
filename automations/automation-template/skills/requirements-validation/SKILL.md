# Requirements Validation Skill

## Objetivo

Validar si una solicitud o protocolo contiene la información mínima necesaria para avanzar hacia scaffold, deploy o verificación runtime.

## Entradas

```json
{
  "protocol_summary": {},
  "project_summary": {},
  "business_rules": [],
  "integrations": [],
  "success_metrics": [],
  "risks": []
}
```

## Salidas

```json
{
  "is_ready": false,
  "readiness_score": 0,
  "critical_gaps": [],
  "non_blocking_gaps": [],
  "recommended_questions": [],
  "decision": "ready_for_next_phase | needs_more_info | not_viable"
}
```

## Reglas

- Validar integridad antes de sugerir scaffold.
- Separar gaps críticos de gaps no bloqueantes.
- No inventar integraciones, credenciales ni reglas de negocio.
- No ejecutar acciones externas.
- No activar automatizaciones.
- No ejecutar pruebas finales.

## Configuración requerida

```text
OPENROUTER_API_KEY = supabase_secret
AI_PROVIDER = runtime_config
AI_MODEL = runtime_config
```

## Runtime package esperado

```text
bucket = skills
path = automation-template/requirements-validation/0.1.0/skill.zip
```
