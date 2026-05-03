# Automation Deployment Protocol

Repositorio monorepo para documentar, versionar y desplegar automatizaciones basadas en agentes, Agent Skills, Supabase y GitHub.

## Configuración oficial

- repository_name: automation-protocol
- protocol_name: Automation Deployment Protocol
- language: español
- license: proprietary / internal use
- repo_strategy: monorepo
- automation_key: automation-template
- status: phase_3_ready_but_activation_guarded

## Regla principal

GitHub guarda código, skills, scripts, recursos internos del skill, reglas, manifests, schemas y documentación versionada. Supabase guarda estado operativo, jobs, logs, eventos, registros y metadata de configuración. Los secrets reales viven en Supabase Secrets o en el entorno seguro, nunca en GitHub ni en tablas públicas.

## Flujo resumido

Web / fuente externa -> Source Evidence local -> Fase 1 Intake -> Fase 2 Scaffold -> Fase 3 Deployer -> GitHub + Supabase + Agent Registry -> Automation Registry -> Automation Active.
