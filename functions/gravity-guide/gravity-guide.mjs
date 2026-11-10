import run from './guide-core.mjs';

// Preserve Gravity's existing public health check and core AI response contract
// while using Netlify's modern handler API for enforceable platform rate limiting.
export default async function gravityGuide(request) {
  if (request.method === 'GET') {
    return Response.json({
      ok: true,
      function: 'gravity-guide',
      configured: Boolean(process.env.OPENAI_API_KEY),
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const response = await run(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Gravity Guide request failed', error?.name || 'Error');
    return Response.json(
      { error: 'Gravity Guide AI is temporarily unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// Per-IP rate limiting is enforced by Netlify before the paid AI provider call.
// This is not customer authentication and must not be presented as such.
export const config = {
  // Netlify requires a concrete path to activate code-defined rate-limit rules.
  // Keep the existing public function URL stable for all current browser clients.
  path: '/.netlify/functions/gravity-guide',
  rateLimit: {
    action: 'rate_limit',
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
