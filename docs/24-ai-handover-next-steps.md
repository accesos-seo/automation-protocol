# 24 - AI Handover and Next Steps

## Propósito

Este documento sirve como handover para una nueva IA que continúe el trabajo del repositorio `automation-protocol` sin cargar contexto innecesario y sin repetir trabajo ya realizado.

La nueva IA debe leer primero este archivo, luego `docs/01-ai-context-router.md`, y después solo los documentos indicados según la tarea.

## Mensaje inicial recomendado para una nueva IA

```text
Estás continuando el proyecto automation-protocol.

No empieces leyendo todo el repositorio. Primero lee:

1. README.md
2. docs/01-ai-context-router.md
3. docs/00-index.md
4. docs/24-ai-handover-next-steps.md

Después identifica la intención exacta de la tarea:

crear | validar | registrar | verificar | probar_final | activar | pausar | documentar | modificar_runtime

Con esa intención, carga solo los documentos indicados por docs/01-ai-context-router.md.

Estado actual del proyecto:

- El runtime base ya está validado.
- El proyecto Supabase compartido es lwurzjrghzwzxbhrulyn.
- No se debe crear un proyecto Supabase nuevo por cada automatización.
- Las nuevas automatizaciones se separan por automation_key.
- GitHub guarda código, docs, manifests, skills, reglas, scripts y handovers.
- Supabase guarda automation_registry, agent_registry, skill_registry, deployment_configs, automation_rules, audit_logs, runtime_events y execution_tasks.
- Los secretos reales viven en Supabase Secrets o entorno seguro, nunca en GitHub ni en tablas públicas.
- Durante construcción mantener activation_guarded = true.
- No ejecutar pruebas finales ni activar nada hasta que el estado sea pending_final_validation y el usuario lo autorice.

Funciones Edge activas del pipeline:

- generate-shared-automation-scaffold
- validate-shared-automation-manifest
- build-components-payload-from-manifest
- build-shared-automation-draft
- create-shared-automation
- register-shared-automation-components
- update-shared-automation-build-state
- create-shared-automation-local-test

Scripts PowerShell oficiales:

- scripts/powershell/shared-automation/Invoke-SharedAutomationFunction.ps1
- scripts/powershell/shared-automation/New-SharedAutomationScaffold.ps1
- scripts/powershell/shared-automation/Register-SharedAutomationFromManifest.ps1
- scripts/powershell/shared-automation/Get-SharedAutomationVerificationSql.ps1
- scripts/powershell/shared-automation/Invoke-SharedAutomationFinalTests.ps1
- scripts/powershell/shared-automation/Enable-SharedAutomationControlledActivation.ps1
- scripts/powershell/shared-automation/Disable-SharedAutomation.ps1

Documentos principales:

- docs/01-ai-context-router.md
- docs/00-index.md
- docs/17-deferred-final-test-plan.md
- docs/18-shared-automation-build-pipeline.md
- docs/19-shared-automation-operational-flow.md
- docs/20-shared-automation-powershell-operator-guide.md
- docs/21-shared-automation-final-test-closeout-guide.md
- docs/22-shared-automation-controlled-activation-checklist.md
- docs/23-shared-automation-handover-checklist.md
- docs/24-ai-handover-next-steps.md

Plantillas y ejemplos:

- automations/_template/
- handover/_template-AUTOMATION-HANDOVER.md
- examples/shared-automation/example-manifest.json

Trabajo ya completado:

- README reducido como mapa ejecutivo.
- docs/01-ai-context-router.md creado para reducir consumo de tokens.
- docs/00-index.md actualizado como índice maestro.
- Pipeline compartido Supabase construido y documentado.
- Funciones Edge creadas/desplegadas.
- Scripts PowerShell versionados.
- Ejemplo de manifest creado.
- Checklist de handover creado.

Siguientes pasos que debes ejecutar:

1. Crear un script PowerShell que genere automáticamente el handover inicial por automation_key.
   Ruta sugerida:
   scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1

2. Crear una plantilla más completa de handover operativo si la actual se queda corta.
   Ruta base:
   handover/_template-AUTOMATION-HANDOVER.md

3. Actualizar docs/23-shared-automation-handover-checklist.md para referenciar el nuevo script.

4. Actualizar docs/00-index.md y docs/01-ai-context-router.md para incluir el nuevo script.

5. Actualizar README.md solo si hace falta, manteniéndolo corto. No convertirlo en manual.

6. Después, preparar un ejemplo completo de una automatización real bajo automations/example-shared-automation/ sin ejecutar pruebas finales.

7. No ejecutar Invoke-SharedAutomationFinalTests.ps1 salvo autorización explícita.

8. No ejecutar Enable-SharedAutomationControlledActivation.ps1 salvo autorización explícita.

9. Mantener enfoque proactivo: si una tarea de documentación queda terminada, avanzar al siguiente bloque lógico sin esperar confirmación, pero sin ejecutar pruebas ni activaciones.

10. Registrar cada cambio con commits claros en GitHub.

Regla de oro:

Lee poco, actúa con precisión, documenta rutas, evita repetir contexto y no expongas secretos.
```

## Próximos pasos técnicos

### 1. Crear script de handover automático

Ruta sugerida:

```text
scripts/powershell/shared-automation/New-SharedAutomationHandover.ps1
```

Responsabilidad:

- Recibir `automation_key`, `automation_name`, `protocol_name`, `commit_sha`.
- Generar contenido Markdown de handover.
- Incluir checklist de `docs/23-shared-automation-handover-checklist.md`.
- No llamar Supabase.
- No ejecutar pruebas.
- No activar nada.

### 2. Actualizar template de handover

Ruta:

```text
handover/_template-AUTOMATION-HANDOVER.md
```

Agregar:

- Context router reference.
- Estado Supabase esperado.
- Evidencia GitHub.
- Evidencia Supabase.
- Checklist antes de pruebas finales.
- Checklist post pruebas.
- Checklist antes de activación.
- Rollback notes.

### 3. Actualizar documentación que debe apuntar al nuevo script

```text
docs/00-index.md
docs/01-ai-context-router.md
docs/20-shared-automation-powershell-operator-guide.md
docs/23-shared-automation-handover-checklist.md
```

### 4. Mantener el README corto

El README debe seguir siendo solo mapa ejecutivo.

No mover instrucciones largas al README.

## Prohibiciones para la nueva IA

```text
No leer todo el repositorio por defecto.
No crear nuevos proyectos Supabase para cada automatización.
No guardar secretos reales en GitHub.
No guardar secretos reales en tablas públicas.
No ejecutar pruebas finales sin autorización.
No activar automatizaciones sin autorización.
No borrar datos sin confirmación explícita.
No convertir README.md en manual largo.
```

## Criterio de buen comportamiento

La nueva IA trabaja correctamente si:

```text
usa docs/01-ai-context-router.md antes de cargar contexto,
usa PowerShell cuando corresponda,
mantiene activation_guarded = true durante construcción,
crea documentación y scripts versionados,
registra commits claros,
y avanza proactivamente sin ejecutar pruebas finales ni activaciones.
```
