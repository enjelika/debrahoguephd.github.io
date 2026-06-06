// Cloudflare Worker — Anthropic API Proxy
// Deploy at: Workers & Pages → Create Worker → paste this code
// Then: Settings → Variables → add ANTHROPIC_API_KEY as a secret

const ALLOWED_ORIGINS = ['https://debrahogue.phd', 'https://www.debrahogue.phd'];
const ANTHROPIC_API = 'https://api.anthropic.com';

export default {
  async fetch(request, env) {

    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': allowed ? origin : 'null',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Only allow POST from your domain
    if (request.method !== 'POST' || !allowed) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();

      const apiResponse = await fetch(`${ANTHROPIC_API}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05',
        },
        body: JSON.stringify(body),
      });

      const data = await apiResponse.json();

      return new Response(JSON.stringify(data), {
        status: apiResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        }
      });
    }
  }
};
