# Handover para siguiente IA - Fase 3 Runtime Hardening

## Propósito de este handover

Este documento entrega el contexto completo para que otra IA pueda continuar el trabajo sin reiniciar el diagnóstico. El proyecto ya pasó por sincronización entre Supabase y GitHub. El siguiente objetivo es endurecer el runtime para reducir la dependencia del fallback y lograr una ejecución estable terminando en `runtime.execution_completed`.

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
