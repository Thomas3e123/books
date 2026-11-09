const {test,expect}=require('@playwright/test');

test('Homepage five-question audit leads to the native Gravity tool, not an external host',async({page})=>{
  await page.goto('/');
  const entry=page.getByRole('link',{name:'Find your weakest system — 5 questions'});
  await expect(entry).toHaveAttribute('href','/gravity-aware?tool=systems#gravity-quick-tools');
  await expect(entry).not.toHaveAttribute('href',/muse\.ai/);
  await page.goto('/gravity-aware?tool=systems#gravity-quick-tools');
  await expect(page.locator('#gravity-quick-workspace')).toBeVisible();
  await expect(page.locator('#gravity-quick-title')).toHaveText('Five-question system check');
  await expect(page.locator('#gravity-quick-form fieldset')).toHaveCount(5);
});

test('Five-question audit requires all answers, without pretending incomplete evidence is a diagnosis',async({page})=>{
  await page.goto('/gravity-aware?tool=systems#gravity-quick-tools');
  await page.getByRole('button',{name:'Generate next steps'}).click();
  await expect(page.locator('#gravity-quick-result')).toContainText('Answer each question before continuing.');
  await expect(page.locator('#gravity-quick-result')).not.toContainText('Priority:');
});

test('Five-question audit explains when all controls are unknown and avoids ranking them as proven weaknesses',async({page})=>{
  await page.goto('/gravity-aware?tool=systems#gravity-quick-tools');
  const selects=page.locator('#gravity-quick-form select');
  await expect(selects).toHaveCount(5);
  for(let i=0;i<5;i++)await selects.nth(i).selectOption('2');
  await page.getByRole('button',{name:'Generate next steps'}).click();
  await expect(page.locator('#gravity-quick-result')).toContainText('Evidence is insufficient');
  await expect(page.locator('#gravity-quick-result')).toContainText('No weakest system can be established');
});

test('A single concern produces the relevant control and clear evidence-first guidance',async({page})=>{
  await page.goto('/gravity-aware?tool=systems#gravity-quick-tools');
  const selects=page.locator('#gravity-quick-form select');
  for(let i=0;i<5;i++)await selects.nth(i).selectOption(i===2?'1':'0');
  await page.getByRole('button',{name:'Generate next steps'}).click();
  await expect(page.locator('#gravity-quick-result')).toContainText('Priority: Food cost');
  await expect(page.locator('#gravity-quick-result')).toContainText('prove the cause');
  await expect(page.locator('#gravity-quick-result a')).toHaveAttribute('href','/operating-systems#system-finder');
});

test('The native 30-day plan presents a provisional plan rather than a verified solution',async({page})=>{
  await page.goto('/gravity-aware?tool=plan#gravity-quick-tools');
  await expect(page.locator('#gravity-quick-title')).toHaveText('30-Day Install Plan');
  await expect(page.locator('#gravity-quick-form fieldset')).toHaveCount(1);
  await page.locator('#gravity-quick-form select').selectOption({label:'SOP standards'});
  await page.getByRole('button',{name:'Generate next steps'}).click();
  await expect(page.locator('#gravity-quick-result')).toContainText('not yet validated');
  await expect(page.locator('#gravity-quick-result')).toContainText('measurable proof');
  await expect(page.locator('#gravity-quick-result a')).toHaveAttribute('href','/gravity-sop-foundry');
});
