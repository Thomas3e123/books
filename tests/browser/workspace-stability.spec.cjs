const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('Work Study preserves unreadable study and visibly blocks replacement',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('gravityWorkStudyV2','{damaged-study-json'));
  await page.goto('/gravity-work-study-lab');
  await expect(page.locator('#ws2-app [role="alert"]')).toContainText('Existing study needs recovery');
  const original=await page.evaluate(()=>localStorage.getItem('gravityWorkStudyV2'));
  expect(original).toBe('{damaged-study-json');
  await expect(page.locator('#ws2-app [data-start="guided"]')).toHaveCount(0);
});

test('Shift Lab halts before replacing unreadable employee schedules',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('gravityShiftLabSchedulesV3','{damaged-schedule-json'));
  await page.goto('/gravity-shift-lab');
  await expect(page.locator('body > section[role="alert"]')).toContainText('Shift Lab has stopped to protect existing');
  expect(await page.evaluate(()=>localStorage.getItem('gravityShiftLabSchedulesV3'))).toBe('{damaged-schedule-json');
});

test('Inventory Center warns and preserves unreadable saved inventory',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('gravityInventoryCenter.v1','{damaged-inventory-json'));
  await page.goto('/apps/inventory-center/index.html');
  await expect(page.locator('#app-status')).toContainText('Stored inventory could not be validated');
  expect(await page.evaluate(()=>localStorage.getItem('gravityInventoryCenter.v1'))).toBe('{damaged-inventory-json');
});

test('Inventory Center backup triggers a real downloadable JSON file',async({page})=>{
  await page.goto('/apps/inventory-center/index.html');
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#backup-json').evaluate(el=>el.click());
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Gravity_Inventory_Backup_\\d{4}-\\d{2}-\\d{2}\\.json$/);
  const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(data.product).toBe('Gravity Inventory Center');
  expect(data.state.schemaVersion).toBe(1);
  await expect(page.locator('#app-status')).toContainText('backup export started');
});
