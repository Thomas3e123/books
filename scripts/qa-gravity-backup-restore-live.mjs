import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {chromium} from 'playwright';

const HOST='https://gravityleadershipsystem.com';
const OUT='docs/audits/gravity-backup-restore-live-2026-10-30.md';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gravity-backup-qa-'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[];
const test=async(label,fn)=>{
 try{const detail=await fn();checks.push({label,status:'PASS',detail});console.log('PASS '+label+' — '+detail)}
 catch(e){checks.push({label,status:'FAIL',detail:String(e.message||e).slice(0,300)});console.error('FAIL '+label+' '+String(e.stack||e).slice(0,1000))}
};
async function open(url){
 const ctx=await browser.newContext({acceptDownloads:true,viewport:{width:1400,height:900}});
 await ctx.route('**/*',r=>r.request().url().startsWith(HOST)?r.continue():r.abort());
 const page=await ctx.newPage();const res=await page.goto(HOST+url,{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(res?.status(),200);return {ctx,page};
}
await test('Shift Lab JSON backup restores employee and shift on a clean device',async()=>{
 const {ctx,page}=await open('/gravity-shift-lab');
 let backupFile=path.join(dir,'shift.json');
 try{
  await page.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:15000});
  const row=page.locator('#lab-body tr[data-employee-id]').first();
  await page.locator('#lab-restaurant').fill('Gravity Backup QA Only');
  await page.locator('#lab-sales').fill('9000');
  await row.locator('.employee-name').fill('QA Backup Employee');
  await row.locator('.employee-wage').fill('21');
  await row.locator('.shift-input[data-day="2"]').fill('10a-6p');
  await page.locator('#lab-save').click();
  const downloadPromise=page.waitForEvent('download',{timeout:12000});
  await page.locator('#lab-backup').click();
  const file=await downloadPromise;await file.saveAs(backupFile);
  const backup=JSON.parse(fs.readFileSync(backupFile,'utf8'));
  assert.equal(backup.profile.restaurant,'Gravity Backup QA Only');
  assert.equal(backup.profile.employees.find(e=>e.name==='QA Backup Employee').wage,21);
 }finally{await ctx.close()}
 const restored=await open('/gravity-shift-lab');
 try{
  const {page:p}=restored;
  await p.locator('#lab-body tr[data-employee-id]').first().waitFor({timeout:15000});
  await p.locator('#lab-restore-file').setInputFiles(backupFile);
  await p.waitForFunction(()=>document.querySelector('#lab-restaurant')?.value==='Gravity Backup QA Only',{timeout:15000});
  assert.equal(await p.locator('#lab-restaurant').inputValue(),'Gravity Backup QA Only');
  assert.equal(await p.locator('#lab-body tr .employee-name').first().inputValue(),'QA Backup Employee');
  assert.equal(await p.locator('#lab-body tr .shift-input[data-day="2"]').first().inputValue(),'10a-6p');
  await p.reload({waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('#lab-body tr .employee-name').first().inputValue(),'QA Backup Employee');
  return 'Exported genuine JSON; restored synthetic name, wage and Tuesday shift in a fresh browser; survived reload.';
 }finally{await restored.ctx.close()}
});
await test('Inventory Center backup restores stock and cost in a clean browser',async()=>{
 let backupFile=path.join(dir,'inventory.json');
 const {ctx,page}=await open('/apps/inventory-center/index');
 try{
  await page.locator('#edit-profile').click();
  await page.locator('#profile-restaurant').fill('Gravity Restore QA Only');
  await page.locator('#save-profile').click();
  await page.locator('[data-view="locations"]').click();
  await page.locator('#loc-name').fill('QA Cold Storage');
  await page.locator('#location-form button[type="submit"]').click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')));
  const id=state.locations[0].id;
  await page.locator('[data-view="items"]').click();
  await page.locator('#add-item').click();
  await page.locator('#item-name').fill('QA Pickles');
  await page.locator('#item-unit').fill('jar');
  await page.locator('#item-cost').fill('4.25');
  await page.locator('#item-par').fill('15');
  await page.locator('#item-reorder').fill('4');
  await page.locator('#item-location').selectOption(id);
  await page.locator('#item-onhand').fill('8');
  await page.locator('#save-item').click();
  const downloadPromise=page.waitForEvent('download',{timeout:12000});
  await page.locator('#backup-json').click();
  const file=await downloadPromise;await file.saveAs(backupFile);
  let value=JSON.parse(fs.readFileSync(backupFile,'utf8'));
  assert.equal(value.product,'Gravity Inventory Center');
  assert.equal(value.state.items[0].cost,4.25);
 }finally{await ctx.close()}
 const restored=await open('/apps/inventory-center/index');
 try{
  const {page:p}=restored;
  p.on('dialog',d=>d.accept());
  const chooser=p.waitForEvent('filechooser',{timeout:12000});
  await p.locator('#restore-json').click();
  const dialog=await chooser;
  await dialog.setFiles(backupFile);
  await p.waitForFunction(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'{}').items?.length===1,{timeout:16000});
  const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')));
  assert.equal(state.profile.restaurant,'Gravity Restore QA Only');
  assert.equal(state.items[0].name,'QA Pickles');
  assert.equal(state.items[0].cost,4.25);
  await p.reload({waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('#metric-value').innerText(),'$34.00');
  return 'Real JSON backup imported into independent browser; 8 jars at $4.25 = $34.00 retained after reload.';
 }finally{await restored.ctx.close()}
});
await browser.close();
fs.rmSync(dir,{recursive:true,force:true});
const lines=['# Gravity live backup/recovery verification — October 30, 2026','',
 'Synthetic data in isolated headless browsers only. No real customers, production accounts, remote API mutations, registration, or subscriptions involved.',
 '','| Test | Result | Evidence |','| --- | --- | --- |',
 ...checks.map(x=>'| '+x.label+' | '+x.status+' | '+x.detail.replaceAll('|','/')+' |'),
 '','## Important', '',
 'Browser-only storage is not automatic cloud backup. This test only proves that the exported JSON can be imported in another clean browser. Customers must keep backup files safe.',
 'Windows installers and remote updates were not installed by these browser tests.','',
 'Failures: '+checks.filter(x=>x.status==='FAIL').length+'.'];
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,lines.join('\n')+'\n');
console.log('GRAVITY_BACKUP_RESTORE_QA '+JSON.stringify({tests:checks.length,failures:checks.filter(x=>x.status==='FAIL').length,report:OUT}));
if(checks.some(x=>x.status==='FAIL'))process.exitCode=1;
