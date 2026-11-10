import legacy from './core.cjs';

// Preserve the tested binary MP3 response contract while Netlify enforces
// a client-based request limit before any paid provider request.
export default async function gravityTts(request) {
  try {
    const event = {
      httpMethod: request.method,
      headers: Object.fromEntries(request.headers),
      body: request.method === 'POST' ? await request.text() : '',
    };
    const result = await legacy.handler(event);
    const headers = new Headers(result.headers || {});
    const data = result.isBase64Encoded
      ? Buffer.from(result.body || '', 'base64')
      : (result.body || '');
    return new Response(data, { status: result.statusCode || 500, headers });
  } catch (error) {
    console.error('Gravity voice adapter failure', error?.name || 'Error');
    return Response.json(
      { error: 'Neural voice is temporarily unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export const config = {
  path: '/.netlify/functions/gravity-tts',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['ip', 'domain'],
    windowSize: 60,
    windowLimit: 60,
  },
};
