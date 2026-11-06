'use strict';
/** Real PostgreSQL QA using a temporary local GitHub Actions service, not Netlify's database. */
const fs=require('node:fs'), assert=require('node:assert/strict'), {Client}=require('pg');
const connection=process.env.GRAVITY_QA_LOCAL_POSTGRES_URL||'';
if(!/^postgres(?:ql)?:\/\/gravityqa:gravityqa@(?:127\.0\.0\.1|localhost):5432\/gravityqa$/.test(connection))
  throw Error('Safety: only the explicitly named local Gravity QA PostgreSQL is permitted.');
const source=fs.readFileSync('functions/foundry-hosted/index.mjs','utf8');
const start=source.indexOf('class PostgresRepo {'),end=source.indexOf('\nconst handler=',start);
if(start<0||end<start)throw Error('Could not find actual PostgresRepo class');
const RepoSource=source.slice(start,end);
const migration=fs.readFileSync('netlify/database/migrations/20261010070000_foundry_hosted_employee.sql','utf8');
(async()=>{
const client=new Client({connectionString:connection});await client.connect();let started=false;
try{
  await client.query('BEGIN');started=true;
  await client.query('CREATE SCHEMA gravity_isolated_review');
  await client.query('SET search_path TO gravity_isolated_review,public');
  await client.query(migration);
  const db={sql:async(parts,...values)=>{
    if(!Array.isArray(parts)||!Object.prototype.hasOwnProperty.call(parts,'raw'))
      throw Error('Expected actual parameterized tagged SQL');
    const query=parts.map((part,i)=>part+(i<values.length?'$'+(i+1):'')).join('');
    return (await client.query(query,values)).rows;
  }};
  const PostgresRepo=(new Function('getDatabase',RepoSource+';return PostgresRepo;'))(()=>db);
  const repo=new PostgresRepo();
  const account=(id,code,hash)=>({id,code,manager_key_hash:hash,restaurant_name:'Synthetic '+code,
    employee_pin_salt:'synthetic-only',employee_pin_hash:'synthetic-only',snapshot:{restaurantName:'Synthetic '+code}});
  const {createHash}=require('node:crypto');
  const tokenHash=value=>createHash('sha256').update(value).digest('hex');
  const managerToken='QA-fake-manager-token-never-used-outside-CI';
  await repo.createWorkspace(account('workspace-one','QAONE1',tokenHash(managerToken)));
  await repo.createWorkspace(account('workspace-two','QATWO2','fake-key-two'));
  assert.equal((await repo.getWorkspaceByCode('QAONE1')).id,'workspace-one');
  const timestamp='2026-11-01T12:00:00.000Z',since='1970-01-01T00:00:00.000Z',until='2026-11-06T12:00:00.000Z';
  const streams=[['activity','gravity_foundry_activity',6001,'a'],['messages','gravity_foundry_messages',2001,'m'],['training','gravity_foundry_training',2001,'t']];
  let total=0;
  for(const [stream,table,count,prefix] of streams){
    // Table names are controlled constants from the test source, never user input.
    const sql='INSERT INTO '+table+'(id,workspace_id,data,created_at) SELECT $1 || lpad(n::text,5,\'0\'),$2, jsonb_build_object(\'id\',$1 || lpad(n::text,5,\'0\'),\'source\',\'qa\'),$3::timestamptz FROM generate_series(1,$4::int) n';
    await client.query(sql,[prefix,'workspace-one',timestamp,count]);
    const otherSql='INSERT INTO '+table+'(id,workspace_id,data,created_at) VALUES($1,$2,$3::jsonb,$4::timestamptz)';
    await client.query(otherSql,['outside-'+prefix,'workspace-two',JSON.stringify({id:'outside-'+prefix,source:'other-restaurant'}),timestamp]);
  }
  for(const [stream,,count,prefix] of streams){
    const ids=new Set();let cursor=null,pages=0;
    while(true){
      const page=await repo.listEventPage('workspace-one',{stream,since,until,
        afterAt:cursor?.at,afterId:cursor?.id,limit:500});
      assert.ok(page.records.length<=500);
      for(const event of page.records){
        assert.ok(!ids.has(event.id),'duplicate '+event.id);
        assert.ok(!event.id.startsWith('outside-'),'cross-workspace leak');
        ids.add(event.id);
      }
      pages++;if(!page.hasMore)break;
      assert.ok(page.nextCursor?.at&&page.nextCursor?.id,'missing cursor');
      cursor=page.nextCursor;
      assert.ok(pages<40,'pagination never finished');
    }
    assert.equal(ids.size,count,stream+' lost records');
    const other=await repo.listEventPage('workspace-two',{stream,since,until,limit:500});
    assert.deepEqual(other.records.map(x=>x.id),['outside-'+prefix]);
    const none=await repo.listEventPage('nonexistent',{stream,since,until,limit:500});
    assert.equal(none.records.length,0);
    console.log(stream+': '+count+' actual Postgres records across '+pages+' pages; tenant isolated');
    total+=count;
  }
  const counts=await repo.countEvents('workspace-one');
  assert.equal(counts.activity,6001);assert.equal(counts.messages,2001);assert.equal(counts.training,2001);
  const legacy=await repo.listEvents('workspace-one',since);
  assert.equal(legacy.activity.length,5000);assert.equal(legacy.messages.length,2000);assert.equal(legacy.training.length,2000);
  assert.equal(total,10003);
  // Execute the actual handler (not a mock route map) against the local
  // PostgreSQL repository and verify manager/employee authorization end to end.
  const {createHostedFoundryHandler}=await import(require('node:url').pathToFileURL(
    require('node:path').resolve('functions/foundry-hosted/core.mjs')).href);
  const handler=createHostedFoundryHandler(repo);
  const staffToken='QA-fake-employee-token-never-used-outside-CI';
  const otherStaff='QA-fake-other-staff-token';
  await repo.createSession({token_hash:tokenHash(staffToken),workspace_id:'workspace-one',
    role:'staff',expires_at:new Date(Date.now()+3600000).toISOString()});
  await repo.createSession({token_hash:tokenHash(otherStaff),workspace_id:'workspace-two',
    role:'staff',expires_at:new Date(Date.now()+3600000).toISOString()});
  await repo.updateWorkspace('workspace-one',{snapshot:{
    restaurantName:'QA one',publishedSops:[{id:'qa-sop-a',title:'Sanitize sink',station:'Dish',
      steps:['Wash and sanitize'],managerPrivateNotes:'HIDDEN_MANAGEMENT_ONLY'}],
    publishedRecipes:[],posters:[] }});
  await repo.updateWorkspace('workspace-two',{snapshot:{restaurantName:'QA two',
    publishedSops:[{id:'qa-sop-b',title:'Other restaurant',steps:['Not cross visible']}],
    publishedRecipes:[],posters:[] }});
  const request=async(endpoint,token)=>handler(new Request(
    'https://test.invalid/foundry-hosted/'+endpoint,{
      method:'GET',headers:token?{Authorization:'Bearer '+token}:{}
    }));
  for(const route of ['manager/events?stream=activity&since=1970-01-01T00%3A00%3A00.000Z',
    'manager/status','published-sops','staff-recipes','published-posters']){
    const res=await request(route);assert.equal(res.status,401,'Anonymous access leaked '+route);
  }
  const fakeManager=await request('manager/events?stream=activity&since=1970-01-01T00%3A00%3A00.000Z',staffToken);
  assert.equal(fakeManager.status,401,'Staff accessed manager activity');
  const managerResponse=await request('manager/events?stream=activity&since=1970-01-01T00%3A00%3A00.000Z',managerToken);
  assert.equal(managerResponse.status,200);
  const managerBody=await managerResponse.json();
  assert.equal(managerBody.records.length,500);assert.equal(managerBody.hasMore,true);
  assert.ok(managerBody.nextCursor?.at&&managerBody.nextCursor?.id);
  const statusResponse=await request('manager/status',managerToken);
  assert.equal(statusResponse.status,200);
  assert.equal((await statusResponse.json()).counts.training,2001);
  const staffResponse=await request('published-sops',staffToken);
  assert.equal(staffResponse.status,200);
  const staffBody=await staffResponse.json();
  assert.deepEqual(staffBody.data.sops.map(x=>x.id),['qa-sop-a']);
  assert.equal(staffBody.data.sops[0].managerPrivateNotes,undefined,'Manager notes leaked to employee');
  const otherResponse=await request('published-sops',otherStaff);
  assert.equal(otherResponse.status,200);
  assert.deepEqual((await otherResponse.json()).data.sops.map(x=>x.id),['qa-sop-b']);
  console.log('GRAVITY_FOUNDRY_POSTGRES_HANDLER_QA_PASS '+JSON.stringify({
    routeAuthorization:true,employeeManagerSeparation:true,publishedPrivacy:true,
    twoRestaurantsIsolated:true,managerEventPage:500,syntheticRecordsOnly:true}));
  console.log('GRAVITY_POSTGRES_ISOLATED_QA_PASS '+JSON.stringify({records:total,streams:3,
    equalTimestamps:true,crossRestaurantIsolation:true,legacyTruncationReproduced:true,realPostgres:true,customerData:0}));
}finally{
  if(started)await client.query('ROLLBACK').catch(()=>{});
  await client.end();
}
})().catch(e=>{console.error('GRAVITY_POSTGRES_ISOLATED_QA_FAIL',e);process.exitCode=1});
