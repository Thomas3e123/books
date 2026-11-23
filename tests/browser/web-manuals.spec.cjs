const {test, expect} = require('@playwright/test');

test('web manuals fit a narrow phone and link to the printable editions', async ({page}) => {
  await page.setViewportSize({width: 320, height: 740});
  for (const slug of ['guest-relationship-retention', 'performance-profitability', 'standards-intelligence']) {
    await page.goto('/' + slug + '-manual');
    const main = page.locator('main.gravity-web-manual');
    await expect(main.locator('h1')).toHaveCount(1);
    await expect(main.locator('a[href="/assets/system-previews/' + slug + '-manual.pdf"]')).toBeVisible();
    const overflows = await main.locator('table').evaluateAll(tables =>
      tables.filter(table => table.getBoundingClientRect().right > window.innerWidth).length);
    expect(overflows, slug).toBe(0);
    await main.getByText('Contents', {exact:true}).click();
    await expect(main.locator('details a').first()).toBeVisible();
  }
});
