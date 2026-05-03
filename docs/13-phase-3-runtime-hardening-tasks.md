# Phase 3 Runtime Hardening — Task Checklist

Documento vivo de tareas para la rama `phase-3-runtime-hardening`.

Este checklist debe consultarse antes de cada bloque de trabajo y actualizarse cuando aparezca una tarea nueva, un bloqueo, una decisión técnica o una validación completada.

## Reglas de uso

- No avanzar tareas técnicas sin registrar el objetivo en este documento.
- No olvidar bloqueos: si una acción no puede completarse ahora, debe quedar como pendiente explícito.
- No marcar una tarea como completada sin evidencia verificable.
- No pedir ni pegar secretos en el chat.
- No versionar `supabase/.temp/`.
- Antes de commits técnicos, revisar ausencia de secretos hardcodeados.
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

- [x] Rama remota `phase-3-runtime-hardening` creada.
- [x] Informe inicial creado: `docs/13-phase-3-runtime-hardening-report.md`.
- [x] Handover inicial creado: `handover/NEXT_AI_HANDOVER_AFTER_RUNTIME_HARDENING.md`.
- [x] Checklist vivo creado: `docs/13-phase-3-runtime-hardening-tasks.md`.
- [ ] Parche técnico aplicado en Edge Functions.
- [ ] Funciones desplegadas en Supabase.
- [ ] Prueba controlada ejecutada.
- [ ] Evidencia `runtime.execution_completed` registrada.
- [ ] PR creado o actualizado.
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
- [ ] Revisar últimos commits remotos antes de aplicar cambios técnicos.
- [ ] Verificar si hubo commits manuales del operador durante el trabajo del asistente.

### 2. Hardening runtime-router

- [ ] Modificar `supabase/functions/runtime-router/index.ts`.
- [ ] Agregar detección de modo controlado:
  - `input.runtime_validation_mode = "deterministic_hardening"`
  - o `event_type = "runtime.hardening.validation"`
- [ ] Registrar evento `runtime.deterministic_route_used`.
- [ ] Evitar llamada a OpenRouter solo para esa ruta controlada.
- [ ] Seleccionar skill determinística `intake-analysis` o la indicada por `input.skill_key`.
- [ ] Garantizar que `used_fallback = false` en la ruta determinística.
- [ ] Mantener fallback normal para flujo productivo.

### 3. Hardening skill-executor

- [ ] Modificar `supabase/functions/skill-executor/index.ts`.
- [ ] Agregar modo determinístico equivalente para `deterministic_hardening`.
- [ ] Evitar llamada a OpenRouter solo durante prueba controlada.
- [ ] Retornar `completed_with_fallback = false` en esa ruta.
- [ ] Registrar `skill.execution_completed`.
- [ ] Mantener fallback normal para flujo productivo.

### 4. Bloqueos conocidos

- [x] Detectado bloqueo del conector GitHub al intentar escribir Edge Function completa por referencias a nombres de variables sensibles de entorno.
- [ ] Resolver bloqueo con una de estas opciones:
  - aplicar cambios por parche más pequeño desde conector;
  - aplicar cambios desde PowerShell local;
  - usar otro flujo seguro de GitHub si está disponible.
- [ ] Documentar cuál opción se usó.

### 5. Seguridad

- [ ] Revisar que no haya secretos hardcodeados.
- [ ] Confirmar que `.env` real no se sube.
- [ ] Confirmar que `supabase/.temp/` no se sube.
- [ ] Confirmar que solo se usan nombres de variables de entorno, nunca valores reales.
- [ ] Si se usa PowerShell, no pegar `service_role`, tokens ni API keys en el chat.

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
- [ ] Abrir Pull Request contra `main`.
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

## Pendientes capturados para no olvidar

- [ ] Verificar commit manual reciente del operador y reconciliarlo con la rama remota.
- [ ] Reintentar modificación técnica por conector con parche mínimo, si es viable.
- [ ] Si el conector vuelve a bloquear, preparar bloque PowerShell mínimo para aplicar cambios localmente.
- [ ] Al terminar el hardening, cerrar este checklist con estado final y referencias de PR.
