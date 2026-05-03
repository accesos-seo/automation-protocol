import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" },
  });
}

function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fallbackSkillResult(reason: string, skillContext: any, details?: unknown) {
  const input = skillContext?.input || {};
  const rawRequest = typeof input?.raw_request === "string" ? input.raw_request : JSON.stringify(input ?? {});
  const skillKey = skillContext?.skill?.skill_key || "intake-analysis";
  return {
    result: {
      intake_analysis: {
        request_summary: rawRequest.slice(0, 1000),
        intent: "automation_request",
        classification: { category: "automation_builder", subcategory: "runtime_intake", priority: "medium" },
        detected_fields: Object.keys(input),
        missing_fields: [],
        completeness: "partial_fallback",
        scaffold: {
          components: ["intake_reader", "missing_field_detector", "request_classifier", "technical_scaffold_generator"],
          dependencies: ["runtime-router", "skill-executor", "skill_registry", "execution_tasks", "runtime_events"],
          technical_notes: "Fallback tecnico generado porque el proveedor de IA no produjo salida usable dentro de skill-executor.",
          estimated_effort: "medium",
        },
      },
      status: "complete_with_fallback",
      next_steps: ["Revisar salida fallback", "Confirmar reglas de clasificacion", "Reintentar proveedor si se requiere analisis profundo"],
      human_intervention_needed: true,
    },
    fallback: { used_fallback: true, reason, details: typeof details === "string" ? details.slice(0, 3000) : details ?? null },
    skill_key: skillKey,
    execution_status: "success_with_fallback",
  };
}

async function callOpenRouter(skillContext: any) {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  const model = Deno.env.get("AI_MODEL") || Deno.env.get("OPENROUTER_MODEL") || "deepseek/deepseek-v4-pro";
  if (!apiKey) return fallbackSkillResult("missing_openrouter_api_key", skillContext);
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
          { role: "system", content: "Eres Skill Executor. Ejecuta logicamente el skill solicitado y responde solo JSON valido." },
          { role: "user", content: JSON.stringify(skillContext) },
        ],
      }),
    });
    const text = await response.text();
    if (!response.ok) return fallbackSkillResult(`openrouter_http_${response.status}`, skillContext, text);
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { return fallbackSkillResult("openrouter_non_json_response", skillContext, text); }
    const content = parsed?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string" || content.trim().length === 0) return fallbackSkillResult("openrouter_empty_content", skillContext, parsed);
    try { return JSON.parse(content); } catch { return fallbackSkillResult("openrouter_invalid_json_content", skillContext, content); }
  } catch (error) {
    return fallbackSkillResult("openrouter_unexpected_error", skillContext, error instanceof Error ? error.message : String(error));
  }
}

Deno.serve(async (req) => {
  let taskId: string | null = null;
  let automationKey = "automation-template";
  let skillKey = "intake-analysis";
  const supabase = getSupabaseAdmin();
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed. Use POST." }, 405);
    const body = await req.json();
    automationKey = body.automation_key || "automation-template";
    skillKey = body.skill_key || "intake-analysis";
    const input = body.input || {};

    const { data: automation, error: automationError } = await supabase.from("automation_registry").select("*").eq("automation_key", automationKey).limit(1).single();
    if (automationError || !automation) return jsonResponse({ ok: false, error: "Automation not found", automation_key: automationKey, details: automationError?.message }, 404);
    if (automation.status !== "active") return jsonResponse({ ok: false, error: "Automation is not active", automation_key: automationKey, status: automation.status }, 409);

    const { data: skill, error: skillError } = await supabase.from("skill_registry").select("*").eq("automation_key", automationKey).eq("skill_key", skillKey).order("created_at", { ascending: false }).limit(1).single();
    if (skillError || !skill) return jsonResponse({ ok: false, error: "Skill not found", automation_key: automationKey, skill_key: skillKey, details: skillError?.message }, 404);

    const { data: task, error: taskError } = await supabase.from("execution_tasks").insert({
      automation_key: automationKey,
      task_type: "skill_execution",
      task_status: "running",
      status: "running",
      phase: "runtime",
      agent_name: "skill-executor",
      agent_key: "skill-executor",
      skill_key: skillKey,
      input_payload: body,
      input_data: body,
      started_at: new Date().toISOString(),
    }).select("*").single();
    if (taskError || !task) return jsonResponse({ ok: false, error: "Failed to create execution task", details: taskError?.message }, 500);
    taskId = task.id;

    await supabase.from("runtime_events").insert({ automation_key: automationKey, execution_task_id: task.id, event_type: "skill.execution_started", event_payload: { skill_key: skillKey, runtime_package_path: skill.runtime_package_path } });

    const skillContext = { automation, skill, input, instruction: "Ejecuta este skill de forma logica con la informacion disponible." };
    const skillResult = await callOpenRouter(skillContext);
    const usedFallback = skillResult?.fallback?.used_fallback === true || skillResult?.execution_status === "success_with_fallback";

    if (usedFallback) await supabase.from("runtime_events").insert({ automation_key: automationKey, execution_task_id: task.id, event_type: "skill.openrouter_fallback_used", event_payload: { skill_key: skillKey, fallback: skillResult.fallback ?? null } });

    await supabase.from("execution_tasks").update({
      task_status: "completed",
      status: "completed",
      output_payload: skillResult,
      output_data: skillResult,
      error_message: usedFallback ? `completed_with_fallback: ${skillResult?.fallback?.reason || "unknown"}` : null,
      completed_at: new Date().toISOString(),
    }).eq("id", task.id);

    await supabase.from("runtime_events").insert({ automation_key: automationKey, execution_task_id: task.id, event_type: usedFallback ? "skill.execution_completed_with_fallback" : "skill.execution_completed", event_payload: { skill_key: skillKey, result: skillResult } });

    return jsonResponse({ ok: true, automation_key: automationKey, skill_key: skillKey, task_id: task.id, completed_with_fallback: usedFallback, result: skillResult });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (taskId) await supabase.from("execution_tasks").update({ task_status: "failed", status: "failed", error_message: errorMessage, completed_at: new Date().toISOString() }).eq("id", taskId);
    await supabase.from("runtime_events").insert({ automation_key: automationKey, execution_task_id: taskId, event_type: "skill.execution_failed", event_payload: { skill_key: skillKey, error: errorMessage } });
    return jsonResponse({ ok: false, automation_key: automationKey, skill_key: skillKey, task_id: taskId, error: errorMessage }, 500);
  }
});
