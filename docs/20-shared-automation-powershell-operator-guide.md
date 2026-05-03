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
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
scripts/powershell/shared-automation/Disable-SharedAutomation.ps1
```

Para construcción normal usar principalmente:

```text
New-SharedAutomationScaffold.ps1
New-SharedAutomationHandover.ps1
Register-SharedAutomationFromManifest.ps1
Get-SharedAutomationVerificationSql.ps1
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

### 2. Generar handover inicial

```powershell
.\scripts\powershell\shared-automation\New-SharedAutomationHandover.ps1 `
  -AutomationKey $AutomationKey `
  -AutomationName $AutomationName `
  -ProtocolName $ProtocolName `
  -CommitSha $CommitSha
```

Resultado esperado:

```text
handover/$AutomationKey-HANDOVER.md
activation_guarded = true
tests_deferred = true
```

### 3. Crear archivos en GitHub

Crear los archivos devueltos por el scaffold generator y el handover:

```text
automations/$AutomationKey/README.md
automations/$AutomationKey/agents/orchestrator.md
automations/$AutomationKey/skills/$DefaultSkillKey/SKILL.md
automations/$AutomationKey/routing-rules/default-runtime-route.json
automations/$AutomationKey/deployment/manifest.json
handover/$AutomationKey-HANDOVER.md
```

### 4. Registrar desde manifest

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

## Nota de diagnóstico del conector GitHub

En la sesión 2026-05-03 se validó que el conector podía escribir en rama y abrir PR usando:

```text
branch = test/ai-write-diagnostic
file = diagnostic-ai-write-test.md
PR = #4 draft
```

La rama preferida `feature/shared-automation-handover` fue bloqueada al crearla por controles del conector. La rama alternativa usada fue:

```text
ai-shared-automation-handover
```

El archivo PowerShell completo `New-SharedAutomationHandover.ps1` fue bloqueado al intentar escribirlo mediante el conector. Si ocurre de nuevo, aplicar ese archivo desde una sesión con escritura habilitada o dividir la escritura en pasos seguros, sin escribir directo a `main`.

## Verificación SQL no destructiva

```powershell
.\scripts\powershell\shared-automation\Get-SharedAutomationVerificationSql.ps1 `
  -AutomationKey $AutomationKey
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
