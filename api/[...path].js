// Vercel serverless function proxying every /api/* request to the real backend.
//
// This exists instead of a static `rewrites` entry in vercel.json because
// vercel.json is static config with no environment-variable interpolation —
// the backend's URL has to be read at request time here, from BACKEND_URL
// (set in the Vercel project's Environment Variables, never committed).
//
// The browser only ever talks to this project's own domain, so requests
// stay same-origin (no CORS needed) even though the real backend lives
// elsewhere (e.g. an ngrok tunnel to a local machine).
export default async function handler(req, res) {
  const backendBase = process.env.BACKEND_URL;
  if (!backendBase) {
    res.statusCode = 500;
    res.end("BACKEND_URL environment variable is not configured");
    return;
  }

  const target = new URL(req.url, backendBase);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  // Skips ngrok's free-tier browser-warning interstitial (an HTML page in
  // place of the real response) for requests that look browser-originated.
  headers["ngrok-skip-browser-warning"] = "true";

  const hasBody = body && req.method !== "GET" && req.method !== "HEAD";
  const backendRes = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? body : undefined,
  });

  res.statusCode = backendRes.status;
  backendRes.headers.forEach((value, key) => {
    if (["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await backendRes.arrayBuffer());
  res.end(buf);
}
