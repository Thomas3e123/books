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
  await repo.createWorkspace(account('workspace-one','QAONE1','fake-key-one'));
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
  console.log('GRAVITY_POSTGRES_ISOLATED_QA_PASS '+JSON.stringify({records:total,streams:3,
    equalTimestamps:true,crossRestaurantIsolation:true,legacyTruncationReproduced:true,realPostgres:true,customerData:0}));
}finally{
  if(started)await client.query('ROLLBACK').catch(()=>{});
  await client.end();
}
})().catch(e=>{console.error('GRAVITY_POSTGRES_ISOLATED_QA_FAIL',e);process.exitCode=1});
