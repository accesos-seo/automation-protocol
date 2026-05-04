# Agency Automation Protocol

## Propósito

Crear una forma estándar, corta y escalable para controlar automatizaciones de la agencia.

El protocolo debe servir para:

```text
crear automatizaciones
documentarlas
validarlas
activarlas
pausarlas
desactivarlas
auditar eventos
generar handovers
permitir automatizaciones simples, híbridas o con agentes
```

## Separación oficial

```text
GitHub = documentación, manifests, handovers, skills, scripts y lógica versionada.
Supabase = estado vivo, activación/desactivación, eventos, runs, trazabilidad y dashboard.
```

## Estados operativos

```text
draft = idea o solicitud inicial
designed = diseño documentado
ready_for_build = listo para construir
active = activo y autorizado
paused = pausa temporal
disabled = desactivado operacionalmente
archived = histórico, no operativo
```

## Health status

```text
not_tested
healthy
warning
failed
blocked
```

## Tipos de automatización

```text
logic = lógica directa sin agentes
agent_swarm = requiere grupo de agentes
hybrid = mezcla lógica + agentes
manual_protocol = protocolo documentado sin runtime automático todavía
```

## Regla de activación

Ninguna automatización debe marcarse como activa sin evidencia mínima:

```text
manifest creado
registro en Supabase
canales definidos
horario definido si aplica
riesgos revisados
handover o nota operativa creada
prueba o dry-run registrada cuando aplique
```

## Regla de desactivación

Toda pausa o desactivación debe dejar evento en Supabase con:

```text
motivo
actor
fecha
estado anterior
estado nuevo
impacto esperado
```

## Principio operativo

Primero orden. Luego ejecución.

Antes de construir una automatización nueva, debe existir una entrada en `agency_automations.automation_blueprints` y un manifest versionado en GitHub.
