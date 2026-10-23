'use strict';
// Offline test only: fake restaurant records held in memory. Never contacts production.
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
class FakeRepo {
  constructor(){this.workspaces=new Map();this.sessions=new Map();this.events=new Map();this.messages=new Map();this.training=new Map()}
  async getWorkspaceByCode(code){return this.workspaces.get(code)||null}
  async getWorkspaceByManagerHash(hash){return [...this.workspaces.values()].find(w=>w.manager_key_hash===hash)||null}
  async createWorkspace(w){this.workspaces.set(w.code,{...w,updated_at:new Date().toISOString()})}
  async updateWorkspace(id,patch){let w=[...this.workspaces.values()].find(x=>x.id===id);if(!w)throw Error('Missing fake workspace');Object.assign(w,patch,{updated_at:new Date().toISOString()})}
  async createSession(x){this.sessions.set(x.token_hash,x)}
  async getSession(hash){const s=this.sessions.get(hash);if(!s)return null;const w=[...this.workspaces.values()].find(x=>x.id===s.workspace_id);return w?{...w,role:s.role,expires_at:s.expires_at}:null}
  async insertActivity(id,x){this.collection(this.events,id).push(x)}
  async insertMessage(id,x){this.collection(this.messages,id).push(x)}
  async insertTraining(id,x){this.collection(this.training,id).push(x)}
  collection(map,id){if(!map.has(id))map.set(id,[]);return map.get(id)}
  async listEvents(id){return {activity:this.collection(this.events,id),messages:this.collection(this.messages,id),training:this.collection(this.training,id)}}
  async countEvents(id){return {activity:this.collection(this.events,id).length,messages:this.collection(this.messages,id).length,training:this.collection(this.training,id).length}}
}
(async()=>{
 const {createHostedFoundryHandler,testHelpers}=await import(path.resolve(__dirname,'..','functions/foundry-hosted/core.mjs'));
 const db=new FakeRepo(),app=createHostedFoundryHandler(db);let tests=0;
 const req=async(method,endpoint,body,token)=>{
  const opts={method,headers:{'content-type':'application/json'}};
  if(token)opts.headers.authorization='Bearer '+token;
  if(body!==undefined)opts.body=JSON.stringify(body);
  const result=await app(new Request('https://gravity-leadership-system.netlify.app/foundry-hosted/'+endpoint,opts));
  return {status:result.status,body:await result.json()};
 };
 function check(condition,message){assert.ok(condition,message);tests++}
 let r=await req('GET','health');check(r.status===200&&r.body.ok,'health route');
 r=await req('POST','manager/create',{employeePin:'0000',snapshot:{restaurantName:'Demo Only'}});
 check(r.status===400,'default PIN not accepted');
 const sop={id:'demo-1',title:'Pizza station',revision:'2',purpose:'Prepare a consistent pizza',role:'Station employee',steps:['Sanitize prep area','Verify ingredients'],checks:'Check temperature',correction:'Remake failed pizza',trainingRequirement:'review'};
 const snapshot={restaurantName:'First Example Restaurant',publishedSops:[sop],publishedRecipes:[{id:'recipe-1',title:'Sauce'}],posters:[{id:'poster-1',status:'Active'},{id:'poster-2',status:'Draft'}]};
 r=await req('POST','manager/create',{employeePin:'4826',snapshot});
 check(r.status===201&&r.body.workspaceCode?.length===6&&r.body.managerKey,'create first workspace');
 const code=r.body.workspaceCode,managerKey=r.body.managerKey;
 const w=await req('GET','workspace/'+code);
 check(w.status===200&&w.body.restaurantName===snapshot.restaurantName&&!w.body.snapshot,'public workspace lookup exposes name only');
 const bad=await req('POST','login',{code,pin:'1234'});
 check(bad.status===401,'incorrect staff PIN denied');
 const login=await req('POST','login',{code,pin:'4826'});
 check(login.status===200&&login.body.token,'correct staff PIN accepted');
 const token=login.body.token;
 const unauth=await req('GET','published-sops');
 check(unauth.status===401,'staff-only content denied without login');
 const live=await req('GET','published-sops',undefined,token);
 check(live.status===200&&live.body.canBuild===false&&live.body.data.sops.length===1&&!JSON.stringify(live.body).includes('manager_key_hash'),'read-only staff SOP');
 const posters=await req('GET','published-posters',undefined,token);
 check(posters.status===200&&posters.body.posters.length===1,'only active posters published');
 const staffManager=await req('GET','manager/events',undefined,token);
 check(staffManager.status===401,'staff token cannot access manager events');
 const questions=await req('GET','training?id=demo-1',undefined,token);
 check(questions.status===200&&questions.body.questions.length===5&&!JSON.stringify(questions.body).includes('"correct":'),'staff quiz hides answer key');
 const answers={};for(const item of testHelpers.buildQuiz(sop))answers[item.id]=item.correct;
 const train=await req('POST','training',{sopId:'demo-1',revision:'2',name:'Example Employee',acknowledge:true,answers},token);
 check(train.status===200&&train.body.record.passed===true,'training recorded with current revision');
 const wrong=await req('POST','training',{sopId:'demo-1',revision:'1',name:'Example Employee',acknowledge:true,answers},token);
 check(wrong.status===409,'outdated revision refused');
 const message=await req('POST','messages',{requestId:crypto.randomUUID(),text:'Is this the right step?',kind:'question'},token);
 check(message.status===201,'employee question creates manager-only record');
 const events=await req('GET','manager/events',undefined,managerKey);
 check(events.status===200&&events.body.training.length===1&&events.body.messages.length===1,'manager can read staff records');
 const status=await req('GET','manager/status',undefined,managerKey);
 check(status.status===200&&status.body.counts.training===1,'manager status preserves training count');
 const second=await req('POST','manager/create',{employeePin:'6381',snapshot:{restaurantName:'Second Example Restaurant',publishedSops:[]}});
 check(second.status===201&&second.body.workspaceCode!==code,'separate restaurant workspaces');
 const crossManager=await req('GET','manager/events',undefined,managerKey);
 check(crossManager.status===200&&crossManager.body.training.length===1,'original manager retains first restaurant records');
 const secondStaffLogin=await req('POST','login',{code:second.body.workspaceCode,pin:'6381'});
 check(secondStaffLogin.status===200&&secondStaffLogin.body.token,'second restaurant staff can authenticate independently');
 const originalWithSecondStaff=await req('GET','published-sops',undefined,secondStaffLogin.body.token);
 check(originalWithSecondStaff.status===200&&originalWithSecondStaff.body.data.restaurant==='Second Example Restaurant'&&originalWithSecondStaff.body.data.sops.length===0,'second staff token cannot read first restaurant content');
 const managerAsStaff=await req('GET','published-sops',undefined,managerKey);
 check(managerAsStaff.status===401,'manager credential is not an employee session');
 const staffAsManager=await req('POST','manager/sync',{snapshot},token);
 check(staffAsManager.status===401,'staff session cannot modify published manager snapshot');
 const secondEvents=await req('GET','manager/events',undefined,second.body.managerKey);
 check(secondEvents.status===200&&secondEvents.body.training.length===0&&secondEvents.body.messages.length===0,'restaurant data isolated');
 const otherSops=await req('GET','published-sops',undefined,(await req('POST','login',{code:second.body.workspaceCode,pin:'6381'})).body.token);
 check(otherSops.status===200&&otherSops.body.data.sops.length===0,'separate staff scope');
 const badSync=await req('POST','manager/sync',{employeePin:'0000',snapshot},managerKey);
 check(badSync.status===400,'manager cannot revert PIN to default');
 const newSnapshot={...snapshot,publishedSops:[{...sop,revision:'3'}]};
 const sync=await req('POST','manager/sync',{employeePin:'4826',snapshot:newSnapshot},managerKey);
 check(sync.status===200,'manager can synchronize revision');
 const after=await req('GET','published-sops',undefined,token);
 check(after.status===200&&after.body.data.sops[0].revision==='3','updated published SOP reaches connected employee');
 console.log('GRAVITY_FOUNDRY_ISOLATION_PASS '+JSON.stringify({tests,realCustomerRecords:0,publicRequests:0,formSubmissions:0,noDeploy:true,restaurants:2}));
})().catch(error=>{console.error('GRAVITY_FOUNDRY_ISOLATION_FAILED',error.stack);process.exitCode=1});
