# Handover - Official Final Test HTTP Result

Fecha UTC: 2026-05-04 00:35

## Resumen

Se ejecutó el script oficial:

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
```

usando:

```text
LOCAL_TEST_TOKEN = swarm-local-test
automation_key = validation-shared-runtime-002
```

La llamada HTTP llegó correctamente a:

```text
create-shared-automation-local-test
```

y esta a su vez llamó a:

```text
create-shared-automation
```

## Resultado principal

Se creó la automatización temporal:

```text
automation_key = validation-shared-runtime-002
status = scaffolded
health_status = pending_validation
activation_guarded = true
```

Se creó regla runtime:

```text
rule_key = default-runtime-route
status = active
created_at = 2026-05-04 00:31:12.865149+00
```

## Error parcial observado

El subpaso `audit_log` devolvió:

```text
new row for relation "audit_logs" violates check constraint "audit_logs_actor_type_check"
```

Esto indica que la función intenta insertar un `actor_type` no permitido por el constraint actual de `public.audit_logs`.

## Verificación Supabase

Estado confirmado:

```text
validation-shared-runtime-001:
  status = pending_final_validation
  health_status = manual_validation_prepared
  activation_guarded = true

validation-shared-runtime-002:
  status = scaffolded
  health_status = pending_validation
  activation_guarded = true
```

## Seguridad

```text
No se activó validation-shared-runtime-002.
No se cambió activation_guarded a false.
No se cambió automation-template.
No se borró Storage.
```

## Pendiente técnico

Corregir la función `create-shared-automation` o el constraint `audit_logs_actor_type_check` para alinear el valor de `actor_type` permitido.

Después de corregirlo, repetir el test oficial con una nueva key temporal, por ejemplo:

```text
validation-shared-runtime-003
```

## Estado de cierre

```text
HTTP bridge validado parcialmente: OK
create-shared-automation alcanzada: OK
automation_registry temporal creada: OK
automation_rules default creadas: OK
audit_logs: pendiente por constraint
activación: no ejecutada
```
