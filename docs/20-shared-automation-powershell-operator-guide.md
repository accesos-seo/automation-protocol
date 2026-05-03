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

## Scripts oficiales

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
```

Para construcción normal usar principalmente:

```text
New-SharedAutomationScaffold.ps1
Register-SharedAutomationFromManifest.ps1
```

Reservar para cierre final:

```text
Invoke-SharedAutomationFinalTests.ps1
Enable-SharedAutomationControlledActivation.ps1
Disable-SharedAutomation.ps1
```

## Variables base

> No guardar secrets reales en GitHub.

```powershell
$ErrorActionPreference = "Stop"

$env:SUPABASE_URL = "https://lwurzjrghzwzxbhrulyn.supabase.co"
$env:SUPABASE_AUTH_TOKEN = "REPLACE_WITH_SUPABASE_AUTH_TOKEN"

$AutomationKey = "cliente-area-proceso"
$AutomationName = "Cliente Area Proceso"
$ProtocolName = "Cliente Area Proceso Protocol"
$DefaultSkillKey = "intake-analysis"
$CommitSha = "REPLACE_WITH_GITHUB_COMMIT_SHA"
```

## Opción recomendada - scripts versionados

### 1. Generar scaffold

```powershell
.\scripts\powershell\shared-automation\New-SharedAutomationScaffold.ps1 `
  -AutomationKey $AutomationKey `
  -AutomationName $AutomationName `
  -ProtocolName $ProtocolName `
  -DefaultSkillKey $DefaultSkillKey
```

Resultado esperado:

```text
ok = true
files[] contiene rutas y contenido para GitHub
```

### 2. Crear archivos en GitHub

Crear los archivos devueltos por el scaffold generator:

```text
automations/$AutomationKey/README.md
automations/$AutomationKey/agents/orchestrator.md
automations/$AutomationKey/skills/$DefaultSkillKey/SKILL.md
automations/$AutomationKey/routing-rules/default-runtime-route.json
automations/$AutomationKey/deployment/manifest.json
handover/$AutomationKey-HANDOVER.md
```

### 3. Registrar desde manifest

Después de crear y commitear los archivos:

```powershell
.\scripts\powershell\shared-automation\Register-SharedAutomationFromManifest.ps1 `
  -ManifestPath ".\automations\$AutomationKey\deployment\manifest.json" `
  -CommitSha $CommitSha
```

Este script ejecuta:

```text
validate-shared-automation-manifest
build-components-payload-from-manifest
build-shared-automation-draft
register-shared-automation-components
update-shared-automation-build-state -> scaffolded
update-shared-automation-build-state -> components_registered
update-shared-automation-build-state -> pending_final_validation
```

No ejecuta pruebas finales ni activación.

## Opción manual - helper de invocación

El helper versionado vive en:

```text
scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
```

Uso base:

```powershell
. .\scripts\powershell\shared-automation\Invoke-SharedAutomationFunction.ps1

$response = Invoke-SharedAutomationFunction `
  -SupabaseUrl $env:SUPABASE_URL `
  -AuthToken $env:SUPABASE_AUTH_TOKEN `
  -FunctionName "generate-shared-automation-scaffold" `
  -Payload @{
    automation_key = $AutomationKey
    automation_name = $AutomationName
    protocol_name = $ProtocolName
    default_skill_key = $DefaultSkillKey
  }
```

## Verificación SQL no destructiva

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
Invoke-SharedAutomationFinalTests.ps1
Enable-SharedAutomationControlledActivation.ps1
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
