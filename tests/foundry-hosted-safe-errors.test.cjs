'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('functions/foundry-hosted/core.mjs')).href);

test('unexpected hosted database errors are hidden from employee clients',async()=>{
 const {createHostedFoundryHandler}=await load();
 const handler=createHostedFoundryHandler({
  async getWorkspaceByCode(){throw new Error('secret SQL schema and query details')}
 });
 const response=await handler(new Request('https://gravityleadershipsystem.com/foundry-hosted/workspace/ABC234'));
 const data=await response.json();
 assert.equal(response.status,503);
 assert.equal(data.error,'Hosted employee service is temporarily unavailable. Please retry.');
 assert.doesNotMatch(JSON.stringify(data),/secret SQL schema|query details/i);
});

test('oversized hosted snapshots keep their specific safe validation message',async()=>{
 const {createHostedFoundryHandler}=await load();
 const oversized=Array.from({length:6},(_,i)=>({id:'sop-'+i,steps:'x'.repeat(900_000)}));
 const handler=createHostedFoundryHandler({});
 const body=JSON.stringify({employeePin:'1234',snapshot:{publishedSops:oversized}});
 const response=await handler(new Request('https://gravityleadershipsystem.com/foundry-hosted/manager/create',{
  method:'POST',headers:{'content-type':'application/json'},body
 }));
 const data=await response.json();
 assert.equal(response.status,413);
 assert.equal(data.error,'The employee snapshot is too large to sync in one request. Export or reduce oversized embedded images and try again.');
});
