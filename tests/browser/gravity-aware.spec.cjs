const {test,expect}=require('@playwright/test');
test('Homepage opens the five-question assessment directly',async({page})=>{
  await page.goto('/');
  const link=page.getByRole('link',{name:/Find your weakest system/i});
  await expect(link).toHaveAttribute('href','/gravity-aware?tool=systems#gravity-quick-tools');
  if(await page.locator('#gravity-first-visit').isVisible()) await page.getByRole('button',{name:'Enter the Full Site'}).click();
  await link.click();
  await expect(page).toHaveURL(/gravity-aware\?tool=systems#gravity-quick-tools/);
  await expect(page.locator('#gravity-quick-workspace')).toBeVisible();
  await expect(page.locator('#gravity-quick-workspace select')).toHaveCount(5);
  await expect(page.locator('#gravity-quick-workspace #gravity-quick-title')).toHaveText('Five-question system check');
});
test('Assessment analytics tracks actions without collecting individual answers',async({page})=>{
  const events=[];
  await page.exposeFunction('captureAssessmentEvent',(event,params)=>{events.push({event,params});});
  await page.goto('/gravity-aware');
  await page.evaluate(()=>{window.gravityAnalyticsEvent=(event,params)=>window.captureAssessmentEvent(event,params);});
  await page.locator('[data-gravity-tool="systems"]').click();
  const box=page.locator('#gravity-quick-workspace');
  const selects=await box.locator('select').all();
  for(let i=0;i<selects.length;i++)await selects[i].selectOption(i===0?'1':'0');
  await box.getByRole('button',{name:'Generate next steps'}).click();
  await expect(box.locator('#gravity-quick-result')).toContainText('Priority: Leadership');
  await box.getByRole('link',{name:'Open relevant Gravity resources'}).click();
  await expect.poll(()=>events.map(e=>e.event)).toEqual([
    'gravity_assessment_start','gravity_assessment_complete','gravity_assessment_resource_open'
  ]);
  for(const item of events)expect(item.params).toEqual({assessment_type:'systems'});
});
for(const [key,label] of [['systems','Five-question system check'],['food','Food-Cost Leak Finder'],['sop','Which SOP First?'],['plan','30-Day Install Plan']]){
test(label+' generates results and can switch tools',async({page})=>{await page.goto('/gravity-aware#gravity-quick-tools');await page.locator('[data-gravity-tool="'+key+'"]').click();const box=page.locator('#gravity-quick-workspace');await expect(box).toBeVisible();await expect(box.locator('h3').first()).toBeVisible();await box.getByRole('button',{name:'Generate next steps'}).click();await expect(box.locator('#gravity-quick-result')).toContainText('Answer each question');for(const select of await box.locator('select').all())await select.selectOption('1');await box.getByRole('button',{name:'Generate next steps'}).click();await expect(box.locator('#gravity-quick-result')).toContainText('Priority:');await expect(box.getByRole('link',{name:'Open relevant Gravity resources'})).toHaveAttribute('href',/^\//);await page.locator('[data-gravity-tool="systems"]').click();await expect(box.locator('select')).toHaveCount(5);});
}
test('20-question assessment remains on page',async({page})=>{await page.goto('/gravity-aware');await expect(page.locator('#aware-form .aware-question')).toHaveCount(20);});
test('No Muse links on homepage or Gravity Aware',async({page})=>{for(const url of ['/','/gravity-aware']){await page.goto(url);await expect(page.locator('a[href*="muse.ai"]')).toHaveCount(0);}});

test('Successful download registration counts once and keeps marketing consent separate',async({page})=>{
  await page.route('http://127.0.0.1:8765/',route=>{
    if(route.request().method()==='POST')return route.fulfill({status:200,contentType:'text/plain',body:'Accepted'});
    return route.continue();
  });
  await page.goto('/register');
  await page.locator('#reg-first-name').fill('Test');
  await page.locator('#reg-email').fill('synthetic@example.invalid');
  await page.locator('#reg-role').selectOption({label:'General Manager'});
  await page.locator('#reg-need').selectOption({label:'SOPs & station consistency'});
  await page.locator('#reg-feedback-expectation').check();
  await page.locator('.gravity-register-form button[type="submit"]').click();
  await page.waitForURL(/\/registration-thanks$/);
  const events=()=>page.evaluate(()=>Array.from(window.dataLayer||[]).filter(v=>v[0]==='event').map(v=>v[1]));
  await expect.poll(events).toContain('registration_complete');
  expect((await events()).filter(e=>e==='registration_complete')).toHaveLength(1);
  expect((await events()).filter(e=>e==='registration_email_opt_in')).toHaveLength(0);
  await page.reload();
  expect((await events()).filter(e=>e==='registration_complete')).toHaveLength(0);
});

test('Site search directs visitors to individual operating-system sections',async({page})=>{
  await page.goto('/');
  if(await page.locator('#gravity-first-visit').isVisible()) await page.getByRole('button',{name:'Enter the Full Site'}).click();
  await page.getByRole('button',{name:'Search Gravity'}).click();
  await page.locator('#gravity-site-search-input').fill('employee retention');
  await expect(page.locator('#gravity-site-search-results a',{hasText:'Hiring, Retention & Employee Relations'})).toHaveAttribute('href','/operating-systems#hiring-retention');
  await page.locator('#gravity-site-search-input').fill('food cost');
  await expect(page.locator('#gravity-site-search-results a',{hasText:'Food Cost, Inventory & Purchasing'})).toHaveAttribute('href','/operating-systems#food-cost-inventory');
});

test('Main menu routes Free Resources to the download library',async({page})=>{
  await page.goto('/');
  const nav=page.locator('header.site-header nav#site-nav');
  await expect(nav.locator('a[href="/free-resources"]')).toHaveText('Free Resources');
});

test('Unknown diagnostic link parameters do not open a tool',async({page})=>{
  await page.goto('/gravity-aware?tool=not-a-real-tool#gravity-quick-tools');
  await expect(page.locator('#gravity-quick-workspace')).toBeHidden();
  await expect(page.locator('[data-gravity-tool="systems"]')).toBeVisible();
});

test('A verified diagnostic does not invent a weakest system',async({page})=>{
  await page.goto('/gravity-aware?tool=systems#gravity-quick-tools');
  const box=page.locator('#gravity-quick-workspace');
  await expect(box).toBeVisible();
  for(const select of await box.locator('select').all()) await select.selectOption('0');
  await box.getByRole('button',{name:'Generate next steps'}).click();
  await expect(box.locator('#gravity-quick-result')).toContainText('No immediate weakness identified');
  await expect(box.locator('#gravity-quick-result')).toContainText('has not established a weakest system');
});
