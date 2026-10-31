import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const origin='http://127.0.0.1:42928';
const root=path.resolve('site');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 try{
  let x=new URL(req.url,origin),file=path.resolve(root,'.'+decodeURIComponent(x.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  if(!fs.existsSync(file)&&!path.extname(file))file+='.html';
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e))}
});
await new Promise(resolve=>server.listen(42928,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const records=new Map(),uploads=[],results=[];
async function context(){
 const c=await browser.newContext({viewport:{width:1390,height:900},acceptDownloads:true});
 await c.route('**/*',async route=>{
  const req=route.request(),requestUrl=req.url();
  if(!requestUrl.startsWith(origin))return route.abort();
  const url=new URL(requestUrl);
  if(url.pathname==='/assets/js/gravity-identity-client.js')
   return route.fulfill({status:200,contentType:'application/javascript',body:"window.GravityCustomerIdentity={login:async()=>({}),signup:async()=>({}),logout:async()=>({}),handleAuthCallback:async()=>null};"});
  if(!url.pathname.startsWith('/gravity-cloud-backup/'))return route.continue();
  const tool=url.pathname.split('/').at(-1),record=records.get(tool);
  console.log('CLOUD MOCK',req.method(),url.pathname);
  const ok=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(tool==='status'&&req.method()==='GET')return ok({ok:true,account:{id:'test-verified-user',email:'sample@example.test'},tools:[...records.entries()].map(([t,v])=>({tool:t,revision:v.revision,createdAt:v.createdAt}))});
  if(req.method()==='GET'&&url.searchParams.get('history')==='1')
   return ok({ok:true,tool,versions:record?[{revision:record.revision,createdAt:record.createdAt}]:[]});
  if(req.method()==='GET'&&record){
   const revision=url.searchParams.has('revision')?Number(url.searchParams.get('revision')):record.revision;
   if(revision!==record.revision)return ok({ok:false,error:'Not found'},404);
   return ok({ok:true,tool,revision:record.revision,createdAt:record.createdAt,envelope:record.envelope});
  }
  if(req.method()==='GET')return ok({ok:false,error:'None'},404);
  if(req.method()==='DELETE'){
   const body=JSON.parse(req.postData());
   if(body.confirmation!=='DELETE MY CLOUD BACKUPS')return ok({ok:false,error:'Confirmation required'},400);
   const deleted=records.delete(tool)?1:0;
   return ok({ok:true,tool,deleted});
  }
  if(req.method()==='PUT'){
   const raw=req.postData(),data=JSON.parse(raw);uploads.push({raw,tool,data});
   if(record&&data.baseRevision!==record.revision)return ok({ok:false,error:'Conflict'},409);
   if(!record&&data.baseRevision!==0)return ok({ok:false,error:'Conflict'},409);
   const r={revision:(record?.revision||0)+1,createdAt:new Date().toISOString(),envelope:data.envelope};
   records.set(tool,r);return ok({ok:true,tool,revision:r.revision,createdAt:r.createdAt},201);
  }
  return ok({ok:false,error:'Not supported'},405);
 });
 return c;
}
async function test(label,run){
 try{const info=await run();results.push({label,outcome:'PASS',info});console.log('PASS',label,'—',info)}
 catch(e){results.push({label,outcome:'FAIL',info:String(e.message||e)});console.error('FAIL',label,String(e.stack||e).slice(0,1200))}
}
const phrase='Test passphrase that never enters cloud API 123!';
await test('Shift Lab client encrypts before uploading',async()=>{
 const c=await context();
 try{
  const p=await c.newPage();await p.goto(origin+'/gravity-shift-lab',{waitUntil:'domcontentloaded'});
  await p.locator('#lab-body tr[data-employee-id]').first().waitFor();
  await p.locator('#lab-restaurant').fill('QA Private Shift Restaurant');
  await p.locator('#lab-body tr[data-employee-id] .employee-name').first().fill('QA Confidential Employee');
  await p.locator('#lab-save').click();
  const proof=await p.evaluate(async()=>{const r=await fetch('/gravity-cloud-backup/status',{cache:'no-store'});return {status:r.status,url:r.url,type:r.headers.get('content-type'),sample:(await r.text()).slice(0,170)}});console.log('SHIFT CLOUD PROBE',JSON.stringify(proof));
  await p.locator('#gravity-cloud-passphrase').fill(phrase);
  await p.locator('#gravity-cloud-unlock').click();
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000}).catch(async error=>{
   const debug=await p.evaluate(()=>({msg:document.getElementById('gravity-cloud-message')?.textContent,controls:document.getElementById('gravity-cloud-controls')?.outerHTML.slice(0,200),input:document.getElementById('gravity-cloud-passphrase')?.value.length,hasAccount:document.querySelector('#gravity-cloud-backup')?.textContent.slice(0,100),localKeys:Object.keys(localStorage)}));
   throw Error('Encrypted cloud unlock failed: '+JSON.stringify(debug)+'; '+error.message);
  });
  await p.locator('#gravity-cloud-now').click();
  await p.waitForFunction(()=>document.querySelector('#gravity-cloud-message')?.textContent.includes('version 1'),null,{timeout:20000});
  const up=uploads.find(x=>x.tool==='shift');assert.ok(up);
  assert.ok(!up.raw.includes('QA Private Shift Restaurant'));
  assert.ok(!up.raw.includes('QA Confidential Employee'));
  assert.ok(!up.raw.includes(phrase));
  assert.equal(up.data.envelope.alg,'AES-256-GCM');
  assert.equal(up.data.envelope.iterations,310000);
  return 'Only AES-GCM ciphertext and KDF metadata uploaded; no private restaurant/employee/plain passphrase data.';
 }finally{await c.close()}
});
await test('Second browser decrypts verified account cloud backup with explicit consent',async()=>{
 const c=await context();
 try{
  const p=await c.newPage();await p.goto(origin+'/gravity-shift-lab',{waitUntil:'domcontentloaded'});
  await p.locator('#gravity-cloud-passphrase').fill(phrase);
  await p.locator('#gravity-cloud-unlock').click();
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000}).catch(async error=>{
   const debug=await p.evaluate(()=>({msg:document.getElementById('gravity-cloud-message')?.textContent,controls:document.getElementById('gravity-cloud-controls')?.outerHTML.slice(0,200),input:document.getElementById('gravity-cloud-passphrase')?.value.length,hasAccount:document.querySelector('#gravity-cloud-backup')?.textContent.slice(0,100),localKeys:Object.keys(localStorage)}));
   throw Error('Encrypted cloud unlock failed: '+JSON.stringify(debug)+'; '+error.message);
  });
  const m=await p.locator('#gravity-cloud-message').innerText();
  assert.match(m,/PAUSED/);
  await p.locator('#gravity-cloud-revisions').waitFor({state:'visible',timeout:8000});
  assert.equal(await p.locator('#gravity-cloud-revisions').inputValue(),'1');
  let confirmations=0;
  p.on('dialog',d=>{confirmations++;d.accept()});
  await p.locator('#gravity-cloud-restore').click();
  await p.waitForFunction(()=>document.querySelector('#lab-restaurant')?.value==='QA Private Shift Restaurant',null,{timeout:16000});
  assert.equal(await p.locator('#lab-body tr[data-employee-id] .employee-name').first().inputValue(),'QA Confidential Employee');
  assert.equal(confirmations,1);
  return 'Cloud restore recovered the correct record in a clean browser and required confirmation.';
 }finally{await c.close()}
});
await test('Wrong recovery passphrase cannot unlock or overwrite local data',async()=>{
 const c=await context();
 try{
  const p=await c.newPage();await p.goto(origin+'/gravity-shift-lab',{waitUntil:'domcontentloaded'});
  await p.locator('#gravity-cloud-passphrase').fill('Incorrect longer recovery phrase 123!');
  await p.locator('#gravity-cloud-unlock').click();
  await p.waitForFunction(()=>/Cloud backup remains locked: Incorrect recovery passphrase/.test(document.querySelector('#gravity-cloud-message')?.textContent||''),null,{timeout:14000});
  assert.equal(await p.locator('#gravity-cloud-controls').isVisible(),false);
  assert.notEqual(await p.locator('#lab-restaurant').inputValue(),'QA Private Shift Restaurant');
  assert.equal(uploads.filter(x=>x.tool==='shift').length,1);
  return 'Incorrect key refused at unlock before any cloud backup could be overwritten.';
 }finally{await c.close()}
});
await test('Inventory Center client encrypts a valid workspace',async()=>{
 const c=await context();
 try{
  const p=await c.newPage();await p.goto(origin+'/apps/inventory-center/index.html',{waitUntil:'domcontentloaded'});
  await p.locator('#edit-profile').click();
  await p.locator('#profile-restaurant').fill('QA Secret Inventory Location');
  await p.locator('#save-profile').click();
  await p.locator('#gravity-cloud-passphrase').fill(phrase);
  await p.locator('#gravity-cloud-unlock').click();
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000}).catch(async error=>{
   const debug=await p.evaluate(()=>({msg:document.getElementById('gravity-cloud-message')?.textContent,controls:document.getElementById('gravity-cloud-controls')?.outerHTML.slice(0,200),input:document.getElementById('gravity-cloud-passphrase')?.value.length,hasAccount:document.querySelector('#gravity-cloud-backup')?.textContent.slice(0,100),localKeys:Object.keys(localStorage)}));
   throw Error('Encrypted cloud unlock failed: '+JSON.stringify(debug)+'; '+error.message);
  });
  await p.locator('#gravity-cloud-now').click();
  await p.waitForFunction(()=>document.querySelector('#gravity-cloud-message')?.textContent.includes('version 1'),null,{timeout:20000});
  const up=uploads.find(x=>x.tool==='inventory');assert.ok(up);
  assert.ok(!up.raw.includes('QA Secret Inventory Location'));
  return 'Valid inventory state encrypted before transmission; customer name absent from upload.';
 }finally{await c.close()}
});
await test('Customer account page deletes only confirmed encrypted cloud copies',async()=>{
 const c=await context();
 try{
  const p=await c.newPage();await p.goto(origin+'/gravity-cloud-vault',{waitUntil:'domcontentloaded'});
  await p.locator('#account-panel').waitFor({state:'visible',timeout:12000});
  assert.ok(records.has('inventory'));
  let prompts=0;
  p.on('dialog',d=>{prompts++;d.accept('DELETE MY CLOUD BACKUPS')});
  await p.locator('#gravity-cloud-delete-inventory').click();
  await p.waitForFunction(()=>document.getElementById('gravity-cloud-delete-status')?.textContent.includes('Deleted 1 inventory encrypted cloud backup'),null,{timeout:12000});
  assert.equal(prompts,1);
  assert.equal(records.has('inventory'),false);
  assert.equal(records.has('shift'),true);
  return 'Typed confirmation permanently removed the selected workspace copy only; other tools were untouched.';
 }finally{await c.close()}
});
await browser.close();await new Promise(resolve=>server.close(resolve));
const bad=results.filter(x=>x.outcome==='FAIL');
console.log('GRAVITY_ENCRYPTED_CLOUD_BROWSER_TEST '+JSON.stringify({pass:results.length-bad.length,fail:bad.length,results}));
if(bad.length)process.exitCode=1;
