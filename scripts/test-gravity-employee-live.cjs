'use strict';
// Intentional one-time staging integration smoke test. Generates only synthetic records.
// Do not run against the TMB production site or public Gravity production.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const base='https://gravity-migration--gravity-leadership-system.netlify.app';
const pin=String(100000+crypto.randomInt(900000));
const testId=crypto.randomBytes(5).toString('hex');
const snapshot={restaurantName:'GLS QA DISPOSABLE '+testId,branding:{name:'GLS QA DISPOSABLE '+testId,logo:''},
 publishedSops:[{id:'qa-'+testId,title:'Disposable sample SOP',revision:'1',purpose:'Demonstrate sample procedure.',role:'Employee',steps:['Read sample SOP','Follow the instructions'],checks:'Procedure reviewed',correction:'Read again',trainingRequirement:'review'}],
 publishedRecipes:[{id:'recipe-'+testId,title:'Sample Water',revision:'1'}],
 posters:[{id:'poster-'+testId,title:'Sample Safety Poster',status:'Active'}]};
async function call(path,method='GET',data,token){
 const r=await fetch(base+'/foundry-hosted/'+path,{method,headers:{...(data?{'content-type':'application/json'}:{}),...(token?{authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(16000)});
 let json;try{json=await r.json()}catch{throw Error(path+' returned non-JSON HTTP '+r.status)}
 return {status:r.status,json};
}
(async()=>{
 const health=await call('health');assert.equal(health.status,200);
 const created=await call('manager/create','POST',{employeePin:pin,snapshot});assert.equal(created.status,201, 'manager/create: '+created.status+' '+JSON.stringify(created.json));
 const {workspaceCode,managerKey}=created.json;assert.match(workspaceCode,/^[A-Z0-9]{6}$/);
 assert.equal((await call('workspace/'+workspaceCode)).status,200);
 assert.equal((await call('login','POST',{code:workspaceCode,pin:'0000'})).status,401);
 const login=await call('login','POST',{code:workspaceCode,pin});assert.equal(login.status,200);
 const token=login.json.token;
 assert.equal((await call('session','GET',undefined,token)).status,200);
 const sop=await call('published-sops','GET',undefined,token);assert.equal(sop.json.data.sops[0].id,'qa-'+testId);
 assert.equal((await call('staff-recipes','GET',undefined,token)).json.recipes.length,1);
 assert.equal((await call('published-posters','GET',undefined,token)).json.posters.length,1);
 const quiz=await call('training?id=qa-'+testId,'GET',undefined,token);assert.equal(quiz.status,200);
 const answers=Object.fromEntries(quiz.json.questions.map(q=>[q.id,q.options[0]]));
 assert.equal((await call('training','POST',{sopId:'qa-'+testId,revision:'1',name:'QA Disposable Employee',acknowledge:true,answers},token)).status,200);
 assert.equal((await call('messages','POST',{text:'Synthetic test question'},token)).status,201);
 assert.equal((await call('activity','POST',{kind:'qa-synthetic-view'},token)).status,200);
 assert.equal((await call('assistant','POST',{kind:'sop',sourceId:'qa-'+testId,messages:[{content:'What first?'}]},token)).status,200);
 const status=await call('manager/status','GET',undefined,managerKey);assert.equal(status.status,200);assert.deepEqual(status.json.counts,{activity:1,messages:1,training:1});
 assert.equal((await call('manager/events','GET',undefined,managerKey)).json.messages.length,1);
 assert.equal((await call('manager/sync','POST',{snapshot:{...snapshot,publishedSops:[{...snapshot.publishedSops[0],revision:'2'}]}},managerKey)).status,200);
 assert.equal((await call('training','POST',{sopId:'qa-'+testId,revision:'1',name:'QA Disposable Employee',acknowledge:true,answers},token)).status,409);
 console.log('PASS: Live Netlify staging employee connection create, login, snapshot, quiz, messages, assistant, manager sync, revision controls.');
 console.log('Synthetic workspace retained for QA; no credentials printed or real customers affected.');
})().catch(e=>{console.error('LIVE EMPLOYEE TEST FAILED:',e.message);process.exitCode=1});
