const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('Handbook Creator backup restores as a separate editable project without replacing original',async({page})=>{
  await page.goto('/handbook-creator/index.html');
  await expect(page.locator('#saved')).toContainText('Saved on this device');
  await page.locator('[id="answer-welcome.name"]').fill('Gravity Recovery Test Restaurant');
  await expect.poll(()=>page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('gravity.handbook.web.v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    const out=await new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    db.close();return out.some(p=>p.answers?.['welcome.name']==='Gravity Recovery Test Restaurant');
  })).toBe(true);
  const pending=page.waitForEvent('download');
  await page.locator('#backup').click();
  const file=await pending,buffer=fs.readFileSync(await file.path());
  const saved=JSON.parse(buffer.toString('utf8'));
  expect(saved.answers['welcome.name']).toBe('Gravity Recovery Test Restaurant');
  const original=saved.projectId;
  await page.locator('#restore').setInputFiles({name:'recovery.gravityhandbook',mimeType:'application/json',buffer});
  await expect(page.locator('#message')).toContainText('Backup opened as a separate project');
  await expect(page.locator('#projects option')).toHaveCount(2);
  const imported=await page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('gravity.handbook.web.v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    const list=await new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    db.close();return list.map(x=>({id:x.projectId,answer:x.answers?.['welcome.name']}));
  });
  expect(new Set(imported.map(x=>x.id)).size).toBe(2);
  expect(imported.some(x=>x.id===original)).toBe(true);
  expect(imported.filter(x=>x.answer==='Gravity Recovery Test Restaurant')).toHaveLength(2);
  await page.reload();
  await expect(page.locator('#projects option')).toHaveCount(2);
  await expect(page.locator('[id="answer-welcome.name"]')).toHaveValue('Gravity Recovery Test Restaurant');
});

test('Handbook Creator rejects damaged backup without changing existing projects',async({page})=>{
  await page.goto('/handbook-creator/index.html');
  await expect(page.locator('#projects option')).toHaveCount(1);
  const id=await page.locator('#projects').inputValue();
  await page.locator('#restore').setInputFiles({name:'damaged.gravityhandbook',mimeType:'application/json',buffer:Buffer.from('{damaged')});
  await expect(page.locator('#message')).toContainText('Backup not opened');
  await expect(page.locator('#projects option')).toHaveCount(1);
  expect(await page.locator('#projects').inputValue()).toBe(id);
});

test('Inventory Center restores downloaded data and preserves posted records',async({page})=>{
  await page.goto('/apps/inventory-center/index.html');
  await page.locator('#profile-dialog').evaluate(el=>el.showModal());
  await page.locator('#profile-restaurant').fill('Gravity Recovery Inventory');
  await page.locator('#save-profile').click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null')?.profile?.restaurant)).toBe('Gravity Recovery Inventory');
  await page.reload();
  const pending=page.waitForEvent('download');
  await page.locator('#backup-json').evaluate(x=>x.click());
  const file=await pending,buffer=fs.readFileSync(await file.path());
  const saved=JSON.parse(buffer.toString('utf8'));
  expect(saved.state.profile.restaurant).toBe('Gravity Recovery Inventory');
  await page.evaluate(()=>{
    const key='gravityInventoryCenter.v1',record=JSON.parse(localStorage.getItem(key));
    record.profile.restaurant='Altered Restaurant';localStorage.setItem(key,JSON.stringify(record));
  });
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')).profile.restaurant)).toBe('Altered Restaurant');
  page.on('dialog',d=>d.accept());
  await page.locator('#restore-json').evaluate(x=>x.click());
  await page.locator('#web-restore-input').setInputFiles({name:'Gravity_Inventory_Backup.json',mimeType:'application/json',buffer});
  await expect(page.locator('#app-status')).toContainText('Backup restored successfully');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')).profile.restaurant)).toBe('Gravity Recovery Inventory');
  await page.reload();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')).profile.restaurant)).toBe('Gravity Recovery Inventory');
});

test('Inventory Center rejects malformed backups without modifying existing records',async({page})=>{
  await page.goto('/apps/inventory-center/index.html');
  const initial=await page.evaluate(()=>localStorage.getItem('gravityInventoryCenter.v1'));
  await page.locator('#restore-json').evaluate(x=>x.click());
  await page.locator('#web-restore-input').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"product":"Gravity Inventory Center","state":{"schemaVersion":999}}')});
  await expect(page.locator('#app-status')).toContainText('Unsupported backup product or version');
  expect(await page.evaluate(()=>localStorage.getItem('gravityInventoryCenter.v1'))).toBe(initial);
});

