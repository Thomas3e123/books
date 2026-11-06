'use strict';
/**
 * Disposable synthetic manager + employee workflow against the Netlify PR
 * preview database branch. NEVER production. Uses a newly created QA-only
 * workspace and never reads or changes any existing workspace.
 */
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const origin=process.env.GRAVITY_QA_PREVIEW_URL||'';
const url=new URL(origin);
if(url.protocol!=='https:'||url.hostname!=='6aee1a8fdba4fc908b3d4d5c--gravity-leadership-system.netlify.app')
  throw Error('Safety guard refused to contact anything except the approved immutable Netlify deploy preview.');
const qaId='QA-'+randomUUID().slice(0,8);
const restaurantName='SYNTHETIC QA RESTAURANT '+qaId+' — NOT A CUSTOMER';
const employeePin='714926';
const publishedSop={
  id:'qa-dish-station-'+qaId,title:'Synthetic Dish Sanitation',station:'Dish',category:'Cleaning',
  revision:'1.0',purpose:'Verify approved sanitation procedure.',role:'Assigned dishwasher',
  frequency:'Each shift',steps:['Check approved sanitizer','Wash dishware','Verify clean surface'],
  checks:'Confirm sanitizing step.',correction:'Stop and correct any failed sanitation check.',
  trainingRequirement:'review',status:'Published',
  managerPrivateNotes:'THIS MUST NEVER APPEAR IN EMPLOYEE RESPONSE'
};
const publishedRecipe={
  id:'qa-recipe-'+qaId,title:'Synthetic water service',type:'food',category:'Training',
  revision:'1.0',ingredients:['Water'],steps:['Fill clean glass'],
  allergens:'None',privateFoodCost:999,approvedBy:'QA tester',
  status:'Published'
};
const publishedPoster={
  id:'qa-poster-'+qaId,title:'Synthetic Handwashing Reminder',
  station:'Dish',category:'Safety',lines:'Wash hands',note:'QA only',
  status:'Active',managerInternalTag:'MUST NEVER LEAK'
};
const snapshot={restaurantName,branding:{name:restaurantName,logo:''},
  publishedSops:[publishedSop],publishedRecipes:[publishedRecipe],posters:[publishedPoster]};
let writeCalls=0;
async function api(path,{method='GET',body,token,expected=200}={}){
  const dest=new URL('/foundry-hosted/'+path,url);
  if(dest.hostname!==url.hostname)throw Error('Cross-domain test blocked');
  const init={method,redirect:'manual',signal:AbortSignal.timeout(20000),
    headers:{accept:'application/json','content-type':'application/json'}};
  if(token)init.headers.authorization='Bearer '+token;
  if(method!=='GET'){
    writeCalls++;
    if(!['manager/create','manager/sync','login','activity','messages','training'].includes(path))
      throw Error('Unexpected write destination '+path);
    init.body=JSON.stringify(body||{});
  }
  const response=await fetch(dest,init);
  assert.equal(response.status,expected,'Unexpected '+path+' HTTP '+response.status);
  const out=await response.json();assert.ok(out&&typeof out==='object');
  if(expected>=200&&expected<300)assert.notEqual(out.ok,false,path+' returned failure');
  return out;
}
(async()=>{
  // This creates a QA workspace ONLY on the preview's DB branch.
  const created=await api('manager/create',{method:'POST',expected:201,
    body:{employeePin,snapshot}});
  assert.match(created.workspaceCode,/^[A-Z0-9]{6}$/);
  assert.ok(created.managerKey&&created.managerKey.length>=20);
  const managerKey=created.managerKey,code=created.workspaceCode;
  const publicWorkspace=await api('workspace/'+code);
  assert.equal(publicWorkspace.restaurantName,restaurantName);
  const status=await api('manager/status',{token:managerKey});
  assert.equal(status.counts.activity,0);assert.equal(status.counts.messages,0);
  const denied=await api('login',{method:'POST',expected:401,body:{code,pin:'111111'}});
  assert.equal(denied.ok,undefined);
  const login=await api('login',{method:'POST',body:{code,pin:employeePin}});
  assert.ok(login.token&&login.token.length>=20);
  const employeeToken=login.token;
  assert.equal((await api('session',{token:employeeToken})).workspaceCode,code);
  const sops=await api('published-sops',{token:employeeToken});
  assert.equal(sops.data.sops.length,1);
  assert.equal(sops.data.sops[0].id,publishedSop.id);
  assert.equal(sops.data.sops[0].managerPrivateNotes,undefined);
  const recipes=await api('staff-recipes',{token:employeeToken});
  assert.equal(recipes.recipes.length,1);
  assert.equal(recipes.recipes[0].privateFoodCost,undefined);
  const posters=await api('published-posters',{token:employeeToken});
  assert.equal(posters.posters.length,1);
  assert.equal(posters.posters[0].managerInternalTag,undefined);
  await api('manager/status',{token:employeeToken,expected:401});
  await api('published-sops',{token:managerKey,expected:401});
  const activity=await api('activity',{method:'POST',token:employeeToken,
    body:{kind:'sop_view',sourceKind:'sop',sourceId:publishedSop.id,name:'Synthetic QA'}});
  assert.ok(activity.id);
  const message=await api('messages',{method:'POST',token:employeeToken,expected:201,
    body:{kind:'question',sourceId:publishedSop.id,name:'Synthetic QA',text:'Is this QA SOP visible?'}});
  assert.equal(message.message.text,'Is this QA SOP visible?');
  const quiz=await api('training?id='+encodeURIComponent(publishedSop.id),{token:employeeToken});
  assert.equal(quiz.questions.length,5);
  const answers={purpose:publishedSop.purpose,role:publishedSop.role,
    'first-step':publishedSop.steps[0],standard:publishedSop.checks,mistake:publishedSop.correction};
  const training=await api('training',{method:'POST',token:employeeToken,
    body:{sopId:publishedSop.id,revision:publishedSop.revision,name:'Synthetic QA',
      acknowledge:true,answers}});
  assert.equal(training.record.score,100);
  assert.equal(training.record.identityVerified,false);
  const after=await api('manager/status',{token:managerKey});
  assert.equal(after.counts.activity,1);
  assert.equal(after.counts.messages,1);
  assert.equal(after.counts.training,1);
  for(const [stream,want] of [['activity',activity.id],['messages',message.message.id],['training',training.record.id]]){
    const data=await api('manager/events?stream='+stream+'&since=1970-01-01T00%3A00%3A00.000Z',
      {token:managerKey});
    assert.equal(data.records.length,1);
    assert.equal(data.records[0].id,want);
    assert.equal(data.hasMore,false);
  }
  const synced=await api('manager/sync',{method:'POST',token:managerKey,body:{snapshot}});
  assert.equal(synced.workspaceCode,code);
  console.log('GRAVITY_PREVIEW_SYNTHETIC_AUTH_PASS '+JSON.stringify({
    preview:true,realHostedDatabase:true,uniqueSyntheticRestaurant:true,
    registrationOrPaymentWrites:0,syntheticEmployeeLogin:true,privateFieldsHidden:true,
    managerAuthorization:true,trainingScore:training.record.score,
    employeeEventsVerified:3,managerSync:true,writeCalls,
    productionDatabaseWrites:0,existingWorkspaceReads:0
  }));
})().catch(e=>{console.error('GRAVITY_PREVIEW_SYNTHETIC_AUTH_FAIL',e.stack||e);process.exitCode=1});
