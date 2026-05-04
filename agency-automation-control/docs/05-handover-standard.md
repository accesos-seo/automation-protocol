# Handover Standard

## Objetivo

Crear handovers cortos, útiles y reutilizables para continuidad operativa.

## Ruta histórica oficial

```text
handover/Registros_Historicos/YYYY/MM-Mes/YYYY-MM-DD_HH-MM_BOG_Titulo_Descriptivo.md
```

## Regla horaria

```text
zona_horaria = America/Bogota
utc_offset = UTC-5
usar formato 24h
incluir BOG en el nombre del archivo
```

## Secciones mínimas

```text
1. Identidad
2. Estado real en Supabase
3. Estado documental en GitHub
4. Evidencia
5. Riesgos
6. Pendientes
7. Siguiente paso exacto
8. Bloque corto para siguiente IA
```

## Identidad mínima

```text
automation_key
project_ref
schema
github_repo
github_path
responsable
fecha_hora_bog
```

## Regla de evidencia

No marcar una automatización como activa si no existe evidencia en Supabase:

```text
automation_blueprints.status = active
automation_blueprints.is_enabled = true
automation_events contiene evento de activación
automation_runs contiene prueba o ejecución cuando aplique
```

## Bloque corto para siguiente IA

Todo handover debe terminar con un bloque corto que permita continuar sin releer todo.
