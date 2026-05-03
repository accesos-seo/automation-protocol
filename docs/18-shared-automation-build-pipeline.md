# 18 - Shared Automation Build Pipeline

## Propósito

Definir la arquitectura operativa para crear nuevas automatizaciones dentro del mismo proyecto Supabase usando `automation_key` como separación lógica.

Este pipeline evita crear un proyecto Supabase nuevo por cada proceso.

## Estado base

```text
phase_3_runtime_hardening_validated
runtime_state = active
runtime_health = healthy
activation_guarded = false
```

## Principio

GitHub conserva código, documentación, manifests, reglas y definición versionada.

Supabase conserva estado operativo, registros, jobs, logs, eventos y metadata.

Secrets reales viven en Supabase Secrets o entorno seguro. No se guardan en GitHub ni en tablas públicas.

## Funciones construidas

### generate-shared-automation-scaffold

Estado:

```text
ACTIVE
verify_jwt = true
```

Responsabilidad:

- Validar `automation_key`.
- Generar lista de archivos esperados.
- Generar contenido scaffold para GitHub.
- No escribir en base de datos.
- No ejecutar pruebas.
- No activar automatizaciones.

### build-shared-automation-draft

Estado:

```text
ACTIVE
verify_jwt = true
```

Responsabilidad:

- Validar `automation_key`.
- Verificar duplicados en `automation_registry`.
- Crear draft en `automation_registry`.
- Registrar config placeholder.
- Registrar regla base.
- Guardar metadata de scaffold esperado.
- Crear audit log.
- Mantener `activation_guarded = true`.

### create-shared-automation

Estado:

```text
ACTIVE
verify_jwt = true
```

Responsabilidad:

- Crear alta base directa.
- Insertar `automation_registry`.
- Insertar `deployment_configs`.
- Insertar `automation_rules`.
- Crear audit log.

### register-shared-automation-components

Estado:

```text
ACTIVE
verify_jwt = true
```

Responsabilidad:

- Buscar automatización existente por `automation_key`.
- Registrar agentes.
- Registrar skills.
- Registrar configs.
- Registrar reglas.
- Crear audit log.

### create-shared-automation-local-test

Estado:

```text
ACTIVE
verify_jwt = false
```

Responsabilidad:

- Puente controlado para pruebas finales.
- Usar `x-test-token`.
- Llamar internamente a `create-shared-automation` sin exponer service role.
- Mantener pruebas diferidas hasta el cierre.

## Flujo recomendado

```text
1. Definir automation_key
2. Ejecutar generate-shared-automation-scaffold
3. Crear archivos generados en GitHub
4. Ejecutar build-shared-automation-draft o create-shared-automation
5. Ejecutar register-shared-automation-components
6. Mantener activation_guarded = true
7. Ejecutar pruebas finales al cierre
8. Activar solo con evidencia runtime
```

## Estados operativos

### Draft generado

```text
status = draft_scaffold_generated
health_status = pending_github_files
activation_guarded = true
```

### Scaffold versionado

```text
status = scaffolded
health_status = pending_component_registration
activation_guarded = true
```

### Componentes registrados

```text
status = components_registered
health_status = pending_validation
activation_guarded = true
```

### Validado

```text
status = validated
health_status = healthy
activation_guarded = false
```

## Tablas principales

```text
automation_registry
agent_registry
skill_registry
deployment_configs
automation_rules
audit_logs
execution_tasks
runtime_events
```

## Separación lógica

Cada proceso se separa por:

```text
automation_key
```

Esto permite múltiples automatizaciones dentro del mismo proyecto Supabase.

## Política de pruebas

Las pruebas están diferidas según:

```text
docs/17-deferred-final-test-plan.md
```

No se ejecutan altas reales, pruebas runtime ni activaciones hasta el cierre de construcción.

## Pendiente de construcción

- Crear validador estático de manifests.
- Crear función de actualización de estado post-scaffold.
- Crear endpoint seguro para preparar payload de registro de componentes desde manifest.
- Crear documentación final de uso operativo.
