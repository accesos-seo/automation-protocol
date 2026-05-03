# Next AI Session Block Handover

## Objetivo de este handover

Indicar a la siguiente sesión de IA dónde está detenido el proyecto, qué ya fue completado, qué no debe repetirse, cuáles son los próximos bloques, qué límites de seguridad siguen vigentes y cómo debe trabajar sin pedir confirmaciones repetitivas.

## Regla de idioma obligatoria

Aunque algunos documentos técnicos estén en inglés, la IA debe responder al usuario en español.

```text
assistant_response_language = español
technical_file_language = mantener idioma existente salvo instrucción contraria
```

## Lectura obligatoria antes de ejecutar

Antes de cualquier ejecución, leer o atender:

```text
README.md
docs/01-ai-context-router.md
docs/00-index.md
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
docs/01-ai-context-router-autonomy-addendum.md
handover/ai-sessions/NEXT_AI_SESSION_BLOCK_HANDOVER.md
handover/automations/example-shared-automation-HANDOVER.md
```

## Política de autonomía obligatoria

La IA no debe preguntar por microacciones rutinarias si el usuario ya aprobó un bloque con `adelante`, `hazlo`, `continúa`, `monta`, `sigue`, `ejecuta`, `vamos` o equivalente.

Acciones automáticas dentro del bloque aprobado:

```text
add_supabase_script
create_github_file_in_repository
create_pull_request_in_github_repository
create_or_update_github_readme
add_comment_to_github
```

La IA debe ejecutarlas, registrar evidencia y reportar al cierre del bloque.

## Repositorio actual

```text
repository = accesos-seo/automation-protocol
main_commit_sha = 43d16a2b0b04189cb3066e81811353ddb09c8187
working_branch = ai/reorganize-handovers-autonomy-block
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
```

## Trabajo completado en la rama actual

```text
handover reorganizado en carpetas dedicadas
docs/26-ai-autonomous-action-allowlist.md creado
docs/25-ai-block-execution-procedure.md actualizado con regla no-repeat-confirmation
docs/01-ai-context-router-autonomy-addendum.md creado
docs/00-index.md actualizado con política de autonomía y rutas nuevas
docs/23-shared-automation-handover-checklist.md actualizado con rutas nuevas
New-SharedAutomationHandover.ps1 actualizado para generar en handover/automations/
example-shared-automation-HANDOVER.md sincronizado con IDs Supabase reales
PR #20 abierto
```

## Registro Supabase completado

```text
automation_key = example-shared-automation
automation_id = e4b53127-2a30-489b-8253-4d1a659f68c0
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
```

IDs importantes:

```text
agent_id = a14c94de-f683-42e8-8e1e-ea89511804f0
skill_id = 0b90a73e-c721-40b8-8938-8de3de6bc54b
deployment_config_id = 75ef3548-4655-48b3-847c-d5fa816ed753
automation_rule_id = d2fb22f9-7206-44d7-9438-570a03cb94a8
execution_task_id = 2112c12f-20c7-4d23-942f-323b6eed210e
runtime_event_id = ee6c74e3-82f1-4c65-a195-40f5208d1a46
audit_log_id = c526e8f3-4652-491f-afb4-61d6f179624f
```

## Estado de seguridad actual

```text
final_tests = not_executed
activation = not_executed
activation_guarded = true
controlled_activation = not_authorized
secrets_stored = false
new_supabase_project_created = false
direct_main_write = false
destructive_changes = false
```

## Bloque siguiente recomendado

Ejecutar verificación no destructiva Supabase y documentar resultado:

```text
1. Verificar automation_registry.
2. Verificar agent_registry.
3. Verificar skill_registry.
4. Verificar deployment_configs sin valores secretos.
5. Verificar automation_rules.
6. Verificar runtime_events.
7. Verificar execution_tasks.
8. Verificar audit_logs.
9. Verificar que no existan tasks stuck.
10. Documentar resultado en handover/automations/example-shared-automation-HANDOVER.md.
11. Comentar evidencia en PR #20.
```

## Prohibido sin autorización separada explícita

```text
Invoke-SharedAutomationFinalTests.ps1
create-shared-automation-local-test
Enable-SharedAutomationControlledActivation.ps1
activation_guarded = false
status = active
crear proyecto Supabase nuevo
guardar secretos reales
borrar registros
escribir directo a main
migraciones destructivas
```

## Instrucción final para la siguiente IA

Responder siempre en español.

No detenerse por cada microtarea.

No pedir permiso para las acciones automáticas listadas en `docs/26-ai-autonomous-action-allowlist.md`.

Detenerse solo ante límites de seguridad, permisos de plataforma o autorización explícita faltante para pruebas finales/activación.
