# GitHub Skills to Supabase Inventory

## Correccion operativa

No se debe asumir que solo existen las 3 filas actuales de `skill_registry` como universo completo de skills.

El objetivo correcto es:

```text
Toda skill versionada en GitHub debe estar representada en Supabase skill_registry.
Toda skill que requiera runtime package debe tener objeto en Supabase Storage bucket skills.
```

## Fuentes revisadas

### Supabase skill_registry actual

```text
automation-template/intake-analysis
automation-template/requirements-validation
example-shared-automation/intake-analysis
```

### GitHub skills detectadas en manifest/repo

```text
automations/_template/skills/scaffold-validation/SKILL.md
automations/_template/skills/technical-deployment/SKILL.md
automations/_template/skills/web-source-capture/SKILL.md
automations/automation-template/skills/intake-analysis/SKILL.md        # creado en PR #14
automations/automation-template/skills/requirements-validation/SKILL.md # creado en PR #14
automations/example-shared-automation/skills/intake-analysis/SKILL.md
```

## Matriz de cobertura

| Automation | Skill | GitHub source | Supabase skill_registry | Storage package | Estado |
|---|---|---:|---:|---:|---|
| _template | scaffold-validation | yes | no | no | faltante en Supabase y Storage |
| _template | technical-deployment | yes | no | no | faltante en Supabase y Storage |
| _template | web-source-capture | yes | no | no | faltante en Supabase y Storage |
| automation-template | intake-analysis | PR #14 | yes | no | pendiente Storage |
| automation-template | requirements-validation | PR #14 | yes | no | pendiente Storage |
| example-shared-automation | intake-analysis | yes | yes | no aplica actualmente | runtime github |

## Gap principal

```text
skill_registry solo contiene 3 registros.
GitHub contiene al menos 6 skills/versiones relevantes considerando _template, automation-template y example-shared-automation.
storage.objects = 0.
```

## Decisiones de registro necesarias

### Opcion recomendada

Registrar las skills de `_template` en Supabase como templates reales, no como automatizaciones activas.

Propuesta de campos:

```text
automation_key = _template
skill_key = scaffold-validation | technical-deployment | web-source-capture
skill_name = nombre legible
skill_source_path = automations/_template/skills/{skill_key}/SKILL.md
runtime_location = supabase_storage
runtime_bucket = skills
runtime_package_path = _template/{skill_key}/0.1.0/skill.zip
status = template
required_configs = []
```

## Plan por bloques

### Bloque 1 - Inventario completo

```text
1. Mantener este documento como matriz canonical.
2. Expandir inventario si aparecen mas skills en GitHub.
3. Separar skills de template, automation-template y automatizaciones reales.
```

### Bloque 2 - Registrar faltantes en Supabase

```text
1. Insertar en skill_registry las 3 skills faltantes de _template.
2. Usar status = template para no confundirlas con automatizaciones activas.
3. No activar ninguna automatizacion.
```

### Bloque 3 - Empaquetar todas las skills faltantes

```text
1. Generar skill.zip para _template/scaffold-validation.
2. Generar skill.zip para _template/technical-deployment.
3. Generar skill.zip para _template/web-source-capture.
4. Reutilizar/validar paquetes de automation-template ya planificados.
5. Crear SHA256SUMS global.
```

### Bloque 4 - Subir Storage

```text
1. Subir paquetes al bucket skills.
2. Verificar storage.objects.
3. Comparar checksums.
4. Documentar evidencia.
```

## Seguridad

No se deben ejecutar pruebas finales, activacion, cambios de `activation_guarded`, ni secrets durante este bloque.
