# Next AI Session Block Handover

## Objetivo de este handover

Este handover no es solo una descripción de estructura.

Su objetivo es indicar a la siguiente sesión de IA:

```text
1. dónde está detenido el proyecto;
2. qué ya fue completado;
3. qué no debe repetirse;
4. cuáles son los próximos bloques de trabajo;
5. qué límites de seguridad siguen vigentes;
6. cómo debe trabajar por bloques autónomos;
7. qué idioma debe usar con el usuario.
```

## Regla de idioma obligatoria

Aunque algunos documentos técnicos estén en inglés, la IA debe responder al usuario en español.

```text
assistant_response_language = español
technical_file_language = mantener idioma existente salvo instrucción contraria
```

## Leer primero

```text
README.md
docs/01-ai-context-router.md
docs/00-index.md
docs/25-ai-block-execution-procedure.md
handover/NEXT_AI_SESSION_BLOCK_HANDOVER.md
handover/example-shared-automation-HANDOVER.md
```

No cargar documentación de pruebas finales ni activación salvo autorización explícita del usuario.

## Repositorio actual

```text
repository = accesos-seo/automation-protocol
main_commit_sha = 292928f937c5dc5be9add37a8c793f034d425b8d
shared_supabase_project_ref = lwurzjrghzwzxbhrulyn
runtime = shared_supabase_runtime
```

## Trabajo completado

```text
PR #6 merged: shared automation handover generator and example
PR #7 merged: post-merge documentation status cleanup
PR #8 merged: AI block execution procedure and next-session handover
New-SharedAutomationHandover.ps1 is in main
example-shared-automation is in main
```

## Registro Supabase completado

La automatización de ejemplo ya fue registrada en el proyecto Supabase compartido.

```text
automation_key = example-shared-automation
automation_id = e4b53127-2a30-489b-8253-4d1a659f68c0
status = pending_final_validation
health_status = pending_final_validation
activation_guarded = true
commit_sha = 48c65a7576cf1e3de0a3d7b76a9271b9802eb1bb
```

Registros creados/verificados:

```text
automation_registry = 1
agent_registry = 1
skill_registry = 1
deployment_configs = 1
automation_rules = 1
runtime_events = 1
execution_tasks = 1
audit_logs = 1
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

## Punto exacto de detención

El proyecto queda detenido aquí:

```text
example-shared-automation está registrada en Supabase
estado = pending_final_validation
handover de ejemplo aún debe sincronizar IDs reales
estructura handover aún debe reorganizarse en carpetas exclusivas
verificación SQL final aún no se ha ejecutado
pruebas finales aún no se han ejecutado
activación aún no se ha ejecutado
```

## Estado de seguridad actual

```text
final_tests = not_executed
activation = not_executed
activation_guarded = true
controlled_activation = not_authorized
secrets_stored = false
new_supabase_project_created = false
```

`OPENROUTER_API_KEY` existe solo como referencia en `deployment_configs`; no se guardó ningún valor real.

## Método de trabajo obligatorio por bloques

La siguiente IA debe leer `docs/25-ai-block-execution-procedure.md` y decidir el tamaño del bloque de forma autónoma.

No debe preguntar al usuario cuántas microtareas ejecutar dentro de una fase aprobada.

Matriz resumida:

```text
pure_read_only = up to 12 tasks
supabase_verification_read_only = up to 12 tasks
mostly_read_with_light_documentation = 8 to 10 tasks
documentation_only = 5 to 10 tasks
github_write_docs_only = 5 to 8 tasks
github_write_code_or_scripts = 4 to 6 tasks
supabase_registration = 5 to 9 tasks
mixed_github_and_supabase = 5 to 7 tasks
high_risk_runtime = 1 to 3 tasks only, separate authorization required
```

Cuando el trabajo sea mixto, usar la categoría más restrictiva.

## Bloque siguiente recomendado: reorganización de handovers

Este bloque debe ejecutarse antes de continuar con validación final.

Tipo de bloque:

```text
github_write_docs_only = 5 to 8 tasks
```

Tareas:

```text
1. Crear rama para reorganización de handovers.
2. Crear handover/README.md como índice de handovers.
3. Crear ruta handover/_templates/.
4. Mover handover/_template-AUTOMATION-HANDOVER.md a handover/_templates/AUTOMATION-HANDOVER.md.
5. Crear ruta handover/automations/.
6. Mover handover/example-shared-automation-HANDOVER.md a handover/automations/example-shared-automation-HANDOVER.md.
7. Crear ruta handover/ai-sessions/.
8. Mover handover/NEXT_AI_SESSION_BLOCK_HANDOVER.md a handover/ai-sessions/NEXT_AI_SESSION_BLOCK_HANDOVER.md.
```

## Bloque posterior recomendado: actualizar referencias

Tipo de bloque:

```text
github_write_docs_only = 5 to 8 tasks
```

Tareas:

```text
1. Actualizar docs/00-index.md con las nuevas rutas handover.
2. Actualizar docs/01-ai-context-router.md con las nuevas rutas handover.
3. Actualizar docs/23-shared-automation-handover-checklist.md.
4. Actualizar scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1 para generar en handover/automations/.
5. Actualizar README.md solo si hace falta y de forma corta.
6. Abrir PR.
7. Verificar PR.
8. Mergear PR si está autorizado y mergeable.
```

## Bloque posterior recomendado: sincronizar handover de automatización

Tipo de bloque:

```text
github_write_docs_only = 5 to 8 tasks
```

Tareas:

```text
1. Actualizar handover/automations/example-shared-automation-HANDOVER.md con IDs reales Supabase.
2. Actualizar commit_sha y main_commit_sha.
3. Marcar Supabase registration como completado.
4. Mantener final_tests = not_executed.
5. Mantener activation = not_executed.
6. Mantener activation_guarded = true.
7. Abrir PR o incluir en el PR de reorganización si aún está abierto.
```

## Bloque posterior recomendado: verificación no destructiva

Tipo de bloque:

```text
supabase_verification_read_only = up to 12 tasks
```

Tareas:

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
10. Documentar resultado en handover.
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
```

## Instrucción final para la siguiente IA

Responder siempre en español al usuario.

Trabajar por bloques autónomos según `docs/25-ai-block-execution-procedure.md`.

No detenerse por cada microtarea.

Detenerse solo ante límites de seguridad, permisos de plataforma o autorización explícita faltante para pruebas finales/activación.
