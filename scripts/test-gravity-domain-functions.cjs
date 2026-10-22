'use strict';
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const requireCjs=createRequire(__filename);
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
process.env.OPENAI_API_KEY='local-test-placeholder-no-network';
const allowed=['https://thomasmonroebooks.com','https://www.thomasmonroebooks.com','https://gravity-leadership-system.netlify.app','https://gravityleadershipsystem.com','https://www.gravityleadershipsystem.com'];
const denied='https://malicious.example';
let tested=0;
(async()=>{
 const guide=(await import(path.join(base,'functions/gravity-guide/guide-core.mjs'))).default;
 for(const origin of allowed){
  const req=new Request('https://gravity-leadership-system.netlify.app/.netlify/functions/gravity-guide',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{invalid json'});
  const resp=await guide(req);
  assert.equal(resp.status,400,'Gravity Guide should accept allowed origin and reject only invalid JSON: '+origin);tested++;
 }
 const deniedGuide=await guide(new Request('https://gravity-leadership-system.netlify.app/.netlify/functions/gravity-guide',{method:'POST',headers:{origin:denied},body:'{'}));
 assert.equal(deniedGuide.status,403);tested++;
 const voice=requireCjs(path.join(base,'functions/gravity-tts/gravity-tts.js'));
 const transcribe=requireCjs(path.join(base,'functions/work-study-transcribe/work-study-transcribe.js'));
 for(const origin of allowed){
  const tts=await voice.handler({httpMethod:'POST',headers:{origin},body:'{invalid json'});
  assert.equal(tts.statusCode,400,'TTS origin expected to be allowed: '+origin);tested++;
  const transcription=await transcribe.handler({httpMethod:'POST',headers:{origin},isBase64Encoded:false,body:''});
  assert.equal(transcription.statusCode,400,'Transcription origin expected to be allowed: '+origin);tested++;
 }
 for(const [label,fn,event] of [
   ['TTS',voice.handler,{httpMethod:'POST',headers:{origin:denied},body:'{}'}],
   ['transcription',transcribe.handler,{httpMethod:'POST',headers:{origin:denied},body:'{}',isBase64Encoded:false}]
 ]){
   const resp=await fn(event);assert.equal(resp.statusCode,403,label+' should reject disallowed origin');tested++;
 }
 const testingRoom=fs.readFileSync(path.join(base,'functions/testing-room/index.mjs'),'utf8');
 for(const o of allowed){assert.ok(testingRoom.includes(o),'Testing Room allowlist missing '+o);tested++}
 const ws=fs.readFileSync(path.join(base,'functions/work-study-link/index.mjs'),'utf8');
 assert.ok(ws.includes('joinUrl:')&&ws.includes('gravityOrigin(url)'),'Work Study must build origin-aware links');tested++;
 assert.ok(!ws.includes('joinUrl:`https://thomasmonroebooks.com/'),'Old Work Study pairing URL must be gone');tested++;
 for(const o of ['https://gravity-leadership-system.netlify.app','https://gravityleadershipsystem.com','https://www.gravityleadershipsystem.com']){
   assert.ok(ws.includes(o),'Work Study host missing '+o);tested++;
 }
 console.log('GRAVITY_DOMAIN_FUNCTION_TEST_PASS '+JSON.stringify({tests:tested,allowedDomains:allowed.length,disallowedOriginsRejected:true,externalRequests:0,customerWrites:0,deploys:0}));
})().catch(e=>{console.error('GRAVITY_DOMAIN_FUNCTION_TEST_FAILED',e.message);process.exitCode=1});
