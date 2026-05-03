# Automation Deployment Protocol

Repositorio monorepo para documentar, versionar y desplegar automatizaciones basadas en agentes, Agent Skills, Supabase y GitHub.

## Configuración oficial

- repository_name: automation-protocol
- protocol_name: Automation Deployment Protocol
- language: español
- license: proprietary / internal use
- repo_strategy: monorepo
- automation_key: automation-template
- status: phase_3_runtime_hardening_validated
- runtime_state: active
- runtime_health: healthy

## Estado actual

Phase 3 Runtime Hardening quedó validada y fusionada en `main`.

Evidencia de cierre:

```text
PR #3 = merged
merge_commit_sha = b589527f9294488c79bcb1382498eccb1bbf145a
protocol.config.json = phase_3_runtime_hardening_validated
completed_with_fallback = false
deterministic_route = true
final_event = runtime.execution_completed
```

## Regla principal

GitHub guarda código, skills, scripts, recursos internos del skill, reglas, manifests, schemas y documentación versionada. Supabase guarda estado operativo, jobs, logs, eventos, registros y metadata de configuración. Los secrets reales viven en Supabase Secrets o en el entorno seguro, nunca en GitHub ni en tablas públicas.

## Runtime compartido Supabase

El repositorio ahora incluye un pipeline para crear múltiples automatizaciones dentro del mismo proyecto Supabase usando separación lógica por `automation_key`.

Objetivo:

```text
no crear un proyecto Supabase nuevo por cada automatización
usar GitHub como fuente versionada
usar Supabase como runtime operativo compartido
mantener pruebas finales diferidas hasta cierre controlado
```

Proyecto Supabase compartido:

```text
project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
runtime_router = runtime-router
skill_executor = skill-executor
```

## Pipeline oficial para nuevas automatizaciones compartidas

Orden recomendado:

```text
1. generate-shared-automation-scaffold
2. Crear archivos generados en GitHub
3. validate-shared-automation-manifest
4. build-components-payload-from-manifest
5. build-shared-automation-draft
6. register-shared-automation-components
7. update-shared-automation-build-state -> scaffolded
8. update-shared-automation-build-state -> components_registered
9. update-shared-automation-build-state -> pending_final_validation
10. pruebas finales diferidas
11. activación controlada solo con evidencia
```

## Funciones Edge activas del pipeline

```text
generate-shared-automation-scaffold
validate-shared-automation-manifest
build-components-payload-from-manifest
build-shared-automation-draft
create-shared-automation
register-shared-automation-components
update-shared-automation-build-state
create-shared-automation-local-test
```

## Documentación principal

```text
docs/17-deferred-final-test-plan.md
docs/18-shared-automation-build-pipeline.md
docs/19-shared-automation-operational-flow.md
docs/20-shared-automation-powershell-operator-guide.md
docs/21-shared-automation-final-test-closeout-guide.md
docs/22-shared-automation-controlled-activation-checklist.md
```

## Plantillas

```text
automations/_template/README.md
automations/_template/agents/orchestrator.md
automations/_template/skills/intake-analysis/SKILL.md
automations/_template/routing-rules/default-runtime-route.json
automations/_template/deployment/manifest.json
handover/_template-AUTOMATION-HANDOVER.md
```

## Estados operativos de una automatización compartida

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

## Flujo resumido histórico

Web / fuente externa -> Source Evidence local -> Fase 1 Intake -> Fase 2 Scaffold -> Fase 3 Deployer -> GitHub + Supabase + Agent Registry -> Automation Registry -> Automation Active.

## Flujo resumido compartido

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
