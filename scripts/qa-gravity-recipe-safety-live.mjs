import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const HOST='https://gravityleadershipsystem.com';
const OUT='docs/audits/gravity-recipe-data-safety-live-2026-10-30.md';
const results=[];
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function start(blockWrites=false){
 const context=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 await context.route('**/*',route=>route.request().url().startsWith(HOST)?route.continue():route.abort());
 if(blockWrites)await context.addInitScript(()=>{
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){
   if(k==='gravityRecipeWorksV1')throw new DOMException('QA simulated storage full','QuotaExceededError');
   return original.call(this,k,v);
  };
 });
 const page=await context.newPage();
 const response=await page.goto(HOST+'/gravity-recipe-works',{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(response.status(),200);
 return {page,context};
}
async function check(label,fn){
 try{const detail=await fn();results.push({label,result:'PASS',detail});console.log('PASS '+label+' '+detail)}
 catch(error){results.push({label,result:'FAIL',detail:String(error.message||error).slice(0,260)});console.error('FAIL '+label+' '+String(error.stack||error).slice(0,1000))}
}
await check('Live deployment contains current restore and storage protections',async()=>{
 const response=await fetch(HOST+'/gravity-recipe-works',{signal:AbortSignal.timeout(30000)});
 assert.equal(response.status,200);
 const body=await response.text();
 assert.ok(body.includes('function recipeStorageWarning'));
 assert.ok(body.includes('This will REPLACE all recipes, revisions, and governance records'));
 assert.ok(body.includes('SAVE FAILED — Browser storage did not accept your changes'));
 return 'Actual production HTML contains both protected save and destructive-restore confirmation.';
});
await check('Create recipe and save persists after reload',async()=>{
 const {page,context}=await start();
 try{
  await page.locator('#rw-new').click();
  await page.locator('#rr-name').fill('QA Fictional Recipe · Protected');
  await page.locator('#rr-save').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.length===1,{timeout:12000});
  await page.reload({waitUntil:'domcontentloaded'});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name);
  assert.equal(saved,'QA Fictional Recipe · Protected');
  return 'Synthetic recipe created and survived browser reload.';
 }finally{await context.close()}
});
await check('Invalid restore file does not corrupt saved recipe',async()=>{
 const {page,context}=await start();
 try{
  await page.locator('#rw-new').click();
  await page.locator('#rr-name').fill('QA Keep Original');
  await page.locator('#rr-save').click();
  await page.locator('[data-tab="storage"]').click();
  await page.locator('#st-restore').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"something":"else"}')});
  await page.waitForTimeout(550);
  const name=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name);
  assert.equal(name,'QA Keep Original');
  return 'Malformed backup rejected, prior recipe retained.';
 }finally{await context.close()}
});
await check('Destructive restore canceled by user does not erase records',async()=>{
 const {page,context}=await start();
 try{
  await page.locator('#rw-new').click();
  await page.locator('#rr-name').fill('QA Must Survive Cancel');
  await page.locator('#rr-save').click();
  await page.locator('[data-tab="storage"]').click();
  let prompts=[];
  page.on('dialog',async dialog=>{prompts.push(dialog.message());await dialog.dismiss()});
  await page.locator('#st-restore').setInputFiles({name:'empty.json',mimeType:'application/json',buffer:Buffer.from('{"recipes":[]}')});
  await page.waitForTimeout(600);
  assert.equal(prompts.length,1);
  assert.match(prompts[0],/REPLACE all recipes/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name);
  assert.equal(saved,'QA Must Survive Cancel');
  return 'Confirmation appears; rejecting it preserves the working library.';
 }finally{await context.close()}
});
await check('Explicitly accepted restore correctly updates browser data',async()=>{
 const {page,context}=await start();
 try{
  await page.locator('#rw-new').click();
  await page.locator('#rr-name').fill('QA Before Restore');
  await page.locator('#rr-save').click();
  await page.locator('[data-tab="storage"]').click();
  let confirmations=0;
  page.on('dialog',async d=>{confirmations++;await d.accept()});
  const imported={recipes:[{id:'qa-proof',name:'QA Intentionally Restored',category:'Test',status:'Draft',ingredients:[],revisions:[]}],governance:[],adoptions:[],settings:{backupReminderDays:7,lastBackup:null}};
  await page.locator('#st-restore').setInputFiles({name:'approved-test-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.[0]?.name==='QA Intentionally Restored',{timeout:12000});
  assert.equal(confirmations,1);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name),'QA Intentionally Restored');
  return 'Explicit consent replaces only synthetic records; accepted restore survives reload.';
 }finally{await context.close()}
});
await check('Storage quota failure is visible, persistent, and is not reported as saved',async()=>{
 const {page,context}=await start(true);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.locator('#rw-new').click();
  await page.locator('#rr-name').fill('QA Rejected Save');
  await page.locator('#rr-save').click();
  await page.waitForTimeout(450);
  const state=await page.evaluate(()=>({
   warning:document.getElementById('gravity-recipe-storage-warning')?.textContent||'',
   role:document.getElementById('gravity-recipe-storage-warning')?.getAttribute('role')||'',
   stored:localStorage.getItem('gravityRecipeWorksV1')
  }));
  assert.match(state.warning,/SAVE FAILED/);
  assert.equal(state.role,'alert');
  assert.equal(state.stored,null);
  assert.equal(errors.length,0,'Unexpected JavaScript exception escaped '+errors.join('; '));
  return 'Simulated full browser storage produces persistent red warning; false Saved notice avoided.';
 }finally{await context.close()}
});
await browser.close();
const failed=results.filter(x=>x.result==='FAIL');
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,[
 '# Gravity Recipe Works — production data-loss safeguards retested (October 30, 2026)','',
 'Live https://gravityleadershipsystem.com, headless Chrome in separate temporary browser profiles; synthetic data only, no hosted account writes or customer records.',
 '','| Check | Result | Evidence |','| --- | --- | --- |',
 ...results.map(x=>'| '+x.label+' | **'+x.result+'** | '+x.detail.replaceAll('|','/')+' |'),
 '','## Findings','',
 '- Passed: '+(results.length-failed.length)+' of '+results.length+'.',
 '- Failed: '+failed.length+'.',
 '- Automated cloud backup, online account recovery and automatic synchronization are not part of this verified scope. Prior separate-browser checks confirmed these are not currently implemented in Shift Lab and Inventory Center.',
 '- Local device data remains vulnerable if browser storage is lost without a separately saved file.',
 '- No Windows installers were run.',
 ''].join('\n'));
console.log('GRAVITY_RECIPE_LIVE_GUARD '+JSON.stringify({total:results.length,passed:results.length-failed.length,failed:failed.length,report:OUT}));
if(failed.length)process.exitCode=1;
