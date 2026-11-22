const { test, expect } = require('@playwright/test');

test('backward tabbing keeps a catalog link clear of the sticky header', async ({ page }) => {
  await page.goto('/books');
  const header = page.locator('header.site-header');
  const target = page.locator('a.mini-btn[href="/quiet-gravity"]');
  await target.focus();
  await page.keyboard.press('Tab');
  await target.evaluate(link => {
    const bar = document.querySelector('header.site-header').getBoundingClientRect();
    window.scrollBy({ top: link.getBoundingClientRect().top - bar.height / 2, behavior: 'instant' });
  });
  await page.keyboard.press('Shift+Tab');
  await expect(target).toBeFocused();
  await expect.poll(async () => {
    const bar = await header.boundingBox();
    const link = await target.boundingBox();
    return link.y >= bar.y + bar.height;
  }).toBe(true);
});
