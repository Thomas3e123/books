import legacy from './core.cjs';

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

async function readLimitedAudio(request) {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_AUDIO_BYTES) return null;
  if (!request.body) {
    const payload = Buffer.from(await request.arrayBuffer());
    return payload.length > MAX_AUDIO_BYTES ? null : payload;
  }

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_AUDIO_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

// Keep the existing browser audio upload, segment output and error semantics;
// reject oversized recordings before building a base64 request for the processor.
export default async function workStudyTranscribe(request) {
  try {
    let payload = Buffer.alloc(0);
    if (request.method === 'POST') {
      payload = await readLimitedAudio(request);
      if (!payload) {
        return Response.json(
          { error: 'Recordings must be between 1 byte and 4 MB for this preview. Save longer audio locally.' },
          { status: 413, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

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
