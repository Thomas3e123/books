const {test,expect}=require('@playwright/test');

async function fillRegistration(page){
 await page.locator('#reg-first-name').fill('Synthetic');
 await page.locator('#reg-email').fill('synthetic-registration@example.invalid');
 await page.locator('#reg-role').selectOption({label:'General Manager'});
 await page.locator('#reg-need').selectOption({label:'SOPs & station consistency'});
 await page.locator('#reg-feedback-expectation').check();
}

test('Registration failure preserves answers and does not open the books',async({page})=>{
 let posts=0;
 await page.route('http://127.0.0.1:8765/',route=>{
  if(route.request().method()==='POST'){posts++;return route.fulfill({status:503,body:'Not available'});}
  return route.continue();
 });
 await page.goto('/register');
 await fillRegistration(page);
 await page.locator('.gravity-register-form button[type="submit"]').click();
 await expect(page.locator('[data-registration-feedback]')).toContainText('could not be confirmed');
 await expect(page.locator('#reg-email')).toHaveValue('synthetic-registration@example.invalid');
 await expect(page.locator('.gravity-register-form button[type="submit"]')).toBeEnabled();
 expect(posts).toBe(1);
 expect(await page.evaluate(()=>localStorage.getItem('gravity_founding_year_download_access_v1'))).not.toBe('registered');
});

test('Accepted registration cannot falsely say access is unlocked if local storage is blocked',async({page})=>{
 let posts=0;
 await page.addInitScript(()=>{
  const orig=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
   if(key==='gravity_founding_year_download_access_v1')throw new DOMException('Storage blocked','QuotaExceededError');
   return orig.call(this,key,value);
  };
 });
 await page.route('http://127.0.0.1:8765/',route=>{
  if(route.request().method()==='POST'){posts++;return route.fulfill({status:200,body:'OK'});}
  return route.continue();
 });
 await page.goto('/register');
 await fillRegistration(page);
 await page.locator('.gravity-register-form button[type="submit"]').click();
 await expect(page.locator('[data-registration-feedback]')).toContainText('accepted your registration');
 await expect(page.locator('[data-registration-feedback]')).toContainText('Do not register again');
 await expect(page.locator('.gravity-register-form button[type="submit"]')).toBeDisabled();
 await expect(page).toHaveURL(/\/register$/);
 await page.locator('.gravity-register-form').evaluate(el=>el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 expect(posts).toBe(1);
 expect(await page.evaluate(()=>localStorage.getItem('gravity_founding_year_download_access_v1'))).not.toBe('registered');
});
