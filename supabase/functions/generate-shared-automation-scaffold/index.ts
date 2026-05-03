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
};

type GeneratedFile = {
  path: string;
  content: string;
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

function bulletList(values: string[] | undefined, fallback: string): string {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function jsonPretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildFiles(input: Required<Pick<RequestBody, "automation_key" | "automation_name" | "protocol_name" | "default_skill_key">> & RequestBody): GeneratedFile[] {
  const automationKey = input.automation_key;
  const automationName = input.automation_name;
  const protocolName = input.protocol_name;
  const defaultSkillKey = input.default_skill_key;
  const objective = safeName(input.objective, "Definir objetivo operativo de la automatización.");
  const commitSha = safeName(input.commit_sha, "REPLACE_WITH_COMMIT_SHA");

  const basePath = `automations/${automationKey}`;

  const manifest = {
    automation_key: automationKey,
    automation_name: automationName,
    protocol_name: protocolName,
    repo_strategy: "monorepo",
    runtime: {
      type: "shared_supabase_runtime",
      project_ref: "lwurzjrghzwzxbhrulyn",
      runtime_router: "runtime-router",
      skill_executor: "skill-executor",
    },
    github: {
      repository: "accesos-seo/automation-protocol",
      repository_path: basePath,
      commit_sha: commitSha,
    },
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
          description: "Secret usado por runtime/skills. No guardar valor real en GitHub ni tablas públicas.",
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
    status: {
      automation_registry_status: "scaffolded",
      health_status: "pending_validation",
      activation_guarded: true,
    },
  };

  const route = {
    rule_key: "default-runtime-route",
    rule_type: "runtime_routing",
    rule_version: "0.1.0",
    automation_key: automationKey,
    status: "active",
    rule_config: {
      runtime_router: "runtime-router",
      skill_executor: "skill-executor",
      default_skill_key: defaultSkillKey,
      fallback_allowed: true,
      deterministic_validation_event_type: "runtime.hardening.validation",
    },
  };

  return [
    {
      path: `${basePath}/README.md`,
      content: `# ${automationName}\n\n## Identidad\n\n\`\`\`text\nautomation_key = ${automationKey}\nautomation_name = ${automationName}\nprotocol_name = ${protocolName}\nruntime = shared_supabase_runtime\n\`\`\`\n\n## Objetivo\n\n${objective}\n\n## Entradas esperadas\n\n${bulletList(input.inputs, "Definir entrada principal.")}\n\n## Salidas esperadas\n\n${bulletList(input.outputs, "Definir salida principal.")}\n\n## Estado operativo\n\n\`\`\`text\nstatus = scaffolded\nhealth_status = pending_validation\nactivation_guarded = true\n\`\`\`\n\n## Seguridad\n\nNo guardar secretos reales en GitHub. Los valores reales deben vivir en Supabase Secrets o entorno seguro.\n\n## Pruebas\n\nLas pruebas quedan diferidas para el cierre final según \`docs/17-deferred-final-test-plan.md\`.\n`,
    },
    {
      path: `${basePath}/agents/orchestrator.md`,
      content: `# Orchestrator Agent\n\n## Identidad\n\n\`\`\`text\nagent_key = orchestrator\nagent_name = Orchestrator Agent\nagent_type = orchestrator\nautomation_key = ${automationKey}\n\`\`\`\n\n## Responsabilidad\n\nCoordinar la ejecución de ${automationName} dentro del runtime compartido.\n\n## Skills relacionados\n\n\`\`\`text\n${defaultSkillKey}\n\`\`\`\n`,
    },
    {
      path: `${basePath}/skills/${defaultSkillKey}/SKILL.md`,
      content: `# ${defaultSkillKey}\n\n## Identidad\n\n\`\`\`text\nskill_key = ${defaultSkillKey}\nautomation_key = ${automationKey}\nruntime_location = github\n\`\`\`\n\n## Propósito\n\nAnalizar la entrada inicial y producir estructura operativa para routing, validación y ejecución.\n\n## Reglas\n\n- No exponer secretos.\n- Mantener salida JSON serializable.\n- Registrar gaps como información faltante.\n`,
    },
    {
      path: `${basePath}/routing-rules/default-runtime-route.json`,
      content: jsonPretty(route),
    },
    {
      path: `${basePath}/deployment/manifest.json`,
      content: jsonPretty(manifest),
    },
    {
      path: `handover/${automationKey}-HANDOVER.md`,
      content: `# ${automationName} — Handover\n\n## Identidad\n\n\`\`\`text\nautomation_key = ${automationKey}\nautomation_name = ${automationName}\nprotocol_name = ${protocolName}\nruntime = shared_supabase_runtime\n\`\`\`\n\n## Estado actual\n\n\`\`\`text\nstatus = scaffolded\nhealth_status = pending_validation\nactivation_guarded = true\n\`\`\`\n\n## Evidencia GitHub\n\n\`\`\`text\nrepository = accesos-seo/automation-protocol\nrepository_path = ${basePath}\ncommit_sha = ${commitSha}\n\`\`\`\n\n## Pruebas diferidas\n\nLas pruebas quedan para el cierre final según docs/17-deferred-final-test-plan.md.\n`,
    },
  ];
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

  const automationKey = normalizeKey(body.automation_key ?? "");
  const validationError = validateAutomationKey(automationKey);
  if (validationError) {
    return jsonResponse(400, { ok: false, error: "invalid_automation_key", message: validationError });
  }

  const automationName = safeName(body.automation_name, automationKey);
  const protocolName = safeName(body.protocol_name, `${automationName} Protocol`);
  const defaultSkillKey = normalizeKey(body.default_skill_key || "intake-analysis");
  const skillKeyError = validateAutomationKey(defaultSkillKey);
  if (skillKeyError) {
    return jsonResponse(400, { ok: false, error: "invalid_default_skill_key", message: skillKeyError });
  }

  const files = buildFiles({
    ...body,
    automation_key: automationKey,
    automation_name: automationName,
    protocol_name: protocolName,
    default_skill_key: defaultSkillKey,
  });

  return jsonResponse(200, {
    ok: true,
    automation_key: automationKey,
    files,
    next_steps: [
      "Create these files in GitHub under automations/{automation_key}/",
      "Call create-shared-automation after files are committed",
      "Call register-shared-automation-components with deployment/manifest.json components",
      "Run final tests only at the end of the build block",
    ],
  });
});
