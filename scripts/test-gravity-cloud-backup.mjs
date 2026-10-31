import assert from 'node:assert/strict';
import {createCloudBackupHandler} from '../functions/gravity-cloud-backup/core.mjs';
const users=new Map(),hist=new Map();
const key=(uid,tool)=>uid+'|'+tool;
const store={
 async latest(uid,tool){return hist.get(key(uid,tool))?.at(-1)||null},
 async history(uid,tool,keep){return (hist.get(key(uid,tool))||[]).slice(-keep).reverse().map(x=>({revision:x.revision,createdAt:x.createdAt}))},
 async status(uid){return ['shift','inventory'].flatMap(t=>{const r=hist.get(key(uid,t))?.at(-1);return r?[{tool:t,revision:r.revision,createdAt:r.createdAt}]:[]})},
 async read(uid,tool,rev){const a=hist.get(key(uid,tool))||[];return rev===null?a.at(-1)||null:a.find(x=>x.revision===rev)||null},
 async insert(uid,tool,rev,envelope){
  const k=key(uid,tool),a=hist.get(k)||[];
  if(a.some(x=>x.revision===rev)){const e=new Error('duplicate');e.code='23505';throw e}
  const item={revision:rev,createdAt:new Date().toISOString(),envelope};a.push(item);hist.set(k,a);return item;
 },
 async prune(uid,tool,keep){let k=key(uid,tool);hist.set(k,hist.get(k).slice(-keep))},
 async deleteAll(uid,tool){const k=key(uid,tool),n=(hist.get(k)||[]).length;hist.delete(k);return n}
};
const fn=createCloudBackupHandler({getIdentityUser:async()=>users.get('current')||null,store});
const url='https://gravityleadershipsystem.com/gravity-cloud-backup/';
function request(route,method='GET',body=null,origin=url){
 const h={'Origin':origin};if(body!==null)h['Content-Type']='application/json';
 return new Request(url+route,{method,headers:h,body:body===null?undefined:JSON.stringify(body)});
}
const checks=[];
async function check(label,run){try{await run();checks.push([label,'PASS']);console.log('PASS',label)}catch(e){checks.push([label,'FAIL']);console.error('FAIL',label,e)}}
const encryption={version:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:310000,salt:'AAAAAAAAAAAAAAAAAAAAAA',iv:'AAAAAAAAAAAAAAAA',ciphertext:'A'.repeat(80)};
async function put(tool,baseRevision,envelope=encryption,origin=url){return fn(request(tool,'PUT',{baseRevision,envelope},origin))}
await check('Unauthenticated account denied',async()=>{assert.equal((await fn(request('status'))).status,401);assert.equal((await put('shift',0)).status,401)});
users.set('current',{id:'user-a',email:'a@example.test'});
await check('Same origin and plaintext-only guard',async()=>{
 assert.equal((await put('shift',0,encryption,'https://untrusted.example')).status,403);
 assert.equal((await put('shift',0,{restaurant:'PRIVATE',wages:[100]})).status,400);
 assert.equal((await put('shift',0,{...encryption,ciphertext:'PRIVATE DATA'})).status,400);
});
await check('Authenticated encrypted save/retrieve',async()=>{
 const a=await put('shift',0);assert.equal(a.status,201);
 const x=await a.json();assert.equal(x.revision,1);
 const data=await (await fn(request('shift'))).json();
 assert.equal(data.envelope.ciphertext,encryption.ciphertext);
 const status=await (await fn(request('status'))).json();
 assert.equal(status.tools.length,1);
});
await check('Only owner can enumerate dated backup versions',async()=>{
 const first=await fn(request('shift?history=1'));
 assert.equal(first.status,200);
 const versions=(await first.json()).versions;
 assert.equal(versions.length,1);
 assert.equal(versions[0].revision,1);
 assert.ok(!JSON.stringify(versions).includes('ciphertext'));
 users.set('current',{id:'user-b',email:'b@example.test'});
 const foreign=await fn(request('shift?history=1'));
 assert.equal(foreign.status,200);assert.equal((await foreign.json()).versions.length,0);
 users.set('current',{id:'user-a',email:'a@example.test'});
});
await check('Optimistic concurrency prevents lost updates',async()=>{assert.equal((await put('shift',0)).status,409)});
await check('Accounts isolated by Identity ID',async()=>{
 users.set('current',{id:'user-b',email:'b@example.test'});
 assert.equal((await fn(request('shift'))).status,404);
 assert.equal((await fn(request('status'))).status,200);
 assert.equal((await put('inventory',0)).status,201);
 assert.equal((await fn(request('shift'))).status,404);
 users.set('current',{id:'user-a',email:'a@example.test'});
 assert.equal((await fn(request('inventory'))).status,404);
});
await check('Explicit deletion and origin validation',async()=>{
 assert.equal((await fn(request('shift','DELETE',{confirmation:'no'}))).status,400);
 assert.equal((await fn(request('shift','DELETE',{confirmation:'DELETE MY CLOUD BACKUPS'},'https://attacker.test'))).status,403);
 assert.equal((await fn(request('shift','DELETE',{confirmation:'DELETE MY CLOUD BACKUPS'}))).status,200);
 assert.equal((await fn(request('shift'))).status,404);
});
await check('Unsupported tools and methods denied',async()=>{
 assert.equal((await fn(request('payroll'))).status,404);
 assert.equal((await fn(request('status','PUT',{baseRevision:0,envelope:encryption}))).status,404);
 assert.equal((await fn(request('shift?revision=0'))).status,400);
});
await check('Five-version retention, older version lookup, and deletion isolation',async()=>{
 users.set('current',{id:'user-a',email:'a@example.test'});
 for(let i=0;i<7;i++){
  const last=hist.get(key('user-a','shift'))?.at(-1);
  if(last)last.createdAt='2001-01-01T00:00:00.000Z';
  const response=await put('shift',i);
  assert.equal(response.status,201);
 }
 const historyResponse=await fn(request('shift?history=1'));
 assert.equal(historyResponse.status,200);
 const history=(await historyResponse.json()).versions;
 assert.equal(history.length,5);
 assert.deepEqual(history.map(x=>x.revision),[7,6,5,4,3]);
 assert.equal((await fn(request('shift?revision=1'))).status,404);
 assert.equal((await fn(request('shift?revision=3'))).status,200);
 users.set('current',{id:'user-b',email:'b@example.test'});
 const other=await fn(request('shift?history=1'));
 assert.equal((await other.json()).versions.length,0);
 users.set('current',{id:'user-a',email:'a@example.test'});
 const deleted=await fn(request('shift','DELETE',{confirmation:'DELETE MY CLOUD BACKUPS'}));
 assert.equal((await deleted.json()).deleted,5);
 assert.equal((await fn(request('shift?history=1')).then(x=>x.json())).versions.length,0);
});
await check('Over-sized and malformed backups denied',async()=>{
 assert.equal((await put('shift',0,{...encryption,ciphertext:'A'.repeat(900001)})).status,413);
 assert.equal((await fn(new Request(url+'shift',{method:'PUT',headers:{Origin:'https://gravityleadershipsystem.com'},body:'not json'}))).status,400);
});
const failures=checks.filter(x=>x[1]!=='PASS').length;
console.log('GRAVITY_CLOUD_BACKUP_CONTRACT',JSON.stringify({passed:checks.length-failures,failed:failures}));
if(failures)process.exitCode=1;
