// deno-lint-ignore-file no-explicit-any

type BuildState =
  | "scaffolded"
  | "components_registered"
  | "pending_final_validation"
  | "validated"
  | "active"
  | "paused";

type RequestBody = {
  automation_key?: string;
  target_state?: BuildState;
  commit_sha?: string;
  evidence?: Record<string, unknown>;
  notes?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedTransitions: Record<string, BuildState[]> = {
  draft_scaffold_generated: ["scaffolded"],
  scaffolded: ["components_registered", "paused"],
  components_registered: ["pending_final_validation", "paused"],
  pending_final_validation: ["validated", "paused"],
  validated: ["active", "paused"],
  active: ["paused"],
  paused: ["scaffolded", "components_registered", "pending_final_validation"],
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function validateAutomationKey(value: string): string | null {
  if (!value) return "automation_key is required";
  if (value.length < 6) return "automation_key must have at least 6 characters";
  if (value.length > 80) return "automation_key must have at most 80 characters";
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value)) {
    return "automation_key must be lowercase kebab-case with letters, numbers and hyphens only";
  }
  return null;
}

function restHeaders(serviceRoleKey: string, prefer?: string) {
  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function restGet(baseUrl: string, serviceRoleKey: string, path: string) {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method: "GET",
    headers: restHeaders(serviceRoleKey),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(typeof data?.message === "string" ? data.message : text);
  return data;
}

async function restPatch(baseUrl: string, serviceRoleKey: string, path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method: "PATCH",
    headers: restHeaders(serviceRoleKey, "return=representation"),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(typeof data?.message === "string" ? data.message : text);
  if (!Array.isArray(data) || data.length === 0) throw new Error("Update did not return a row");
  return data[0];
}

async function restInsert(baseUrl: string, serviceRoleKey: string, table: string, payload: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
    method: "POST",
    headers: restHeaders(serviceRoleKey, "return=representation"),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(typeof data?.message === "string" ? data.message : text);
  if (!Array.isArray(data) || data.length === 0) throw new Error(`Insert into ${table} did not return a row`);
  return data[0];
}

function healthForState(targetState: BuildState): string {
  if (targetState === "scaffolded") return "pending_component_registration";
  if (targetState === "components_registered") return "pending_validation";
  if (targetState === "pending_final_validation") return "pending_final_validation";
  if (targetState === "validated" || targetState === "active") return "healthy";
  if (targetState === "paused") return "paused";
  return "unknown";
}

function activationGuardedForState(targetState: BuildState): boolean {
  return !(targetState === "validated" || targetState === "active");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, { ok: false, error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(500, { ok: false, error: "missing_runtime_environment" });

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (_error) {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const automationKey = normalizeKey(body.automation_key ?? "");
  const keyError = validateAutomationKey(automationKey);
  if (keyError) return jsonResponse(400, { ok: false, error: "invalid_automation_key", message: keyError });

  const targetState = body.target_state;
  if (!targetState || !["scaffolded", "components_registered", "pending_final_validation", "validated", "active", "paused"].includes(targetState)) {
    return jsonResponse(400, { ok: false, error: "invalid_target_state" });
  }

  try {
    const rows = await restGet(
      supabaseUrl,
      serviceRoleKey,
      `automation_registry?select=*&automation_key=eq.${encodeURIComponent(automationKey)}`,
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return jsonResponse(404, { ok: false, error: "automation_not_found", automation_key: automationKey });
    }

    const current = rows[0];
    const currentStatus = String(current.status || "");
    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(targetState)) {
      return jsonResponse(409, {
        ok: false,
        error: "invalid_state_transition",
        automation_key: automationKey,
        current_status: currentStatus,
        target_state: targetState,
        allowed_transitions: allowed,
      });
    }

    const evidence = body.evidence && typeof body.evidence === "object" ? body.evidence : {};
    const metadata = {
      ...(current.metadata && typeof current.metadata === "object" ? current.metadata : {}),
      build_state_updated_by: "update-shared-automation-build-state",
      last_build_state_transition: {
        from: currentStatus,
        to: targetState,
        notes: body.notes || null,
        evidence,
      },
    };

    const updatePayload: Record<string, unknown> = {
      status: targetState,
      health_status: healthForState(targetState),
      activation_guarded: activationGuardedForState(targetState),
      metadata,
      updated_at: new Date().toISOString(),
    };

    if (body.commit_sha) updatePayload.commit_sha = body.commit_sha;

    const updated = await restPatch(
      supabaseUrl,
      serviceRoleKey,
      `automation_registry?automation_key=eq.${encodeURIComponent(automationKey)}&select=*`,
      updatePayload,
    );

    let auditLog: Record<string, unknown> | { error: string };
    try {
      auditLog = await restInsert(supabaseUrl, serviceRoleKey, "audit_logs", {
        entity_type: "automation_registry",
        entity_id: updated.id,
        action: "update_shared_automation_build_state",
        actor_type: "edge_function",
        old_value: {
          status: current.status,
          health_status: current.health_status,
          activation_guarded: current.activation_guarded,
        },
        new_value: {
          status: updated.status,
          health_status: updated.health_status,
          activation_guarded: updated.activation_guarded,
        },
        metadata: { function: "update-shared-automation-build-state", evidence, notes: body.notes || null },
      });
    } catch (error) {
      auditLog = { error: error instanceof Error ? error.message : "audit_log_failed" };
    }

    return jsonResponse(200, {
      ok: true,
      automation: updated,
      audit_log: auditLog,
      tests_deferred: targetState !== "validated" && targetState !== "active",
      warning: targetState === "validated" || targetState === "active"
        ? "Only use validated/active after final runtime evidence exists."
        : null,
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: "update_build_state_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
