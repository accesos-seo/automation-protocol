// deno-lint-ignore-file no-explicit-any

type Manifest = {
  automation_key?: string;
  components?: {
    agents?: Record<string, unknown>[];
    skills?: Record<string, unknown>[];
    configs?: Record<string, unknown>[];
    rules?: Record<string, unknown>[];
  };
};

type RequestBody = {
  manifest?: Manifest;
  strict?: boolean;
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function validateKebab(value: unknown, field: string, errors: string[]) {
  if (!isString(value)) {
    errors.push(`${field} is required`);
    return null;
  }

  const normalized = normalizeKey(value);
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(normalized)) {
    errors.push(`${field} must be lowercase kebab-case`);
    return null;
  }

  return normalized;
}

function ensureArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function sanitizeAgent(agent: Record<string, unknown>, index: number, errors: string[]) {
  const agentKey = validateKebab(agent.agent_key, `agents[${index}].agent_key`, errors);
  if (!agentKey) return null;

  return {
    agent_key: agentKey,
    agent_name: isString(agent.agent_name) ? agent.agent_name.trim() : agentKey,
    agent_type: isString(agent.agent_type) ? agent.agent_type.trim() : "specialized",
    definition_path: isString(agent.definition_path) ? agent.definition_path.trim() : undefined,
    runtime_function: isString(agent.runtime_function) ? agent.runtime_function.trim() : undefined,
    status: isString(agent.status) ? agent.status.trim() : "registered",
    capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
    skills: Array.isArray(agent.skills) ? agent.skills : [],
    required_configs: Array.isArray(agent.required_configs) ? agent.required_configs : [],
    metadata: isObject(agent.metadata) ? agent.metadata : {},
  };
}

function sanitizeSkill(skill: Record<string, unknown>, index: number, errors: string[]) {
  const skillKey = validateKebab(skill.skill_key, `skills[${index}].skill_key`, errors);
  if (!skillKey) return null;

  return {
    skill_key: skillKey,
    skill_name: isString(skill.skill_name) ? skill.skill_name.trim() : skillKey,
    skill_source_path: isString(skill.skill_source_path) ? skill.skill_source_path.trim() : undefined,
    skill_version: isString(skill.skill_version) ? skill.skill_version.trim() : "0.1.0",
    commit_sha: isString(skill.commit_sha) ? skill.commit_sha.trim() : undefined,
    source_hash: isString(skill.source_hash) ? skill.source_hash.trim() : undefined,
    runtime_location: isString(skill.runtime_location) ? skill.runtime_location.trim() : "github",
    runtime_bucket: isString(skill.runtime_bucket) ? skill.runtime_bucket.trim() : "skills",
    runtime_package_path: isString(skill.runtime_package_path) ? skill.runtime_package_path.trim() : undefined,
    status: isString(skill.status) ? skill.status.trim() : "registered",
    required_configs: Array.isArray(skill.required_configs) ? skill.required_configs : [],
    metadata: isObject(skill.metadata) ? skill.metadata : {},
  };
}

function sanitizeConfig(config: Record<string, unknown>, index: number, errors: string[], warnings: string[]) {
  if (!isString(config.config_key)) {
    errors.push(`configs[${index}].config_key is required`);
    return null;
  }

  const configKey = config.config_key.trim();
  const isSecret = config.is_secret === true;

  if (isSecret && "value" in config) {
    errors.push(`configs[${index}] ${configKey} must not include value for secret config`);
  }

  if (isSecret && config.config_status !== "managed_in_supabase_secrets") {
    warnings.push(`configs[${index}] ${configKey} should use config_status managed_in_supabase_secrets`);
  }

  return {
    config_key: configKey,
    config_type: isString(config.config_type) ? config.config_type.trim() : (isSecret ? "secret" : "runtime"),
    is_required: config.is_required === true,
    is_secret: isSecret,
    config_status: isString(config.config_status) ? config.config_status.trim() : (isSecret ? "managed_in_supabase_secrets" : "pending"),
    description: isString(config.description) ? config.description.trim() : undefined,
    metadata: isObject(config.metadata) ? config.metadata : {},
  };
}

function sanitizeRule(rule: Record<string, unknown>, index: number, errors: string[]) {
  const ruleKey = validateKebab(rule.rule_key, `rules[${index}].rule_key`, errors);
  if (!ruleKey) return null;

  return {
    rule_key: ruleKey,
    rule_type: isString(rule.rule_type) ? rule.rule_type.trim() : "runtime_routing",
    rule_version: isString(rule.rule_version) ? rule.rule_version.trim() : "0.1.0",
    rule_source_path: isString(rule.rule_source_path) ? rule.rule_source_path.trim() : undefined,
    rule_config: isObject(rule.rule_config) ? rule.rule_config : {},
    status: isString(rule.status) ? rule.status.trim() : "active",
  };
}

function detectDuplicates(items: Record<string, unknown>[], key: string, label: string, errors: string[]) {
  const seen = new Set<string>();
  for (const item of items) {
    const value = item[key];
    if (!isString(value)) continue;
    const normalized = normalizeKey(value);
    if (seen.has(normalized)) errors.push(`${label} contains duplicate ${key}: ${normalized}`);
    seen.add(normalized);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, { ok: false, error: "method_not_allowed" });

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (_error) {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const manifest = body.manifest;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(manifest)) {
    return jsonResponse(400, { ok: false, errors: ["manifest object is required"], warnings });
  }

  const automationKey = validateKebab(manifest.automation_key, "automation_key", errors);
  const components = isObject(manifest.components) ? manifest.components : {};

  const rawAgents = ensureArray(components.agents);
  const rawSkills = ensureArray(components.skills);
  const rawConfigs = ensureArray(components.configs);
  const rawRules = ensureArray(components.rules);

  if (body.strict === true) {
    if (rawAgents.length === 0) errors.push("components.agents must include at least one agent");
    if (rawSkills.length === 0) errors.push("components.skills must include at least one skill");
    if (rawRules.length === 0) errors.push("components.rules must include at least one rule");
  }

  detectDuplicates(rawAgents, "agent_key", "agents", errors);
  detectDuplicates(rawSkills, "skill_key", "skills", errors);
  detectDuplicates(rawConfigs, "config_key", "configs", errors);
  detectDuplicates(rawRules, "rule_key", "rules", errors);

  const agents = rawAgents.map((item, index) => sanitizeAgent(item, index, errors)).filter(Boolean);
  const skills = rawSkills.map((item, index) => sanitizeSkill(item, index, errors)).filter(Boolean);
  const configs = rawConfigs.map((item, index) => sanitizeConfig(item, index, errors, warnings)).filter(Boolean);
  const rules = rawRules.map((item, index) => sanitizeRule(item, index, errors)).filter(Boolean);

  if (errors.length > 0 || !automationKey) {
    return jsonResponse(400, {
      ok: false,
      valid: false,
      errors,
      warnings,
      tests_deferred: true,
    });
  }

  return jsonResponse(200, {
    ok: true,
    valid: true,
    payload: {
      automation_key: automationKey,
      agents,
      skills,
      configs,
      rules,
    },
    counts: {
      agents: agents.length,
      skills: skills.length,
      configs: configs.length,
      rules: rules.length,
    },
    warnings,
    tests_deferred: true,
    target_function: "register-shared-automation-components",
  });
});
