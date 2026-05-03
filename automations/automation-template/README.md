# Automation Template

Plantilla runtime base para automatizaciones compartidas.

## Estado

```text
automation_key = automation-template
runtime = shared_supabase_runtime
storage_bucket = skills
```

## Skills

```text
automations/automation-template/skills/intake-analysis/SKILL.md
automations/automation-template/skills/requirements-validation/SKILL.md
```

## Paquetes esperados en Supabase Storage

```text
skills/automation-template/intake-analysis/0.1.0/skill.zip
skills/automation-template/requirements-validation/0.1.0/skill.zip
```

## Seguridad

No guardar secretos reales en este directorio. Las claves deben vivir en Supabase Secrets o en un entorno seguro.
