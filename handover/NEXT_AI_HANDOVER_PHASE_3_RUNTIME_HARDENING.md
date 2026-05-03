# Handover para siguiente IA - Fase 3 Runtime Hardening

## Prompt de arranque para la siguiente IA

Usar este texto para iniciar una nueva ventana o sesión:

```text
Continúa el proyecto `accesos-seo/automation-protocol`. No reinicies el diagnóstico.

Primero lee en GitHub estos archivos:

1. `handover/NEXT_AI_HANDOVER_PHASE_3_RUNTIME_HARDENING.md`
2. `docs/12-phase-3-sync-report.md`
3. `handover/PHASE_3_RUNTIME_ACTIVE.md`
4. `protocol.config.json`
5. `docs/05-github-vs-supabase-residency-map.md`

Contexto: Fase 3 ya fue sincronizada entre Supabase y GitHub. El repo ya es privado. El runtime real de Supabase ya fue descargado, versionado y fusionado a `main`. El siguiente trabajo es `phase-3-runtime-hardening`: crear una ruta determinística de validación para que una prueba controlada termine en `runtime.execution_completed` sin depender del fallback.

Regla de trabajo: usa PowerShell paso a paso. No pidas secretos en el chat. No pegues ni solicites service_role keys, tokens personales ni claves reales. Documenta automáticamente cada avance importante en el repositorio, actualizando este handover o creando un informe nuevo en `docs/` o `handover/`.
```

## Propósito de este handover

Este documento entrega el contexto completo para que otra IA pueda continuar el trabajo sin reiniciar el diagnóstico. El proyecto ya pasó por sincronización entre Supabase y GitHub. El siguiente objetivo es endurecer el runtime para reducir la dependencia del fallback y lograr una ejecución estable terminando en `runtime.execution_completed`.

## Regla permanente de documentación continua

Cada IA que continúe este proyecto debe documentar los avances importantes sin esperar a que el operador lo pida.

La regla es:

```text
Todo cambio relevante debe quedar versionado en GitHub y resumido en un documento de continuidad.
```

La IA debe documentar especialmente:

- cambios de arquitectura;
- nuevas ramas creadas;
- commits importantes;
- Pull Requests abiertos o fusionados;
- cambios en Supabase Edge Functions;
- cambios en migraciones, policies o tablas;
- resultados de pruebas runtime;
- errores relevantes y cómo se resolvieron;
- decisiones de seguridad;
- próximos pasos y criterios de aceptación.

Ubicación recomendada para la documentación:

```text
docs/
handover/
```

Convención recomendada:

```text
docs/13-phase-3-runtime-hardening-report.md
handover/NEXT_AI_HANDOVER_<FASE_O_TAREA>.md
```

Al terminar un bloque de trabajo, la IA debe dejar preparado el siguiente handover con:

1. estado alcanzado;
2. archivos tocados;
3. commits/PRs;
4. comandos útiles ya validados;
5. errores encontrados;
6. riesgos pendientes;
7. próximo paso exacto;
8. prompt de arranque para la siguiente IA.

## Proyecto

- Repositorio GitHub: `accesos-seo/automation-protocol`
- Visibilidad actual: privado
- Proyecto Supabase: `Swarm Agentes MD`
- Supabase project ref: `lwurzjrghzwzxbhrulyn`
- Automation key principal: `automation-template`
- Rama principal: `main`
- Runtime actual: activo con fallback operativo

## Informes y documentos clave ya creados

La siguiente IA debe leer primero estos archivos en el repositorio:

1. `docs/12-phase-3-sync-report.md`
   - Informe principal de sincronización Fase 3.
   - Documenta que GitHub fue privado, que PowerShell se usó como puente, que Supabase CLI funcionó, que las funciones fueron descargadas y que el Pull Request fue fusionado.

2. `handover/PHASE_3_RUNTIME_ACTIVE.md`
   - Handover previo que documenta que Supabase ya estaba por delante de GitHub y que Fase 3 estaba activa con fallback.

3. `protocol.config.json`
   - Actualizado desde estado `phase_3_ready_but_activation_guarded` hacia estado runtime activo con fallback.

