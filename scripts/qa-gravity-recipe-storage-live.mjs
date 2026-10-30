import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const URL='https://gravityleadershipsystem.com/gravity-recipe-works';
const OUT='docs/audits/gravity-recipe-storage-live-2026-10-30.md';
const results=[];
const report=(name,state,detail)=>{results.push({name,state,detail});console.log(state+' '+name+': '+detail)};
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function pageFor(block=false){
 const ctx=await browser.newContext({viewport:{width:1366,height:900}});
 await ctx.route('**/*',r=>r.request().url().startsWith('https://gravityleadershipsystem.com')?r.continue():r.abort());
 if(block)await ctx.addInitScript(()=>{
  const raw=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){if(k==='gravityRecipeWorksV1')throw new DOMException('Synthetic quota exceeded','QuotaExceededError');return raw.call(this,k,v)};
 });
 const page=await ctx.newPage();
 const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(response?.status(),200);
 return{ctx,page};
}
try{
 const a=await pageFor();
 try{
  await a.page.locator('#rw-new').click();
  await a.page.locator('#rr-name').fill('QA LIVE BACKUP ONLY');
  await a.page.locator('#rr-save').click();
  const origin=await a.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name);
  assert.equal(origin,'QA LIVE BACKUP ONLY');
  report('Synthetic recipe saved','PASS','No production customer record changed, local browser only.');
  await a.page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await a.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0].name),origin);
  report('Save persists through reload','PASS','Saved recipe reloaded from isolated browser storage.');
  let prompts=0;
  a.page.on('dialog',d=>{prompts++;d.dismiss()});
  await a.page.locator('[data-tab="storage"]').click();
  await a.page.locator('#st-restore').setInputFiles({name:'replace-with-empty.json',mimeType:'application/json',buffer:Buffer.from('{"recipes":[]}')});
  await a.page.waitForTimeout(450);
  const kept=await a.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0]?.name);
  assert.equal(kept,origin);
  assert.equal(prompts,1);
  report('User can cancel destructive restore','PASS','Replacement required a prompt; Cancel preserved existing recipe.');
  await a.page.locator('#st-restore').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"invalid":true}')});
  await a.page.waitForTimeout(450);
  assert.equal(await a.page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')).recipes[0]?.name),origin);
  report('Invalid backup rejected','PASS','Malformed backup did not delete or alter recipe.');
 }finally{await a.ctx.close()}
 const b=await pageFor(true);
 try{
  const errors=[];b.page.on('pageerror',e=>errors.push(e.message));
  await b.page.locator('#rw-new').click();
  await b.page.locator('#rr-name').fill('QA UNSAVABLE');
  await b.page.locator('#rr-save').click();
  await b.page.waitForTimeout(350);
  const state=await b.page.evaluate(()=>({text:document.querySelector('#gravity-recipe-storage-warning')?.textContent||'',role:document.querySelector('#gravity-recipe-storage-warning')?.getAttribute('role')||'',stored:localStorage.getItem('gravityRecipeWorksV1')}));
  assert.match(state.text,/SAVE FAILED/);
  assert.equal(state.role,'alert');
  assert.equal(state.stored,null);
  report('Storage failure never claims successful save','PASS','Quota failure displayed a persistent accessible SAVE FAILED warning.');
 }finally{await b.ctx.close()}
}finally{await browser.close()}
const lines=['# Gravity Recipe Works production safeguards — 2026-10-30','',
'Production UI was tested in isolated browsers using fictional data. No real customer records, submissions or hosted databases changed.','',
'| Check | Result | Evidence |','| --- | --- | --- |',
...results.map(x=>'| '+x.name+' | '+x.state+' | '+x.detail+' |'),'',
'This tests the web Recipe Works browser only; automatic cloud backup, Windows installation, and cross-device synchronization remain unverified/not implemented.',
'','Failures: '+results.filter(x=>x.state!=='PASS').length+'.'];
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,lines.join('\n')+'\n');
console.log('GRAVITY_LIVE_RECIPE_STORAGE '+JSON.stringify({tests:results.length,passed:results.filter(x=>x.state==='PASS').length,report:OUT}));
