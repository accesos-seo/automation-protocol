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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-test-token",
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

function safeMetadata(metadata: Record<string, unknown> | undefined) {
  return {
    ...(metadata && typeof metadata === "object" ? metadata : {}),
    bridge: "create-shared-automation-local-test",
    bridge_mode: "controlled_local_test",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  const expectedToken = Deno.env.get("LOCAL_TEST_TOKEN") || "swarm-local-test";
  const receivedToken = req.headers.get("x-test-token") || "";

  if (!receivedToken || receivedToken !== expectedToken) {
    return jsonResponse(401, {
      ok: false,
      error: "invalid_test_token",
      message: "x-test-token is missing or invalid.",
    });
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

  const proxyPayload: RequestBody = {
    automation_key: body.automation_key,
    automation_name: body.automation_name,
    protocol_name: body.protocol_name,
    default_skill_key: body.default_skill_key,
    metadata: safeMetadata(body.metadata),
  };

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-shared-automation`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proxyPayload),
    });

    const responseText = await response.text();
    let result: unknown = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch (_error) {
      result = { raw_response: responseText };
    }

    return jsonResponse(response.status, {
      ok: response.ok,
      proxy_status: response.status,
      called_function: "create-shared-automation",
      result,
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: "bridge_request_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
