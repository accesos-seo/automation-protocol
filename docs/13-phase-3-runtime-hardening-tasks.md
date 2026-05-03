# Phase 3 Runtime Hardening — Task Checklist

Documento vivo de tareas para la fase `phase-3-runtime-hardening`.

Este checklist debe consultarse antes de cada bloque de trabajo y actualizarse cuando aparezca una tarea nueva, un bloqueo, una decisión técnica o una validación completada.

## Reglas de uso

- No avanzar tareas técnicas sin registrar el objetivo en este documento.
- No olvidar bloqueos: si una acción no puede completarse ahora, debe quedar como pendiente explícito.
- No marcar una tarea como completada sin evidencia verificable.
- No compartir credenciales en chat ni documentación.
- No versionar carpetas temporales locales de Supabase.
- Antes de commits técnicos, revisar ausencia de valores sensibles hardcodeados.
- Mantener sincronizados:
  - `docs/13-phase-3-runtime-hardening-report.md`
  - `docs/13-phase-3-runtime-hardening-tasks.md`
  - `handover/NEXT_AI_HANDOVER_AFTER_RUNTIME_HARDENING.md`

## Objetivo de la fase

Conseguir que una prueba controlada del runtime termine con:

```text
runtime.execution_completed
```

en vez de:

```text
runtime.execution_completed_with_fallback
```

sin eliminar el fallback operativo del flujo normal.

## Estado general

- [x] Rama `phase-3-runtime-hardening` creada previamente.
- [x] PR #2 fusionado manualmente a `main` con informe/handover inicial.
- [x] Informe inicial creado: `docs/13-phase-3-runtime-hardening-report.md`.
- [x] Handover inicial creado: `handover/NEXT_AI_HANDOVER_AFTER_RUNTIME_HARDENING.md`.
- [x] Checklist vivo creado.
- [ ] Parche técnico aplicado en Edge Functions.
- [ ] Funciones desplegadas en Supabase.
- [ ] Prueba controlada ejecutada.
- [ ] Evidencia `runtime.execution_completed` registrada.
- [ ] PR técnico creado o actualizado.
- [ ] Handover final actualizado con commits, PRs, errores y siguiente paso.

## Checklist técnico

### 1. Preparación

- [x] Confirmar estado base: `phase_3_runtime_active_with_fallback`.
- [x] Confirmar automation key principal: `automation-template`.
- [x] Confirmar project ref Supabase: `lwurzjrghzwzxbhrulyn`.
- [x] Confirmar funciones runtime sincronizadas:
  - `runtime-router`
  - `skill-executor`
  - `runtime-router-local-test`
- [x] Revisar últimos commits remotos antes de aplicar cambios técnicos.
- [x] Verificar merge manual del operador durante el trabajo del asistente.

### 2. Hardening runtime-router

- [ ] Modificar `supabase/functions/runtime-router/index.ts`.
- [ ] Agregar detección de modo controlado:
  - `input.runtime_validation_mode = "deterministic_hardening"`
  - o `event_type = "runtime.hardening.validation"`
- [ ] Registrar evento `runtime.deterministic_route_used`.
- [ ] Evitar llamada al proveedor externo solo para esa ruta controlada.
- [ ] Seleccionar skill determinística `intake-analysis` o la indicada por `input.skill_key`.
- [ ] Garantizar que `used_fallback = false` en la ruta determinística.
- [ ] Mantener fallback normal para flujo productivo.

### 3. Hardening skill-executor

- [ ] Modificar `supabase/functions/skill-executor/index.ts`.
- [ ] Agregar modo determinístico equivalente para `deterministic_hardening`.
- [ ] Evitar llamada al proveedor externo solo durante prueba controlada.
- [ ] Retornar `completed_with_fallback = false` en esa ruta.
- [ ] Registrar `skill.execution_completed`.
- [ ] Mantener fallback normal para flujo productivo.

### 4. Bloqueos conocidos

- [x] GitHub bloqueó la actualización directa de Edge Functions por referencias a nombres de variables de entorno sensibles, sin exposición de valores reales.
- [x] Supabase deploy desde conector fue bloqueado por controles de seguridad del entorno incluso con función de prueba sin valores sensibles.
- [ ] Resolver bloqueo con PowerShell local mínimo o flujo seguro alternativo.
- [ ] Documentar cuál opción se usó.

