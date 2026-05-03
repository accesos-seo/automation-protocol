# 30 - Supabase Storage Skill Upload Runbook

## Purpose

Define the operator-side process to upload generated `skill.zip` packages to Supabase Storage bucket `skills`.

The current Supabase connector can query `storage.buckets` and `storage.objects`, but it does not expose binary object upload. Therefore, package upload must be performed from a secure local environment, Supabase Dashboard, Supabase CLI/API, or a dedicated secure MCP/API wrapper.

## Current Storage state

Verified non-destructively:

```text
bucket = skills
public = false
storage.objects = 0
```

The registry already references 5 expected package paths:

```text
_template/scaffold-validation/0.1.0/skill.zip
_template/technical-deployment/0.1.0/skill.zip
_template/web-source-capture/0.1.0/skill.zip
automation-template/intake-analysis/0.1.0/skill.zip
automation-template/requirements-validation/0.1.0/skill.zip
```

## Versioned evidence

```text
dist/skills/package-manifest.json
dist/skills/SHA256SUMS.txt
```

## Operator working directory

Run the upload from the real Git repository root, not from a copied folder.

Known good local path used during verification:

```powershell
cd C:\Users\ceoel\automation-protocol
```

A OneDrive copy was observed at:

```powershell
C:\Users\ceoel\OneDrive\Escritorio\Nueva carpeta\automation-protocol
```

That folder is not a Git repository and does not reliably contain the root-level upload script. Symptoms:

```text
fatal: not a git repository (or any of the parent directories): .git
Upload-SkillPackagesToSupabaseStorage.ps1 : El término ... no se reconoce
```

Before running upload, confirm these checks from the repository root:

```powershell
git status
git pull origin main
Test-Path .\scripts\powershell\shared-automation\Upload-SkillPackagesToSupabaseStorage.ps1
Test-Path .\dist\skills\package-manifest.json
Test-Path .\dist\skills\packages
```

Expected result for the script check:

```text
True
```

If `Test-Path .\dist\skills\packages` returns `False`, the root manifest exists but the generated local ZIP package directory is missing. Regenerate the five local packages under `dist\skills\packages` before running upload.

Do not paste the PowerShell prompt itself. Paste only commands. For example, do not paste `PS C:\Users\ceoel>`; paste only what comes after `>`.

## Regenerate missing local skill packages

Use this only when `dist\skills\packages` or any expected `skill.zip` is missing.

```powershell
.\scripts\powershell\shared-automation\New-SkillPackagePlan.ps1 -AutomationKey "_template" -SkillKey "scaffold-validation" -SkillSourcePath "automations\_template\skills\scaffold-validation\SKILL.md" -Version "0.1.0" -OutputRoot "dist\skills\packages"
.\scripts\powershell\shared-automation\New-SkillPackagePlan.ps1 -AutomationKey "_template" -SkillKey "technical-deployment" -SkillSourcePath "automations\_template\skills\technical-deployment\SKILL.md" -Version "0.1.0" -OutputRoot "dist\skills\packages"
.\scripts\powershell\shared-automation\New-SkillPackagePlan.ps1 -AutomationKey "_template" -SkillKey "web-source-capture" -SkillSourcePath "automations\_template\skills\web-source-capture\SKILL.md" -Version "0.1.0" -OutputRoot "dist\skills\packages"
.\scripts\powershell\shared-automation\New-SkillPackagePlan.ps1 -AutomationKey "automation-template" -SkillKey "intake-analysis" -SkillSourcePath "automations\automation-template\skills\intake-analysis\SKILL.md" -Version "0.1.0" -OutputRoot "dist\skills\packages"
.\scripts\powershell\shared-automation\New-SkillPackagePlan.ps1 -AutomationKey "automation-template" -SkillKey "requirements-validation" -SkillSourcePath "automations\automation-template\skills\requirements-validation\SKILL.md" -Version "0.1.0" -OutputRoot "dist\skills\packages"
```

Then confirm all five ZIPs exist and rerun dry-run. If dry-run reports SHA256 mismatch, stop and refresh package manifest/checksum files intentionally before upload.

## Secure local upload script

Use:

```text
scripts/powershell/shared-automation/Upload-SkillPackagesToSupabaseStorage.ps1
```

Required environment variables:

```powershell
$env:SUPABASE_URL = "https://PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "REPLACE_WITH_SECURE_VALUE"
```

Dry run:

```powershell
.\scripts\powershell\shared-automation\Upload-SkillPackagesToSupabaseStorage.ps1 `
  -ManifestPath "dist\skills\package-manifest.json" `
  -PackagesRoot "dist\skills\packages" `
  -DryRun
```

Upload:

```powershell
.\scripts\powershell\shared-automation\Upload-SkillPackagesToSupabaseStorage.ps1 `
  -ManifestPath "dist\skills\package-manifest.json" `
  -PackagesRoot "dist\skills\packages"
```

Use `-Upsert` only when intentionally replacing an existing package with the same path.

## Expected local package layout

```text
dist/skills/packages/_template/scaffold-validation/0.1.0/skill.zip
dist/skills/packages/_template/technical-deployment/0.1.0/skill.zip
dist/skills/packages/_template/web-source-capture/0.1.0/skill.zip
dist/skills/packages/automation-template/intake-analysis/0.1.0/skill.zip
dist/skills/packages/automation-template/requirements-validation/0.1.0/skill.zip
```

## Post-upload verification SQL

```sql
select bucket_id, name, metadata, created_at, updated_at
from storage.objects
where bucket_id = 'skills'
order by name;
```

Expected object count:

```text
5
```

## SHA256 verification

After upload, compare each object with:

```text
dist/skills/SHA256SUMS.txt
```

If using local upload script, SHA256 is checked before upload. If using Dashboard or another client, download or inspect objects and verify hashes separately.

## Safety limits

Do not perform these actions without separate explicit authorization:

```text
borrar objetos Storage
usar -Upsert para reemplazar paquetes existentes
exponer SUPABASE_SERVICE_ROLE_KEY
guardar service role key en GitHub
ejecutar pruebas finales
activar automatizaciones
cambiar activation_guarded = false
```

## Completion criteria

```text
storage.objects has 5 package paths
hashes match SHA256SUMS.txt
skill_registry runtime_package_path matches uploaded objects
handover updated with verification evidence
final tests remain deferred until separately authorized
activation remains deferred until separately authorized
```