4. `docs/04-phase-3-technical-deployer.md`
   - Define la función de Fase 3: recibir handoff, generar deployment job, publicar en GitHub, preparar Supabase, registrar agentes/skills, validar y activar.

5. `docs/05-github-vs-supabase-residency-map.md`
   - Define residencia: código/skills/scripts/manifests en GitHub; estado/eventos/logs/metadata en Supabase; secretos en Supabase Secrets o entorno seguro.

6. `docs/09-acceptance-criteria.md`
   - Define criterios de aceptación generales del protocolo.

## Estado alcanzado

### GitHub

El repositorio fue convertido a privado. Esto era necesario porque contiene arquitectura interna, nombres de Edge Functions, estructura Supabase, migraciones, handovers y lógica operativa.

Se creó y fusionó el Pull Request:

```text
sync: add deployed phase 3 runtime functions #1
```

El PR fusionó la rama:

```text
phase-3-sync-supabase-runtime
```

hacia:

```text
main
```

Commit local/principal de sincronización:

```text
41c83cc sync: add deployed phase 3 runtime functions
```

Después se añadió el informe:

```text
docs/12-phase-3-sync-report.md
```

Commit del informe:

```text
cd5cf4f71f700f2a4bc0039c09d399570e971b10
```

### Supabase

Supabase tenía Edge Functions activas antes de la sincronización. Se confirmaron mediante Supabase CLI:

```text
runtime-router            ACTIVE
skill-executor            ACTIVE
runtime-router-local-test ACTIVE
```

También existen otras funciones previas de fases anteriores, entre ellas:

```text
submit-automation-request
get-pending-protocols
specialist_id
create-scaffold-job
scaffold/index.ts
run-build-scaffold-mjs
test-phase-2
intake-router
```

### PowerShell local del operador

El operador trabaja en Windows PowerShell.

Ruta local del repositorio:

```text
C:\Users\ceoel\automation-protocol
```

Se usó Supabase CLI vía `npx`, no instalación global:

```powershell
npx -y supabase@latest
```

Node y npm disponibles:

```text
Node v22.19.0
npm 10.9.3
```

Supabase CLI usada:

```text
2.98.0
```

El operador completó login Supabase CLI correctamente.

## Archivos runtime sincronizados en GitHub

Las funciones reales descargadas desde Supabase quedaron versionadas en:

```text
supabase/functions/runtime-router/index.ts
supabase/functions/skill-executor/index.ts
supabase/functions/runtime-router-local-test/index.ts
```

También se añadió `.gitignore` para evitar subir carpeta temporal local:

```text
supabase/.temp/
```

## Corrección preventiva de seguridad ya aplicada

Antes de versionar, se revisaron referencias a tokens/secrets. No se encontraron claves reales pegadas.

Se detectó en `runtime-router-local-test` un token por defecto:

```ts
Deno.env.get("LOCAL_TEST_TOKEN") || "swarm-local-test"
```

Se corrigió a:

```ts
Deno.env.get("LOCAL_TEST_TOKEN")
```

Motivo: incluso en repo privado, no debe existir token fallback hardcodeado.

## Estado runtime observado

El flujo runtime completo ya funciona:

```text
PowerShell -> runtime-router-local-test -> runtime-router -> skill-executor -> runtime_events
```

El último flujo observado completó con fallback operativo:

```text
runtime.execution_completed_with_fallback
skill.execution_completed_with_fallback
```

La causa principal observada fue dependencia del proveedor IA externo vía OpenRouter: errores/rate limit/timeout del proveedor provocan fallback.

## Problema pendiente

El sistema está operativo, pero la validación estable de Fase 3 todavía depende demasiado de OpenRouter.

El fallback funciona y debe conservarse como continuidad operativa, pero no debe ser la ruta dominante para pruebas controladas.

## Siguiente objetivo técnico

Crear una nueva rama:

```text
phase-3-runtime-hardening
```

Objetivo de la rama:

1. Añadir una ruta determinística para eventos de prueba controlados.
2. Mantener OpenRouter/IA externa para decisiones semánticas reales.
3. Mantener fallback para fallos externos.
4. Registrar eventos diferenciados:
   - ruta determinística usada,
   - ruta IA usada,
   - fallback usado,
   - error real.
