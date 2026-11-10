'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

function extractClass(file,marker,endMarker){
 const src=fs.readFileSync(file,'utf8');
 const start=src.indexOf(marker),end=src.indexOf(endMarker,start);
 if(start<0||end<start)throw Error('Could not locate source DB adapter '+file);
 return src.slice(start,end).trim();
}
const createDb=()=>{
 const queries=[];
 const sql=async(strings,...values)=>{queries.push({query:strings.join('?'),values});return []};
 return {queries,getDatabase:()=>({sql})};
};
const customerClass=extractClass('functions/gravity-cloud-backup/index.mjs','class GravityEncryptedBackupStore','const authenticatedHandler=');
const foundryClass=extractClass('functions/foundry-hosted/index.mjs','class PostgresRepo','const handler=');

test('Every customer backup SQL operation scopes data to the authenticated Identity user',async()=>{
 const db=createDb();
 const Store=new Function('getDatabase','return ('+customerClass+');')(db.getDatabase);
 const store=new Store(),uid='synthetic-identity-A',tool='shift';
 await store.latest(uid,tool);
 await store.status(uid);
 await store.history(uid,tool,5);
 await store.read(uid,tool,null);
 await store.read(uid,tool,1);
 await assert.rejects(store.insert(uid,tool,1,{version:1},123),/Cannot read properties of undefined/);
 await store.prune(uid,tool,5);
 await store.deleteAll(uid,tool);
 assert.ok(db.queries.length>=8);
 for(const item of db.queries){
  assert.match(item.query,/gravity_customer_backup_snapshots/);
  assert.match(item.query,/identity_user_id/,'Each backup DB query must filter or insert account identity');
  assert.ok(item.values.includes(uid),'DB query lacks authenticated Identity user argument: '+item.query);
 }
 const readWithRevision=db.queries.find(x=>/AND revision=/.test(x.query));
 assert.ok(readWithRevision);
 assert.ok(readWithRevision.values.includes(1));
});

test('Hosted Foundry resolves sessions through their own workspace rather than client-supplied restaurant',async()=>{
 const db=createDb();
 const Repo=new Function('getDatabase','return ('+foundryClass+');')(db.getDatabase);
 const repo=new Repo();
 assert.equal(await repo.getWorkspaceByCode('SYNTHA'),null);
 assert.equal(await repo.getWorkspaceByManagerHash('synthetic-manager-hash'),null);
 assert.equal(await repo.getSession('synthetic-session-hash'),null);
 assert.equal(db.queries.length,3);
 const [byCode,byManager,session]=db.queries;
 assert.match(byCode.query,/WHERE code=/);
 assert.ok(byCode.values.includes('SYNTHA'));
 assert.match(byManager.query,/WHERE manager_key_hash=/);
 assert.ok(byManager.values.includes('synthetic-manager-hash'));
 assert.match(session.query,/JOIN gravity_foundry_workspaces w ON w.id=s.workspace_id/);
 assert.match(session.query,/WHERE s.token_hash=/);
 assert.ok(session.values.includes('synthetic-session-hash'));
 assert.doesNotMatch(session.query,/WHERE w.code=/);
});
