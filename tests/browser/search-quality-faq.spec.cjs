const {test,expect}=require('@playwright/test');

test('Help Center printing search finds a genuinely useful, accurately titled FAQ',async({page})=>{
  await page.goto('/help-center');
  const shell=page.locator('[data-page-search]').first();
  await shell.locator('[data-page-search-input]').fill('printing');
  const result=shell.locator('button.page-search-result').first();
  await expect(result).toBeVisible();
  await expect(result.locator('strong')).toContainText('How do I print a Gravity PDF, Word file, or form?');
  await expect(shell.locator('[data-page-search-status]')).toContainText('match');
  await result.click();
  await expect(shell.locator('[data-page-search-results]')).toBeHidden();
  const faq=page.locator('details.faq-item').filter({has:page.locator('summary',{hasText:'How do I print a Gravity PDF'})});
  await expect(faq).toHaveAttribute('open','');
  await expect(faq).toContainText('paper size');
  await expect(faq).toContainText('orientation');
});

test('Knowledge Center search ranks focused food-cost results above unrelated general tools',async({page})=>{
  await page.goto('/knowledge-center');
  const shell=page.locator('[data-page-search]').first();
  await shell.locator('[data-page-search-input]').fill('food cost');
  const results=shell.locator('button.page-search-result');
  await expect(results.first()).toBeVisible();
  const firstTitle=await results.first().locator('strong').textContent();
  expect(firstTitle?.toLowerCase()).toContain('food cost');
  const all=await results.count();
  expect(all).toBeGreaterThan(1);
  expect(all).toBeLessThanOrEqual(18);
});

test('Help Center FAQs have question titles instead of generic Page section labels',async({page})=>{
  await page.goto('/help-center');
  const shell=page.locator('[data-page-search]').first();
  await shell.locator('[data-page-search-input]').fill('download');
  await expect(shell.locator('button.page-search-result').first()).toBeVisible();
  const titles=await shell.locator('button.page-search-result strong').allTextContents();
  expect(titles.some(t=>t.includes('Page section'))).toBe(false);
  await shell.locator('[data-page-search-input]').fill('zzznomatchunique45881');
  await expect(shell.locator('[data-page-search-status]')).toHaveText('No matches on this page');
  await shell.locator('[data-page-search-clear]').click();
  await expect(shell.locator('[data-page-search-results]')).toBeHidden();
});
