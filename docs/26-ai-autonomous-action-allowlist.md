# 26 - AI Autonomous Action Allowlist

## Propósito

Definir acciones operativas que la IA debe ejecutar automáticamente dentro de un bloque ya aprobado, sin pedir confirmación adicional al usuario por cada microtarea.

Esta política existe para eliminar interrupciones innecesarias durante tareas repetitivas de documentación, GitHub, Supabase y coordinación operativa.

## Regla principal

Cuando el usuario ya aprobó un bloque de trabajo con una instrucción como `hazlo`, `continúa`, `monta`, `sigue`, `ejecuta`, `vamos` o equivalente, la IA no debe volver a preguntar por las acciones listadas en este documento.

Debe ejecutarlas, registrar evidencia y reportar el resultado al cerrar el bloque.

## Acciones automáticas permitidas

Las siguientes acciones son automáticas dentro del alcance aprobado:

```text
add_supabase_script
create_github_file_in_repository
create_pull_request_in_github_repository
create_or_update_github_readme
add_comment_to_github
```

## Descripción operativa

### add_supabase_script

La IA puede agregar scripts Supabase necesarios para el bloque aprobado, incluyendo SQL no destructivo, scripts operativos, funciones auxiliares o archivos de soporte versionados.

Restricciones:

```text
no guardar secretos reales
no crear proyecto Supabase nuevo
no borrar datos
no ejecutar migraciones destructivas sin autorización separada
no activar runtime ni cambiar activation_guarded a false
```

### create_github_file_in_repository

La IA puede crear archivos en GitHub cuando sean necesarios para documentación, handover, scripts, plantillas, manifests, reglas o soporte técnico del bloque aprobado.

Reglas:

```text
usar rama de trabajo
no escribir directo a main
usar commits pequeños y auditables
reportar commit_sha y ruta creada
```

### create_pull_request_in_github_repository

La IA puede abrir pull requests sin preguntar cuando haya cambios listos para revisión.

Reglas:

```text
base_branch = main salvo que el contexto indique otra base
head_branch = rama de trabajo del bloque
body debe resumir cambios, seguridad y límites no ejecutados
reportar número y URL del PR
```

### create_or_update_github_readme

La IA puede crear o actualizar README.md cuando sea necesario para orientar el uso de una carpeta, automatización, script, paquete o handover.

Reglas:

```text
mantener README como mapa operativo breve
no duplicar manuales largos
no incluir secretos
actualizar rutas cuando se reorganice estructura
```

### add_comment_to_github

La IA puede agregar comentarios en issues o pull requests de GitHub cuando sirvan para dejar evidencia, explicar cambios, registrar estado, pedir revisión o cerrar un bloque operativo.

Reglas:

```text
comentar solo información relevante del bloque
no publicar secretos
no prometer ejecución futura fuera del turno actual
```

## Relación con el procedimiento de bloques

Este documento complementa:

```text
docs/25-ai-block-execution-procedure.md
```

La IA debe clasificar estas acciones dentro de las categorías ya existentes:

```text
GitHub file creation = github_write_docs_only o github_write_code_or_scripts
GitHub PR creation = github_write_docs_only o github_write_code_or_scripts
GitHub README creation = documentation_only o github_write_docs_only
GitHub comment = documentation_only o github_write_docs_only
Supabase script = supabase_registration, mixed_github_and_supabase o high_risk_runtime según alcance
```

## Límites que siguen requiriendo parada

Esta allowlist no autoriza acciones prohibidas o de alto riesgo fuera del alcance aprobado.

La IA debe detenerse si la acción implica:

```text
ejecutar pruebas finales
activar automatización
set activation_guarded = false
guardar o exponer secretos reales
crear un nuevo proyecto Supabase
borrar datos o registros
escribir directo a main
ejecutar migraciones destructivas
modificar producción fuera del alcance aprobado
```

## Resultado esperado

Al finalizar el bloque, la IA debe informar:

```text
acciones ejecutadas
archivos creados o modificados
PR creado o actualizado
comentarios agregados
IDs, commit_sha o URLs relevantes
acciones no ejecutadas por límites de seguridad, si aplica
```
