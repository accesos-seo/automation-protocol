const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type JsonRecord = Record<string, unknown>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" },
  });
}

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function dbHeaders() {
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  return {
    "apikey": serviceRoleKey,
    "Authorization": `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
}

async function dbSelect(path: string) {
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${path}`, { headers: dbHeaders() });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`DB select failed ${path}: ${text}`);
  return parsed;
}

async function dbInsert(table: string, payload: JsonRecord) {
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${table}`, {
    method: "POST",
    headers: dbHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`DB insert failed ${table}: ${text}`);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

async function dbPatch(table: string, id: string, payload: JsonRecord) {
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: dbHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`DB patch failed ${table}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function insertRuntimeEvent(payload: JsonRecord) {
  try { await dbInsert("runtime_events", payload); } catch (error) { console.error("runtime_events insert failed", error); }
}

function fallbackDecision(reason: string, details?: unknown) {
  return {
    decision: {
      next_step: "execute_skill",
      skill_to_execute: "intake-analysis",
      agent_to_execute: "intake-specialist",
      human_intervention_needed: true,
      used_fallback: true,
      fallback_reason: reason,
      reasoning: "Fallback tÃ©cnico: OpenRouter no produjo una decisiÃ³n utilizable. Se ejecuta intake-analysis por defecto para mantener continuidad operativa.",
    },
    fallback: { reason, details: typeof details === "string" ? details.slice(0, 4000) : details ?? null },
  };
}

function isDeterministicHardeningInput(input: JsonRecord, eventType: string): boolean {
  return input?.runtime_validation_mode === "deterministic_hardening" || eventType === "runtime.hardening.validation";
}

function deterministicHardeningDecision(input: JsonRecord) {
  const requestedSkill =
    typeof input?.skill_key === "string" && input.skill_key.trim().length > 0
      ? input.skill_key
      : "intake-analysis";

  return {
    decision: {
      next_step: "execute_skill",
      skill_to_execute: requestedSkill,
      agent_to_execute: "intake-specialist",
      human_intervention_needed: false,
      used_fallback: false,
      deterministic_route: true,
      reasoning:
        "Ruta deterministica de hardening activada para validacion controlada; no depende del proveedor externo y debe cerrar como runtime.execution_completed.",
    },
  };
}
function extractNextStep(result: any): string | null {
  return result?.decision?.next_step || result?.next_step || null;
}

function extractSkillToExecute(result: any): string | null {
  return result?.decision?.skill_to_execute || result?.skill_to_execute || null;
}

async function callOpenRouter(runtimeContext: unknown) {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  const model = Deno.env.get("AI_MODEL") || Deno.env.get("OPENROUTER_MODEL") || "deepseek/deepseek-v4-pro";
  if (!apiKey) return fallbackDecision("missing_openrouter_api_key");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://supabase.com",
        "X-Title": "Automation Deployment Protocol",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Eres el Runtime Orchestrator Agent. Decide el siguiente paso. Responde solo JSON valido con decision.next_step, decision.skill_to_execute, decision.agent_to_execute, decision.human_intervention_needed y decision.reasoning." },
          { role: "user", content: JSON.stringify(runtimeContext) },
        ],
      }),
    });
    const text = await response.text();
    if (!response.ok) return fallbackDecision(`openrouter_http_${response.status}`, text);
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { return fallbackDecision("openrouter_non_json_response", text); }
    const content = parsed?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string" || content.trim().length === 0) return fallbackDecision("openrouter_empty_content", parsed);
    try {
      const decision = JSON.parse(content);
      if (!extractNextStep(decision)) return fallbackDecision("openrouter_missing_next_step", decision);
      return decision;
    } catch { return fallbackDecision("openrouter_invalid_json_content", content); }
  } catch (error) {
    return fallbackDecision("openrouter_unexpected_error", error instanceof Error ? error.message : String(error));
  }
}

async function callSkillExecutor(params: { automationKey: string; skillKey: string; input: JsonRecord; parentTaskId: string }) {
  const response = await fetch(`${env("SUPABASE_URL")}/functions/v1/skill-executor`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      automation_key: params.automationKey,
      skill_key: params.skillKey,
      input: { ...params.input, parent_task_id: params.parentTaskId, called_by: "runtime-router" },
    }),
  });
  const text = await response.text();
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { throw new Error(`skill-executor returned non JSON response: ${text}`); }
  if (!response.ok || parsed?.ok === false) throw new Error(`skill-executor failed: ${JSON.stringify(parsed)}`);
  return parsed;
}

