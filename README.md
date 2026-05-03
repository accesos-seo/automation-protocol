# Automation Deployment Protocol

Repositorio monorepo para documentar, versionar y desplegar automatizaciones basadas en agentes, Agent Skills, Supabase y GitHub.

## Punto de entrada para IA

Antes de cargar documentación extensa, leer primero:

```text
docs/01-ai-context-router.md
```

Ese archivo decide qué documentos mínimos cargar según la tarea y evita consumo innecesario de tokens.

Índice humano completo:

```text
docs/00-index.md
```

## Estado ejecutivo

```text
repository_name = automation-protocol
protocol_name = Automation Deployment Protocol
language = español
repo_strategy = monorepo
status = phase_3_runtime_hardening_validated
runtime_state = active
runtime_health = healthy
shared_supabase_runtime = built
final_tests_for_new_automations = deferred
```

## Regla principal

GitHub guarda código, skills, scripts, reglas, manifests, schemas y documentación versionada.

Supabase guarda estado operativo, jobs, logs, eventos, registros y metadata.

Secrets reales viven en Supabase Secrets o entorno seguro, nunca en GitHub ni en tablas públicas.

## Runtime compartido Supabase

El repositorio permite crear múltiples automatizaciones dentro del mismo proyecto Supabase usando separación lógica por:

```text
automation_key
```

Proyecto compartido:

```text
project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
runtime_router = runtime-router
skill_executor = skill-executor
```

## Pipeline oficial resumido

```text
Automation Request
-> Scaffold Generator
-> GitHub Versioned Files
-> Manifest Validator
-> Component Payload Builder
-> Supabase Draft
-> Component Registry
-> Build State Updater
-> Pending Final Validation
-> Final Test Closeout
-> Controlled Activation
```

## Rutas principales

```text
docs/01-ai-context-router.md
docs/00-index.md
docs/18-shared-automation-build-pipeline.md
docs/19-shared-automation-operational-flow.md
docs/20-shared-automation-powershell-operator-guide.md
```

## Scripts principales

```text
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
```

## Plantillas y ejemplos

```text
automations/_template/
handover/_template-AUTOMATION-HANDOVER.md
examples/shared-automation/example-manifest.json
```

## Estados operativos

```text
draft_scaffold_generated
scaffolded
components_registered
pending_final_validation
validated
active
paused
```

Durante construcción:

```text
activation_guarded = true
```

Solo después de pruebas finales exitosas:

```text
status = validated
health_status = healthy
activation_guarded = false
```
