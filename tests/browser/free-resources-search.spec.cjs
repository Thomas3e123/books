const {test,expect}=require('@playwright/test');

test('resource search isolates the requested operating system instead of listing unrelated system cards',async({page})=>{
  await page.goto('/free-resources');
  const input=page.locator('[data-page-search-input]');
  await input.fill('Guest Relationship & Retention');
  const results=page.locator('[data-page-search-results]');
  await expect(results).toBeVisible();
  const titles=await results.locator('.page-search-result strong').allTextContents();
  expect(titles.filter(title=>title.trim()==='Guest Relationship & Retention')).toHaveLength(1);
  expect(titles).not.toContain('Restaurant Performance & Profitability');
  await results.locator('.page-search-result',{has:page.locator('strong',{hasText:'Guest Relationship & Retention'})}).click();
  await expect(page.locator('.comparison-card.page-search-hit h3')).toHaveText('Guest Relationship & Retention');
});

test('book search identifies the exact book rather than unrelated titles in its section',async({page})=>{
  await page.goto('/free-resources');
  const input=page.locator('[data-page-search-input]');
  await input.fill('Quiet Gravity');
  const titles=await page.locator('[data-page-search-results] .page-search-result strong').allTextContents();
  expect(titles.filter(title=>title.trim()==='Quiet Gravity')).toHaveLength(1);
  expect(titles).not.toContain("The Owner's Chair");
  await page.locator('[data-page-search-results] .page-search-result',{has:page.locator('strong').filter({hasText:/^Quiet Gravity$/})}).click();
  await expect(page.locator('article.book-card.page-search-hit h3')).toHaveText('Quiet Gravity');
});

test('download-card search finds its actual file section and the search can be cleared',async({page})=>{
  await page.goto('/free-resources');
  const input=page.locator('[data-page-search-input]');
  await input.fill('Gravity Master Customer Installation Package');
  const titles=await page.locator('[data-page-search-results] .page-search-result strong').allTextContents();
  expect(titles.filter(title=>title.includes('Gravity Master Customer Installation Package'))).toHaveLength(1);
  await page.locator('[data-page-search-results] .page-search-result',{has:page.locator('strong',{hasText:'Gravity Master Customer Installation Package'})}).click();
  await expect(page.locator('.download-card.page-search-hit')).toContainText('Gravity Master Customer Installation Package');
  await input.fill('zzzz-not-a-resource-zzzz');
  await expect(page.locator('[data-page-search-status]')).toHaveText('No matches on this page');
  await page.locator('[data-page-search-clear]').click();
  await expect(input).toHaveValue('');
  await expect(page.locator('[data-page-search-results]')).toBeHidden();
});
