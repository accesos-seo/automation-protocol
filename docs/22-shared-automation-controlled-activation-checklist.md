# 22 - Shared Automation Controlled Activation Checklist

## Propósito

Checklist para activar una automatización compartida solo después de pruebas finales exitosas y evidencia documentada.

## Scripts oficiales

Activación controlada:

```text
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
```

Pausa / rollback controlado:

```text
scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
```

## Regla principal

No activar si falta evidencia.

La activación solo procede cuando:

```text
status = validated
health_status = healthy
activation_guarded = false
```

## Precondiciones

Confirmar:

```text
final tests completed
handover actualizado
runtime_events revisados
execution_tasks revisadas
audit_logs revisados
secrets configurados
no hay secretos en GitHub
no hay tasks stuck
```

## Verificación de estado previo

```sql
select automation_key, status, health_status, activation_guarded, updated_at
from public.automation_registry
where automation_key = 'REPLACE_WITH_AUTOMATION_KEY';
```

Estado mínimo requerido antes de validar:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
```

## Ruta recomendada con script

```powershell
$env:SUPABASE_URL = "https://lwurzjrghzwzxbhrulyn.supabase.co"
$env:SUPABASE_AUTH_TOKEN = "REPLACE_WITH_SUPABASE_AUTH_TOKEN"

.\scripts\powershell\shared-automation\Enable-SharedAutomationControlledActivation.ps1 `
  -AutomationKey "REPLACE_WITH_AUTOMATION_KEY"
```

Para marcar como `validated` sin activar todavía:

```powershell
.\scripts\powershell\shared-automation\Enable-SharedAutomationControlledActivation.ps1 `
  -AutomationKey "REPLACE_WITH_AUTOMATION_KEY" `
  -SkipActiveStep
```

## Paso 1 - Marcar como validated

Usar:

```text
update-shared-automation-build-state
```

Payload:

```json
{
  "automation_key": "REPLACE_WITH_AUTOMATION_KEY",
  "target_state": "validated",
  "evidence": {
    "final_tests_passed": true,
    "runtime_events_reviewed": true,
    "execution_tasks_reviewed": true,
    "audit_logs_reviewed": true,
    "handover_updated": true
  },
  "notes": "Final validation passed. Automation is ready for controlled activation."
}
```

Resultado esperado:

```text
status = validated
health_status = healthy
activation_guarded = false
```

## Paso 2 - Confirmar estado validated

```sql
select automation_key, status, health_status, activation_guarded, metadata, updated_at
from public.automation_registry
where automation_key = 'REPLACE_WITH_AUTOMATION_KEY';
```

## Paso 3 - Activar

Usar:

```text
update-shared-automation-build-state
```

Payload:

```json
{
  "automation_key": "REPLACE_WITH_AUTOMATION_KEY",
  "target_state": "active",
  "evidence": {
    "validated_state_confirmed": true,
    "activation_approved": true
  },
  "notes": "Controlled activation after successful final validation."
}
```

Resultado esperado:

```text
status = active
health_status = healthy
activation_guarded = false
```

## Paso 4 - Confirmar activación

```sql
select automation_key, status, health_status, activation_guarded, updated_at
from public.automation_registry
where automation_key = 'REPLACE_WITH_AUTOMATION_KEY';
```

## Paso 5 - Monitoreo inmediato

Durante la primera ejecución real revisar:

```sql
select automation_key, event_type, status, created_at
from public.runtime_events
where automation_key = 'REPLACE_WITH_AUTOMATION_KEY'
order by created_at desc
limit 20;
```

```sql
select automation_key, task_type, status, created_at, updated_at
from public.execution_tasks
where automation_key = 'REPLACE_WITH_AUTOMATION_KEY'
order by created_at desc
limit 20;
```

## Condiciones de rollback a paused

Pausar si ocurre cualquiera de estos casos:

```text
runtime error no documentado
task stuck
evento inesperado crítico
config faltante
secret no disponible
comportamiento no determinístico riesgoso
```

Ruta con script:

```powershell
.\scripts\powershell\shared-automation\Disable-SharedAutomation.ps1 `
  -AutomationKey "REPLACE_WITH_AUTOMATION_KEY" `
  -Reason "REPLACE_WITH_REASON"
```

Payload de pausa:

```json
{
  "automation_key": "REPLACE_WITH_AUTOMATION_KEY",
  "target_state": "paused",
  "evidence": {
    "pause_reason": "REPLACE_WITH_REASON"
  },
  "notes": "Paused after activation due to observed issue."
}
```

## Registro de auditoría esperado

```sql
select entity_type, entity_id, action, actor_type, old_value, new_value, created_at
from public.audit_logs
where action = 'update_shared_automation_build_state'
order by created_at desc
limit 20;
```

## Prohibiciones

No activar si:

```text
status no es validated
health_status no es healthy
activation_guarded sigue true
handover no está actualizado
hay tasks stuck
hay secrets faltantes
hay errores runtime sin clasificar
```

## Cierre

Una activación se considera correcta cuando:

```text
status = active
health_status = healthy
activation_guarded = false
primera ejecución real monitoreada
sin tasks stuck
sin exposición de secrets
audit log generado
handover actualizado
```
