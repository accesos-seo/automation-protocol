// deno-lint-ignore-file no-explicit-any

type RequestBody = {
  automation_key?: string;
  automation_name?: string;
  protocol_name?: string;
  default_skill_key?: string;
  metadata?: Record<string, unknown>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeAutomationKey(value: string): string {
  return value.trim().toLowerCase();
}

function validateAutomationKey(value: string): string | null {
  if (!value) return "automation_key is required";
  if (value.length < 6) return "automation_key must have at least 6 characters";
  if (value.length > 80) return "automation_key must have at most 80 characters";
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value)) {
    return "automation_key must be lowercase kebab-case with letters, numbers and hyphens only";
  }
  if (["test", "demo", "automation", "template", "automation-template"].includes(value)) {
    return "automation_key is too generic or reserved";
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

  if (!response.ok) {
    throw new Error(typeof data?.message === "string" ? data.message : text);
  }

  return data;
}

async function restInsert(baseUrl: string, serviceRoleKey: string, table: string, payload: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
    method: "POST",
    headers: restHeaders(serviceRoleKey, "return=representation"),
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(typeof data?.message === "string" ? data.message : text);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Insert into ${table} did not return a row`);
  }

  return data[0];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, {
      ok: false,
      error: "missing_runtime_environment",
      message: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured as Supabase secrets.",
    });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (_error) {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const automationKey = normalizeAutomationKey(body.automation_key ?? "");
  const validationError = validateAutomationKey(automationKey);

  if (validationError) {
    return jsonResponse(400, {
      ok: false,
      error: "invalid_automation_key",
      message: validationError,
    });
  }

  const automationName = body.automation_name?.trim() || automationKey;
  const protocolName = body.protocol_name?.trim() || `${automationName} Protocol`;
  const defaultSkillKey = body.default_skill_key?.trim() || "intake-analysis";
  const requestMetadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  try {
    const encodedAutomationKey = encodeURIComponent(automationKey);
    const existing = await restGet(
      supabaseUrl,
      serviceRoleKey,
      `automation_registry?select=id,automation_key,status,health_status,activation_guarded&automation_key=eq.${encodedAutomationKey}`,
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return jsonResponse(409, {
        ok: false,
        error: "automation_key_already_exists",
        automation: existing[0],
      });
    }

    const runtimeConfig = {
      runtime: "shared_supabase_runtime",
      runtime_router: "runtime-router",
      skill_executor: "skill-executor",
      project_ref: "lwurzjrghzwzxbhrulyn",
    };

    const metadata = {
      ...requestMetadata,
      created_by: "create-shared-automation",
      source_status: "phase_3_runtime_hardening_validated",
    };

    const automation = await restInsert(supabaseUrl, serviceRoleKey, "automation_registry", {
      automation_key: automationKey,
      automation_name: automationName,
      protocol_name: protocolName,
      repo_strategy: "monorepo",
      status: "scaffolded",
      health_status: "pending_validation",
      version: "0.1.0",
      repository_url: "github:accesos-seo/automation-protocol",
      repository_path: `automations/${automationKey}`,
      runtime_config: runtimeConfig,
      activation_guarded: true,
      metadata,
    });

    const config = await restInsert(supabaseUrl, serviceRoleKey, "deployment_configs", {
      automation_key: automationKey,
      config_key: "OPENROUTER_API_KEY",
      config_type: "secret",
      is_required: true,
      is_secret: true,
      config_status: "managed_in_supabase_secrets",
      description: "Secret used by Edge Functions. Real value must never be stored in GitHub or public tables.",
      metadata: { runtime: "shared" },
    });

    const rule = await restInsert(supabaseUrl, serviceRoleKey, "automation_rules", {
      automation_key: automationKey,
      rule_key: "default-runtime-route",
      rule_type: "runtime_routing",
      rule_version: "0.1.0",
      rule_config: {
        runtime_router: "runtime-router",
        skill_executor: "skill-executor",
        default_skill_key: defaultSkillKey,
      },
      status: "active",
    });

    let auditLog: Record<string, unknown> | { error: string };
    try {
      auditLog = await restInsert(supabaseUrl, serviceRoleKey, "audit_logs", {
        entity_type: "automation_registry",
        entity_id: automation.id,
        action: "create_shared_automation",
        actor_type: "edge_function",
        new_value: {
          automation,
          config,
          rule,
        },
        metadata: {
          function: "create-shared-automation",
        },
      });
    } catch (error) {
      auditLog = { error: error instanceof Error ? error.message : "audit_log_failed" };
    }

    return jsonResponse(200, {
      ok: true,
      automation,
      deployment_config: config,
      automation_rule: rule,
      audit_log: auditLog,
      next_steps: [
        "Create versioned files under automations/{automation_key}/",
        "Register agents and skills if this automation needs custom routing",
        "Run a controlled runtime test through runtime-router-local-test",
        "Update automation_registry to validated only after runtime evidence exists",
      ],
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: "create_shared_automation_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
