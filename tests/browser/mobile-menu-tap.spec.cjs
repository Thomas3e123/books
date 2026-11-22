const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test('first-time visitors can tap Menu and follow links on two pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#gravity-first-visit')).toBeHidden();
  for (const path of ['/books', '/help-center']) {
    const menu = page.locator('header.site-header [data-menu-toggle]');
    await menu.tap();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const link = page.locator('#site-nav a[href="' + path + '"]');
    await link.tap();
    await expect(page).toHaveURL(new RegExp(path + '$'));
  }
});

test('visitors can navigate when the menu script is unavailable', async ({ page }) => {
  await page.route('**/assets/js/site.js*', route => route.abort());
  await page.goto('/');
  await expect(page.locator('header.site-header [data-menu-toggle]')).toBeHidden();
  await page.locator('#site-nav a[href="/books"]').tap();
  await expect(page).toHaveURL(/\/books$/);
});