### 5. Seguridad

- [ ] Revisar que no haya valores sensibles hardcodeados.
- [ ] Confirmar que archivos locales de entorno no se suben.
- [ ] Confirmar que carpetas temporales locales de Supabase no se suben.
- [ ] Confirmar que solo se usan nombres de variables de entorno, nunca valores reales.

### 6. Deploy Supabase

- [ ] Desplegar `runtime-router`.
- [ ] Desplegar `skill-executor`.
- [ ] Confirmar funciones ACTIVE.
- [ ] Registrar fecha/hora del deploy en el informe.

### 7. Prueba controlada

Payload esperado:

```json
{
  "automation_key": "automation-template",
  "event_type": "runtime.hardening.validation",
  "input": {
    "runtime_validation_mode": "deterministic_hardening",
    "skill_key": "intake-analysis",
    "raw_request": "Prueba controlada de hardening runtime sin fallback."
  }
}
```

- [ ] Ejecutar prueba mediante `runtime-router-local-test` o flujo seguro equivalente.
- [ ] Confirmar respuesta `ok = true`.
- [ ] Confirmar `completed_with_fallback = false`.
- [ ] Confirmar evento `runtime.deterministic_route_used`.
- [ ] Confirmar evento `skill.execution_completed`.
- [ ] Confirmar evento final `runtime.execution_completed`.

### 8. Evidencia SQL

- [ ] Consultar `runtime_events` para `automation-template`.
- [ ] Consultar `execution_tasks` para la tarea generada.
- [ ] Registrar IDs relevantes en `docs/13-phase-3-runtime-hardening-report.md`.
- [ ] Verificar que no quedan tareas `running` colgadas.

### 9. GitHub / PR

- [ ] Commit técnico de Edge Functions.
- [ ] Commit de documentación actualizada.
- [ ] Abrir Pull Request contra `main` si el cambio técnico se realiza en rama.
- [ ] Registrar PR en informe y handover.
- [ ] No fusionar sin evidencia mínima de aceptación.

### 10. Handover final

Actualizar `handover/NEXT_AI_HANDOVER_AFTER_RUNTIME_HARDENING.md` con:

- [ ] Estado alcanzado.
- [ ] Archivos modificados.
- [ ] Commits.
- [ ] Pull Requests.
- [ ] Comandos PowerShell validados, si hubo.
- [ ] Errores encontrados.
- [ ] Riesgos pendientes.
- [ ] Siguiente paso exacto.
- [ ] Prompt de arranque para la próxima IA.

## Registro de decisiones

### Decisión 001 — Checklist vivo obligatorio

Se crea este documento porque el operador pidió evitar pérdida de tareas y mantener una lista consultable, actualizada paso a paso durante la fase.

Estado: aceptada.

### Decisión 002 — Automatización como criterio operativo preferido

El operador prefiere que GitHub y Supabase sean operados por el asistente/conectores siempre que sea posible. PowerShell queda reservado para casos necesarios e importantes, especialmente cuando conectores bloqueen escritura, deploy o pruebas locales.

Estado: aceptada.

### Decisión 003 — PowerShell mínimo por bloqueo de conectores

GitHub y Supabase bloquearon las acciones necesarias para modificar o desplegar Edge Functions desde el conector. Por tanto, el siguiente paso técnico requiere PowerShell local mínimo.

Estado: aceptada operativamente por necesidad técnica.

## Pendientes capturados para no olvidar

- [ ] Aplicar parche técnico localmente si los conectores siguen bloqueados.
- [ ] Confirmar que la rama local esté sincronizada con `main` después del merge manual del PR #2.
- [ ] Crear nueva rama técnica si es necesario: `phase-3-runtime-hardening-runtime-patch`.
- [ ] Desplegar `runtime-router` y `skill-executor` desde Supabase CLI.
- [ ] Ejecutar prueba controlada vía `runtime-router-local-test`.
- [ ] Actualizar informe, checklist y handover con evidencia real.
