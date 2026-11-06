'use strict';
// Offline tests exercising the ACTUAL staging repository's pagination method and
// browser bridge. Synthetic records only. No Netlify database or network used.
const {test}=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sqlSource=fs.readFileSync('functions/foundry-hosted/index.mjs','utf8');
const browserSource=fs.readFileSync('site/apps/sop-foundry/hosted-bridge.js','utf8');
const first=sqlSource.indexOf('  async listEventPage('),last=sqlSource.indexOf('  async countEvents(',first);
if(first<0||last<first)throw Error('Could not identify the actual database pagination method');
const paginationMethod=sqlSource.slice(first,last);
function makeRecords(){const stamp='2026-11-01T12:00:00.000Z',out={};
  for(const [name,count,letter] of [['activity',6001,'a'],['messages',2001,'m'],['training',2001,'t']]){
    out[name]=Array.from({length:count},(_,i)=>({id:letter+String(i).padStart(5,'0'),createdAt:stamp,workspace:'one'}));
  }
  out.activity.push({id:'outside-tenant',createdAt:stamp,workspace:'two'});
  return out;
}
function makeRepo(records){
  const db={sql:async (literals,...values)=>{
    const query=literals.join('?');
    const stream=query.includes('gravity_foundry_activity')?'activity':query.includes('gravity_foundry_messages')?'messages':'training';
    const [workspace,since,until,at,id,limit]=values;
    return records[stream].filter(r=>r.workspace===workspace
      && Date.parse(r.createdAt)>Date.parse(since)&&Date.parse(r.createdAt)<=Date.parse(until)
      && (Date.parse(r.createdAt)>Date.parse(at)||(Date.parse(r.createdAt)===Date.parse(at)&&r.id>id)))
      .sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)||a.id.localeCompare(b.id))
      .slice(0,limit).map(r=>({data:{...r},event_time:r.createdAt,event_id:r.id}));
  }};
  return new Function('db','return ({db,'+paginationMethod+'});')(db);
}
function fakeLocal(initial={}){const values=new Map(Object.entries(initial));return {
  getItem:k=>values.has(k)?values.get(k):null,
  setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),
  key:i=>[...values.keys()][i]||null,get length(){return values.size}
}}
function makeBrowser({records=makeRecords(),failSave=false,mutateFetch}={}){
  const repo=makeRepo(records),storage=fakeLocal({
    gravityFoundryHostedManagerV1:JSON.stringify({workspaceCode:'FOUNDRY1',managerKey:'test-manager-key'})
  });
  let state={activity:[],messages:[],training:[]},failNextSave=failSave,totalPages=0;
  const browser={
    location:{pathname:'/apps/sop-foundry/employee-connection.html',search:'',href:'https://example.test/apps/sop-foundry/employee-connection.html'},
    document:{getElementById:()=>({textContent:''})},
    localStorage:storage,URL,URLSearchParams,Headers,Date,setTimeout,clearTimeout,
  };
  const originalFetch=async input=>{
    const url=new URL(input,'https://example.test/');
    assert.equal(url.pathname,'/foundry-hosted/manager/events');
    const q=url.searchParams,stream=q.get('stream');
    assert.ok(['activity','messages','training'].includes(stream));
    totalPages++;
    const until=q.get('until')||new Date().toISOString();
    const page=await repo.listEventPage('one',{
      stream,since:q.get('since'),until,afterAt:q.get('afterAt'),afterId:q.get('afterId'),limit:500
    });
    if(mutateFetch)mutateFetch({stream,storage,totalPages,page});
    return {ok:true,json:async()=>({ok:true,stream,until,serverTime:until,...page})};
  };
  browser.window={
    fetch:originalFetch,
    GravityFoundryWeb:{
      load:async()=>JSON.parse(JSON.stringify(state)),
      save:async next=>{
        if(failNextSave){failNextSave=false;throw Error('simulated IndexedDB write failure');}
        state=JSON.parse(JSON.stringify(next));return next;
      }
    }
  };
  vm.runInNewContext(browserSource,browser,{timeout:2500});
  return{...browser,records,
    pull:()=>browser.window.GravityFoundryHosted.pull(),
    getState:()=>JSON.parse(JSON.stringify(state)),
    checkpoint:()=>JSON.parse(storage.getItem('gravityFoundryHostedManagerV1')),
    getPages:()=>totalPages
  };
}
test('database pages all 10,003 records without dropping equal-timestamp IDs',async()=>{
  const records=makeRecords(),repo=makeRepo(records);
  let sum=0;
  for(const [stream,want] of [['activity',6001],['messages',2001],['training',2001]]){
    let cursor=null,ids=[];
    for(let i=0;i<100;i++){
      const page=await repo.listEventPage('one',{stream,since:'1970-01-01T00:00:00.000Z',
        until:'2026-11-06T12:00:00.000Z',afterAt:cursor?.at,afterId:cursor?.id,limit:500});
      assert.ok(page.records.length<=500);
      ids.push(...page.records.map(x=>x.id));
      if(!page.hasMore)break;
      cursor=page.nextCursor;assert.ok(cursor?.at&&cursor?.id);
    }
    assert.equal(ids.length,want,stream);
    assert.equal(new Set(ids).size,want,stream+' IDs duplicated');
    sum+=ids.length;
  }
  assert.equal(sum,10003);
  const other=await repo.listEventPage('two',{stream:'activity',since:'1970-01-01T00:00:00.000Z',
    until:'2026-11-06T12:00:00.000Z',limit:500});
  assert.deepEqual(other.records.map(x=>x.id),['outside-tenant']);
});
test('browser pulls complete history, persists every page, and avoids duplicates',async()=>{
  const x=makeBrowser(),one=await x.pull(),saved=x.getState();
  assert.equal(one.added,10003);
  assert.equal(saved.activity.length,6001);
  assert.equal(saved.messages.length,2001);
  assert.equal(saved.training.length,2001);
  assert.equal(new Set(saved.activity.map(x=>x.id)).size,6001);
  assert.ok(x.checkpoint().lastPullV2.activity);
  assert.ok(x.checkpoint().lastPullV2.messages);
  assert.ok(x.checkpoint().lastPullV2.training);
  const again=await x.pull();
  assert.equal(again.added,0);
  assert.equal(x.getState().activity.length,6001);
});
test('failed storage write does not advance cursor; retry recovers complete history',async()=>{
  const x=makeBrowser({failSave:true});
  await assert.rejects(x.pull(),/simulated IndexedDB write failure/);
  assert.ok(!x.checkpoint().lastPullV2?.activity);
  assert.equal(x.getState().activity.length,0);
  const retried=await x.pull();
  assert.equal(retried.added,10003);
  assert.equal(x.getState().training.length,2001);
});
test('changing manager connection interrupts import before any unsafe checkpoint',async()=>{
  const x=makeBrowser({mutateFetch:({totalPages,storage})=>{
    if(totalPages===1)storage.setItem('gravityFoundryHostedManagerV1',JSON.stringify({
      workspaceCode:'DIFFERENT',managerKey:'different-key'
    }));
  }});
  await assert.rejects(x.pull(),/manager connection changed/);
  assert.ok(!x.checkpoint().lastPullV2);
  assert.equal(x.getState().activity.length,0);
});
