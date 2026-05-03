# 19 - Shared Automation Operational Flow

## Propósito

Definir el orden exacto de uso del pipeline para crear nuevas automatizaciones dentro del runtime compartido Supabase sin crear proyectos nuevos y sin ejecutar pruebas hasta el cierre.

## Regla vigente

Las pruebas finales están diferidas según:

```text
docs/17-deferred-final-test-plan.md
```

Durante construcción:

- No ejecutar pruebas runtime.
- No activar automatizaciones.
- No insertar datos de prueba innecesarios.
- Sí construir, validar, registrar y documentar.
- Mantener `activation_guarded = true`.

## Orden recomendado de llamadas

```text
1. generate-shared-automation-scaffold
2. Crear archivos generados en GitHub
3. validate-shared-automation-manifest
4. build-components-payload-from-manifest
5. build-shared-automation-draft
6. register-shared-automation-components
7. update-shared-automation-build-state → scaffolded
8. update-shared-automation-build-state → components_registered
9. update-shared-automation-build-state → pending_final_validation
10. Pruebas finales diferidas
```

## 1. Generar scaffold

Función:

```text
generate-shared-automation-scaffold
```

Propósito:

Generar el contenido esperado para GitHub sin escribir en base de datos.

Payload:

```json
{
  "automation_key": "cliente-area-proceso",
  "automation_name": "Cliente Area Proceso",
  "protocol_name": "Cliente Area Proceso Protocol",
  "objective": "Objetivo operativo de la automatización.",
  "inputs": [
    "Entrada principal"
  ],
  "outputs": [
    "Salida principal"
  ],
  "default_skill_key": "intake-analysis"
}
```

Resultado esperado:

```text
files[] con rutas y contenido
```

Archivos esperados:

```text
automations/{automation_key}/README.md
automations/{automation_key}/agents/orchestrator.md
automations/{automation_key}/skills/{default_skill_key}/SKILL.md
automations/{automation_key}/routing-rules/default-runtime-route.json
automations/{automation_key}/deployment/manifest.json
handover/{automation_key}-HANDOVER.md
```

## 2. Crear archivos en GitHub

Crear los archivos devueltos por el scaffold generator.

Estado recomendado después de crear archivos:

```text
GitHub files committed
Supabase todavía sin activación
```

## 3. Validar manifest

Función:

```text
validate-shared-automation-manifest
```

Payload:

```json
{
  "manifest": {
    "automation_key": "cliente-area-proceso",
    "automation_name": "Cliente Area Proceso",
    "protocol_name": "Cliente Area Proceso Protocol",
    "repo_strategy": "monorepo",
    "runtime": {
      "type": "shared_supabase_runtime",
      "project_ref": "lwurzjrghzwzxbhrulyn",
      "runtime_router": "runtime-router",
      "skill_executor": "skill-executor"
    },
    "github": {
      "repository": "accesos-seo/automation-protocol",
      "repository_path": "automations/cliente-area-proceso"
    },
    "components": {
      "agents": [],
      "skills": [],
      "configs": [],
      "rules": []
    },
    "status": {
      "activation_guarded": true
    }
  }
}
```

Resultado requerido:

```text
valid = true
errors = []
```

## 4. Construir payload de componentes

Función:

```text
build-components-payload-from-manifest
```

Payload:

```json
{
  "strict": true,
  "manifest": {
    "automation_key": "cliente-area-proceso",
    "components": {
      "agents": [],
      "skills": [],
      "configs": [],
      "rules": []
    }
  }
}
```

Resultado:

```json
{
  "payload": {
    "automation_key": "cliente-area-proceso",
    "agents": [],
    "skills": [],
    "configs": [],
    "rules": []
  }
}
```

Este payload se usa directamente en:

```text
register-shared-automation-components
```

## 5. Crear draft en Supabase

Función:

```text
build-shared-automation-draft
```

Payload:

```json
{
  "automation_key": "cliente-area-proceso",
  "automation_name": "Cliente Area Proceso",
  "protocol_name": "Cliente Area Proceso Protocol",
  "objective": "Objetivo operativo de la automatización.",
  "inputs": ["Entrada principal"],
  "outputs": ["Salida principal"],
  "default_skill_key": "intake-analysis",
  "commit_sha": "COMMIT_SHA_DE_GITHUB",
  "metadata": {
    "build_source": "shared_automation_operational_flow"
  }
}
```

Estado creado:

```text
status = draft_scaffold_generated
health_status = pending_github_files
activation_guarded = true
```

## 6. Registrar componentes

Función:

```text
register-shared-automation-components
```

Payload:

Usar el `payload` generado por:

```text
build-components-payload-from-manifest
```

Resultado esperado:

```text
inserted.agents
inserted.skills
inserted.configs
inserted.rules
audit_log
```

## 7. Actualizar estado a scaffolded

Función:

```text
update-shared-automation-build-state
```

Payload:

```json
{
  "automation_key": "cliente-area-proceso",
  "target_state": "scaffolded",
  "commit_sha": "COMMIT_SHA_DE_GITHUB",
  "evidence": {
    "github_files_created": true
  },
  "notes": "Archivos scaffold creados en GitHub."
}
```

Estado esperado:

```text
status = scaffolded
health_status = pending_component_registration
activation_guarded = true
```

## 8. Actualizar estado a components_registered

Payload:

```json
{
  "automation_key": "cliente-area-proceso",
  "target_state": "components_registered",
  "evidence": {
    "components_registered": true
  },
  "notes": "Agentes, skills, configs y reglas registrados."
}
```

Estado esperado:

```text
status = components_registered
health_status = pending_validation
activation_guarded = true
```

## 9. Actualizar estado a pending_final_validation

Payload:

```json
{
  "automation_key": "cliente-area-proceso",
  "target_state": "pending_final_validation",
  "evidence": {
    "ready_for_final_tests": true
  },
  "notes": "Construcción terminada. Pruebas finales pendientes."
}
```

Estado esperado:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
```

## 10. Pruebas finales

Las pruebas finales se ejecutan solo al cierre del bloque de construcción.

Documento rector:

```text
docs/17-deferred-final-test-plan.md
```

## Funciones activas del pipeline

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

## Seguridad

- No guardar valores reales de secretos en GitHub.
- No incluir campo `value` en configs secretas.
- Mantener `activation_guarded = true` hasta validación final.
- Usar service role solo dentro de funciones protegidas.
- Usar `verify_jwt = true` para funciones de escritura operativa.

## Cierre operativo

Una automatización queda lista para prueba final cuando:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
manifest validado
component payload generado
componentes registrados
handover creado
```
