'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

function mockRepo(){
 const workspaces=new Map(),sessions=new Map(),events=new Map();
 return {
  workspaces,sessions,events,
  async getWorkspaceByCode(code){return [...workspaces.values()].find(x=>x.code===code)||null},
  async getWorkspaceByManagerHash(hash){return [...workspaces.values()].find(x=>x.manager_key_hash===hash)||null},
  async createWorkspace(w){workspaces.set(w.id,{...w,updated_at:new Date().toISOString()})},
  async updateWorkspace(id,patch){Object.assign(workspaces.get(id),patch,{updated_at:new Date().toISOString()})},
  async createSession(s){sessions.set(s.token_hash,s)},
  async getSession(hash){const s=sessions.get(hash);return s?{...workspaces.get(s.workspace_id),expires_at:s.expires_at,role:s.role}:null},
  async insertActivity(workspaceId,data){let row=events.get(workspaceId)||{activity:[],messages:[],training:[]};row.activity.push(data);events.set(workspaceId,row)},
  async insertMessage(workspaceId,data){let row=events.get(workspaceId)||{activity:[],messages:[],training:[]};row.messages.push(data);events.set(workspaceId,row)},
  async insertTraining(workspaceId,data){let row=events.get(workspaceId)||{activity:[],messages:[],training:[]};row.training.push(data);events.set(workspaceId,row)},
  async listEvents(workspaceId){return events.get(workspaceId)||{activity:[],messages:[],training:[]}},
  async countEvents(workspaceId){const data=events.get(workspaceId)||{activity:[],messages:[],training:[]};return {activity:data.activity.length,messages:data.messages.length,training:data.training.length}}
 };
}
const root='https://gravityleadershipsystem.com/foundry-hosted/';
async function invoke(handle,route,method='GET',body,token){
 const req=new Request(root+route,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 const res=await handle(req);return {status:res.status,data:await res.json()};
}
const snapshot=(restaurantName,id,secret)=>({
 restaurantName,
 publishedSops:[{id,title:restaurantName+' published SOP',station:'Pizza',status:'Published',revision:'1',steps:['Follow '+restaurantName+' approved procedure'],internalDraftNotes:secret}],
 publishedRecipes:[{id:'recipe-'+id,title:restaurantName+' approved recipe',ingredients:['flour']}],
 managerOnlyDrafts:[{text:secret}]
});

test('Hosted Foundry requires non-default employee PIN and keeps two restaurant libraries separate',async()=>{
 const {createHostedFoundryHandler}=await import(pathToFileURL(path.resolve('functions/foundry-hosted/core.mjs')).href);
 const repo=mockRepo(),handle=createHostedFoundryHandler(repo);
 assert.equal((await invoke(handle,'manager/create','POST',{employeePin:'0000',snapshot:snapshot('Alpha','shared','SECRET-ALPHA')})).status,400);
 const alpha=await invoke(handle,'manager/create','POST',{employeePin:'2468',snapshot:snapshot('Alpha','shared','SECRET-ALPHA')});
 const beta=await invoke(handle,'manager/create','POST',{employeePin:'1357',snapshot:snapshot('Beta','shared','SECRET-BETA')});
 assert.equal(alpha.status,201);assert.equal(beta.status,201);
 assert.notEqual(alpha.data.workspaceCode,beta.data.workspaceCode);
 assert.notEqual(alpha.data.managerKey,beta.data.managerKey);
 const wrong=await invoke(handle,'login','POST',{code:alpha.data.workspaceCode,pin:'1357'});
 assert.equal(wrong.status,401,'Beta employee PIN must not open Alpha library');
 const signA=await invoke(handle,'login','POST',{code:alpha.data.workspaceCode,pin:'2468'});
 const signB=await invoke(handle,'login','POST',{code:beta.data.workspaceCode,pin:'1357'});
 assert.equal(signA.status,200);assert.equal(signB.status,200);
 assert.notEqual(signA.data.token,signB.data.token);
 const a=await invoke(handle,'published-sops?workspace='+beta.data.workspaceCode,'GET',undefined,signA.data.token);
 const b=await invoke(handle,'published-sops?workspace='+alpha.data.workspaceCode,'GET',undefined,signB.data.token);
 assert.equal(a.data.data.restaurant,'Alpha');assert.equal(b.data.data.restaurant,'Beta');
 assert.equal(a.data.data.sops[0].title,'Alpha published SOP');
 assert.equal(b.data.data.sops[0].title,'Beta published SOP');
 assert.doesNotMatch(JSON.stringify(a.data),/SECRET-ALPHA|SECRET-BETA|managerOnlyDrafts/);
 assert.doesNotMatch(JSON.stringify(b.data),/SECRET-ALPHA|SECRET-BETA|managerOnlyDrafts/);
 const aRecipes=await invoke(handle,'staff-recipes','GET',undefined,signA.data.token);
 assert.equal(aRecipes.data.recipes[0].title,'Alpha approved recipe');
 const crossRecipe=await invoke(handle,'assistant','POST',{kind:'recipe',sourceId:'recipe-other',messages:[{content:'What first?'}]},signA.data.token);
 assert.equal(crossRecipe.status,404);
 const managerAttempt=await invoke(handle,'manager/status','GET',undefined,signA.data.token);
 assert.equal(managerAttempt.status,401,'Employee token must not gain manager access');
 const managerA=await invoke(handle,'manager/status','GET',undefined,alpha.data.managerKey);
 const managerB=await invoke(handle,'manager/status','GET',undefined,beta.data.managerKey);
 assert.equal(managerA.data.restaurantName,'Alpha');
 assert.equal(managerB.data.restaurantName,'Beta');
});

test('Hosted employee activity and messages cannot reach another restaurant manager',async()=>{
 const {createHostedFoundryHandler}=await import(pathToFileURL(path.resolve('functions/foundry-hosted/core.mjs')).href);
 const repo=mockRepo(),handle=createHostedFoundryHandler(repo);
 const a=await invoke(handle,'manager/create','POST',{employeePin:'2468',snapshot:snapshot('Alpha','a','TOP-SECRET-A')});
 const b=await invoke(handle,'manager/create','POST',{employeePin:'1357',snapshot:snapshot('Beta','b','TOP-SECRET-B')});
 const token=(await invoke(handle,'login','POST',{code:a.data.workspaceCode,pin:'2468'})).data.token;
 assert.equal((await invoke(handle,'activity','POST',{type:'view',kind:'sop',sourceId:'a'},token)).status,200);
 assert.equal((await invoke(handle,'messages','POST',{kind:'question',sourceId:'a',text:'Alpha employee question'},token)).status,201);
 const aEvents=await invoke(handle,'manager/events','GET',undefined,a.data.managerKey);
 const bEvents=await invoke(handle,'manager/events','GET',undefined,b.data.managerKey);
 assert.equal(aEvents.data.activity.length,1);assert.equal(aEvents.data.messages.length,1);
 assert.deepEqual(bEvents.data,{ok:true,serverTime:bEvents.data.serverTime,activity:[],messages:[],training:[]});
 assert.doesNotMatch(JSON.stringify(bEvents.data),/Alpha employee question/);
 // Malicious query/body workspace selection cannot redirect a valid manager token.
 const aSync=await invoke(handle,'manager/sync','POST',{workspaceCode:b.data.workspaceCode,snapshot:snapshot('Alpha Updated','a','TOP-SECRET-A')},a.data.managerKey);
 assert.equal(aSync.status,200);
 assert.equal((await invoke(handle,'manager/status','GET',undefined,b.data.managerKey)).data.restaurantName,'Beta');
 assert.equal((await invoke(handle,'manager/status','GET',undefined,a.data.managerKey)).data.restaurantName,'Alpha Updated');
});

test('Expired sessions deny access even if employee token was previously valid',async()=>{
 const {createHostedFoundryHandler}=await import(pathToFileURL(path.resolve('functions/foundry-hosted/core.mjs')).href);
 const repo=mockRepo(),handle=createHostedFoundryHandler(repo);
 const a=await invoke(handle,'manager/create','POST',{employeePin:'2468',snapshot:snapshot('Alpha','a','PRIVATE')});
 const signed=await invoke(handle,'login','POST',{code:a.data.workspaceCode,pin:'2468'});
 assert.equal((await invoke(handle,'session','GET',undefined,signed.data.token)).status,200);
 for(const s of repo.sessions.values())s.expires_at='2000-01-01T00:00:00.000Z';
 assert.equal((await invoke(handle,'session','GET',undefined,signed.data.token)).status,401);
 assert.equal((await invoke(handle,'published-sops','GET',undefined,signed.data.token)).status,401);
});
