// deno-lint-ignore-file no-explicit-any

type Manifest = {
  automation_key?: string;
  automation_name?: string;
  protocol_name?: string;
  repo_strategy?: string;
  runtime?: Record<string, unknown>;
  github?: Record<string, unknown>;
  components?: {
    agents?: unknown[];
    skills?: unknown[];
    configs?: unknown[];
    rules?: unknown[];
  };
  status?: Record<string, unknown>;
};

type RequestBody = {
  manifest?: Manifest;
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

function validateKebabKey(value: unknown, field: string, errors: string[]) {
  if (!isString(value)) {
    errors.push(`${field} is required`);
    return;
  }

  const normalized = value.trim();
  if (normalized.length < 6 || normalized.length > 80) {
    errors.push(`${field} must be between 6 and 80 characters`);
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(normalized)) {
    errors.push(`${field} must be lowercase kebab-case`);
  }
}

function validateArray(value: unknown, field: string, errors: string[]) {
  if (!Array.isArray(value)) errors.push(`${field} must be an array`);
}

function validateComponentKeys(items: unknown[] | undefined, keyField: string, componentName: string, errors: string[]) {
  if (!Array.isArray(items)) return;

  const seen = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (!isObject(item)) {
      errors.push(`${componentName}[${index}] must be an object`);
      continue;
    }

    const key = item[keyField];
    if (!isString(key)) {
      errors.push(`${componentName}[${index}].${keyField} is required`);
      continue;
    }

    const normalized = key.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(normalized)) {
      errors.push(`${componentName}[${index}].${keyField} must be lowercase kebab-case`);
    }

    if (seen.has(normalized)) {
      errors.push(`${componentName} contains duplicate ${keyField}: ${normalized}`);
    }
    seen.add(normalized);
  }
}

function validateSecretPolicy(configs: unknown[] | undefined, errors: string[], warnings: string[]) {
  if (!Array.isArray(configs)) return;

  for (const [index, config] of configs.entries()) {
    if (!isObject(config)) continue;
    const isSecret = config.is_secret === true;
    const configKey = isString(config.config_key) ? config.config_key : `configs[${index}]`;

    if (isSecret && "value" in config) {
      errors.push(`Secret config ${configKey} must not include a value field`);
    }

    if (isSecret && config.config_status !== "managed_in_supabase_secrets") {
      warnings.push(`Secret config ${configKey} should use config_status = managed_in_supabase_secrets`);
    }
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
    return jsonResponse(400, {
      ok: false,
      valid: false,
      errors: ["manifest object is required"],
      warnings,
    });
  }

  validateKebabKey(manifest.automation_key, "automation_key", errors);

  if (!isString(manifest.automation_name)) errors.push("automation_name is required");
  if (!isString(manifest.protocol_name)) errors.push("protocol_name is required");
  if (manifest.repo_strategy !== "monorepo") warnings.push("repo_strategy should be monorepo");

  if (!isObject(manifest.runtime)) {
    errors.push("runtime object is required");
  } else {
    if (manifest.runtime.type !== "shared_supabase_runtime") warnings.push("runtime.type should be shared_supabase_runtime");
    if (manifest.runtime.runtime_router !== "runtime-router") warnings.push("runtime.runtime_router should be runtime-router");
    if (manifest.runtime.skill_executor !== "skill-executor") warnings.push("runtime.skill_executor should be skill-executor");
  }

  if (!isObject(manifest.github)) {
    errors.push("github object is required");
  } else {
    if (!isString(manifest.github.repository)) errors.push("github.repository is required");
    if (!isString(manifest.github.repository_path)) errors.push("github.repository_path is required");
  }

  if (!isObject(manifest.components)) {
    errors.push("components object is required");
  } else {
    validateArray(manifest.components.agents, "components.agents", errors);
    validateArray(manifest.components.skills, "components.skills", errors);
    validateArray(manifest.components.configs, "components.configs", errors);
    validateArray(manifest.components.rules, "components.rules", errors);

    validateComponentKeys(manifest.components.agents, "agent_key", "agents", errors);
    validateComponentKeys(manifest.components.skills, "skill_key", "skills", errors);
    validateComponentKeys(manifest.components.configs, "config_key", "configs", errors);
    validateComponentKeys(manifest.components.rules, "rule_key", "rules", errors);
    validateSecretPolicy(manifest.components.configs, errors, warnings);
  }

  if (!isObject(manifest.status)) {
    warnings.push("status object is recommended");
  } else {
    if (manifest.status.activation_guarded !== true) {
      warnings.push("status.activation_guarded should remain true until final runtime validation");
    }
  }

  return jsonResponse(200, {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
    warnings,
    tests_deferred: true,
    next_steps: errors.length === 0
      ? [
        "Create or update GitHub scaffold files",
        "Register draft/components in Supabase",
        "Keep final runtime tests deferred until build close",
      ]
      : ["Fix manifest errors before registering components"],
  });
});
