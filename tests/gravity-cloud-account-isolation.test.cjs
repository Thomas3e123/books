'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

const load=()=>import(pathToFileURL(path.resolve('functions/gravity-cloud-backup/core.mjs')).href);
const origin='https://gravityleadershipsystem.com';
const encrypted=()=>({version:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:310000,salt:'A'.repeat(24),iv:'B'.repeat(16),ciphertext:'C'.repeat(64)});
const request=(method,tail,body,headers={})=>new Request(origin+'/gravity-cloud-backup/'+tail,{method,headers:{...(method!=='GET'?{'content-type':'application/json',origin}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});

function fakeStore(){
 const values=new Map();
 const key=(uid,tool)=>uid+':'+tool;
 return {
  values,
  async latest(uid,tool){const all=values.get(key(uid,tool))||[];return all.length?all.at(-1):null},
  async status(uid){return [...values.entries()].filter(([k])=>k.startsWith(uid+':')).map(([k,rows])=>({tool:k.split(':')[1],revision:rows.at(-1).revision,createdAt:rows.at(-1).createdAt}))},
  async history(uid,tool,limit){return (values.get(key(uid,tool))||[]).slice(-limit).reverse().map(({revision,createdAt})=>({revision,createdAt}))},
  async read(uid,tool,revision){const all=values.get(key(uid,tool))||[];return revision===null?all.at(-1)||null:all.find(x=>x.revision===revision)||null},
  async insert(uid,tool,revision,envelope,size){
   const all=values.get(key(uid,tool))||[];
   if(all.some(x=>x.revision===revision)){const error=new Error('unique revision');error.code='23505';throw error}
   const record={revision,envelope,size,createdAt:new Date(Date.now()-30000).toISOString()};
   all.push(record);values.set(key(uid,tool),all);
   return record;
  },
  async prune(uid,tool,keep){const all=values.get(key(uid,tool))||[];values.set(key(uid,tool),all.slice(-keep))},
  async deleteAll(uid,tool){const all=values.get(key(uid,tool))||[];values.delete(key(uid,tool));return all.length}
 };
}
function client(handle,getActor){return async(method,tail,body,headers={})=>{const response=await handle(request(method,tail,body,headers));return {status:response.status,body:await response.json()}}}

test('Customer A and B have separate encrypted backups, history, status, and deletion scopes',async()=>{
 const {createCloudBackupHandler}=await load(),store=fakeStore();
 let actor={id:'synthetic-account-A',email:'a@example.invalid'};
 const handle=createCloudBackupHandler({getIdentityUser:async()=>actor,store});
 const call=client(handle);
 const a1=await call('PUT','shift',{baseRevision:0,envelope:encrypted(),identity_user_id:'synthetic-account-B'});
 assert.equal(a1.status,201);
 assert.equal(a1.body.revision,1);
 const aInv=await call('PUT','inventory',{baseRevision:0,envelope:encrypted()});
 assert.equal(aInv.status,201);
 let status=await call('GET','status');assert.equal(status.status,200);
 assert.equal(status.body.account.id,'synthetic-account-A');
 assert.equal(status.body.tools.length,2);
 actor={id:'synthetic-account-B',email:'b@example.invalid'};
 let bRead=await call('GET','shift?revision=1');
 assert.equal(bRead.status,404,'A known revision must not expose account A data');
 let bHist=await call('GET','shift?history=1');assert.deepEqual(bHist.body.versions,[]);
 let bStatus=await call('GET','status');assert.deepEqual(bStatus.body.tools,[]);
 const b1=await call('PUT','shift',{baseRevision:0,envelope:{...encrypted(),ciphertext:'D'.repeat(64)}});
 assert.equal(b1.status,201);
 let bCurrent=await call('GET','shift');assert.equal(bCurrent.body.envelope.ciphertext,'D'.repeat(64));
 let bGone=await call('DELETE','shift',{confirmation:'DELETE MY CLOUD BACKUPS'});
 assert.equal(bGone.status,200);assert.equal(bGone.body.deleted,1);
 actor={id:'synthetic-account-A',email:'a@example.invalid'};
 const aStill=await call('GET','shift');assert.equal(aStill.body.envelope.ciphertext,'C'.repeat(64));
 assert.equal((await call('GET','inventory')).status,200);
 assert.equal(store.values.has('synthetic-account-B:shift'),false);
 const removeA=await call('DELETE','shift',{confirmation:'DELETE MY CLOUD BACKUPS'});
 assert.equal(removeA.body.deleted,1);
 assert.equal((await call('GET','shift')).status,404);
 assert.equal((await call('GET','inventory')).status,200,'Deleting shift must not delete inventory');
});

test('Backup API denies absent account, cross-origin writes, unsafe deletions, and invalid tools',async()=>{
 const {createCloudBackupHandler}=await load(),store=fakeStore();
 let actor=null;
 const call=client(createCloudBackupHandler({getIdentityUser:async()=>actor,store}));
 assert.equal((await call('GET','status')).status,401);
 assert.equal((await call('PUT','shift',{baseRevision:0,envelope:encrypted()})).status,401);
 actor={id:'synthetic-account-A'};
 assert.equal((await call('PUT','shift',{baseRevision:0,envelope:encrypted()},{origin:'https://untrusted.example'})).status,403);
 assert.equal((await call('PUT','shift',{baseRevision:0,envelope:encrypted()},{origin:''})).status,403);
 assert.equal((await call('PUT','arbitrary',{baseRevision:0,envelope:encrypted()})).status,404);
 assert.equal((await call('DELETE','shift',{confirmation:'delete them'})).status,400);
 assert.equal(store.values.size,0);
});

test('Conflicting revisions, invalid envelopes and oversized payloads leave prior ciphertext unchanged',async()=>{
 const {createCloudBackupHandler}=await load(),store=fakeStore(),actor={id:'synthetic-account-A'};
 const call=client(createCloudBackupHandler({getIdentityUser:async()=>actor,store}));
 assert.equal((await call('PUT','inventory',{baseRevision:0,envelope:encrypted()})).status,201);
 assert.equal((await call('PUT','inventory',{baseRevision:0,envelope:encrypted()})).status,409);
 assert.equal((await call('PUT','inventory',{baseRevision:1,envelope:{...encrypted(),alg:'PLAIN-TEXT'}})).status,400);
 assert.equal((await call('PUT','inventory',{baseRevision:1,envelope:{...encrypted(),ciphertext:'X'.repeat(900100)}})).status,413);
 const current=await call('GET','inventory');
 assert.equal(current.body.revision,1);
 assert.equal(current.body.envelope.ciphertext,'C'.repeat(64));
 const history=await call('GET','inventory?history=1');
 assert.deepEqual(history.body.versions.map(x=>x.revision),[1]);
});

test('Backup API returns safe errors when storage fails and never discloses database messages',async()=>{
 const {createCloudBackupHandler}=await load(),store=fakeStore();
 store.read=async()=>{throw Error('SYNTHETIC_PRIVATE_CREDENTIAL_SHOULD_NOT_APPEAR')};
 const handler=createCloudBackupHandler({getIdentityUser:async()=>({id:'synthetic-account-A'}),store});
 const res=await handler(request('GET','inventory'));
 assert.equal(res.status,503);
 const body=await res.text();
 assert.doesNotMatch(body,/SYNTHETIC_PRIVATE_CREDENTIAL/);
 assert.match(body,/keep your local download/);
});
