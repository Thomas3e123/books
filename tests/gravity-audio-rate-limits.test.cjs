'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const load=async file=>import(pathToFileURL(path.resolve(file)).href);

test('Neural voice adapter has the original route and per-IP rate-limit rule',async()=>{
 const {default:run,config}=await load('functions/gravity-tts/gravity-tts.mjs');
 assert.equal(config.path,'/.netlify/functions/gravity-tts');
 assert.deepEqual(JSON.parse(JSON.stringify(config.rateLimit)),{
  action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:60
 });
 const response=await run(new Request('https://gravityleadershipsystem.com/.netlify/functions/gravity-tts'));
 assert.equal(response.status,200);
 const payload=await response.json();
 assert.equal(payload.function,'gravity-tts');
 assert.deepEqual(payload.voices,['cedar','marin']);
});

test('Neural voice adapter returns real binary MP3 bytes and blocks invalid requests',async()=>{
 const before=global.fetch,old=process.env.OPENAI_API_KEY;let calls=0;
 process.env.OPENAI_API_KEY='synthetic-key';
 const mp3=Buffer.from([0x49,0x44,0x33,0x03,0x00,0xff,0x00,0x80]);
 global.fetch=async()=>{calls++;return new Response(mp3,{status:200,headers:{'content-type':'audio/mpeg'}})};
 try{
  const {default:run}=await load('functions/gravity-tts/gravity-tts.mjs');
  const make=(origin,text)=>new Request('https://gravityleadershipsystem.com/.netlify/functions/gravity-tts',{
   method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify({text,voice:'cedar',speed:0.98})
  });
  assert.equal((await run(make('https://untrusted.netlify.app','Hello'))).status,403);
  assert.equal((await run(make('https://gravityleadershipsystem.com','x'.repeat(4000)))).status,413);
  assert.equal(calls,0);
  const good=await run(make('https://gravityleadershipsystem.com','Synthetic voice test'));
  assert.equal(good.status,200);
  assert.match(good.headers.get('content-type')||'',/audio\/mpeg/);
  assert.equal(good.headers.get('x-gravity-voice'),'cedar');
  assert.deepEqual(Buffer.from(await good.arrayBuffer()),mp3);
  assert.equal(calls,1);
 }finally{global.fetch=before;if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}
});

test('Work Study transcription adapter enforces its route and low request budget',async()=>{
 const {default:run,config}=await load('functions/work-study-transcribe/work-study-transcribe.mjs');
 assert.equal(config.path,'/.netlify/functions/work-study-transcribe');
 assert.deepEqual(JSON.parse(JSON.stringify(config.rateLimit)),{
  action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:8
 });
 const response=await run(new Request('https://gravityleadershipsystem.com/.netlify/functions/work-study-transcribe'));
 assert.equal(response.status,405);
});

test('Work Study audio adapter preserves upload bytes, segments, and error contract',async()=>{
 const before=global.fetch,old=process.env.OPENAI_API_KEY;let calls=0;
 process.env.OPENAI_API_KEY='synthetic-key';
 global.fetch=async(url,options)=>{
  calls++;
  assert.match(url,/audio\/transcriptions/);
  assert.equal(options.body.get('model'),'whisper-1');
  assert.equal((await options.body.get('file').arrayBuffer()).byteLength,5);
  return new Response(JSON.stringify({text:'Synthetic transcript',segments:[{start:0,end:1,text:'Synthetic transcript'}]}),{
   status:200,headers:{'content-type':'application/json'}
  });
 };
 try{
  const {default:run}=await load('functions/work-study-transcribe/work-study-transcribe.mjs');
  const make=(origin,buffer)=>new Request('https://gravityleadershipsystem.com/.netlify/functions/work-study-transcribe',{
   method:'POST',headers:{origin,'content-type':'audio/webm'},body:buffer
  });
  assert.equal((await run(make('https://untrusted.netlify.app',Buffer.from('audio')))).status,403);
  assert.equal((await run(make('https://gravityleadershipsystem.com',Buffer.alloc(4*1024*1024+1)))).status,413);
  assert.equal(calls,0);
  const good=await run(make('https://gravityleadershipsystem.com',Buffer.from('audio')));
  assert.equal(good.status,200);
  const body=await good.json();
  assert.equal(body.text,'Synthetic transcript');
  assert.equal(body.segments.length,1);
  assert.equal(body.confidence,'unverified');
  assert.equal(calls,1);
 }finally{global.fetch=before;if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}
});
