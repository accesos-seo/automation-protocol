# 13 - Phase 3 Runtime Hardening Report

## Estado

Trabajo iniciado en la rama `phase-3-runtime-hardening`.

El objetivo del bloque es endurecer el runtime para permitir una prueba controlada que termine con evento:

```text
runtime.execution_completed
```

en lugar de:

```text
runtime.execution_completed_with_fallback
```

## Contexto validado

- Repositorio GitHub: `accesos-seo/automation-protocol`.
- Rama de trabajo remota creada: `phase-3-runtime-hardening`.
- Proyecto Supabase: `Swarm Agentes MD`.
- Project ref: `lwurzjrghzwzxbhrulyn`.
- Automation key principal: `automation-template`.
- Estado base: `phase_3_runtime_active_with_fallback`.
- Edge Functions activas en Supabase:
  - `runtime-router`.
  - `skill-executor`.
  - `runtime-router-local-test`.

## Evidencia previa observada en Supabase

Consulta ejecutada contra `public.runtime_events` para `automation-template` confirmó que la última prueba completa terminó como:

```text
runtime.execution_completed_with_fallback
```

Causas observadas en eventos previos:

- `runtime.openrouter_fallback_used` por `openrouter_http_429`.
- `skill.openrouter_fallback_used` por `openrouter_empty_content` / abort 504.
- El fallback operativo preservó continuidad y cerró la tarea como completada con fallback.

También existe evidencia histórica de al menos una ejecución de skill sin fallback:

```text
skill.execution_completed
```

## Diagnóstico de hardening

El cuello de botella no es el acceso a tablas ni la creación de tareas: el runtime crea `execution_tasks`, registra eventos y llama a `skill-executor`.

El cierre con fallback aparece cuando OpenRouter o el proveedor upstream no devuelve una respuesta usable. Por tanto, una validación controlada de hardening debe separar dos objetivos:

1. mantener el fallback para flujo real;
2. crear una ruta determinística de validación que no dependa de disponibilidad externa de OpenRouter.

## Parche propuesto

Agregar una ruta determinística activada solo por payload controlado:

```json
{
  "event_type": "runtime.hardening.validation",
  "input": {
    "runtime_validation_mode": "deterministic_hardening",
    "skill_key": "intake-analysis"
  }
}
```

Efecto esperado:

- `runtime-router` registra `runtime.deterministic_route_used`.
- `runtime-router` no llama a OpenRouter para la decisión del orquestador.
- `runtime-router` selecciona `intake-analysis` de forma determinística.
- `skill-executor` debe tener ruta equivalente para el mismo modo de validación.
- El evento final debe ser `runtime.execution_completed` si ni router ni skill reportan fallback.

## Bloqueo encontrado

El conector GitHub bloqueó la actualización directa de `supabase/functions/runtime-router/index.ts` porque el archivo contiene referencias legítimas a nombres de variables sensibles de entorno usadas por Supabase. No se introdujo ni se solicitó ningún secreto real.

Control de seguridad respetado:

- no se pidió `service_role`;
- no se pidió token personal;
- no se pegó ninguna API key;
- no se versionó `supabase/.temp/`;
- no se hardcodeó ningún secreto.

## Comandos PowerShell todavía no ejecutados en este bloque

No se ha solicitado ejecución local todavía. Si el conector sigue bloqueando escrituras de Edge Functions, el siguiente paso mínimo por PowerShell será aplicar el parche localmente y hacer commit/push desde la rama ya creada.

## Resultado actual

Parcial. La rama remota existe y el diagnóstico de hardening está definido. Falta aplicar el parche a las Edge Functions y desplegarlo.

## Riesgos pendientes

- El conector de GitHub puede seguir bloqueando escrituras sobre archivos que contienen nombres de variables sensibles, aunque no haya secretos reales.
- La invocación real de Edge Functions con `verify_jwt=true` puede requerir entorno autenticado local o un flujo de prueba desde PowerShell sin compartir credenciales.
- Debe evitarse convertir la ruta determinística en comportamiento normal de producción; debe quedar activada solo por payload explícito de validación.
