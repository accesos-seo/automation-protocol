# 01 Addendum - Autonomous Routine Actions

## Propósito

Este addendum complementa `docs/01-ai-context-router.md` y debe leerse junto con `docs/25-ai-block-execution-procedure.md` antes de operar bloques de trabajo.

## Política

Dentro de un bloque ya aprobado por el usuario, la IA debe ejecutar acciones rutinarias sin volver a pedir confirmación por cada microtarea.

Acciones automáticas:

```text
add_supabase_script
create_github_file_in_repository
create_pull_request_in_github_repository
create_or_update_github_readme
add_comment_to_github
```

## Documentos relacionados

```text
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
```

## Límites

Esta política no autoriza pruebas finales, activación, secretos reales, creación de proyectos Supabase, escrituras directas a main ni cambios destructivos.
