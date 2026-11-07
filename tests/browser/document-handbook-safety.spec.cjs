const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('Document Studio preserves unreadable drafts and refuses accidental overwrite',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('gravityDocumentStudioDraft','{damaged-json'));
  await page.goto('/gravity-document-studio');
  await expect(page.locator('#studio-status')).toContainText('Saving is blocked');
  await page.locator('#studio-save').evaluate(el=>el.click());
  await expect(page.locator('#studio-status')).toContainText('Saving blocked');
  expect(await page.evaluate(()=>localStorage.getItem('gravityDocumentStudioDraft'))).toBe('{damaged-json');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#studio-reset').evaluate(el=>el.click());
  await expect(page.locator('#studio-status')).toContainText('Previous browser draft deleted');
  expect(await page.evaluate(()=>localStorage.getItem('gravityDocumentStudioDraft'))).toBeNull();
});

test('Document Studio normal draft survives reload',async({page})=>{
  await page.goto('/gravity-document-studio');
  await page.locator('#studio-company').fill('Gravity Test Restaurant');
  await page.locator('#studio-save').evaluate(el=>el.click());
  await expect(page.locator('#studio-status')).toContainText('Draft saved in this browser');
  await page.reload();
  await expect(page.locator('#studio-company')).toHaveValue('Gravity Test Restaurant');
  await expect(page.locator('#studio-status')).toContainText('Saved draft restored');
});

test('Document Studio produces a Word-compatible download',async({page})=>{
  await page.goto('/gravity-document-studio');
  const pending=page.waitForEvent('download');
  await page.locator('#studio-word').evaluate(el=>el.click());
  const result=await pending;
  expect(result.suggestedFilename()).toMatch(/\.doc$/i);
  const body=fs.readFileSync(await result.path(),'utf8');
  expect(body).toContain('<!doctype html>');
  await expect(page.locator('#studio-status')).toContainText('download started');
});

test('Handbook Creator still works when optional recent-project localStorage is blocked',async({page})=>{
  await page.addInitScript(()=>{
    const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
    Storage.prototype.getItem=function(key){if(key==='gravity.handbook.web.active')throw Error('Blocked optional project preference');return get.call(this,key);};
    Storage.prototype.setItem=function(key,value){if(key==='gravity.handbook.web.active')throw Error('Blocked optional project preference');return set.call(this,key,value);};
  });
  await page.goto('/handbook-creator/index.html');
  await expect(page.locator('#saved')).toContainText('Saved on this device');
  await expect(page.locator('#saved')).toContainText('recent project selection not remembered');
  await expect(page.locator('#projects option')).toHaveCount(1);
  await page.locator('#new').click();
  await expect(page.locator('#projects option')).toHaveCount(2);
  await expect(page.locator('#saved')).toContainText('Saved on this device');
  await page.reload();
  await expect(page.locator('#projects option')).toHaveCount(2);
});

test('Handbook Creator project backup remains independently downloadable',async({page})=>{
  await page.goto('/handbook-creator/index.html');
  await expect(page.locator('#saved')).toContainText('Saved on this device');
  const pending=page.waitForEvent('download');
  await page.locator('#backup').click();
  const result=await pending;
  expect(result.suggestedFilename()).toMatch(/\.gravityhandbook$/);
  const backup=JSON.parse(fs.readFileSync(await result.path(),'utf8'));
  expect(backup.projectId).toBeTruthy();
  expect(backup.formatVersion).toMatch(/^0\.[12]\.0$/);
});
