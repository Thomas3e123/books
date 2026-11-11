const {test,expect}=require('@playwright/test');

test.describe('Public Gravity menu at Edge-like high zoom',()=>{
 test.use({viewport:{width:480,height:340}});

 test('shows all public destinations in a compact independently scrollable menu',async({page})=>{
  await page.goto('/start-here');
  const nav=page.locator('header.site-header #site-nav');
  const toggle=page.locator('header.site-header [data-menu-toggle]');
  await expect(nav.locator('a[href]')).toHaveCount(9);
  await expect(nav.locator('a.btn-red')).toHaveCount(0);
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  const rect=await nav.boundingBox();
  expect(rect).toBeTruthy();
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.y+rect.height).toBeLessThanOrEqual(341);
  await nav.locator('a[href="/windows-programs"]').scrollIntoViewIfNeeded();
  await expect(nav.locator('a[href="/windows-programs"]')).toBeVisible();
  await nav.locator('button.gravity-nav-close').click();
  await expect(nav).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
 });

 test('restores missing links when a browser leaves only Home and Windows Programs',async({page})=>{
  await page.goto('/help-center');
  const nav=page.locator('header.site-header #site-nav');
  await page.evaluate(()=>{
    const target=document.querySelector('header.site-header #site-nav');
    target.querySelectorAll('a[href]').forEach(a=>{
      if(!['/','/windows-programs'].includes(a.getAttribute('href')))a.remove();
    });
  });
  await expect(nav.locator('a[href]')).toHaveCount(2);
  await page.locator('header.site-header [data-menu-toggle]').click();
  await expect(nav.locator('a[href]')).toHaveCount(9);
  await expect(nav.locator('a[href="/start-here"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
 });
});

test('The Gravity Report retains the independent publication masthead',async({page})=>{
 await page.goto('/gravity-report');
 await expect(page.locator('.report-masthead')).toHaveCount(1);
 await expect(page.locator('header.site-header #site-nav .gravity-nav-close')).toHaveCount(0);
});
