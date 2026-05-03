# Supabase Storage Gap Plan

## Estado confirmado

Auditoria read-only realizada contra el proyecto Supabase compartido `lwurzjrghzwzxbhrulyn`.

### Buckets existentes

```text
automation-outputs
skills
source-evidence
```

### Objetos Storage

```text
storage.objects = 0
```

### Registros runtime principales

```text
automation_registry = 2
agent_registry = 3
skill_registry = 3
deployment_configs = 5
automation_rules = 2
runtime_events = 48
execution_tasks = 19
audit_logs = 1
```

## Hallazgos

### 1. Skills referenciadas en Storage sin objetos cargados

`automation-template` registra skills con `runtime_location = supabase_storage` y rutas `skill.zip`, pero `storage.objects` esta vacio.

Pendiente real:

```text
Subir o regenerar paquetes runtime para:
- automation-template/intake-analysis/0.1.0/skill.zip
- automation-template/requirements-validation/0.1.0/skill.zip
```

### 2. Skins no estan materializadas

No se detecta bucket `skins`, tabla `skin_registry`, ni objetos de skins.

Pendiente real:

```text
Definir arquitectura de skins antes de crear datos:
- Storage only
- tabla only
- Storage + tabla metadata
```

Recomendacion tecnica:

```text
Storage + tabla metadata
bucket = skins
table = public.skin_registry
```

Motivo: Storage guarda assets; tabla guarda version, automation_key, checksum, estado y ruta.

### 3. example-shared-automation esta protegida

`example-shared-automation` esta en:

```text
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
```

No debe activarse ni probarse sin autorizacion separada.

## Plan de correccion propuesto

### Bloque A - Inventario y diseno de skins

Tipo: documentacion + SQL read-only.

```text
1. Buscar referencias a skins en GitHub.
2. Confirmar si alguna automatizacion espera skins.
3. Definir campos minimos de skin_registry.
4. Preparar migracion DDL, sin aplicarla hasta autorizacion.
5. Preparar estructura de storage paths.
```

### Bloque B - Correccion Storage de skills

Tipo: GitHub + Storage write controlado.

```text
1. Confirmar fuente canonica de los paquetes skill.zip.
2. Generar checksums.
3. Subir objetos al bucket skills.
4. Verificar que storage.objects tenga los paths esperados.
5. Registrar evidencia en handover historico.
```

### Bloque C - Implementacion skins

Tipo: DDL + Storage write. Requiere autorizacion porque crea esquema/objetos nuevos.

```text
1. Crear bucket skins si se aprueba.
2. Crear tabla public.skin_registry si se aprueba.
3. Insertar metadata inicial.
4. Subir assets iniciales.
5. Verificar rutas y checksums.
```

### Bloque D - Verificacion final no destructiva

Tipo: read-only.

```text
1. Verificar automation_registry.
2. Verificar agent_registry.
3. Verificar skill_registry.
4. Verificar deployment_configs sin secretos.
5. Verificar automation_rules.
6. Verificar runtime_events.
7. Verificar execution_tasks sin stuck actuales.
8. Verificar storage.objects.
9. Documentar resultado.
```

## Politica de confirmaciones

Permitido sin nueva confirmacion dentro de un bloque aprobado:

```text
SELECT
conteos
auditorias
crear ramas GitHub
crear PRs
documentacion markdown
handovers historicos
INSERT/UPDATE documental no destructivo cuando el bloque lo incluya
```

Requiere autorizacion explicita separada:

```text
DELETE
DDL
crear proyecto Supabase
crear branch Supabase con coste
guardar secretos reales
activar automatizaciones
cambiar activation_guarded = false
cambiar status = active
subir datos sensibles o productivos
```
