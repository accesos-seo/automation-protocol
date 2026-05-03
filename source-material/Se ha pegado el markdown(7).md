# Handover — Continuación del trabajo Fase 2 / Constructor Scaffold

## 1. Contexto general

El usuario está construyendo un flujo por fases para automatizaciones en Supabase.

Ya se trabajó conceptualmente en:

```text
Fase 1 — Intake / Specialist Approval
Fase 2 — Constructor Scaffold
Fase 3 — Deployer
```

El punto actual es **Fase 2 — Constructor Scaffold**.

El usuario quiere que otra IA/agente técnico continúe el trabajo, idealmente con capacidad de acceder directamente a Supabase, inspeccionar la base, ajustar registros, verificar Edge Functions y corregir lo necesario sin pedirle al usuario depuración manual paso a paso.

---

## 2. Proyecto Supabase afectado

```text
Project URL:
https://lwurzjrghzwzxbhrulyn.supabase.co

Project ref:
lwurzjrghzwzxbhrulyn
```

Este proyecto **no apareció conectado** en la integración Supabase disponible en ChatGPT durante la conversación. La integración solo mostró otros proyectos:

```text
oyocaymmdeqmajnxtilq
lqqjijwwvvdtyksafhmt
```

Por eso no fue posible modificar directamente la base desde aquí.

---

## 3. Protocolos encontrados

El usuario consultó `automation_protocols` y obtuvo:

```json
[
  {
    "protocol_id": "68855189-fddf-4b12-b0c9-eb5d9b83234a",
    "status": "ready_for_specialist_approval",
    "readiness_score": "80.00",
    "specialist_decision": "pending",
    "handoff_ready_for_scaffold": false,
    "ai_feedback": "Modo temporal sin IA. Registro creado correctamente.",
    "created_at": "2026-05-03 03:51:02.476493+00"
  },
  {
    "protocol_id": "5b93d320-9a9c-45d8-af8a-36716c387060",
    "status": "ready_for_specialist_approval",
    "readiness_score": "80.00",
    "specialist_decision": "pending",
    "handoff_ready_for_scaffold": false,
    "ai_feedback": "Modo temporal sin IA. Registro creado correctamente.",
    "created_at": "2026-05-03 03:49:44.479204+00"
  }
]
```

El protocolo principal elegido para avanzar fue el más reciente:

```text
68855189-fddf-4b12-b0c9-eb5d9b83234a
```

---

## 4. Estado deseado del protocolo para Fase 2

Para iniciar correctamente Fase 2, el protocolo debe quedar así:

```json
{
  "status": "ready_for_scaffold",
  "specialist_decision": "approve_interpretation",
  "handoff_ready_for_scaffold": true
}
```

Inicialmente estaba así:

```json
{
  "status": "ready_for_specialist_approval",
  "specialist_decision": "pending",
  "handoff_ready_for_scaffold": false
}
```

---

## 5. Tablas esperadas para Fase 2

Se propusieron estas tablas:

```sql
create table if not exists public.scaffold_jobs (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.automation_protocols(id),
  project_id uuid references public.projects(id),
  witness_id uuid references public.witnesses(id),
  job_status text not null default 'scaffold_queued',
  input_payload jsonb not null default '{}'::jsonb,
  architecture_map jsonb not null default '{}'::jsonb,
  output_summary jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scaffold_artifacts (
  id uuid primary key default gen_random_uuid(),
  scaffold_job_id uuid not null references public.scaffold_jobs(id),
  protocol_id uuid not null references public.automation_protocols(id),
  artifact_type text not null,
  artifact_name text not null,
  file_path text,
  storage_url text,
  checksum text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scaffold_validation_reports (
  id uuid primary key default gen_random_uuid(),
  scaffold_job_id uuid not null references public.scaffold_jobs(id),
  protocol_id uuid not null references public.automation_protocols(id),
  passed_checks integer not null default 0,
  failed_checks integer not null default 0,
  warnings jsonb not null default '[]'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  pending_configs jsonb not null default '[]'::jsonb,
  validation_status text not null default 'pending',
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scaffold_files (
  id uuid primary key default gen_random_uuid(),
  scaffold_job_id uuid not null references public.scaffold_jobs(id),
  protocol_id uuid not null references public.automation_protocols(id),
  file_role text not null,
  relative_path text not null,
  file_name text not null,
  file_extension text,
  checksum text,
  generated_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

También deben existir o revisarse:

```text
automation_protocols
phase_events
audit_logs
projects
witnesses
```

---

## 6. Edge Function 1 propuesta: `create-scaffold-job`

Objetivo:

```text
1. Recibe protocol_id.
2. Busca automation_protocol.
3. Valida:
   - status = ready_for_scaffold
   - handoff_ready_for_scaffold = true
   - specialist_decision = approve_interpretation
