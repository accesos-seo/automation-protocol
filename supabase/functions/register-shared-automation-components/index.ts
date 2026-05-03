// deno-lint-ignore-file no-explicit-any

type ComponentConfig = {
  config_key: string;
  config_type?: string;
  is_required?: boolean;
  is_secret?: boolean;
  config_status?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

type AgentInput = {
  agent_key: string;
  agent_name?: string;
  agent_type?: string;
  definition_path?: string;
  runtime_function?: string;
  status?: string;
  capabilities?: unknown[];
  skills?: unknown[];
  required_configs?: unknown[];
  metadata?: Record<string, unknown>;
};

type SkillInput = {
  skill_key: string;
  skill_name?: string;
  skill_source_path?: string;
  skill_version?: string;
  commit_sha?: string;
  source_hash?: string;
  runtime_location?: string;
  runtime_bucket?: string;
  runtime_package_path?: string;
  status?: string;
  required_configs?: unknown[];
  metadata?: Record<string, unknown>;
};

type RuleInput = {
  rule_key: string;
  rule_type?: string;
  rule_version?: string;
  rule_source_path?: string;
  rule_config?: Record<string, unknown>;
  status?: string;
};

type RequestBody = {
  automation_key?: string;
  agents?: AgentInput[];
  skills?: SkillInput[];
  configs?: ComponentConfig[];
  rules?: RuleInput[];
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

function validateKey(value: string, field: string): string | null {
  if (!value) return `${field} is required`;
  if (value.length < 3) return `${field} must have at least 3 characters`;
  if (value.length > 100) return `${field} must have at most 100 characters`;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value)) {
    return `${field} must be lowercase kebab-case with letters, numbers and hyphens only`;
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

async function insertMany(baseUrl: string, serviceRoleKey: string, table: string, rows: Record<string, unknown>[]) {
  const inserted = [];
  for (const row of rows) {
    inserted.push(await restInsert(baseUrl, serviceRoleKey, table, row));
  }
  return inserted;
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
  const automationKeyError = validateKey(automationKey, "automation_key");
  if (automationKeyError) return jsonResponse(400, { ok: false, error: "invalid_automation_key", message: automationKeyError });

  const agents = Array.isArray(body.agents) ? body.agents : [];
  const skills = Array.isArray(body.skills) ? body.skills : [];
  const configs = Array.isArray(body.configs) ? body.configs : [];
  const rules = Array.isArray(body.rules) ? body.rules : [];

  try {
    const existingAutomations = await restGet(
      supabaseUrl,
      serviceRoleKey,
      `automation_registry?select=id,automation_key,protocol_id&automation_key=eq.${encodeURIComponent(automationKey)}`,
    );

    if (!Array.isArray(existingAutomations) || existingAutomations.length === 0) {
      return jsonResponse(404, { ok: false, error: "automation_not_found", automation_key: automationKey });
    }

    const automation = existingAutomations[0];
    const automationId = automation.id;
    const protocolId = automation.protocol_id ?? null;

    for (const agent of agents) {
      const err = validateKey(normalizeKey(agent.agent_key ?? ""), "agent_key");
      if (err) return jsonResponse(400, { ok: false, error: "invalid_agent_key", message: err });
    }

    for (const skill of skills) {
      const err = validateKey(normalizeKey(skill.skill_key ?? ""), "skill_key");
      if (err) return jsonResponse(400, { ok: false, error: "invalid_skill_key", message: err });
    }

    for (const config of configs) {
      if (!config.config_key || config.config_key.trim().length < 2) {
        return jsonResponse(400, { ok: false, error: "invalid_config_key" });
      }
    }

    for (const rule of rules) {
      const err = validateKey(normalizeKey(rule.rule_key ?? ""), "rule_key");
      if (err) return jsonResponse(400, { ok: false, error: "invalid_rule_key", message: err });
    }

    const agentRows = agents.map((agent) => ({
      automation_id: automationId,
      protocol_id: protocolId,
      automation_key: automationKey,
      agent_key: normalizeKey(agent.agent_key),
      agent_name: agent.agent_name || agent.agent_key,
      agent_type: agent.agent_type || "specialized",
      definition_path: agent.definition_path || `automations/${automationKey}/agents/${normalizeKey(agent.agent_key)}.md`,
      runtime_function: agent.runtime_function || null,
      status: agent.status || "registered",
      capabilities: agent.capabilities || [],
      skills: agent.skills || [],
      required_configs: agent.required_configs || [],
      metadata: agent.metadata || {},
    }));

    const skillRows = skills.map((skill) => ({
      automation_id: automationId,
      protocol_id: protocolId,
      automation_key: automationKey,
      skill_key: normalizeKey(skill.skill_key),
      skill_name: skill.skill_name || skill.skill_key,
      skill_source_path: skill.skill_source_path || `automations/${automationKey}/skills/${normalizeKey(skill.skill_key)}/SKILL.md`,
      skill_version: skill.skill_version || "0.1.0",
      commit_sha: skill.commit_sha || null,
      source_hash: skill.source_hash || null,
      runtime_location: skill.runtime_location || "github",
      runtime_bucket: skill.runtime_bucket || "skills",
      runtime_package_path: skill.runtime_package_path || null,
      status: skill.status || "registered",
      required_configs: skill.required_configs || [],
      metadata: skill.metadata || {},
    }));

    const configRows = configs.map((config) => ({
      automation_id: automationId,
      protocol_id: protocolId,
      automation_key: automationKey,
      config_key: config.config_key.trim(),
      config_type: config.config_type || (config.is_secret ? "secret" : "runtime"),
      is_required: config.is_required ?? false,
      is_secret: config.is_secret ?? false,
      config_status: config.config_status || "pending",
      description: config.description || null,
      metadata: config.metadata || {},
    }));

    const ruleRows = rules.map((rule) => ({
      automation_id: automationId,
      protocol_id: protocolId,
      automation_key: automationKey,
      rule_key: normalizeKey(rule.rule_key),
      rule_type: rule.rule_type || "runtime_routing",
      rule_version: rule.rule_version || "0.1.0",
      rule_source_path: rule.rule_source_path || `automations/${automationKey}/routing-rules/${normalizeKey(rule.rule_key)}.json`,
      rule_config: rule.rule_config || {},
      status: rule.status || "active",
    }));

    const insertedAgents = await insertMany(supabaseUrl, serviceRoleKey, "agent_registry", agentRows);
    const insertedSkills = await insertMany(supabaseUrl, serviceRoleKey, "skill_registry", skillRows);
    const insertedConfigs = await insertMany(supabaseUrl, serviceRoleKey, "deployment_configs", configRows);
    const insertedRules = await insertMany(supabaseUrl, serviceRoleKey, "automation_rules", ruleRows);

    let auditLog: Record<string, unknown> | { error: string };
    try {
      auditLog = await restInsert(supabaseUrl, serviceRoleKey, "audit_logs", {
        entity_type: "automation_registry",
        entity_id: automationId,
        action: "register_shared_automation_components",
        actor_type: "system",
        new_value: {
          agents: insertedAgents.length,
          skills: insertedSkills.length,
          configs: insertedConfigs.length,
          rules: insertedRules.length,
        },
        metadata: { function: "register-shared-automation-components" },
      });
    } catch (error) {
      auditLog = { error: error instanceof Error ? error.message : "audit_log_failed" };
    }

    return jsonResponse(200, {
      ok: true,
      automation_key: automationKey,
      inserted: {
        agents: insertedAgents,
        skills: insertedSkills,
        configs: insertedConfigs,
        rules: insertedRules,
      },
      audit_log: auditLog,
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: "register_components_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
