# Handover

Índice operativo de handovers, reglas, fases, plantillas y registros históricos.

## Accesos rápidos

- [Reglas y fases](./00_Reglas_y_Fases/)
- [Plantillas](./01_Plantillas/)
- [Registros históricos](./Registros_Historicos/)

## SOP de registros históricos

Todo handover real ejecutado debe guardarse en una ruta cronológica:

```text
handover/Registros_Historicos/YYYY/MM-Mes/YYYY-MM-DD_HH-MM_ContextoDelHandover.md
```

Ejemplo:

```text
handover/Registros_Historicos/2026/05-Mayo/2026-05-03_19-30_Reorganizacion_Handover.md
```

Reglas:

```text
1. Usar año de 4 dígitos.
2. Usar mes con número y nombre: 05-Mayo.
3. Usar fecha y hora al inicio del archivo: YYYY-MM-DD_HH-MM.
4. Usar contexto corto en PascalCase o palabras separadas por guiones bajos.
5. Mantener extensión .md.
```

## Últimos Handovers

1. [2026-05-03 19:30 - Reorganización Handover](./Registros_Historicos/2026/05-Mayo/2026-05-03_19-30_Reorganizacion_Handover.md)

## Nota de seguridad

Este directorio documenta estado y transferencia operativa. No autoriza por sí mismo pruebas finales, activación, escritura de secretos ni cambios destructivos en runtime.
