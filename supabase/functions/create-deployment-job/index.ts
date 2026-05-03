// create-deployment-job
export default async function handler(req: Request): Promise<Response> { return new Response(JSON.stringify({function:"create-deployment-job", status:"template"}), {headers:{"content-type":"application/json"}}); }
