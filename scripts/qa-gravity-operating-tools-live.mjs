import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const HOST='https://gravityleadershipsystem.com';
const OUT='docs/audits/gravity-operating-tools-live-2026-10-30.md';
const results=[];
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const record=(category,caseName,state,detail)=>results.push({category,caseName,state,detail:String(detail||'').slice(0,300)});
function checked(label,value,message){assert.ok(value,message||label);return label}
async function context(){
 const ctx=await browser.newContext({viewport:{width:1366,height:900}});
 await ctx.route('**/*',route=>{
  const url=route.request().url();
  if(url.startsWith(HOST))return route.continue();
  return route.abort();
 });
 return ctx;
}
async function task(category,caseName,fn){
 try{const value=await fn();record(category,caseName,'PASS',value);console.log('PASS '+category+' '+caseName+' '+String(value||''));}
 catch(e){record(category,caseName,'FAIL',e.message||String(e));console.error('FAIL '+category+' '+caseName+': '+String(e.stack||e).slice(0,1000));}
}
await task('Shift Lab','Create synthetic employee, save schedule and survive reload',async()=>{
 const ctx=await context();
 try{
  const p=await ctx.newPage();const res=await p.goto(HOST+'/gravity-shift-lab',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(res.status(),200);
  await p.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:18000});
  const row=p.locator('#lab-body tr[data-employee-id]').first();
  const week=await p.locator('#lab-week').inputValue();
  checked('week',week,'Schedule week is not selected');
  await p.locator('#lab-restaurant').fill('Gravity QA Synthetic Restaurant');
  await p.locator('#lab-sales').fill('10000');
  await row.locator('.employee-name').fill('QA Synthetic Employee');
  await row.locator('.employee-wage').fill('20');
  await row.locator('.shift-input[data-day="1"]').fill('9a-5p');
  await p.locator('#lab-save').click();
  const state=await p.evaluate(()=>({
   profile:JSON.parse(localStorage.getItem('gravityShiftLabProfileV3')||'null'),
   schedules:JSON.parse(localStorage.getItem('gravityShiftLabSchedulesV3')||'null')
  }));
  assert.equal(state.profile.restaurant,'Gravity QA Synthetic Restaurant');
  const emp=state.profile.employees.find(e=>e.name==='QA Synthetic Employee');
  checked('employee',emp,'Employee not saved');
  assert.equal(String(emp.wage),'20');
  assert.equal(state.schedules[week].sales,'10000');
  assert.equal(state.schedules[week].shifts[emp.id][1],'9a-5p');
  await p.reload({waitUntil:'domcontentloaded'});
  await p.locator('#lab-body tr[data-employee-id]').first().waitFor();
  assert.equal(await p.locator('#lab-restaurant').inputValue(),'Gravity QA Synthetic Restaurant');
  assert.equal(await p.locator('#lab-body tr .employee-name').first().inputValue(),'QA Synthetic Employee');
  assert.equal(await p.locator('#lab-body tr .shift-input[data-day="1"]').first().inputValue(),'9a-5p');
  return 'Browser-local data retained on reload; employee, wage, weekly sales, Monday shift verified; no server writes.';
 }finally{await ctx.close();}
});
await task('Inventory Center','Create synthetic location and item, verify value and reload',async()=>{
 const ctx=await context();
 try{
  const p=await ctx.newPage();const res=await p.goto(HOST+'/apps/inventory-center/index',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(res.status(),200);
  await p.locator('#edit-profile').click();
  await p.locator('#profile-restaurant').fill('Gravity QA Synthetic Inventory');
  await p.locator('#save-profile').click();
  await p.locator('[data-view="locations"]').click();
  await p.locator('#loc-name').fill('QA Walk-in Test');
  await p.locator('#location-form button[type="submit"]').click();
  const s1=await p.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null'));
  assert.equal(s1.profile.restaurant,'Gravity QA Synthetic Inventory');
  assert.equal(s1.locations.length,1);
  const locationId=s1.locations[0].id;
  await p.locator('[data-view="items"]').click();
  await p.locator('#add-item').click();
  await p.locator('#item-name').fill('QA Test Tomatoes');
  await p.locator('#item-unit').fill('lb');
  await p.locator('#item-cost').fill('2.50');
  await p.locator('#item-par').fill('12');
  await p.locator('#item-reorder').fill('4');
  await p.locator('#item-location').selectOption(locationId);
  await p.locator('#item-onhand').fill('10');
  await p.locator('#save-item').click();
  const s2=await p.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null'));
  assert.equal(s2.items.length,1);
  assert.equal(s2.items[0].name,'QA Test Tomatoes');
  assert.equal(s2.items[0].cost,2.5);
  assert.equal(Number(Object.values(s2.items[0].balances).reduce((x,y)=>x+Number(y),0)),10);
  await p.reload({waitUntil:'domcontentloaded'});
  const s3=await p.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null'));
  assert.equal(s3.locations.length,1);
  assert.equal(s3.items.length,1);
  assert.equal(await p.locator('#metric-value').innerText(),'$25.00');
  return 'Synthetic profile, location, item, count and $25 valuation persisted after reload; browser-only, no customer data.';
 }finally{await ctx.close();}
});
await task('Gravity Reader','Registration gate and synthetic registered book loading',async()=>{
 const ctx=await context();
 try{
  const p=await ctx.newPage();const res=await p.goto(HOST+'/book-reader',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(res.status(),200);
  const fresh=await p.evaluate(()=>({gate:document.querySelector('#reader-gate').hidden,books:document.querySelector('#reader-available-books').hidden}));
  assert.equal(fresh.gate,false,'Book registration gate should be visible for fresh browser');
  assert.equal(fresh.books,true,'Book titles should be locked for fresh browser');
  await p.evaluate(()=>localStorage.setItem('gravity_founding_year_download_access_v1','registered'));
  await p.reload({waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>document.querySelectorAll('#reader-book option[value]').length>10,{timeout:18000});
  const counts=await p.evaluate(()=>({books:document.querySelectorAll('#reader-book-buttons button').length,gate:document.querySelector('#reader-gate').hidden,options:document.querySelector('#reader-book').options.length}));
  assert.equal(counts.gate,true);
  assert.ok(counts.books>=10,'Registered book catalog is not populated');
  await p.locator('#reader-book').selectOption('quiet-gravity');
  await p.waitForFunction(()=>document.querySelector('#reader-text').textContent.trim().length>100,{timeout:25000});
  const chars=await p.locator('#reader-text').evaluate(x=>x.textContent.length);
  return 'Fresh browser gated; simulated local access shows '+counts.books+' books; Quiet Gravity text loaded ('+chars+' chars). Does not test real sign-up backend.';
 }finally{await ctx.close();}
});
await task('Service endpoints','Read-only TTS health and protected manager endpoint',async()=>{
 const ctx=await context();
 try{
  const voice=await ctx.request.get(HOST+'/.netlify/functions/gravity-tts',{timeout:25000});
  const voiceText=await voice.text();
  const denied=await ctx.request.get(HOST+'/testing-room/manager/testers',{timeout:25000});
  assert.equal(denied.status(),401,'Private manager endpoint must deny anonymous reads');
  assert.equal(voice.status(),200,'TTS health route should return HTTP 200');
  const info=JSON.parse(voiceText);
  assert.equal(info.ok,true);
  assert.equal(info.configured,true,'TTS provider configuration missing');
  assert.ok((info.voices||[]).includes('cedar'));
  return 'Voice configuration healthy and Cedar offered; anonymous manager data denied (401). No paid audio synthesis or sign-in performed.';
 }finally{await ctx.close();}
});
await task('Downloads','Read-only check for five PDFs and a Windows manual',async()=>{
 const ctx=await context();
 try{
  const names=['gravity-field-sheet-01-manager-excuses.pdf','gravity-field-sheet-02-food-cost.pdf','gravity-field-sheet-03-manager-follow-through.pdf','gravity-field-sheet-04-food-waste.pdf','gravity-field-sheet-05-employee-retention.pdf'];
  for(const name of names){
   const v=await ctx.request.get(HOST+'/assets/downloads/'+name,{timeout:22000});
   assert.equal(v.status(),200,'Missing Field Sheet: '+name);
   const b=await v.body();assert.equal(b.subarray(0,4).toString(),'%PDF','Not a PDF: '+name);
  }
  const manual=await ctx.request.get(HOST+'/assets/downloads/windows/manuals/current/Gravity_Shift_Lab_Windows_User_Manual.html',{timeout:22000});
  assert.equal(manual.status(),200);
  assert.ok((await manual.text()).length>2000);
  return 'Five genuine PDF files and current Shift Lab Windows manual delivered successfully. Windows executable not launched.';
 }finally{await ctx.close();}
});
await browser.close();
const failures=results.filter(x=>x.state==='FAIL');
const lines=['# Gravity operating tools and persistence QA — October 30, 2026','',
 'Test scope: real Gravity production pages in fresh isolated headless Chrome contexts; deliberately synthetic browser-local data only. No live customer records, tester submissions, emails, charges, paid speech requests or Netlify database mutations.',
 '','| Test | Result | Evidence |','| --- | --- | --- |',
 ...results.map(x=>'| '+x.category+' — '+x.caseName+' | '+x.state+' | '+x.detail.replaceAll('|','/')+' |'),
 '','## Coverage limitations','',
 'The in-browser Founding Year registration marker is simulated for Reader UI testing; it is not proof of the real registration or delivery process.',
 'Inventory and Shift Lab persistence are local to one browser/device. A successful reload does not establish cloud backup, cross-device synchronization or customer account recovery.',
 'Voice health GET proves configuration only, not audible synthesis latency, quality, or mobile microphone permissions.',
 'Windows ZIP installation and remote updates require an actual Windows virtual machine and are not tested by Chrome.',
 'Email form delivery and authenticated back-end persistent records require separate tests with an isolated test account or staging database.',
 '','Critical failures: '+failures.length+'.',
];
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,lines.join('\n')+'\n');
console.log('GRAVITY_OPERATING_TOOLS_REPORT '+JSON.stringify({tests:results.length,passed:results.length-failures.length,failed:failures.length,results}));
if(failures.length)process.exitCode=1;
