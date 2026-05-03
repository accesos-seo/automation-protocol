# 20 - Shared Automation PowerShell Operator Guide

## Propósito

Guía operativa para ejecutar el pipeline de alta de automatizaciones compartidas desde PowerShell, sin crear nuevos proyectos Supabase y sin ejecutar pruebas finales hasta el cierre.

## Regla vigente

Las pruebas están diferidas según:

```text
docs/17-deferred-final-test-plan.md
```

Durante construcción:

```text
activation_guarded = true
```

No ejecutar runtime tests ni activar automatizaciones hasta el bloque final de validación.

## Variables base

> No guardar secrets reales en GitHub.

```powershell
$ErrorActionPreference = "Stop"

$SUPABASE_URL = "https://lwurzjrghzwzxbhrulyn.supabase.co"
$SUPABASE_ANON_KEY = "REPLACE_WITH_SUPABASE_ANON_OR_AUTH_TOKEN"

$AutomationKey = "cliente-area-proceso"
$AutomationName = "Cliente Area Proceso"
$ProtocolName = "Cliente Area Proceso Protocol"
$DefaultSkillKey = "intake-analysis"
$CommitSha = "REPLACE_WITH_GITHUB_COMMIT_SHA"
```

## Helper de invocación

```powershell
function Invoke-SupabaseFunction {
    param(
        [Parameter(Mandatory = $true)] [string] $FunctionName,
        [Parameter(Mandatory = $true)] [hashtable] $Payload
    )

    $uri = "$SUPABASE_URL/functions/v1/$FunctionName"

    $headers = @{
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        "apikey" = $SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    }

    $body = $Payload | ConvertTo-Json -Depth 30

    Invoke-RestMethod `
        -Uri $uri `
        -Method POST `
        -Headers $headers `
        -Body $body
}
```

## 1. Generar scaffold

```powershell
$scaffoldPayload = @{
    automation_key = $AutomationKey
    automation_name = $AutomationName
    protocol_name = $ProtocolName
    objective = "Objetivo operativo de la automatización."
    inputs = @(
        "Entrada principal"
    )
    outputs = @(
        "Salida principal"
    )
    default_skill_key = $DefaultSkillKey
}

$scaffold = Invoke-SupabaseFunction `
    -FunctionName "generate-shared-automation-scaffold" `
    -Payload $scaffoldPayload

$scaffold | ConvertTo-Json -Depth 30
```

Resultado esperado:

```text
ok = true
files[] contiene rutas y contenido para GitHub
```

## 2. Crear archivos en GitHub

Crear en GitHub los archivos devueltos por:

```text
generate-shared-automation-scaffold
```

Rutas esperadas:

```text
automations/$AutomationKey/README.md
automations/$AutomationKey/agents/orchestrator.md
automations/$AutomationKey/skills/$DefaultSkillKey/SKILL.md
automations/$AutomationKey/routing-rules/default-runtime-route.json
automations/$AutomationKey/deployment/manifest.json
handover/$AutomationKey-HANDOVER.md
```

## 3. Cargar manifest local

Si el manifest existe localmente:

```powershell
$ManifestPath = ".\automations\$AutomationKey\deployment\manifest.json"
$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
```

Si se obtiene desde otra fuente, asegurar que `$manifest` sea un objeto PowerShell equivalente al JSON.

## 4. Validar manifest

```powershell
$validationPayload = @{
    manifest = $manifest
}

$validation = Invoke-SupabaseFunction `
    -FunctionName "validate-shared-automation-manifest" `
    -Payload $validationPayload

$validation | ConvertTo-Json -Depth 30
```

Continuar solo si:

```text
valid = true
errors = []
```

## 5. Construir payload de componentes

```powershell
$componentPayloadRequest = @{
    strict = $true
    manifest = $manifest
}

$componentPayloadResponse = Invoke-SupabaseFunction `
    -FunctionName "build-components-payload-from-manifest" `
    -Payload $componentPayloadRequest

$componentPayloadResponse | ConvertTo-Json -Depth 30
```

