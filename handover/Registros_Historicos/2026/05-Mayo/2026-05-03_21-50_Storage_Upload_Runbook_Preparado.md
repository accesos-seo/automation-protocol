# 2026-05-03 21:50 - Storage Upload Runbook Preparado

## Alcance

Preparar el siguiente bloque para subir paquetes `skill.zip` a Supabase Storage bucket `skills` desde entorno seguro.

## Verificacion no destructiva ejecutada

```text
bucket = skills
public = false
storage.objects = 0
skill_registry references = 5
```

## Bloqueo tecnico identificado

```text
El conector Supabase disponible permite SQL y consultas sobre storage.objects, pero no expone carga binaria directa de objetos Storage.
```

## Archivos agregados

```text
scripts/powershell/shared-automation/Upload-SkillPackagesToSupabaseStorage.ps1
docs/30-supabase-storage-skill-upload-runbook.md
```

## Paquetes esperados

```text
_template/scaffold-validation/0.1.0/skill.zip
_template/technical-deployment/0.1.0/skill.zip
_template/web-source-capture/0.1.0/skill.zip
automation-template/intake-analysis/0.1.0/skill.zip
automation-template/requirements-validation/0.1.0/skill.zip
```

## Evidencia versionada previa

```text
dist/skills/package-manifest.json
dist/skills/SHA256SUMS.txt
```

## Pendiente de ejecucion externa segura

```text
1. Disponer de los 5 skill.zip en dist/skills/packages/...
2. Ejecutar Upload-SkillPackagesToSupabaseStorage.ps1 con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en entorno local seguro.
3. Verificar storage.objects = 5.
4. Comparar SHA256.
5. Actualizar handover con evidencia de carga.
```

## Seguridad

```text
No se subieron objetos Storage.
No se expuso service role key.
No se guardaron secretos en GitHub.
No se ejecutaron pruebas finales.
No se activo automatizacion.
No se cambio activation_guarded.
No se borraron datos.
```