4. Crea o reutiliza scaffold_job.
5. Inserta phase_event scaffold.job_created.
6. Inserta audit_log create_scaffold_job.
7. Devuelve scaffold_job_id.
```

Nombre de archivo:

```text
supabase/functions/create-scaffold-job/index.ts
```

Código entregado previamente al usuario:

```ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type RequestBody = {
  protocol_id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed. Use POST.",
      },
      405,
    );
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        {
          success: false,
          error:
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.",
        },
        500,
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    const body = (await req.json()) as RequestBody;
    const protocol_id = body.protocol_id;

    if (!protocol_id) {
      return jsonResponse(
        {
          success: false,
          error: "protocol_id is required.",
        },
        400,
      );
    }

    const { data: protocol, error: protocolError } = await supabase
      .from("automation_protocols")
      .select(
        `
        id,
        witness_id,
        project_id,
        specialist_id,
        status,
        readiness_score,
        scaffold_payload,
        specialist_decision,
        handoff_ready_for_scaffold
      `,
      )
      .eq("id", protocol_id)
      .single();

    if (protocolError || !protocol) {
      return jsonResponse(
        {
          success: false,
          error: "Automation protocol not found.",
          details: protocolError?.message,
        },
        404,
      );
    }

    const isReadyForScaffold =
      protocol.status === "ready_for_scaffold" &&
      protocol.handoff_ready_for_scaffold === true &&
      protocol.specialist_decision === "approve_interpretation";

    if (!isReadyForScaffold) {
      return jsonResponse(
        {
          success: false,
          error: "Protocol is not ready for scaffold.",
          required_state: {
            status: "ready_for_scaffold",
            handoff_ready_for_scaffold: true,
            specialist_decision: "approve_interpretation",
          },
          current_state: {
            status: protocol.status,
            handoff_ready_for_scaffold: protocol.handoff_ready_for_scaffold,
            specialist_decision: protocol.specialist_decision,
            readiness_score: protocol.readiness_score,
          },
        },
        409,
      );
    }

    const inputPayload = {
      handoff_type: "specialist_intake_to_scaffold",
      protocol_id: protocol.id,
      project_id: protocol.project_id,
      witness_id: protocol.witness_id,
      specialist_id: protocol.specialist_id,
      scaffold_payload: protocol.scaffold_payload ?? {},
      validation_layer: {
        specialist_approved: true,
        specialist_decision: protocol.specialist_decision,
        protocol_status: protocol.status,
        readiness_score: protocol.readiness_score,
      },
      scaffold_expectations: {
        generate_agents: true,
        generate_skills: true,
        generate_resources: true,
        generate_scripts: true,
        generate_evals: true,
        generate_routing_rules: true,
        generate_validation_report: true,
      },
    };

    const { data: existingJob, error: existingJobError } = await supabase
      .from("scaffold_jobs")
      .select("id, job_status")
      .eq("protocol_id", protocol_id)
      .in("job_status", [
        "scaffold_queued",
        "scaffold_input_validating",
        "scaffold_mapping",
        "scaffold_generating",
        "scaffold_validation_running",
        "scaffold_completed",
        "ready_for_deployer",
      ])
      .maybeSingle();

    if (existingJobError) {
      return jsonResponse(
        {
          success: false,
          error: "Failed checking existing scaffold job.",
          details: existingJobError.message,
        },
        500,
      );
    }

    if (existingJob) {
      return jsonResponse({
        success: true,
        reused_existing_job: true,
        scaffold_job_id: existingJob.id,
        job_status: existingJob.job_status,
      });
    }

    const { data: scaffoldJob, error: scaffoldJobError } = await supabase
      .from("scaffold_jobs")
      .insert({
        protocol_id: protocol.id,
        project_id: protocol.project_id,
        witness_id: protocol.witness_id,
        job_status: "scaffold_queued",
        input_payload: inputPayload,
        architecture_map: {},
        output_summary: {},
      })
      .select("id, job_status")
      .single();

    if (scaffoldJobError || !scaffoldJob) {
      return jsonResponse(
        {
          success: false,
          error: "Failed creating scaffold job.",
          details: scaffoldJobError?.message,
        },
        500,
      );
    }

    await supabase.from("phase_events").insert({
      protocol_id: protocol.id,
      witness_id: protocol.witness_id,
      event_type: "scaffold.job_created",
      from_status: protocol.status,
      to_status: "scaffold_queued",
      payload: {
        scaffold_job_id: scaffoldJob.id,
        source: "create-scaffold-job",
      },
      processed: false,
    });

    await supabase.from("audit_logs").insert({
      entity_type: "scaffold_job",
      entity_id: scaffoldJob.id,
      action: "create_scaffold_job",
      actor_type: "system",
      actor_id: null,
      old_value: null,
      new_value: {
        protocol_id: protocol.id,
        job_status: "scaffold_queued",
      },
      metadata: {
        source: "create-scaffold-job",
      },
    });

    return jsonResponse({
      success: true,
      reused_existing_job: false,
      protocol_id: protocol.id,
      scaffold_job_id: scaffoldJob.id,
      job_status: scaffoldJob.job_status,
      next_step: "Run build-scaffold with this scaffold_job_id.",
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: "Unexpected error in create-scaffold-job.",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
```

---

## 7. Edge Function 2 propuesta: `build-scaffold`

Objetivo:

```text
1. Recibe protocol_id o scaffold_job_id.
2. Busca scaffold_job.
3. Busca automation_protocol.
4. Valida protocolo listo para scaffold.
5. Genera architecture_map.
6. Registra archivos esperados en scaffold_files.
7. Registra artifacts en scaffold_artifacts.
8. Crea scaffold_validation_reports.
9. Marca scaffold_jobs.job_status = ready_for_deployer.
10. Inserta phase_event scaffold.completed.
11. Inserta audit_log build_scaffold.
```

Archivos esperados registrados en `scaffold_files`:

```text
protocols/{protocol_id}/agents/agent.manifest.json
protocols/{protocol_id}/skills/skills.manifest.json
protocols/{protocol_id}/resources/resources.manifest.json
protocols/{protocol_id}/scripts/run.ts
protocols/{protocol_id}/evals/eval-suite.json
protocols/{protocol_id}/routing-rules/routing-rules.json
protocols/{protocol_id}/README.md
protocols/{protocol_id}/deployment/deployment.manifest.json
protocols/{protocol_id}/validation-report.json
```

Artifacts esperados:

```text
constructor-scaffold-bundle
validation-report.json
```

Estado final esperado:

```text
scaffold_jobs.job_status = ready_for_deployer
```

Validation status esperado:

```text
passed_with_pending_configs
```

---

## 8. Scripts de prueba entregados

Se entregó un script llamado:

```text
test-phase-2.mjs
```

Objetivo del script:

```text
1. Verificar protocolo.
2. Aprobar protocolo para scaffold.
3. Llamar create-scaffold-job.
4. Llamar build-scaffold.
5. Consultar scaffold_jobs.
6. Consultar scaffold_files.
7. Consultar scaffold_artifacts.
8. Consultar scaffold_validation_reports.
9. Consultar phase_events.
10. Imprimir RESULTADO FINAL.
```

Resultado esperado:

```json
{
  "success": true,
  "phase": "phase_2_constructor_scaffold",
  "protocol_id": "68855189-fddf-4b12-b0c9-eb5d9b83234a",
  "scaffold_job_id": "...",
  "job_status": "ready_for_deployer",
  "files_registered": 9,
  "artifacts_registered": 2,
  "validation_status": "passed_with_pending_configs",
  "next_phase": "phase_3_deployer"
}
```

Pero el usuario indicó que al ejecutar una consulta obtuvo:

```text
Success. No rows returned
```

No se confirmó que el script completo haya terminado exitosamente. Se asumió que hay algo pendiente de revisar en la base.

---

## 9. Problema actual

El usuario no desea seguir corrigiendo ni depurando manualmente.

El estado actual debe considerarse:

```text
PENDIENTE DE REVISIÓN TÉCNICA DIRECTA EN SUPABASE
```

Motivo:

```text
Una consulta devolvió “Success. No rows returned”.
No hay confirmación definitiva de que:
- el protocolo haya avanzado,
- se haya creado scaffold_job,
- build-scaffold haya corrido,
- existan scaffold_files,
- exista validation_report,
- el estado final sea ready_for_deployer.
```

---

## 10. Consultas que debe ejecutar el siguiente agente

### Confirmar protocolo

```sql
select
  id,
  status,
  readiness_score,
  specialist_decision,
  handoff_ready_for_scaffold,
  project_id,
  witness_id,
  specialist_id,
  scaffold_payload,
  ai_feedback,
  created_at,
  updated_at
from public.automation_protocols
where id = '68855189-fddf-4b12-b0c9-eb5d9b83234a';
```

### Confirmar scaffold job

```sql
select
  id,
  protocol_id,
  project_id,
  witness_id,
  job_status,
  input_payload,
  architecture_map,
  output_summary,
  error_message,
  started_at,
  completed_at,
  created_at,
  updated_at
from public.scaffold_jobs
where protocol_id = '68855189-fddf-4b12-b0c9-eb5d9b83234a'
order by created_at desc;
```

### Confirmar scaffold files

```sql
select
  id,
  scaffold_job_id,
  protocol_id,
  file_role,
  relative_path,
  file_name,
  checksum,
  generated_by,
  created_at
from public.scaffold_files
where protocol_id = '68855189-fddf-4b12-b0c9-eb5d9b83234a'
order by created_at asc;
```

### Confirmar artifacts

```sql
select
  id,
  scaffold_job_id,
  protocol_id,
  artifact_type,
  artifact_name,
  file_path,
  storage_url,
  checksum,
  metadata,
  created_at
from public.scaffold_artifacts
where protocol_id = '68855189-fddf-4b12-b0c9-eb5d9b83234a'
order by created_at asc;
```

### Confirmar validation report

```sql
select
  id,
  scaffold_job_id,
  protocol_id,
  validation_status,
  passed_checks,
  failed_checks,
  warnings,
  errors,
  pending_configs,
  report,
  created_at
from public.scaffold_validation_reports
where protocol_id = '68855189-fddf-4b12-b0c9-eb5d9b83234a'
order by created_at desc;
```

### Confirmar events

```sql
select
  id,
  protocol_id,
  witness_id,
  event_type,
  from_status,
  to_status,
  payload,
  processed,
  created_at
from public.phase_events
where protocol_id = '68855189-fddf-4b12-b0c9-eb5d9b83234a'
order by created_at desc;
```

---

## 11. Reparación mínima esperada

Si el protocolo existe pero no avanzó:

```sql
update public.automation_protocols
set
  status = 'ready_for_scaffold',
  specialist_decision = 'approve_interpretation',
  handoff_ready_for_scaffold = true,
  updated_at = now()
where id = '68855189-fddf-4b12-b0c9-eb5d9b83234a'
returning
  id,
  status,
  specialist_decision,
  handoff_ready_for_scaffold,
  updated_at;
```

Luego crear/reusar `scaffold_job`, correr `build-scaffold` y verificar los registros.

---

## 12. Criterio de éxito

La Fase 2 se considera completa solo si se confirma:

### `automation_protocols`

```text
id = 68855189-fddf-4b12-b0c9-eb5d9b83234a
status = ready_for_scaffold
specialist_decision = approve_interpretation
handoff_ready_for_scaffold = true
```

### `scaffold_jobs`

```text
protocol_id = 68855189-fddf-4b12-b0c9-eb5d9b83234a
job_status = ready_for_deployer
```

### `scaffold_files`

Al menos 9 registros:

```text
agent.manifest.json
skills.manifest.json
resources.manifest.json
run.ts
eval-suite.json
routing-rules.json
README.md
deployment.manifest.json
validation-report.json
```

### `scaffold_artifacts`

Al menos:

```text
constructor-scaffold-bundle
validation-report.json
```

### `scaffold_validation_reports`

```text
validation_status = passed_with_pending_configs
failed_checks = 0
```

### `phase_events`

Deben existir:

```text
scaffold.job_created
scaffold.completed
```

---

## 13. Qué debe hacer la siguiente IA/agente

La siguiente IA debe asumir la tarea como una intervención técnica directa:

```text
1. Acceder al proyecto Supabase correcto:
   lwurzjrghzwzxbhrulyn

2. Revisar esquema:
   - automation_protocols
   - scaffold_jobs
   - scaffold_files
   - scaffold_artifacts
   - scaffold_validation_reports
   - phase_events
   - audit_logs

3. Confirmar que las tablas existen y que sus columnas coinciden.

4. Revisar si las Edge Functions existen:
   - create-scaffold-job
   - build-scaffold

5. Si faltan, desplegarlas o corregirlas.

6. Revisar el protocolo:
   68855189-fddf-4b12-b0c9-eb5d9b83234a

7. Avanzarlo correctamente a ready_for_scaffold si sigue pendiente.

8. Crear o reutilizar scaffold_job.

9. Ejecutar build-scaffold.

10. Confirmar que el job termina en ready_for_deployer.

11. Verificar archivos, artifacts, validation report y eventos.

12. Solo después marcar la Fase 2 como completada y preparar Fase 3 — Deployer.
```

---

## 14. Preferencia del usuario

El usuario acepta copiar y pegar código completo, pero no quiere fragmentos con placeholders como:

```text
PEGA_AQUI...
TU_PROJECT_REF...
TU_ANON_KEY...
```

Quiere scripts completos ya armados con la información disponible.

El usuario no quiere hacer depuración manual paso a paso. Prefiere que una IA/agente con acceso real a la base revise y ajuste directamente.

---

## 15. Estado final del handover

```text
Estado: Pendiente de revisión técnica directa
Fase actual: Fase 2 — Constructor Scaffold
Protocolo principal: 68855189-fddf-4b12-b0c9-eb5d9b83234a
Proyecto Supabase: lwurzjrghzwzxbhrulyn
Siguiente objetivo: confirmar/corregir Fase 2 hasta ready_for_deployer
Siguiente fase después de validación: Fase 3 — Deployer
```
