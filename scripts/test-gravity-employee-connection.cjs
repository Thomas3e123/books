'use strict';
/* Isolated Employee Connection contract test. All workspaces and PINs exist in memory only. */
const assert=require('node:assert/strict');
const {createHostedFoundryHandler}=await import('../functions/foundry-hosted/core.mjs');
class MemoryRepo {
 constructor(){this.workspaces=[];this.sessions=new Map();this.activity=[];this.messages=[];this.training=[]}
 async getWorkspaceByCode(code){return this.workspaces.find(w=>w.code===code)||null}
 async getWorkspaceByManagerHash(hash){return this.workspaces.find(w=>w.manager_key_hash===hash)||null}
 async createWorkspace(w){this.workspaces.push({...w,updated_at:new Date().toISOString()})}
 async updateWorkspace(id,p){const w=this.workspaces.find(w=>w.id===id);assert(w);Object.assign(w,p,{updated_at:new Date().toISOString()})}
 async createSession(s){this.sessions.set(s.token_hash,s)}
 async getSession(hash){const s=this.sessions.get(hash);const w=this.workspaces.find(w=>w.id===s?.workspace_id);return w?{...w,expires_at:s.expires_at,role:s.role}:null}
 async insertActivity(id,d){this.activity.push({id,d})}
 async insertMessage(id,d){this.messages.push({id,d})}
 async insertTraining(id,d){this.training.push({id,d})}
 async listEvents(id,since){const after=x=>x.id===id&&x.d.createdAt>since;return {activity:this.activity.filter(after).map(x=>x.d),messages:this.messages.filter(after).map(x=>x.d),training:this.training.filter(x=>x.id===id).map(x=>x.d)}}
 async countEvents(id){return {activity:this.activity.filter(x=>x.id===id).length,messages:this.messages.filter(x=>x.id===id).length,training:this.training.filter(x=>x.id===id).length}}
}
const repo=new MemoryRepo(),handler=createHostedFoundryHandler(repo),origin='https://staging-test.invalid';
async function call(path,method='GET',data,token){const headers={};if(data!==undefined)headers['content-type']='application/json';if(token)headers.authorization='Bearer '+token;const req=new Request(origin+'/foundry-hosted/'+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data)});const res=await handler(req);return {status:res.status,json:await res.json()}}
(async()=>{
 assert.equal((await call('health')).status,200);
 assert.equal((await call('manager/create','POST',{employeePin:'0000'})).status,400);
 const sop={id:'test-sop',title:'Disposable handwashing standard',revision:'1',purpose:'Wash hands safely.',role:'Employee',steps:['Use running water.','Apply soap.','Scrub hands.'],checks:'Hands cleaned.',correction:'Wash again.',trainingRequirement:'review'};
 const snapshot={restaurantName:'GLS Disposable Test Only',publishedSops:[sop],publishedRecipes:[{id:'recipe-test',title:'Water',revision:'1'}],posters:[{id:'poster-test',title:'Handwashing',status:'Active'}]};
 const created=await call('manager/create','POST',{employeePin:'6382',snapshot});assert.equal(created.status,201);
 const {workspaceCode,managerKey}=created.json;assert.match(workspaceCode,/^[A-Z0-9]{6}$/);
 assert.equal((await call('workspace/'+workspaceCode)).status,200);
 assert.equal((await call('login','POST',{code:workspaceCode,pin:'1234'})).status,401);
 const login=await call('login','POST',{code:workspaceCode,pin:'6382'});assert.equal(login.status,200);const token=login.json.token;
 assert.equal((await call('session')).status,401);
 assert.equal((await call('session','GET',undefined,token)).status,200);
 const sops=await call('published-sops','GET',undefined,token);assert.equal(sops.json.data.sops.length,1);assert.equal(sops.json.canBuild,false);
 assert.equal((await call('staff-recipes','GET',undefined,token)).json.recipes.length,1);
 assert.equal((await call('published-posters','GET',undefined,token)).json.posters.length,1);
 const quiz=await call('training?id=test-sop','GET',undefined,token);assert.equal(quiz.json.questions.length,5);
 const answers=Object.fromEntries(quiz.json.questions.map(q=>[q.id,q.options[0]]));
 const training=await call('training','POST',{sopId:'test-sop',revision:'1',name:'Disposable Tester',acknowledge:true,answers},token);
 assert.equal(training.status,200);assert.equal(training.json.record.passed,true);
 assert.equal((await call('messages','POST',{text:'Disposable test question'},token)).status,201);
 assert.equal((await call('activity','POST',{kind:'test-view'},token)).status,200);
 assert.equal((await call('assistant','POST',{kind:'sop',sourceId:'test-sop',messages:[{content:'What first?'}]},token)).status,200);
 const status=await call('manager/status','GET',undefined,managerKey);assert.equal(status.status,200);
 assert.deepEqual(status.json.counts,{activity:1,messages:1,training:1});
 assert.equal((await call('manager/events','GET',undefined,managerKey)).json.messages.length,1);
 assert.equal((await call('manager/sync','POST',{snapshot:{restaurantName:'GLS Disposable Test Only',publishedSops:[{...sop,revision:'2'}]}},managerKey)).status,200);
 assert.equal((await call('training','POST',{sopId:'test-sop',revision:'1',name:'Tester',acknowledge:true,answers},token)).status,409);
 assert.equal((await call('manager/status','GET',undefined,'bad-key')).status,401);
 console.log('PASS: 20 isolated Employee Connection contract assertions; no persistent workspace or customer data touched.');
})().catch(e=>{console.error(e);process.exitCode=1});
