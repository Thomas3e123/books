const {test,expect}=require('@playwright/test');

test('A manager can paste a procedure by keyboard, save a draft and skip its duplicate',async({page,baseURL})=>{
  expect(new URL(baseURL).hostname).toBe('127.0.0.1');
  await page.goto('/apps/sop-foundry/import-export.html');
  await page.getByLabel('Build Room PIN').fill('0000');
  await page.getByRole('button',{name:'Unlock Build Room'}).click();
  const paste=page.getByRole('textbox',{name:'Paste the complete SOP'});
  async function addDraft(){
    await paste.fill('Title: Fictional closing check\nTraining: Competency\nSteps: Record the closing count');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button',{name:'Add to review queue'})).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await addDraft();
  const save=page.getByRole('button',{name:'Save selected as Drafts'});
  await save.click();
  await expect(page.locator('#status')).toContainText('1 working draft(s) saved');
  await page.reload();
  await addDraft();
  await expect(page.locator('#queue')).toContainText('Possible duplicate');
  await page.getByLabel('Duplicate handling').selectOption('skip');
  await save.click();
  await expect(page.locator('#status')).toContainText('0 working draft(s) saved. 1 matching SOP(s) skipped.');
});
