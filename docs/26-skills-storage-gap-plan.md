# Skills Storage Gap Plan

## Correccion de termino

La auditoria anterior menciono `skins` por error. El termino correcto es `skills`.

Este documento reemplaza cualquier referencia previa a skins en el plan operativo.

## Estado confirmado

Proyecto Supabase compartido:

```text
project_ref = lwurzjrghzwzxbhrulyn
```

Buckets existentes:

```text
automation-outputs
skills
source-evidence
```

Storage:

```text
storage.objects = 0
```

Registros principales:

```text
automation_registry = 2
agent_registry = 3
skill_registry = 3
deployment_configs = 5
automation_rules = 2
runtime_events = 48
execution_tasks = 19
audit_logs = 1
```

## Hallazgo principal

Hay skills registradas que apuntan a Supabase Storage, pero no hay objetos cargados.

### Skills afectadas

```text
automation-template/intake-analysis
runtime_location = supabase_storage
runtime_bucket = skills
runtime_package_path = automation-template/intake-analysis/0.1.0/skill.zip
storage_object_present = false

automation-template/requirements-validation
runtime_location = supabase_storage
runtime_bucket = skills
runtime_package_path = automation-template/requirements-validation/0.1.0/skill.zip
storage_object_present = false
```

### Skill no afectada por Storage

```text
example-shared-automation/intake-analysis
runtime_location = github
runtime_bucket = none
runtime_package_path = null
storage_object_required = false
```

## Gaps reales

```text
GAP-SKILL-001: storage.objects esta vacio.
Impacto: skills con runtime_location = supabase_storage no tienen paquete runtime disponible.

GAP-SKILL-002: no se encontro en GitHub la ruta automations/automation-template/skills/intake-analysis/SKILL.md.
Impacto: no se puede regenerar skill.zip de automation-template desde fuente GitHub confirmada aun.

GAP-SKILL-003: no se encontro en GitHub la ruta automations/automation-template/skills/requirements-validation/SKILL.md.
Impacto: no se puede regenerar skill.zip de automation-template desde fuente GitHub confirmada aun.

GAP-SKILL-004: example-shared-automation tiene fuente GitHub disponible para intake-analysis, pero su runtime esta declarado como github, no supabase_storage.
Impacto: no requiere objeto Storage salvo cambio de arquitectura.
```

## Plan de trabajo en bloques

### Bloque 1 - Resolver fuente canonica de skills

Tipo: GitHub read + documentacion.

```text
1. Buscar rutas reales de automation-template en GitHub.
2. Comparar definition_path y skill_source_path registrados contra archivos existentes.
3. Listar skills con fuente faltante.
4. Preparar decision: corregir registros a rutas existentes o crear archivos fuente faltantes.
5. Documentar matriz skill_registry vs GitHub vs Storage.
```

### Bloque 2 - Preparar paquetes skill.zip

Tipo: GitHub docs/scripts. No sube Storage todavia.

```text
1. Crear script de empaquetado reproducible para skills.
2. Definir estructura ZIP canonica.
3. Calcular checksum local esperado.
4. Generar manifest de paquetes.
5. Documentar comando de subida Storage.
```

### Bloque 3 - Cargar skills a Storage

Tipo: Storage write controlado.

```text
1. Subir skill.zip al bucket skills.
2. Verificar storage.objects.
3. Comparar paths contra runtime_package_path.
4. Actualizar checksum/source_hash si corresponde.
5. Registrar evidencia en handover historico.
```

### Bloque 4 - Verificacion final no destructiva

Tipo: read-only.

```text
1. Verificar automation_registry.
2. Verificar agent_registry.
3. Verificar skill_registry.
4. Verificar deployment_configs sin secretos.
5. Verificar automation_rules.
6. Verificar runtime_events.
7. Verificar execution_tasks.
8. Verificar storage.objects.
9. Documentar resultado final.
```

## Politica de confirmaciones

Permitido dentro de bloque aprobado:

```text
SELECT
auditorias
crear ramas GitHub
crear PRs
documentacion
handovers
scripts no destructivos
```

Requiere autorizacion separada:

```text
DELETE
DDL
subir objetos Storage
modificar registros runtime productivos
guardar secretos reales
activar automatizaciones
ejecutar pruebas finales
cambiar activation_guarded = false
cambiar status = active
```
