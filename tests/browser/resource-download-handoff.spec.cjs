const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

const pendingKey='gravity_pending_download_v1';
const accessKey='gravity_founding_year_download_access_v1';
const sample='assets/samples/the-complete-gravity-system-one-page-ad.pdf';

test('all 34 distinct Free Resources download files exist on the site',async({page})=>{
 await page.goto('/free-resources');
 const hrefs=await page.locator('a[download]').evaluateAll(anchors=>[...new Set(anchors.map(a=>a.getAttribute('href')).filter(Boolean))]);
 expect(hrefs.length).toBeGreaterThanOrEqual(34);
 for(const href of hrefs){
   const pathname=new URL(href,'http://127.0.0.1:8765/free-resources').pathname;
   expect(pathname).not.toContain('..');
   expect(fs.existsSync(path.join(__dirname,'../../site',pathname))).toBe(true);
 }
});

test('registrant follows the requested file exactly once, then sees the real resource library',async({page})=>{
 await page.route('http://127.0.0.1:8765/',route=>{
   if(route.request().method()==='POST')return route.fulfill({status:200,contentType:'text/plain',body:'Accepted'});
   return route.continue();
 });
 await page.goto('/free-resources');
 const first=page.locator('a[href="'+sample+'"]');
 await first.click();
 await page.waitForURL(/\/register\?download=1/);
 expect(await page.evaluate(k=>localStorage.getItem(k),pendingKey)).toContain(sample);
 await page.locator('#reg-first-name').fill('Synthetic');
 await page.locator('#reg-email').fill('synthetic-resource@example.invalid');
 await page.locator('#reg-role').selectOption({label:'General Manager'});
 await page.locator('#reg-need').selectOption({label:'SOPs & station consistency'});
 await page.locator('#reg-feedback-expectation').check();
 await page.locator('.gravity-register-form button[type="submit"]').click();
 await page.waitForURL(/\/registration-thanks$/);
 const action=page.locator('[data-gravity-continue-download]');
 await expect(action).toHaveText('Continue to My Download');
 await expect(action).toHaveAttribute('href',new RegExp(sample.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
 const downloading=page.waitForEvent('download');
 await action.click();
 const dl=await downloading;
 expect(dl.suggestedFilename()).toBe(path.basename(sample));
 expect(await page.evaluate(k=>localStorage.getItem(k),pendingKey)).toBeNull();
 await page.reload();
 await expect(action).toHaveText('Browse Digital Resources');
 await expect(action).toHaveAttribute('href','/free-resources');
});

test('already-registered visitors do not return to the registration form to download resources',async({page})=>{
 await page.addInitScript(k=>localStorage.setItem(k,'registered'),accessKey);
 await page.goto('/free-resources');
 const downloading=page.waitForEvent('download');
 await page.locator('a[href="'+sample+'"]').click();
 const dl=await downloading;
 expect(dl.suggestedFilename()).toBe(path.basename(sample));
 await expect(page).toHaveURL(/\/free-resources$/);
});

test('a newly started registered download clears an obsolete previous pending file',async({page})=>{
 await page.addInitScript(({access,pending})=>{
   localStorage.setItem(access,'registered');
   localStorage.setItem(pending,'https://gravityleadershipsystem.com/assets/downloads/old-file.pdf');
 },{access:accessKey,pending:pendingKey});
 await page.goto('/free-resources');
 const downloading=page.waitForEvent('download');
 await page.locator('a[href="'+sample+'"]').click();
 await downloading;
 expect(await page.evaluate(k=>localStorage.getItem(k),pendingKey)).toBeNull();
 await page.goto('/registration-thanks');
 await expect(page.locator('[data-gravity-continue-download]')).toHaveAttribute('href','/free-resources');
});
