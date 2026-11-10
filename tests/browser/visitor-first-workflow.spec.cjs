const {test,expect}=require('@playwright/test');

test('First visitor can go from homepage through Start Here and Gravity Assist, save work, and return',async({page})=>{
  await page.goto('/');
  const enter=page.locator('button[data-welcome-enter]');
  if(await enter.isVisible())await enter.click();
  await page.locator('a.btn[href="/start-here"]').first().click();
  await expect(page).toHaveURL(/\/start-here$/);
  const open=page.getByRole('link',{name:'Choose My First Tool — Open Gravity Assist'});
  await expect(open).toBeVisible();
  await open.click();
  await expect(page).toHaveURL(/\/gravity-assist$/);
  await page.locator('[data-route="shift"]').click();
  const route=page.locator('#assist-route a[href="/gravity-shift-lab"]');
  await expect(route).toBeVisible();
  await route.click();
  await expect(page).toHaveURL(/\/gravity-shift-lab$/);
  await page.locator('#lab-week').fill('2026-11-08');
  await page.locator('#lab-save').evaluate(el=>el.click());
  await expect(page.locator('#lab-status')).toContainText('Week saved on this device');
  await page.reload();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityShiftLabSchedulesV3')||'{}'));
  expect(saved['2026-11-08']).toBeTruthy();
  await page.locator('.breadcrumbs a[href="/gravity-assist"]').click();
  await expect(page).toHaveURL(/\/gravity-assist$/);
  await expect(page.locator('#assist-task-grid [data-route="shift"]')).toBeVisible();
});

test('Start Here offers a tool-first path without removing approved free downloads',async({page})=>{
  await page.goto('/start-here');
  const hero=page.locator('.page-hero');
  const actions=hero.locator('.hero-actions a');
  await expect(actions).toHaveCount(3);
  await expect(actions.first()).toHaveAttribute('href','/gravity-assist');
  await expect(actions.nth(1)).toHaveAttribute('href',/Gravity_Start_Here_v2\.6_2026-10-10\.pdf$/);
  await expect(actions.nth(2)).toHaveAttribute('href',/GRAVITY_CUSTOMER_INSTALLATION_PACKAGE_v1\.5_2026-09-17\.zip$/);
  await expect(actions.nth(1)).toHaveAttribute('download');
  await expect(actions.nth(2)).toHaveAttribute('download');
  await expect(page.getByRole('link',{name:'Download PDF'}).first()).toHaveAttribute('href',/Gravity_System_Overview_v1\.8_2026-10-10\.pdf$/);
  await expect(hero).toContainText('without installing a program');
});