Payload de salida:

```powershell
$componentPayload = $componentPayloadResponse.payload
```

## 6. Crear draft en Supabase

```powershell
$draftPayload = @{
    automation_key = $AutomationKey
    automation_name = $AutomationName
    protocol_name = $ProtocolName
    objective = "Objetivo operativo de la automatización."
    inputs = @("Entrada principal")
    outputs = @("Salida principal")
    default_skill_key = $DefaultSkillKey
    commit_sha = $CommitSha
    metadata = @{
        build_source = "powershell_operator_guide"
    }
}

$draft = Invoke-SupabaseFunction `
    -FunctionName "build-shared-automation-draft" `
    -Payload $draftPayload

$draft | ConvertTo-Json -Depth 30
```

Estado esperado:

```text
status = draft_scaffold_generated
health_status = pending_github_files
activation_guarded = true
```

## 7. Registrar componentes

```powershell
$registeredComponents = Invoke-SupabaseFunction `
    -FunctionName "register-shared-automation-components" `
    -Payload $componentPayload

$registeredComponents | ConvertTo-Json -Depth 30
```

Resultado esperado:

```text
inserted.agents
inserted.skills
inserted.configs
inserted.rules
```

## 8. Mover estado a scaffolded

```powershell
$stateScaffoldedPayload = @{
    automation_key = $AutomationKey
    target_state = "scaffolded"
    commit_sha = $CommitSha
    evidence = @{
        github_files_created = $true
    }
    notes = "Archivos scaffold creados en GitHub."
}

$stateScaffolded = Invoke-SupabaseFunction `
    -FunctionName "update-shared-automation-build-state" `
    -Payload $stateScaffoldedPayload

$stateScaffolded | ConvertTo-Json -Depth 30
```

## 9. Mover estado a components_registered

```powershell
$stateComponentsPayload = @{
    automation_key = $AutomationKey
    target_state = "components_registered"
    evidence = @{
        components_registered = $true
    }
    notes = "Componentes registrados en Supabase."
}

$stateComponents = Invoke-SupabaseFunction `
    -FunctionName "update-shared-automation-build-state" `
    -Payload $stateComponentsPayload

$stateComponents | ConvertTo-Json -Depth 30
```

## 10. Mover estado a pending_final_validation

```powershell
$statePendingValidationPayload = @{
    automation_key = $AutomationKey
    target_state = "pending_final_validation"
    evidence = @{
        ready_for_final_tests = $true
    }
    notes = "Construcción terminada. Pruebas finales diferidas."
}

$statePendingValidation = Invoke-SupabaseFunction `
    -FunctionName "update-shared-automation-build-state" `
    -Payload $statePendingValidationPayload

$statePendingValidation | ConvertTo-Json -Depth 30
```

Estado esperado:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
```

## 11. Verificación SQL no destructiva

```sql
select automation_key, status, health_status, activation_guarded, repository_path, commit_sha, updated_at
from public.automation_registry
where automation_key = 'cliente-area-proceso';
```

```sql
select automation_key, agent_key, status, created_at
from public.agent_registry
where automation_key = 'cliente-area-proceso'
order by created_at desc;
```

```sql
select automation_key, skill_key, status, created_at
from public.skill_registry
where automation_key = 'cliente-area-proceso'
order by created_at desc;
```

```sql
select automation_key, rule_key, status, created_at
from public.automation_rules
where automation_key = 'cliente-area-proceso'
order by created_at desc;
```

```sql
select automation_key, config_key, is_secret, config_status, created_at
from public.deployment_configs
where automation_key = 'cliente-area-proceso'
order by created_at desc;
```

## Prohibiciones durante construcción

No ejecutar:

```text
runtime-router-local-test
create-shared-automation-local-test
activación a active
validación runtime final
borrados masivos
exposición de secrets
```

## Criterio de cierre antes de pruebas finales

```text
manifest validado
archivos GitHub creados
component payload generado
registro draft creado
componentes registrados
status = pending_final_validation
activation_guarded = true
handover creado
```
