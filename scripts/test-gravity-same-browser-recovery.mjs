import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const root=path.resolve('site');
const origin='http://127.0.0.1:42916';
const checks=[];
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.txt':'text/plain'};
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,origin);
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  if(!fs.existsSync(file)&&!path.extname(file))file+='.html';
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e.message))}
});
await new Promise(r=>server.listen(42916,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function run(label,task){
 try{let desc=await task();checks.push({label,result:'PASS',desc});console.log('PASS '+label+' — '+desc)}
 catch(e){checks.push({label,result:'FAIL',desc:String(e.message||e).slice(0,300)});console.error('FAIL '+label+' '+String(e.stack||e).slice(0,1200))}
}
async function stateProbe(p,slot){
 return await p.evaluate(async slot=>{
  const result={url:location.href,localKeys:Object.keys(localStorage),indexed:[]};
  try{
   result.databases=await indexedDB.databases();
   const d=await new Promise((resolve,reject)=>{const r=indexedDB.open('GravitySameBrowserRecoveryV1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const list=await new Promise((resolve,reject)=>{const r=d.transaction('snapshots').objectStore('snapshots').get(slot);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   result.indexed=(list||[]).map(x=>({at:x.at,signature:String(x.signature).slice(0,28),lengths:x.value.map(v=>v?.length),payLockSet:!!(JSON.parse(x.value?.[0]||'{}').payLockHash),items:JSON.parse(x.value?.[0]||'{}').items?.length||0}));
   d.close();
  }catch(e){result.error=e.message}
  return result;
 },slot);
}
async function waitForSnapshot(p,slot,predicate,label){
 let last=null;
 for(let n=0;n<45;n++){
  last=await stateProbe(p,slot);
  if((last.indexed||[]).some(predicate))return last;
  await p.waitForTimeout(200);
 }
 throw Error('Timed out waiting for committed '+label+' snapshot: '+JSON.stringify(last));
}
async function page(route){
 const context=await browser.newContext({viewport:{width:1400,height:900},acceptDownloads:true});
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 const p=await context.newPage();
 let res=await p.goto(origin+route,{waitUntil:'domcontentloaded',timeout:28000});
 assert.equal(res?.status(),200);
 return {context,p};
}
await run('Shift Lab synthetic employee survives loss of localStorage with local snapshot',async()=>{
 const {context,p}=await page('/gravity-shift-lab');
 try{
  await p.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:14000});
  await p.locator('#lab-restaurant').fill('QA Local Recovery Shift');
  await p.locator('#lab-sales').fill('12000');
  const row=p.locator('#lab-body tr[data-employee-id]').first();
  await row.locator('.employee-name').fill('QA Snapshot Employee');
  await row.locator('.employee-wage').fill('24');
  await row.locator('.shift-input[data-day="1"]').fill('9a-5p');
  await p.locator('#lab-save').click();
  await p.waitForFunction(()=>{const b=document.querySelector('#gravity-local-recovery');return b&&!b.disabled},null,{timeout:12000}).catch(async error=>{
    const diag=await p.evaluate(async()=>{
      const btn=document.querySelector('#gravity-local-recovery'),msg=document.querySelector('#gravity-local-recovery-status'),sel=document.querySelector('#gravity-local-recovery-version');
      let snapshots='unknown';
      try{snapshots=await new Promise(resolve=>{const o=indexedDB.open('GravitySameBrowserRecoveryV1',1);o.onsuccess=()=>{const d=o.result;const r=d.transaction('snapshots').objectStore('snapshots').get(document.querySelector('#lab-backup')?'gravity-shift-lab':'gravity-inventory-center');r.onsuccess=()=>resolve((r.result||[]).map(x=>({at:x.at,signature:x.signature,values:x.value.map(v=>v?.length)})));r.onerror=()=>resolve('read error')};o.onerror=()=>resolve('db error')})}catch(e){snapshots=e.message}
      return {button:btn?.outerHTML?.slice(0,450),status:msg?.textContent,versions:sel?.outerHTML?.slice(0,450),snapshots,keys:Object.keys(localStorage)};
    });
    throw Error('Recovery unavailable after reload: '+JSON.stringify(diag)+'; original: '+error.message);
  });
  const snapshot=await p.evaluate(async()=>{
   const d=await new Promise((resolve,reject)=>{const r=indexedDB.open('GravitySameBrowserRecoveryV1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   return new Promise((resolve,reject)=>{const tx=d.transaction('snapshots');const r=tx.objectStore('snapshots').get('gravity-shift-lab');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  });
  assert.equal(snapshot[0].value.length,2);
  assert.equal(JSON.parse(snapshot[0].value[0]).restaurant,'QA Local Recovery Shift');
  await p.evaluate(()=>{
   localStorage.removeItem('gravityShiftLabProfileV3');localStorage.removeItem('gravityShiftLabSchedulesV3');
  });
  await p.reload({waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>{const b=document.querySelector('#gravity-local-recovery');return b&&!b.disabled},null,{timeout:12000}).catch(async error=>{
    const diag=await p.evaluate(async()=>{
      const btn=document.querySelector('#gravity-local-recovery'),msg=document.querySelector('#gravity-local-recovery-status'),sel=document.querySelector('#gravity-local-recovery-version');
      let snapshots='unknown';
      try{snapshots=await new Promise(resolve=>{const o=indexedDB.open('GravitySameBrowserRecoveryV1',1);o.onsuccess=()=>{const d=o.result;const r=d.transaction('snapshots').objectStore('snapshots').get(document.querySelector('#lab-backup')?'gravity-shift-lab':'gravity-inventory-center');r.onsuccess=()=>resolve((r.result||[]).map(x=>({at:x.at,signature:x.signature,values:x.value.map(v=>v?.length)})));r.onerror=()=>resolve('read error')};o.onerror=()=>resolve('db error')})}catch(e){snapshots=e.message}
      return {button:btn?.outerHTML?.slice(0,450),status:msg?.textContent,versions:sel?.outerHTML?.slice(0,450),snapshots,keys:Object.keys(localStorage)};
    });
    throw Error('Recovery unavailable after reload: '+JSON.stringify(diag)+'; original: '+error.message);
  });
  let confirms=0;p.on('dialog',d=>{confirms++;d.accept()});
  await p.locator('#gravity-local-recovery').click();
  await p.waitForFunction(()=>document.querySelector('#lab-restaurant')?.value==='QA Local Recovery Shift',{timeout:18000});
  assert.equal(await p.locator('#lab-body tr .employee-name').first().inputValue(),'QA Snapshot Employee');
  assert.equal(await p.locator('#lab-body tr .employee-wage').first().inputValue(),'24');
  assert.equal(await p.locator('#lab-body tr .shift-input[data-day="1"]').first().inputValue(),'9a-5p');
  assert.equal(confirms,1);
  return 'Separate IndexedDB snapshot recovered employee, pay, schedule, and week after selective localStorage deletion; explicit confirmation used.';
 }finally{await context.close()}
});
await run('Shift Lab pay-protected recovery requires original PIN',async()=>{
 const {context,p}=await page('/gravity-shift-lab');
 try{
  await p.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:12000});
  await p.locator('#lab-restaurant').fill('QA PIN Protected Schedule');
  await p.locator('#lab-save').click();
  await p.evaluate(async()=>{
   const data=JSON.parse(localStorage.getItem('gravityShiftLabProfileV3'));
   const buff=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('GravityShiftLab|97531'));
   data.payLockHash=[...new Uint8Array(buff)].map(n=>n.toString(16).padStart(2,'0')).join('');
   localStorage.setItem('gravityShiftLabProfileV3',JSON.stringify(data));
   window.dispatchEvent(new Event('gravity:local-data-saved'));
  });
  await waitForSnapshot(p,'gravity-shift-lab',x=>x.payLockSet,'PIN-protected Shift Lab');
  console.log('PAY PROBE BEFORE CLEAR',JSON.stringify(await stateProbe(p,'gravity-shift-lab')));
  await p.evaluate(()=>{localStorage.removeItem('gravityShiftLabProfileV3');localStorage.removeItem('gravityShiftLabSchedulesV3')});
  console.log('PAY PROBE AFTER CLEAR',JSON.stringify(await stateProbe(p,'gravity-shift-lab')));
  await p.reload({waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>{const b=document.querySelector('#gravity-local-recovery');return b&&!b.disabled},null,{timeout:12000}).catch(async error=>{
    const diag=await p.evaluate(async()=>{
      const btn=document.querySelector('#gravity-local-recovery'),msg=document.querySelector('#gravity-local-recovery-status'),sel=document.querySelector('#gravity-local-recovery-version');
      let snapshots='unknown';
      try{snapshots=await new Promise(resolve=>{const o=indexedDB.open('GravitySameBrowserRecoveryV1',1);o.onsuccess=()=>{const d=o.result;const r=d.transaction('snapshots').objectStore('snapshots').get(document.querySelector('#lab-backup')?'gravity-shift-lab':'gravity-inventory-center');r.onsuccess=()=>resolve((r.result||[]).map(x=>({at:x.at,signature:x.signature,values:x.value.map(v=>v?.length)})));r.onerror=()=>resolve('read error')};o.onerror=()=>resolve('db error')})}catch(e){snapshots=e.message}
      return {button:btn?.outerHTML?.slice(0,450),status:msg?.textContent,versions:sel?.outerHTML?.slice(0,450),snapshots,keys:Object.keys(localStorage)};
    });
    throw Error('Recovery unavailable after reload: '+JSON.stringify(diag)+'; original: '+error.message);
  });
  let prompts=[];
  p.on('dialog',d=>{prompts.push(d.message());if(d.type()==='prompt')d.accept(prompts.filter(x=>x.includes('Manager Pay Lock')).length===1?'wrong':'97531');else d.accept()});
  await p.locator('#gravity-local-recovery').click();
  await p.waitForTimeout(220);
  assert.equal(await p.locator('#lab-restaurant').inputValue(),'','Incorrect PIN must not restore private schedule');
  await p.locator('#gravity-local-recovery').click();
  await p.waitForFunction(()=>document.querySelector('#lab-restaurant')?.value==='QA PIN Protected Schedule',{timeout:16000});
  assert.ok(prompts.some(x=>x.includes('Manager Pay Lock')));
  return 'Incorrect manager PIN refused; original manager PIN allowed explicit recovery.';
 }finally{await context.close()}
});
await run('Inventory Center synthetic item can recover locally after localStorage deletion',async()=>{
 const {context,p}=await page('/apps/inventory-center/index');
 try{
  await p.locator('#edit-profile').click();
  await p.locator('#profile-restaurant').fill('QA Inventory Recovery');
  await p.locator('#save-profile').click();
  await p.locator('[data-view="locations"]').click();
  await p.locator('#loc-name').fill('QA Pantry');
  await p.locator('#location-form button[type="submit"]').click();
  const location=await p.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')).locations[0].id);
  await p.locator('[data-view="items"]').click();await p.locator('#add-item').click();
  await p.locator('#item-name').fill('QA Snapshot Apples');
  await p.locator('#item-unit').fill('each');
  await p.locator('#item-cost').fill('1.50');
  await p.locator('#item-par').fill('20');
  await p.locator('#item-reorder').fill('5');
  await p.locator('#item-location').selectOption(location);
  await p.locator('#item-onhand').fill('10');
  await p.locator('#save-item').click();
  await waitForSnapshot(p,'gravity-inventory-center',x=>x.items===1,'full inventory item');
  console.log('INVENTORY PROBE BEFORE CLEAR',JSON.stringify(await stateProbe(p,'gravity-inventory-center')));
  await p.evaluate(()=>localStorage.removeItem('gravityInventoryCenter.v1'));
  console.log('INVENTORY PROBE AFTER CLEAR',JSON.stringify(await stateProbe(p,'gravity-inventory-center')));
  await p.reload({waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>{const b=document.querySelector('#gravity-local-recovery');return b&&!b.disabled},null,{timeout:12000}).catch(async error=>{
    const diag=await p.evaluate(async()=>{
      const btn=document.querySelector('#gravity-local-recovery'),msg=document.querySelector('#gravity-local-recovery-status'),sel=document.querySelector('#gravity-local-recovery-version');
      let snapshots='unknown';
      try{snapshots=await new Promise(resolve=>{const o=indexedDB.open('GravitySameBrowserRecoveryV1',1);o.onsuccess=()=>{const d=o.result;const r=d.transaction('snapshots').objectStore('snapshots').get(document.querySelector('#lab-backup')?'gravity-shift-lab':'gravity-inventory-center');r.onsuccess=()=>resolve((r.result||[]).map(x=>({at:x.at,signature:x.signature,values:x.value.map(v=>v?.length)})));r.onerror=()=>resolve('read error')};o.onerror=()=>resolve('db error')})}catch(e){snapshots=e.message}
      return {button:btn?.outerHTML?.slice(0,450),status:msg?.textContent,versions:sel?.outerHTML?.slice(0,450),snapshots,keys:Object.keys(localStorage)};
    });
    throw Error('Recovery unavailable after reload: '+JSON.stringify(diag)+'; original: '+error.message);
  });
  let confirmations=0;p.on('dialog',d=>{confirmations++;d.accept()});
  await p.locator('#gravity-local-recovery').click();
  await p.waitForFunction(()=>document.getElementById('metric-value')?.textContent==='$15.00',{timeout:17000});
  assert.equal(confirmations,1);
  const value=await p.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')).items[0].name);
  assert.equal(value,'QA Snapshot Apples');
  return 'Inventory location, item, quantity and $15 valuation recovered from local snapshot after selective localStorage removal.';
 }finally{await context.close()}
});
await browser.close();await new Promise(r=>server.close(r));
console.log('GRAVITY_SAME_BROWSER_RECOVERY_QA '+JSON.stringify({total:checks.length,passed:checks.filter(x=>x.result==='PASS').length,failed:checks.filter(x=>x.result==='FAIL').length,checks}));
if(checks.some(x=>x.result==='FAIL'))process.exitCode=1;
