const { test, expect } = require('@playwright/test');

for (const route of ['gravity-handbook-creator', 'gravity-sop-library-volume-3', 'testing-room-manager']) {
  test(`keyboard users can skip the menu on ${route}`, async ({ page }) => {
    await page.goto('/' + route);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });
}
