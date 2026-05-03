// activate-automation
export default async function handler(req: Request): Promise<Response> { return new Response(JSON.stringify({function:"activate-automation", status:"template"}), {headers:{"content-type":"application/json"}}); }
