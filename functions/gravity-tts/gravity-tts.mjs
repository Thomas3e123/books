import legacy from './core.cjs';

async function readBoundedBody(request,maxBytes) {
  const declared=Number(request.headers.get('content-length')||0);
  if(Number.isFinite(declared)&&declared>maxBytes)return null;
  if(!request.body){const raw=await request.text();return Buffer.byteLength(raw,'utf8')>maxBytes?null:raw;}
  const reader=request.body.getReader(),chunks=[];let total=0;
  try{
    while(true){
      const{done,value}=await reader.read();
      if(done)break;
      total+=value.byteLength;
      if(total>maxBytes){await reader.cancel();return null;}
      chunks.push(Buffer.from(value));
    }
  }finally{reader.releaseLock();}
  return Buffer.concat(chunks,total).toString('utf8');
}

// Preserve the tested binary MP3 response contract while Netlify enforces
// a client-based request limit before any paid provider request.
export default async function gravityTts(request) {
  try {
    let body='';
    if(request.method==='POST'){
      body=await readBoundedBody(request,16000);
      if(body===null)return Response.json({error:'Request too large'},{status:413,headers:{'Cache-Control':'no-store'}});
    }
    const event = {
      httpMethod: request.method,
      headers: Object.fromEntries(request.headers),
      body,
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
