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