Deno.serve(async (req) => {
  let taskId: string | null = null;
  let automationKey = "automation-template";

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed. Use POST." }, 405);

  try {
    let body: any = {};
    try { body = await req.json(); } catch (error) {
      body = { automation_key: automationKey, event_type: "manual.invalid_json", input: {}, parse_error: error instanceof Error ? error.message : String(error) };
    }

    automationKey = body.automation_key || "automation-template";
    const eventType = body.event_type || "manual.trigger";
    const input = body.input && typeof body.input === "object" ? body.input : {};

    const automations = await dbSelect(`automation_registry?automation_key=eq.${encodeURIComponent(automationKey)}&select=*`);
    const automation = Array.isArray(automations) ? automations[0] : null;
    if (!automation) return jsonResponse({ ok: false, error: "Automation not found", automation_key: automationKey }, 404);
    if (automation.status !== "active") return jsonResponse({ ok: false, error: "Automation is not active", automation_key: automationKey, status: automation.status }, 409);

    const agents = await dbSelect(`agent_registry?automation_key=eq.${encodeURIComponent(automationKey)}&select=*`);
    const skills = await dbSelect(`skill_registry?automation_key=eq.${encodeURIComponent(automationKey)}&select=*`);
    const rules = await dbSelect(`automation_rules?automation_key=eq.${encodeURIComponent(automationKey)}&status=eq.active&select=*`);

    const task = await dbInsert("execution_tasks", {
      automation_key: automationKey,
      task_type: "runtime_execution",
      task_status: "running",
      status: "running",
      phase: "runtime",
      agent_name: "orchestrator",
      agent_key: "orchestrator",
      input_payload: body,
      input_data: body,
      started_at: new Date().toISOString(),
    });
    taskId = task.id;

    await insertRuntimeEvent({ automation_key: automationKey, execution_task_id: task.id, automation_id: automation.id, event_type: "runtime.trigger_received", event_payload: { event_type: eventType, input } });

    const runtimeContext = {
      trigger: { event_type: eventType, input },
      automation: { automation_key: automation.automation_key, automation_name: automation.automation_name, status: automation.status, health_status: automation.health_status, runtime_config: automation.runtime_config },
      agents: agents || [], skills: skills || [], rules: rules || [],
      instruction: "Decide el siguiente paso runtime. Si falla el modelo, ejecutar intake-analysis por fallback.",
    };

    const deterministicRoute = isDeterministicHardeningInput(input, eventType);
    const orchestrationResult = deterministicRoute
      ? deterministicHardeningDecision(input)
      : await callOpenRouter(runtimeContext);

    if (deterministicRoute) {
      await insertRuntimeEvent({
        automation_key: automationKey,
        execution_task_id: task.id,
        automation_id: automation.id,
        event_type: "runtime.deterministic_route_used",
        event_payload: {
          mode: "deterministic_hardening",
          skill_key: extractSkillToExecute(orchestrationResult),
        },
      });
    }
    const usedFallback = orchestrationResult?.decision?.used_fallback === true;
    if (usedFallback) await insertRuntimeEvent({ automation_key: automationKey, execution_task_id: task.id, automation_id: automation.id, event_type: "runtime.openrouter_fallback_used", event_payload: orchestrationResult });

    const nextStep = extractNextStep(orchestrationResult);
    const skillToExecute = extractSkillToExecute(orchestrationResult);
    let skillExecutionResult = null;

    if (nextStep === "execute_skill" && skillToExecute) {
      await insertRuntimeEvent({ automation_key: automationKey, execution_task_id: task.id, automation_id: automation.id, event_type: "runtime.skill_execution_requested", event_payload: { skill_key: skillToExecute, used_fallback: usedFallback, deterministic_route: deterministicRoute } });
      skillExecutionResult = await callSkillExecutor({ automationKey, skillKey: skillToExecute, input, parentTaskId: task.id });
    }

    const skillCompletedWithFallback = skillExecutionResult?.completed_with_fallback === true;
    const completedWithFallback = usedFallback || skillCompletedWithFallback;
    const finalOutput = {
      orchestration: orchestrationResult,
      skill_execution: skillExecutionResult,
      completed_with_fallback: completedWithFallback,
      deterministic_route: deterministicRoute,
    };
    await dbPatch("execution_tasks", task.id, {
      task_status: "completed",
      status: "completed",
      output_payload: finalOutput,
      output_data: finalOutput,
      error_message: completedWithFallback ? `completed_with_fallback: ${orchestrationResult?.fallback?.reason || skillExecutionResult?.result?.fallback?.reason || "unknown"}` : null,
      completed_at: new Date().toISOString(),
    });

    await insertRuntimeEvent({ automation_key: automationKey, execution_task_id: task.id, automation_id: automation.id, event_type: completedWithFallback ? "runtime.execution_completed_with_fallback" : "runtime.execution_completed", event_payload: finalOutput });

    return jsonResponse({ ok: true, automation_key: automationKey, task_id: task.id, completed_with_fallback: completedWithFallback, deterministic_route: deterministicRoute, orchestration: orchestrationResult, skill_execution: skillExecutionResult });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (taskId) await dbPatch("execution_tasks", taskId, { task_status: "failed", status: "failed", error_message: errorMessage, completed_at: new Date().toISOString() });
    await insertRuntimeEvent({ automation_key: automationKey, execution_task_id: taskId, event_type: "runtime.execution_failed", event_payload: { error: errorMessage } });
    return jsonResponse({ ok: false, automation_key: automationKey, task_id: taskId, error: errorMessage }, 500);
  }
});

