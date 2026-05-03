// deno-lint-ignore-file no-explicit-any

type RequestBody = {
  automation_key?: string;
  automation_name?: string;
  protocol_name?: string;
  objective?: string;
  inputs?: string[];
  outputs?: string[];
  default_skill_key?: string;
  commit_sha?: string;
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
  if (["test", "demo", "automation", "template", "automation-template"].includes(value)) {
    return "automation_key is too generic or reserved";
  }
  return null;
}

function safeName(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
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

function buildScaffoldSummary(input: Required<Pick<RequestBody, "automation_key" | "automation_name" | "protocol_name" | "default_skill_key">> & RequestBody) {
  const automationKey = input.automation_key;
  const defaultSkillKey = input.default_skill_key;
  const basePath = `automations/${automationKey}`;

  return {
    files: [
      `${basePath}/README.md`,
      `${basePath}/agents/orchestrator.md`,
      `${basePath}/skills/${defaultSkillKey}/SKILL.md`,
      `${basePath}/routing-rules/default-runtime-route.json`,
      `${basePath}/deployment/manifest.json`,
      `handover/${automationKey}-HANDOVER.md`,
    ],
    components: {
      agents: [
        {
          agent_key: "orchestrator",
          agent_name: "Orchestrator Agent",
          agent_type: "orchestrator",
          definition_path: `${basePath}/agents/orchestrator.md`,
          status: "registered",
          capabilities: ["routing", "coordination", "validation"],
          skills: [defaultSkillKey],
          required_configs: ["OPENROUTER_API_KEY"],
        },
      ],
      skills: [
        {
          skill_key: defaultSkillKey,
          skill_name: "Intake Analysis Skill",
          skill_source_path: `${basePath}/skills/${defaultSkillKey}/SKILL.md`,
          skill_version: "0.1.0",
          runtime_location: "github",
          status: "registered",
          required_configs: ["OPENROUTER_API_KEY"],
        },
      ],
      configs: [
        {
          config_key: "OPENROUTER_API_KEY",
          config_type: "secret",
          is_required: true,
          is_secret: true,
          config_status: "managed_in_supabase_secrets",
          description: "Secret used by runtime/skills. Never store the real value in GitHub or public tables.",
        },
      ],
      rules: [
        {
          rule_key: "default-runtime-route",
          rule_type: "runtime_routing",
          rule_version: "0.1.0",
          rule_source_path: `${basePath}/routing-rules/default-runtime-route.json`,
          status: "active",
          rule_config: {
            runtime_router: "runtime-router",
            skill_executor: "skill-executor",
            default_skill_key: defaultSkillKey,
            fallback_allowed: true,
          },
        },
      ],
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, { ok: false, error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { ok: false, error: "missing_runtime_environment" });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (_error) {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const automationKey = normalizeKey(body.automation_key ?? "");
  const keyError = validateAutomationKey(automationKey);
  if (keyError) return jsonResponse(400, { ok: false, error: "invalid_automation_key", message: keyError });

  const automationName = safeName(body.automation_name, automationKey);
  const protocolName = safeName(body.protocol_name, `${automationName} Protocol`);
  const defaultSkillKey = normalizeKey(body.default_skill_key || "intake-analysis");
  const skillError = validateAutomationKey(defaultSkillKey);
  if (skillError) return jsonResponse(400, { ok: false, error: "invalid_default_skill_key", message: skillError });

  try {
    const existing = await restGet(
      supabaseUrl,
      serviceRoleKey,
      `automation_registry?select=id,automation_key,status,health_status,activation_guarded&automation_key=eq.${encodeURIComponent(automationKey)}`,
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return jsonResponse(409, {
        ok: false,
        error: "automation_key_already_exists",
        automation: existing[0],
      });
    }

    const scaffold = buildScaffoldSummary({
      ...body,
      automation_key: automationKey,
      automation_name: automationName,
      protocol_name: protocolName,
      default_skill_key: defaultSkillKey,
    });

    const automation = await restInsert(supabaseUrl, serviceRoleKey, "automation_registry", {
      automation_key: automationKey,
      automation_name: automationName,
      protocol_name: protocolName,
      repo_strategy: "monorepo",
      status: "draft_scaffold_generated",
      health_status: "pending_github_files",
      version: "0.1.0",
      repository_url: "github:accesos-seo/automation-protocol",
      repository_path: `automations/${automationKey}`,
      commit_sha: body.commit_sha || null,
      runtime_config: {
        runtime: "shared_supabase_runtime",
        runtime_router: "runtime-router",
        skill_executor: "skill-executor",
        project_ref: "lwurzjrghzwzxbhrulyn",
      },
      activation_guarded: true,
      metadata: {
        ...(body.metadata && typeof body.metadata === "object" ? body.metadata : {}),
        created_by: "build-shared-automation-draft",
        source_status: "phase_3_runtime_hardening_validated",
        scaffold_files: scaffold.files,
        objective: body.objective || null,
        inputs: body.inputs || [],
        outputs: body.outputs || [],
      },
    });

    const componentRows = [];

    for (const config of scaffold.components.configs) {
      componentRows.push(await restInsert(supabaseUrl, serviceRoleKey, "deployment_configs", {
        automation_id: automation.id,
        automation_key: automationKey,
        ...config,
      }));
    }

    for (const rule of scaffold.components.rules) {
      componentRows.push(await restInsert(supabaseUrl, serviceRoleKey, "automation_rules", {
        automation_id: automation.id,
        automation_key: automationKey,
        ...rule,
      }));
    }

    let auditLog: Record<string, unknown> | { error: string };
    try {
      auditLog = await restInsert(supabaseUrl, serviceRoleKey, "audit_logs", {
        entity_type: "automation_registry",
        entity_id: automation.id,
        action: "build_shared_automation_draft",
        actor_type: "edge_function",
        new_value: {
          automation,
          scaffold_files: scaffold.files,
          component_rows: componentRows.length,
        },
        metadata: { function: "build-shared-automation-draft" },
      });
    } catch (error) {
      auditLog = { error: error instanceof Error ? error.message : "audit_log_failed" };
    }

    return jsonResponse(200, {
      ok: true,
      automation,
      scaffold,
      registered_component_rows: componentRows,
      audit_log: auditLog,
      tests_deferred: true,
      next_steps: [
        "Create the scaffold files listed in GitHub",
        "Register agents and skills after files are committed",
        "Run final tests only at the end of the build block",
      ],
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: "build_shared_automation_draft_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
