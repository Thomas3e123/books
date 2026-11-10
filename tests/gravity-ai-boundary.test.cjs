'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const nodePath=require('node:path');
const {pathToFileURL}=require('node:url');

test('Guide rejects unfamiliar Netlify origins and oversized input without paid requests',async()=>{
 const before=global.fetch,old=process.env.OPENAI_API_KEY;
 process.env.OPENAI_API_KEY='synthetic-test-key';
 let providerCalls=0;
 global.fetch=async()=>{providerCalls++;return new Response(JSON.stringify({output_text:'Synthetic verified answer'}),{headers:{'content-type':'application/json'}})};
 try{
  const run=(await import(pathToFileURL(nodePath.resolve('functions/gravity-guide/guide-core.mjs')).href)).default;
  const req=(origin,body)=>new Request('https://gravityleadershipsystem.com/.netlify/functions/gravity-guide',{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
  assert.equal((await run(req('https://untrusted.netlify.app',{question:'Hello'}))).status,403);
  assert.equal((await run(req('https://gravityleadershipsystem.com',{question:'a'.repeat(38000)}))).status,413);
  assert.equal(providerCalls,0);
  const good=await run(req('https://gravityleadershipsystem.com',{question:'Where is Shift Lab?'}));
  assert.equal(good.status,200);
  assert.equal((await good.json()).answer,'Synthetic verified answer');
  assert.equal(providerCalls,1);
 }finally{global.fetch=before;if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}
});

test('Neural voice enforces approved origins and bounded text; legitimate speech remains supported',async()=>{
 const before=global.fetch,old=process.env.OPENAI_API_KEY;
 process.env.OPENAI_API_KEY='synthetic-test-key';
 let calls=0;global.fetch=async()=>{calls++;return new Response(Buffer.from('synthetic audio'),{status:200,headers:{'content-type':'audio/mpeg'}})};
 try{
  const {handler}=require('../functions/gravity-tts/gravity-tts.js');
  const e=(origin,body)=>({httpMethod:'POST',headers:{Origin:origin},body:JSON.stringify(body)});
  assert.equal((await handler(e('https://untrusted.netlify.app',{text:'hello'}))).statusCode,403);
  assert.equal((await handler(e('https://gravityleadershipsystem.com',{text:''}))).statusCode,400);
  assert.equal((await handler(e('https://gravityleadershipsystem.com',{text:'a'.repeat(3900)}))).statusCode,413);
  assert.equal((await handler(e('https://gravityleadershipsystem.com',{text:'a'.repeat(17000)}))).statusCode,413);
  assert.equal(calls,0);
  const good=await handler(e('https://gravityleadershipsystem.com',{text:'Synthetic speech',voice:'cedar'}));
  assert.equal(good.statusCode,200);
  assert.equal(good.isBase64Encoded,true);
  assert.equal(Buffer.from(good.body,'base64').toString(),'synthetic audio');
  assert.equal(calls,1);
 }finally{global.fetch=before;if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}
});

test('Work Study transcription rejects unapproved origins and oversized audio; accepted recordings retain output format',async()=>{
 const before=global.fetch,old=process.env.OPENAI_API_KEY;
 process.env.OPENAI_API_KEY='synthetic-test-key';
 let calls=0;global.fetch=async()=>{calls++;return new Response(JSON.stringify({text:'Synthetic transcription',segments:[{start:0,end:1,text:'Synthetic transcription'}]}),{status:200,headers:{'content-type':'application/json'}})};
 try{
  const {handler}=require('../functions/work-study-transcribe/work-study-transcribe.js');
  const e=(origin,bytes)=>({httpMethod:'POST',headers:{origin,'content-type':'audio/webm'},isBase64Encoded:true,body:bytes.toString('base64')});
  assert.equal((await handler(e('https://untrusted.netlify.app',Buffer.from('x')))).statusCode,403);
  assert.equal((await handler(e('https://gravityleadershipsystem.com',Buffer.alloc(4*1024*1024+1)))).statusCode,413);
  assert.equal(calls,0);
  const good=await handler(e('https://gravityleadershipsystem.com',Buffer.from('synthetic recording')));
  assert.equal(good.statusCode,200);
  const payload=JSON.parse(good.body);assert.equal(payload.text,'Synthetic transcription');
  assert.equal(payload.segments.length,1);assert.equal(calls,1);
 }finally{global.fetch=before;if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}
});
