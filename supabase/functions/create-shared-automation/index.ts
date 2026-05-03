// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: existing, error: existingError } = await supabase
    .from("automation_registry")
    .select("id, automation_key, status, health_status, activation_guarded")
    .eq("automation_key", automationKey)
    .maybeSingle();

  if (existingError) {
    return jsonResponse(500, {
      ok: false,
      error: "automation_lookup_failed",
      details: existingError.message,
    });
  }

  if (existing) {
    return jsonResponse(409, {
      ok: false,
      error: "automation_key_already_exists",
      automation: existing,
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

  const { data: automation, error: insertAutomationError } = await supabase
    .from("automation_registry")
    .insert({
      automation_key: automationKey,
      automation_name: automationName,
      protocol_name: protocolName,
      repo_strategy: "monorepo",
      status: "scaffolded",
      health_status: "pending_validation",
      version: "0.1.0",
      repository_url: "https://github.com/accesos-seo/automation-protocol",
      repository_path: `automations/${automationKey}`,
      runtime_config: runtimeConfig,
      activation_guarded: true,
      metadata,
    })
    .select("id, automation_key, automation_name, status, health_status, activation_guarded")
    .single();

  if (insertAutomationError) {
    return jsonResponse(500, {
      ok: false,
      error: "automation_insert_failed",
      details: insertAutomationError.message,
    });
  }

  const { data: config, error: configError } = await supabase
    .from("deployment_configs")
    .insert({
      automation_key: automationKey,
      config_key: "OPENROUTER_API_KEY",
      config_type: "secret",
      is_required: true,
      is_secret: true,
      config_status: "managed_in_supabase_secrets",
      description: "Secret used by Edge Functions. Real value must never be stored in GitHub or public tables.",
      metadata: { runtime: "shared" },
    })
    .select("id, automation_key, config_key, is_secret, config_status")
    .single();

  if (configError) {
    return jsonResponse(500, {
      ok: false,
      error: "deployment_config_insert_failed",
      automation,
      details: configError.message,
    });
  }

  const { data: rule, error: ruleError } = await supabase
    .from("automation_rules")
    .insert({
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
    })
    .select("id, automation_key, rule_key, status")
    .single();

  if (ruleError) {
    return jsonResponse(500, {
      ok: false,
      error: "automation_rule_insert_failed",
      automation,
      config,
      details: ruleError.message,
    });
  }

  const { data: auditLog, error: auditError } = await supabase
    .from("audit_logs")
    .insert({
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
    })
    .select("id, action, created_at")
    .single();

  return jsonResponse(200, {
    ok: true,
    automation,
    deployment_config: config,
    automation_rule: rule,
    audit_log: auditError ? { error: auditError.message } : auditLog,
    next_steps: [
      "Create versioned files under automations/{automation_key}/",
      "Register agents and skills if this automation needs custom routing",
      "Run a controlled runtime test through runtime-router-local-test",
      "Update automation_registry to validated only after runtime evidence exists",
    ],
  });
});
