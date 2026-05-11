# 27 - WhatsApp Meta Automation Pattern

## Propósito

Documentar el patrón general recomendado para automatizaciones de WhatsApp usando Supabase, Meta Cloud API, Edge Functions, `pg_cron`, `pg_net`, cola auditable y webhook de estados.

Este documento existe para que una IA futura no vuelva a implementar envíos directos frágiles cuando el flujo requiere trazabilidad, reintentos, tablero y confirmación real de entrega.

## Cuándo cargar este documento

Leer este documento cuando la tarea mencione cualquiera de estos temas:

```text
WhatsApp
Meta Cloud API
webhook de Meta
mensajes a leads
recordatorios por WhatsApp
notification_queue
accepted / delivered / read / failed
pg_cron + pg_net para enviar mensajes
cola de notificaciones
```

No cargarlo para automatizaciones que no envíen mensajes externos o que no dependan de proveedores como Meta.

## Principio central

No acoplar el evento de negocio al proveedor externo.

El evento de negocio debe guardar estado propio y encolar una intención de mensaje. El envío real debe ocurrir en un proceso separado, auditable y reintentable.

Patrón recomendado:

```text
evento de negocio
→ notification_queue status = pending
→ processor programado
→ Meta Cloud API
→ provider_message_id
→ webhook Meta
→ delivered / read / failed
→ dashboard operativo
```

Evitar este patrón salvo pruebas simples:

```text
evento de negocio
→ Edge Function
→ Meta Cloud API directo
```

## Por qué no enviar directo

Enviar directo desde un trigger o desde el formulario parece más simple, pero genera riesgos:

```text
1. El formulario queda acoplado a Meta, red, tokens y templates.
2. Un error externo puede afectar el flujo principal del CRM.
3. No hay reintentos controlados.
4. No hay deduplicación robusta.
5. No queda trazabilidad suficiente para soporte.
6. No se puede correlacionar bien con webhooks si no se guarda provider_message_id.
7. El resultado accepted de Meta puede confundirse con entrega real.
```

La cola permite:

```text
auditoría
reintentos
control de volumen
deduplicación
observabilidad
webhook correlation
dashboard
alertas
rollback operativo
```

## Estados separados

Mantener separados el estado del sistema y el estado de Meta.

Estado del sistema:

```text
pending
processing
sent
failed
skipped
```

Estado de entrega del proveedor:

```text
accepted
sent
delivered
read
failed
```

Regla importante:

```text
accepted != delivered
```

`accepted` significa que Meta recibió o aceptó la solicitud inicial. La entrega real debe confirmarse con webhook.

## Tablas recomendadas

### notification_queue

Debe guardar como mínimo:

```text
id
event_type
event_reference_id
entity_type
entity_reference_id
recipient_type
recipient_reference_id
recipient_name
recipient_phone
channel
provider
template_name
template_language
template_parameters
payload
status
delivery_status
provider_message_id
provider_response
webhook_payload
error_message
failed_reason
attempt_count
created_at
processing_at
sent_at
failed_at
delivered_at
read_at
last_delivery_status_at
updated_at
```

Índices recomendados:

```text
(status, created_at)
(provider_message_id)
(delivery_status, last_delivery_status_at)
```

Deduplicación recomendada:

```text
event_type
event_reference_id
recipient_reference_id
recipient_phone
template_name
```

### meta_whatsapp_status_events

Debe guardar eventos crudos del webhook:

```text
id
provider_message_id
recipient_id
status
status_timestamp
raw_payload
errors
conversation
pricing
created_at
```

No descartar el payload crudo. El payload crudo sirve para soporte, auditoría y cambios futuros de estructura de Meta.

## Funciones recomendadas

### enqueue_notification

Responsabilidad:

```text
normalizar teléfono
validar datos mínimos
insertar pending
aplicar deduplicación
no llamar a Meta
```

Debe ser segura:

```text
SECURITY DEFINER solo si es necesario
search_path fijado
EXECUTE no público salvo decisión explícita
preferiblemente invocada por triggers internos o service_role
```

### processor Edge Function

Responsabilidad:

```text
leer pending
marcar processing
construir template Meta
enviar a Meta Cloud API
guardar provider_response
guardar provider_message_id
marcar sent + delivery_status accepted
marcar failed con error si Meta rechaza
```

Debe limitar batch:

```text
limit = 25 por ejecución como punto inicial razonable
```

Ajustar según volumen real.

### meta-whatsapp-webhook Edge Function

Responsabilidad:

```text
GET verification de Meta
POST de statuses
guardar evento crudo
actualizar notification_queue por provider_message_id
setear sent_at / delivered_at / read_at / failed_at
```

La función debe estar pública para Meta, pero validada por `verify_token` en GET y por validaciones del payload en POST.

## pg_cron y pg_net

Diferencia:

