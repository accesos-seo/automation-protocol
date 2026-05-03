# 2026-05-03 19:45 - Auditoria Supabase Storage Gaps

## Alcance

Auditoria segura de solo lectura sobre Supabase DB y Storage para mapear estado real y gaps pendientes.

## Supabase DB - resumen

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

## Automatizaciones detectadas

```text
automation-template:
  status = active
  health_status = healthy
  activation_guarded = false
  repository_path = automations/automation-template

example-shared-automation:
  status = pending_final_validation
  health_status = pending_final_validation
  activation_guarded = true
  repository_path = automations/example-shared-automation
  commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
```

## Storage detectado

Buckets existentes:

```text
automation-outputs
skills
source-evidence
```

Objetos en storage.objects:

```text
object_count = 0
```

Hallazgo crítico:

```text
No hay objetos cargados en Supabase Storage.
No se detecta bucket dedicado para skins.
No se detectan paquetes skill.zip cargados aunque automation-template referencia runtime_bucket = skills.
```

## Skills registradas

```text
automation-template/intake-analysis:
  runtime_location = supabase_storage
  runtime_bucket = skills
  runtime_package_path = automation-template/intake-analysis/0.1.0/skill.zip
  storage_object_present = false

automation-template/requirements-validation:
  runtime_location = supabase_storage
  runtime_bucket = skills
  runtime_package_path = automation-template/requirements-validation/0.1.0/skill.zip
  storage_object_present = false

example-shared-automation/intake-analysis:
  runtime_location = github
  runtime_bucket = none
  runtime_package_path = null
  storage_object_required = no, unless runtime design changes
```

## Gaps reales encontrados

```text
GAP-001: storage.objects esta vacio.
Impacto: cualquier skill con runtime_location = supabase_storage no tiene paquete runtime disponible en Storage.
Severidad: critical para automation-template si el runtime requiere skill.zip.

GAP-002: no existe bucket dedicado para skins.
Impacto: no hay lugar canonico para skins si el diseno requiere assets separados.
Severidad: warning hasta confirmar arquitectura final de skins.

GAP-003: no existe tabla explicita de skins en public schema.
Impacto: no hay metadata relacional para skins si el runtime necesita inventario, versionado o asignacion por automatizacion.
Severidad: warning hasta confirmar arquitectura final de skins.

GAP-004: automation-template tiene tareas failed historicas.
Impacto: no parece haber tareas stuck actuales, pero hay fallos runtime previos a documentar.
Severidad: warning.

GAP-005: example-shared-automation esta correctamente guardada en pending_final_validation.
Impacto: faltan verificacion final no destructiva, decision sobre Storage/skins y pruebas finales autorizadas.
Severidad: expected_pending.
```

## Decisiones pendientes

```text
1. Definir si skins son assets de Storage, registros de tabla, o ambos.
2. Definir nombre canonico del bucket si se requiere: propuesta = skins.
3. Definir tabla de metadata si se requiere: propuesta = public.skin_registry.
4. Subir paquetes skill.zip faltantes para automation-template si ese runtime sigue dependiendo de Storage.
5. Mantener example-shared-automation en github runtime o migrarla a supabase_storage solo si se aprueba el cambio.
```

## Seguridad

```text
final_tests = not_executed
activation = not_executed
activation_guarded unchanged
no deletes
no DDL
no secret writes
no Supabase project creation
```
