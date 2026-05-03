# 17 - Deferred Final Test Plan

## Decisión operativa

Las pruebas se guardan para el final. Mientras tanto se continuará construyendo infraestructura, documentación operativa y funciones de soporte.

Estado de esta decisión:

```text
accepted
```

## Alcance de pruebas diferidas

Las siguientes pruebas quedan diferidas hasta el cierre de la construcción:

1. Alta real con `create-shared-automation-local-test`.
2. Verificación de inserts en:
   - `automation_registry`.
   - `deployment_configs`.
   - `automation_rules`.
   - `audit_logs`.
3. Prueba runtime de una automatización nueva.
4. Verificación de eventos en `runtime_events`.
5. Verificación de tareas en `execution_tasks`.
6. Activación controlada de una automatización nueva.

## Estado ya construido antes de diferir pruebas

Funciones desplegadas:

```text
create-shared-automation = ACTIVE, verify_jwt = true
create-shared-automation-local-test = ACTIVE, verify_jwt = false
```

Tablas verificadas como existentes:

```text
automation_registry
automation_rules
deployment_configs
audit_logs
execution_tasks
runtime_events
agent_registry
skill_registry
deployment_jobs
deployment_logs
```

## Regla para el resto de construcción

Mientras las pruebas estén diferidas:

- No insertar automatizaciones de prueba.
- No activar automatizaciones nuevas.
- No hacer pruebas runtime finales.
- Sí se permite construir funciones, plantillas, runbooks, documentación y migraciones no destructivas.
- Sí se permite inspeccionar schema y funciones existentes.
- Sí se permite desplegar funciones nuevas si no ejecutan cambios destructivos por sí mismas.

## Prueba final pendiente

Cuando se autorice el bloque final de pruebas, usar un `automation_key` temporal con nombre claro:

```text
validation-shared-runtime-001
```

Payload para función puente:

```json
{
  "automation_key": "validation-shared-runtime-001",
  "automation_name": "Validation Shared Runtime 001",
  "protocol_name": "Validation Shared Runtime Protocol",
  "default_skill_key": "intake-analysis",
  "metadata": {
    "purpose": "final_validation",
    "source": "deferred_final_test_plan"
  }
}
```

## Criterio de éxito final

La prueba final será exitosa cuando:

```text
create-shared-automation-local-test returns ok = true
automation_registry contains validation-shared-runtime-001
deployment_configs contains OPENROUTER_API_KEY placeholder
automation_rules contains default-runtime-route
runtime test produces runtime.execution_completed or documented expected fallback
no running tasks remain stuck
handover records all IDs and events
```

## Limpieza

No borrar registros de validación sin confirmación explícita. Si se requiere limpieza posterior, documentarla como operación manual segura o migración controlada.