test('Shift Lab restores a backed-up week and removes changes added later',async({page})=>{
  await page.goto('/gravity-shift-lab');
  await page.locator('#lab-week').fill('2026-11-08');
  await page.locator('#lab-save').evaluate(x=>x.click());
  await expect(page.locator('#lab-status')).toContainText('Week saved on this device');
  const pending=page.waitForEvent('download');
  await page.locator('#lab-backup').evaluate(x=>x.click());
  const file=await pending,buffer=fs.readFileSync(await file.path());
  const original=JSON.parse(buffer.toString('utf8'));
  expect(original.schedules['2026-11-08']).toBeTruthy();
  await page.locator('#lab-week').fill('2026-11-15');
  await page.locator('#lab-save').evaluate(x=>x.click());
  await expect(page.locator('#lab-status')).toContainText('Week saved on this device');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityShiftLabSchedulesV3'))['2026-11-15'])).toBeTruthy();
  page.on('dialog',d=>d.accept());
  await page.locator('#lab-restore-file').setInputFiles({name:'gravity-shift-lab-backup.json',mimeType:'application/json',buffer});
  await expect(page.locator('#lab-status')).toContainText('Backup restored and saved information verified');
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityShiftLabSchedulesV3')));
  expect(restored['2026-11-08']).toBeTruthy();
  expect(restored['2026-11-15']).toBeUndefined();
});

test('Shift Lab rejects damaged backup without deleting saved weeks',async({page})=>{
  await page.goto('/gravity-shift-lab');
  await page.locator('#lab-week').fill('2026-11-08');
  await page.locator('#lab-save').evaluate(x=>x.click());
  const before=await page.evaluate(()=>localStorage.getItem('gravityShiftLabSchedulesV3'));
  await page.locator('#lab-restore-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"profile":{},"schedules":{"2026-11-08":[]}}')});
  await expect(page.locator('#lab-status')).toContainText('Backup rejected');
  expect(await page.evaluate(()=>localStorage.getItem('gravityShiftLabSchedulesV3'))).toBe(before);
});

test('Work Study history backup restores archived evidence after browser history is cleared',async({page})=>{
  await page.goto('/gravity-work-study-lab');
  await page.locator('#ws2-app [data-start="guided"]').click();
  await page.locator('#f-problem').fill('Gravity Test: verify dishwashing recovery');
  await page.locator('#ws2-app [data-action="save"]').first().click();
  const expected=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityWorkStudyV2History'))[0]);
  expect(expected.problem).toBe('Gravity Test: verify dishwashing recovery');
  await page.locator('#ws2-app [data-action="history"]').first().click();
  const pending=page.waitForEvent('download');
  await page.locator('#ws2-app [data-action="download-history"]').click();
  const downloaded=await pending;
  expect(downloaded.suggestedFilename()).toBe('gravity-work-study-history-backup.json');
  const buffer=fs.readFileSync(await downloaded.path());
  const backup=JSON.parse(buffer.toString('utf8'));
  expect(backup.product).toBe('Gravity Work Study Lab');
  expect(backup.studies[0].id).toBe(expected.id);
  await page.evaluate(()=>localStorage.removeItem('gravityWorkStudyV2History'));
  await page.reload();
  await expect(page.locator('#ws2-app')).toContainText('No saved studies yet');
  page.on('dialog',d=>d.accept());
  await page.locator('#ws2-history-import').setInputFiles({name:'gravity-work-study-history-backup.json',mimeType:'application/json',buffer});
  await expect(page.locator('#ws2-status')).toContainText('Imported 1 study successfully');
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityWorkStudyV2History')));
  expect(restored).toHaveLength(1);
  expect(restored[0].problem).toBe(expected.problem);
  await page.locator('#ws2-app [data-open-study="'+expected.id+'"]').click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityWorkStudyV2')).id)).toBe(expected.id);
});

test('Work Study rejects a damaged history backup without changing archived studies',async({page})=>{
  await page.goto('/gravity-work-study-lab');
  await page.locator('#ws2-app [data-start="guided"]').click();
  await page.locator('#ws2-app [data-action="save"]').first().click();
  await page.locator('#ws2-app [data-action="history"]').first().click();
  const before=await page.evaluate(()=>localStorage.getItem('gravityWorkStudyV2History'));
  await page.locator('#ws2-history-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"product":"Gravity Work Study Lab","version":2,"studies":[{"id":"WS_bad"}]}')});
  await expect(page.locator('#ws2-status')).toContainText('History import failed');
  expect(await page.evaluate(()=>localStorage.getItem('gravityWorkStudyV2History'))).toBe(before);
});
