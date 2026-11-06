'use strict';
/**
 * Smoke tests against an immutable Netlify PR preview. Only unauthenticated
 * GET requests: never creates a workspace, signs in, submits a form, or writes data.
 */
const assert=require('node:assert/strict');
const origin=process.env.GRAVITY_QA_PREVIEW_URL||'';
const u=new URL(origin);
if(u.protocol!=='https:'||!/^6aee1a8fdba4fc908b3d4d5c--gravity-leadership-system\.netlify\.app$/.test(u.hostname))
  throw Error('Refusing to test a non-approved immutable Gravity preview. Production access forbidden.');
async function read(path,{status=200,content='',json=false}={}){
  const url=new URL(path,u);
  if(url.hostname!==u.hostname)throw Error('Preview host mismatch');
  let last;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const r=await fetch(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(14000),
        headers:{'accept':json?'application/json':'text/html,application/json,*/*','x-gravity-qa':'read-only-preview-smoke'}});
      assert.equal(r.status,status,'Unexpected HTTP status for '+path+' (expected '+status+', got '+r.status+')');
      const raw=await r.text();
      assert.ok(raw.length>0,path+' returned empty body');
      if(json){
        const parsed=JSON.parse(raw);
        assert.ok(parsed&&typeof parsed==='object');
        if(content)assert.ok(JSON.stringify(parsed).includes(content),path+' lacked '+content);
      }else if(content){
        assert.ok(raw.includes(content),path+' lacked expected public page text: '+content);
      }
      console.log('PASS GET '+path+' status='+r.status+' bytes='+raw.length);
      return;
    }catch(e){last=e;if(attempt<3)await new Promise(resolve=>setTimeout(resolve,800*attempt));}
  }
  throw last;
}
(async()=>{
  await read('/',{content:'Gravity'});
  await read('/gravity-shift-lab',{content:'Shift Lab'});
  await read('/gravity-work-study-lab',{content:'Work Study Lab'});
  await read('/gravity-aware',{content:'Gravity'});
  await read('/gravity-report',{content:'Gravity'});
  await read('/registration-thanks',{content:'Checking your Founding Year access'});
  await read('/apps/sop-foundry/employee-access.html',{content:'Employee'});
  await read('/gravity-report/articles.json',{json:true});
  await read('/foundry-hosted/health',{json:true,content:'Gravity Foundry'});
  for(const p of [
    '/foundry-hosted/manager/events?stream=activity&since=1970-01-01T00%3A00%3A00.000Z',
    '/foundry-hosted/manager/status',
    '/foundry-hosted/published-sops',
    '/foundry-hosted/staff-recipes',
    '/foundry-hosted/published-posters'
  ])await read(p,{status:401,json:true});
  console.log('GRAVITY_PREVIEW_GET_ONLY_QA_PASS '+JSON.stringify({
    preview:u.hostname,publicPages:8,hostedHealth:1,noAuthDenied:5,
    writeRequests:0,productionRequests:0,customerRecordsRequested:0
  }));
})().catch(e=>{console.error('GRAVITY_PREVIEW_GET_ONLY_QA_FAIL',e.stack||e);process.exitCode=1});