5. Desplegar a Supabase desde código versionado.
6. Ejecutar una prueba segura desde PowerShell.
7. Confirmar en Supabase un evento:

```text
runtime.execution_completed
```

sin fallback para la prueba controlada.

## Criterio de éxito del próximo bloque

El siguiente bloque se considera exitoso si:

- La rama `phase-3-runtime-hardening` existe.
- El runtime mantiene compatibilidad actual.
- Una prueba controlada termina con `runtime.execution_completed`.
- El fallback sigue existiendo y funciona ante errores del proveedor IA.
- No se versionan secretos.
- Supabase `runtime_events` registra evidencia clara del flujo.

## Hoja de ruta de documentación obligatoria

Durante `phase-3-runtime-hardening`, la siguiente IA debe crear o actualizar al menos estos documentos:

```text
docs/13-phase-3-runtime-hardening-report.md
handover/NEXT_AI_HANDOVER_AFTER_RUNTIME_HARDENING.md
```

`docs/13-phase-3-runtime-hardening-report.md` debe incluir:

- rama usada;
- archivos modificados;
- descripción del parche determinístico;
- comandos PowerShell ejecutados;
- resultado de deploy;
- eventos observados en `runtime_events`;
- prueba exitosa o motivo de bloqueo;
- riesgos pendientes.

`handover/NEXT_AI_HANDOVER_AFTER_RUNTIME_HARDENING.md` debe incluir:

- estado final del bloque;
- siguiente objetivo;
- prompt de arranque actualizado;
- comandos exactos para continuar;
- referencias a informes generados.

Si el trabajo no llega a completarse, igualmente debe documentarse el estado parcial y el bloqueo exacto.

## Comandos útiles ya validados

### Ver estado local

```powershell
cd C:\Users\ceoel\automation-protocol
git status
git branch
```

### Actualizar main local

```powershell
git switch main
git pull origin main
```

### Crear rama de hardening

```powershell
git switch main
git pull origin main
git checkout -b phase-3-runtime-hardening
```

### Ver funciones en Supabase

```powershell
npx -y supabase@latest functions list --project-ref lwurzjrghzwzxbhrulyn
```

### Descargar funciones desde Supabase si hace falta

```powershell
npx -y supabase@latest functions download runtime-router --project-ref lwurzjrghzwzxbhrulyn --use-api
npx -y supabase@latest functions download skill-executor --project-ref lwurzjrghzwzxbhrulyn --use-api
npx -y supabase@latest functions download runtime-router-local-test --project-ref lwurzjrghzwzxbhrulyn --use-api
```

### Commit y push de una rama

```powershell
git add .
git commit -m "runtime: harden phase 3 deterministic validation path"
git push -u origin phase-3-runtime-hardening
```

## Precauciones importantes

1. No pedir ni pegar `service_role` en el chat.
2. No pegar tokens personales en el chat.
3. Si Supabase CLI pide login, el operador debe hacerlo en navegador/PowerShell, no compartiendo credenciales.
4. No subir `supabase/.temp/`.
5. Antes de commit, revisar:

```powershell
Select-String -Path .\supabase\functions\runtime-router\index.ts, .\supabase\functions\skill-executor\index.ts, .\supabase\functions\runtime-router-local-test\index.ts -Pattern "service_role|SUPABASE_SERVICE_ROLE_KEY|OPENROUTER_API_KEY|x-test-token|Bearer|apikey|password|secret|token"
```

Los nombres de variables son aceptables. Lo que no debe aparecer son valores reales largos.

## Recomendación para la siguiente IA

No reiniciar diagnóstico desde cero. El trabajo ya avanzó mucho.

El punto exacto es:

```text
Fase 3 sincronizada entre Supabase y GitHub.
Runtime activo.
Fallback operativo.
Siguiente paso: hardening determinístico y validación estable.
```

La siguiente IA debe comenzar por leer `docs/12-phase-3-sync-report.md`, verificar que `main` local esté actualizado y crear la rama `phase-3-runtime-hardening`.

## Mensaje breve para el operador

El operador prefiere PowerShell y puede ejecutar comandos guiados paso a paso. Evitar explicaciones demasiado abstractas. Dar un comando por bloque, esperar resultado y corregir con calma.
