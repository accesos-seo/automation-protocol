const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-test-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Connection": "keep-alive",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed. Use POST." }, 405);

  const expectedToken = Deno.env.get("LOCAL_TEST_TOKEN");
  const receivedToken = req.headers.get("x-test-token") || "";

  if (receivedToken !== expectedToken) {
    return jsonResponse({ ok: false, error: "Unauthorized local test request" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "Missing Supabase runtime secrets" }, 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {
      automation_key: "automation-template",
      event_type: "manual.trigger",
      input: {
        source: "runtime_router_local_test_default",
        raw_request: "Prueba local de runtime-router desde PowerShell sin exponer service_role key.",
      },
    };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/runtime-router`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${serviceRoleKey}`,
      "apikey": serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw_text: text };
  }

  return jsonResponse({
    ok: response.ok,
    proxy_status: response.status,
    called_function: "runtime-router",
    result: parsed,
  }, response.ok ? 200 : response.status);
});