```text
pg_cron = agenda cuándo correr
pg_net = ejecuta HTTP POST hacia la Edge Function
```

Patrón:

```text
cron.schedule('* * * * *')
→ net.http_post('/functions/v1/process-whatsapp-notifications')
```

Un job cada minuto es razonable si:

```text
la consulta es pequeña
la función tiene batch limit
la cola suele estar vacía o moderada
no hay más de varios jobs pesados concurrentes
```

Validación importante:

```text
cron.job_run_details status = succeeded
```

solo confirma que Postgres ejecutó el SQL del job. No confirma que la Edge Function respondió 200.

Para confirmar respuesta real del HTTP, revisar:

```sql
select
  id,
  status_code,
  left(coalesce(content, ''), 500) as content_preview,
  timed_out,
  error_msg,
  created
from net._http_response
order by created desc
limit 10;
```

## Autorización de cron hacia Edge Functions

Opciones aceptables:

```text
1. Authorization: Bearer <anon/publishable key> con verify_jwt=true.
2. x-cron-secret usando secreto configurado en Edge Function.
3. Preferible: guardar project_url y key en Supabase Vault y leerlos desde el job.
```

Evitar:

```text
hardcodear service_role keys en triggers, funciones o documentación
pegar tokens privados en DDL
exponer secrets en GitHub
```

Si se detecta un token privado incrustado en un trigger o SQL:

```text
1. no copiarlo al reporte
2. planear rotación
3. migrar a Supabase Secrets o Vault
4. reemplazar llamada directa por cola o función segura
```

## Templates de Meta

Para mensajes iniciados por la empresa, usar templates aprobados por Meta.

Guardar en la cola:

```text
template_name
template_language
template_parameters
```

Ejemplo para lead nuevo:

```text
template_name = lead_welcome_es
template_language = es
parameters = [lead_name, company_name, service_interest]
```

Si el template no existe o no está aprobado, el processor debe marcar `failed` y guardar la respuesta de Meta.

## Dashboard operativo

El tablero debe leer una vista o endpoint que exponga:

```text
system_status
meta_status
operational_status
needs_attention
provider_message_id
attempt_count
created_at
sent_at
delivered_at
read_at
failed_at
error_message
```

Reglas útiles para `needs_attention`:

```text
pending > 5 minutos
processing > 5 minutos
accepted sin avance > 10 minutos
failed
attempt_count > 1
webhook sin eventos recientes cuando hay envíos accepted
```

## Hardening recomendado

Aplicar para nuevos módulos:

```text
RLS enabled en tablas nuevas
SELECT solo para authenticated cuando aplique dashboard
sin INSERT/UPDATE/DELETE para anon/authenticated salvo necesidad explícita
views con security_invoker = true
funciones SECURITY DEFINER con search_path fijo
revocar EXECUTE público de funciones internas
no usar secrets en tablas públicas
no guardar tokens en GitHub
```

Recordatorio:

```text
scheduled_job_log u otras tablas públicas sin RLS deben revisarse antes de exponerlas al frontend.
```

## Migración desde implementación legacy

Si existe un envío directo o una tabla legacy como `whatsapp_message_log`, no borrar inmediatamente.

Pasos recomendados:

```text
1. Auditar triggers actuales.
2. Identificar qué eventos envían directo.
3. Crear notification_queue y webhook store.
4. Crear processor nuevo.
5. Crear trigger nuevo que encole.
6. Desactivar trigger directo para evitar duplicados.
7. Mantener Edge Function vieja como rollback temporal.
8. Migrar o cerrar mensajes legacy pendientes en bloque separado.
9. Rotar tokens si estaban embebidos en DDL.
10. Documentar handover.
```

## Pruebas mínimas

Antes de activar envío real:

```text
1. Verificar tablas y triggers.
2. Verificar Edge Functions desplegadas.
3. Verificar cron activo.
4. Verificar net._http_response status_code = 200.
5. Verificar notification_queue vacía o controlada.
6. Confirmar template aprobado en Meta.
7. Insertar lead controlado.
8. Confirmar pending.
9. Confirmar processor → accepted.
10. Conectar webhook Meta.
11. Confirmar delivered/read/failed.
```

## Criterio para enriquecer este documento

Agregar experiencias futuras solo si son generales y reutilizables, por ejemplo:

```text
patrones de webhook
errores comunes de Meta
estrategias de retry
seguridad de cron
hardening de RLS
observabilidad del dashboard
migración de legacy a cola
```

No agregar detalles demasiado específicos como:

```text
nombres privados de clientes
números de teléfono
valores reales de tokens
errores únicos no repetibles
payloads con datos personales
```

## Referencias internas

Leer junto con:

```text
docs/01-ai-context-router.md
docs/00-index.md
docs/25-ai-block-execution-procedure.md
docs/26-ai-autonomous-action-allowlist.md
```
