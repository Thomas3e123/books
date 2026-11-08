const {test,expect}=require('@playwright/test');

test('New registration leads to the live Free Resources library, not unfinished fulfillment',async({page})=>{
  await page.route('http://127.0.0.1:8765/',route=>{
    if(route.request().method()==='POST')return route.fulfill({status:200,contentType:'text/plain',body:'Accepted'});
    return route.continue();
  });
  await page.goto('/register');
  await page.locator('#reg-first-name').fill('Synthetic');
  await page.locator('#reg-email').fill('recovery-test@example.invalid');
  await page.locator('#reg-role').selectOption({label:'General Manager'});
  await page.locator('#reg-need').selectOption({label:'SOPs & station consistency'});
  await page.locator('#reg-feedback-expectation').check();
  await page.locator('.gravity-register-form button[type="submit"]').click();
  await page.waitForURL(/\/registration-thanks$/);
  const action=page.locator('[data-gravity-continue-download]');
  await expect(action).toHaveText('Browse Digital Resources');
  await expect(action).toHaveAttribute('href','/free-resources');
  await expect(page.locator('.hero-actions a',{hasText:'Browse Digital Resources'}).last()).toHaveAttribute('href','/free-resources');
  await action.click();
  await expect(page).toHaveURL(/\/free-resources$/);
  await expect(page.locator('main')).toContainText('Gravity');
});

test('Returning registered visitor can browse real resources without another form',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('gravity_founding_year_download_access_v1','registered'));
  await page.goto('/registration-thanks');
  const action=page.locator('[data-gravity-continue-download]');
  await expect(action).toHaveAttribute('href','/free-resources');
  await action.click();
  await expect(page).toHaveURL(/\/free-resources$/);
});

test('Visiting registration confirmation directly does not invent registration',async({page})=>{
  await page.goto('/registration-thanks');
  const action=page.locator('[data-gravity-continue-download]');
  await expect(action).toHaveAttribute('href','/register');
  await expect(action).toHaveText('Complete Registration');
  await expect(page.locator('.hero-actions a',{hasText:'Browse Digital Resources'}).last()).toHaveAttribute('href','/free-resources');
});
