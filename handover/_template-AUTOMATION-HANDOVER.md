# Automation Handover Template

## Identidad

```text
automation_key = REPLACE_WITH_AUTOMATION_KEY
automation_name = REPLACE_WITH_AUTOMATION_NAME
protocol_name = REPLACE_WITH_PROTOCOL_NAME
runtime = shared_supabase_runtime
```

## Estado actual

```text
status = scaffolded
health_status = pending_validation
activation_guarded = true
```

## Componentes registrados

### Agentes

```text
orchestrator
```

### Skills

```text
intake-analysis
```

### Reglas

```text
default-runtime-route
```

### Configs

```text
OPENROUTER_API_KEY = managed_in_supabase_secrets
```

## Evidencia GitHub

```text
repository = accesos-seo/automation-protocol
repository_path = automations/REPLACE_WITH_AUTOMATION_KEY
commit_sha = REPLACE_WITH_COMMIT_SHA
```

## Evidencia Supabase

```text
automation_id = REPLACE_WITH_AUTOMATION_ID
agent_ids = REPLACE_WITH_AGENT_IDS
skill_ids = REPLACE_WITH_SKILL_IDS
rule_ids = REPLACE_WITH_RULE_IDS
config_ids = REPLACE_WITH_CONFIG_IDS
```

## Pruebas diferidas

Las pruebas quedan para el cierre final según:

```text
docs/17-deferred-final-test-plan.md
```

## Seguridad

- No se documentan valores reales de secretos.
- Secrets viven en Supabase Secrets o entorno seguro.
- GitHub contiene código, documentación, manifests y nombres de variables.
- Supabase contiene estado operativo, eventos, logs y registros.

## Pendientes

- Ejecutar alta real con `create-shared-automation`.
- Registrar componentes con `register-shared-automation-components`.
- Ejecutar prueba runtime final.
- Registrar task IDs y eventos.
- Cambiar estado solo si la evidencia final es correcta.
