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
 await c.route('**/gravity-cloud-backup/**',async route=>{
  const req=route.request(),url=new URL(req.url()),tool=url.pathname.split('/').at(-1),record=records.get(tool);
  const ok=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(tool==='status'&&req.method()==='GET')return ok({ok:true,account:{id:'test-verified-user',email:'sample@example.test'},tools:[...records.entries()].map(([t,v])=>({tool:t,revision:v.revision,createdAt:v.createdAt}))});
  if(req.method()==='GET'&&record)return ok({ok:true,tool,revision:record.revision,createdAt:record.createdAt,envelope:record.envelope});
  if(req.method()==='GET')return ok({ok:false,error:'None'},404);
  if(req.method()==='PUT'){
   const raw=req.postData(),data=JSON.parse(raw);uploads.push({raw,tool,data});
   if(record&&data.baseRevision!==record.revision)return ok({ok:false,error:'Conflict'},409);
   if(!record&&data.baseRevision!==0)return ok({ok:false,error:'Conflict'},409);
   const r={revision:(record?.revision||0)+1,createdAt:new Date().toISOString(),envelope:data.envelope};
   records.set(tool,r);return ok({ok:true,tool,revision:r.revision,createdAt:r.createdAt},201);
  }
  return ok({ok:false,error:'Not supported'},405);
 });
 await c.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
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
  await p.locator('#gravity-cloud-passphrase').fill(phrase);
  await p.locator('#gravity-cloud-unlock').click();
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000});
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
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000});
  const m=await p.locator('#gravity-cloud-message').innerText();
  assert.match(m,/PAUSED/);
  let confirmations=0;
  p.on('dialog',d=>{confirmations++;d.accept()});
  await p.locator('#gravity-cloud-restore').click();
  await p.waitForFunction(()=>document.querySelector('#lab-restaurant')?.value==='QA Private Shift Restaurant',null,{timeout:16000});
  assert.equal(await p.locator('#lab-body tr[data-employee-id] .employee-name').first().inputValue(),'QA Confidential Employee');
  assert.equal(confirmations,1);
  return 'Cloud restore recovered the correct record in a clean browser and required confirmation.';
 }finally{await c.close()}
});
await test('Wrong recovery passphrase cannot decrypt or overwrite local data',async()=>{
 const c=await context();
 try{
  const p=await c.newPage();await p.goto(origin+'/gravity-shift-lab',{waitUntil:'domcontentloaded'});
  await p.locator('#gravity-cloud-passphrase').fill('Incorrect longer recovery phrase 123!');
  await p.locator('#gravity-cloud-unlock').click();
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000});
  await p.locator('#gravity-cloud-restore').click();
  await p.waitForFunction(()=>/Cloud recovery stopped/.test(document.querySelector('#gravity-cloud-message')?.textContent||''),null,{timeout:14000});
  assert.notEqual(await p.locator('#lab-restaurant').inputValue(),'QA Private Shift Restaurant');
  return 'Incorrect key refused without replacing original browser records.';
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
  await p.locator('#gravity-cloud-controls').waitFor({state:'visible',timeout:9000});
  await p.locator('#gravity-cloud-now').click();
  await p.waitForFunction(()=>document.querySelector('#gravity-cloud-message')?.textContent.includes('version 1'),null,{timeout:20000});
  const up=uploads.find(x=>x.tool==='inventory');assert.ok(up);
  assert.ok(!up.raw.includes('QA Secret Inventory Location'));
  return 'Valid inventory state encrypted before transmission; customer name absent from upload.';
 }finally{await c.close()}
});
await browser.close();await new Promise(resolve=>server.close(resolve));
const bad=results.filter(x=>x.outcome==='FAIL');
console.log('GRAVITY_ENCRYPTED_CLOUD_BROWSER_TEST '+JSON.stringify({pass:results.length-bad.length,fail:bad.length,results}));
if(bad.length)process.exitCode=1;
