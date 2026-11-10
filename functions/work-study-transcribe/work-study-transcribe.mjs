import legacy from './core.cjs';

// Keep the existing browser audio upload, segment output and error semantics;
// avoid converting binary audio until after the platform's request limit.
export default async function workStudyTranscribe(request) {
  try {
    const payload = request.method === 'POST'
      ? Buffer.from(await request.arrayBuffer())
      : Buffer.alloc(0);
    const event = {
      httpMethod: request.method,
      headers: Object.fromEntries(request.headers),
      isBase64Encoded: request.method === 'POST',
      body: payload.toString('base64'),
    };
    const result = await legacy.handler(event);
    const headers = new Headers(result.headers || {});
    return new Response(result.body || '', {
      status: result.statusCode || 500,
      headers,
    });
  } catch (error) {
    console.error('Gravity audio analysis adapter failure', error?.name || 'Error');
    return Response.json(
      { error: 'Transcription unavailable. Your recording remains on this device.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export const config = {
  path: '/.netlify/functions/work-study-transcribe',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['ip', 'domain'],
    windowSize: 60,
    windowLimit: 8,
  },
};
