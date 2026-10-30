import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {chromium} from 'playwright';

const HOST='https://gravityleadershipsystem.com';
const OUT='docs/audits/gravity-customer-data-protection-2026-10-30.md';
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'gravity-protection-'));
const findings=[];
const record=(scope,state,detail)=>{findings.push({scope,state,detail:String(detail||'').slice(0,700)});console.log(state+' '+scope+': '+detail)};
async function open(route,{blockWrites=false}={}){
 const ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 await ctx.route('**/*',r=>r.request().url().startsWith(HOST)?r.continue():r.abort());
 if(blockWrites)await ctx.addInitScript(()=>{
  const raw=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,val){
   if(key==='gravityRecipeWorksV1')throw new DOMException('QA injected quota failure','QuotaExceededError');
   return raw.call(this,key,val);
  };
 });
 const page=await ctx.newPage(),res=await page.goto(HOST+route,{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(res?.status(),200,route+' HTTP '+res?.status());
 return {ctx,page};
}
async function task(scope,fn){try{await fn()}catch(e){record(scope,'TEST_ERROR',String(e.stack||e).slice(0,650))}}
async function saveShift(page){
 await page.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:14000});
 await page.locator('#lab-restaurant').fill('QA NO CUSTOMER RESTAURANT');
 await page.locator('#lab-sales').fill('12500');
 const row=page.locator('#lab-body tr[data-employee-id]').first();
 await row.locator('.employee-name').fill('QA DEMO EMPLOYEE');
 await row.locator('.employee-wage').fill('23');
 await row.locator('.shift-input[data-day="3"]').fill('9a-5p');
 await page.locator('#lab-save').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('gravityShiftLabProfileV3')||'{}').restaurant==='QA NO CUSTOMER RESTAURANT',{timeout:14000});
}
await task('Shift Lab — same-browser durability, new-device sync, clearing browser data',async()=>{
 const a=await open('/gravity-shift-lab'),downloads=[];
 try{
  a.page.on('download',d=>downloads.push(d.suggestedFilename()));
  await saveShift(a.page);
  await a.page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await a.page.locator('#lab-restaurant').inputValue(),'QA NO CUSTOMER RESTAURANT');
  record('Shift Lab — reload same browser','PASS','Synthetic schedule and restaurant persisted after reload.');
  const b=await open('/gravity-shift-lab');
  try{
   await b.page.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:14000});
   const n=await b.page.locator('#lab-restaurant').inputValue();
   record('Shift Lab — automatic synchronization to a second browser',n==='QA NO CUSTOMER RESTAURANT'?'PASS':'NOT_IMPLEMENTED',n==='QA NO CUSTOMER RESTAURANT'?'Synthetic data synchronized automatically.':'Separate browser did not receive synthetic schedule. No automatic account/device sync was observed.');
  }finally{await b.ctx.close()}
  record('Shift Lab — automatic backup download on Save',downloads.length?'OBSERVED':'NOT_IMPLEMENTED',downloads.length?'Automatic download(s): '+downloads.join(', '):'Saving a schedule did not produce an automatic off-device backup.');
  await a.page.evaluate(()=>{localStorage.removeItem('gravityShiftLabProfileV3');localStorage.removeItem('gravityShiftLabSchedulesV3')});
  await a.page.reload({waitUntil:'domcontentloaded'});
  const lost=(await a.page.locator('#lab-restaurant').inputValue())!=='QA NO CUSTOMER RESTAURANT';
  record('Shift Lab — recovery without prior manual backup after browser storage clearing',lost?'AT_RISK':'PASS',lost?'Synthetic schedule no longer appears after local storage removal. No automatic recovery detected.':'Synthetic schedule restored despite local storage removal.');
 }finally{await a.ctx.close()}
});
await task('Inventory Center — new device and automatic backup',async()=>{
 const a=await open('/apps/inventory-center/index'),downloads=[];
 try{
  a.page.on('download',d=>downloads.push(d.suggestedFilename()));
  await a.page.locator('#edit-profile').click();
  await a.page.locator('#profile-restaurant').fill('QA STORAGE LOCAL ONLY');
  await a.page.locator('#save-profile').click();
  await a.page.reload({waitUntil:'domcontentloaded'});
  const saved=await a.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'{}').profile?.restaurant);
  assert.equal(saved,'QA STORAGE LOCAL ONLY');
  record('Inventory Center — reload same browser','PASS','Synthetic restaurant persisted in current browser.');
  const b=await open('/apps/inventory-center/index');
  try{
   const onOther=await b.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'{}').profile?.restaurant||'');
   record('Inventory Center — automatic synchronization to a second browser',onOther===saved?'PASS':'NOT_IMPLEMENTED',onOther===saved?'New browser received data.':'New browser did not receive synthetic inventory profile; no automatic cloud synchronization detected.');
  }finally{await b.ctx.close()}
  record('Inventory Center — automatic backup on profile Save',downloads.length?'OBSERVED':'NOT_IMPLEMENTED',downloads.length?'Automatically downloaded: '+downloads.join(', '):'No off-device backup was created automatically when profile saved.');
 }finally{await a.ctx.close()}
});
await task('Recipe Works — actual backup round-trip and recovery validation',async()=>{
 const a=await open('/gravity-recipe-works'),backupFile=path.join(temp,'gravity-recipe-works-backup.json');
 try{
  await a.page.locator('#rw-new').click();
  await a.page.locator('#rr-name').fill('QA Synthetic Soup — Do Not Publish');
  await a.page.locator('#rr-save').click();
  const data=await a.page.evaluate(()=>{const o=JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}');return o.recipes?.map(x=>x.name)||[]});
  assert.ok(data.includes('QA Synthetic Soup — Do Not Publish'),'Synthetic recipe not stored');
  record('Recipe Works — local recipe Save','PASS','Synthetic recipe persisted in browser-local storage.');
  await a.page.reload({waitUntil:'domcontentloaded'});
  await a.page.waitForFunction(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.length>0);
  record('Recipe Works — reopen existing recipe','PASS','Saved recipe was retained after reload.');
  await a.page.locator('[data-tab="storage"]').click();
  const dl=a.page.waitForEvent('download',{timeout:14000});
  await a.page.locator('#st-download').click();
  await (await dl).saveAs(backupFile);
  const json=JSON.parse(fs.readFileSync(backupFile,'utf8'));
  assert.equal(json.recipes[0].name,'QA Synthetic Soup — Do Not Publish');
  const b=await open('/gravity-recipe-works');
  try{
   const before=await b.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.length||0);
   assert.equal(before,0);
   await b.page.locator('[data-tab="storage"]').click();
   await b.page.locator('#st-restore').setInputFiles(backupFile);
   await b.page.waitForFunction(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.length===1,{timeout:14000});
   const name=await b.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name);
   assert.equal(name,'QA Synthetic Soup — Do Not Publish');
   await b.page.reload({waitUntil:'domcontentloaded'});
   assert.equal(await b.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name),name);
   record('Recipe Works — manual backup transferred to a new browser','PASS','Downloaded JSON restored recipe in a clean browser and survived another reload.');
   const broken=path.join(temp,'broken-recipe.json');
   fs.writeFileSync(broken,'{"bad":true}');
   await b.page.locator('[data-tab="storage"]').click();
   await b.page.locator('#st-restore').setInputFiles(broken);
   await b.page.waitForTimeout(550);
   const still=await b.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0]?.name);
   record('Recipe Works — invalid backup rejection',still===name?'PASS':'FAIL',still===name?'Invalid-format backup rejected without replacing saved recipe.':'Existing recipe lost when invalid backup imported.');
   const empty=path.join(temp,'empty-but-shaped.json');
   fs.writeFileSync(empty,'{"recipes":[]}');
   let dialogs=0;
   b.page.on('dialog',async d=>{dialogs++;await d.dismiss()});
   await b.page.locator('#st-restore').setInputFiles(empty);
   await b.page.waitForTimeout(850);
   const current=await b.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.map(x=>x.name));
   record('Recipe Works — replacement backup requires explicit confirmation',dialogs>0?'PASS':current?.length===0?'FAIL':'INCONCLUSIVE',dialogs>0?'Destructive restore displayed a user confirmation.':current?.length===0?'An empty-but-shaped backup replaced saved recipe without confirmation.':'No dialog; recipe remained: '+JSON.stringify(current));
  }finally{await b.ctx.close()}
 }finally{await a.ctx.close()}
});
await task('Recipe Works — deliberate simulated browser storage failure',async()=>{
 const a=await open('/gravity-recipe-works',{blockWrites:true});
 const errors=[];a.page.on('pageerror',e=>errors.push(String(e.message).slice(0,180)));
 try{
  await a.page.locator('#rw-new').click();
  await a.page.locator('#rr-name').fill('QA SHOULD FAIL STORAGE');
  await a.page.locator('#rr-save').click();
  await a.page.waitForTimeout(700);
  const msg=await a.page.locator('#rw-view').innerText();
  const data=await a.page.evaluate(()=>localStorage.getItem('gravityRecipeWorksV1'));
  const explicitlyWarned=/could not save|save failed|storage full|save error|not saved|backup immediately/i.test(msg);
  record('Recipe Works — quota/storage failure surfaced to user',explicitlyWarned?'PASS':errors.length?'FAIL':'INCONCLUSIVE',explicitlyWarned?'Explicit data protection warning displayed.':errors.length?'Browser raised '+errors[0]+'; no clear on-page storage failure warning.':'Neither a warning nor a detectable error; data='+Boolean(data));
 }finally{await a.ctx.close()}
});
await browser.close();
fs.rmSync(temp,{recursive:true,force:true});
const buckets={};for(const x of findings)buckets[x.state]=(buckets[x.state]||0)+1;
const lines=['# Gravity customer data protection, backup and cross-device QA — October 30, 2026','',
 'Real production website tested in isolated headless Chrome profiles with fictional customer data. No real user records, hosted database writes, payment requests or live staff workspace mutations.',
 '',
 '| Test | Classification | Observed evidence |','| --- | --- | --- |',
 ...findings.map(f=>'| '+f.scope.replaceAll('|','/')+' | **'+f.state+'** | '+f.detail.replaceAll('|','/')+' |'),
 '','## Interpretation','',
 'PASS means a capability worked in the tested conditions. NOT_IMPLEMENTED means no automatic off-device backup or cross-browser synchronization was observed. AT_RISK means stored data disappeared in the deliberately cleared test profile. FAIL means an explicitly protective expectation was violated. TEST_ERROR/INCONCLUSIVE means the test cannot establish the outcome.',
 '',
 '## Boundaries',
 'Manual browser-local persistence is not cloud synchronization. A backup must be exported and stored away from the browser/device before local data loss. Separate device recovery without a file, authentication-based account recovery, hosted Foundry write durability, Windows desktop installers, and remote update rollover have not been proven by these tests.',
 '',
 '## Totals',
 ...Object.entries(buckets).map(([k,v])=>'- '+k+': '+v),
];
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,lines.join('\n')+'\n');
console.log('GRAVITY_CUSTOMER_DATA_PROTECTION_QA '+JSON.stringify({tests:findings.length,results:buckets,report:OUT}));
if(findings.some(f=>f.state==='TEST_ERROR'))process.exitCode=1;
