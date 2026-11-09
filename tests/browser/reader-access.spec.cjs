const {test,expect}=require('@playwright/test');

const REGISTERED_KEY='gravity_founding_year_download_access_v1';
async function setRegistered(page){
  await page.addInitScript(key=>localStorage.setItem(key,'registered'),REGISTERED_KEY);
}
async function stubReportCatalog(page,articles=[]){
  await page.route('**/gravity-report/articles.json*',route=>route.fulfill({
    status:200,contentType:'application/json',body:JSON.stringify({articles})
  }));
}

test('Public Reader explains browser-local registration without preview-site language',async({page})=>{
  await stubReportCatalog(page);
  await page.goto('/book-reader');
  const gate=page.locator('#reader-gate');
  await expect(gate).toBeVisible();
  await expect(gate).toContainText('Reader access is remembered on this browser');
  await expect(gate).not.toContainText('This test website');
  await expect(gate.locator('a[href="/register"]')).toBeVisible();
});

test('Unregistered visitors cannot see the full-book catalog',async({page})=>{
  await stubReportCatalog(page);
  await page.goto('/book-reader');
  await expect(page.locator('#reader-gate')).toBeVisible();
  await expect(page.locator('#reader-available-books')).toBeHidden();
  await expect(page.locator('#reader-book optgroup[label="Gravity Books"] option')).toHaveCount(0);
  await expect(page.locator('#reader-book-buttons button')).toHaveCount(0);
});

test('Registered visitors see 15 books and can open the readable text',async({page})=>{
  await setRegistered(page);
  await stubReportCatalog(page);
  await page.goto('/book-reader');
  await expect(page.locator('#reader-gate')).toBeHidden();
  await expect(page.locator('#reader-book optgroup[label="Gravity Books"] option')).toHaveCount(15);
  await expect(page.locator('#reader-book-buttons button')).toHaveCount(15);
  await page.locator('#reader-book').selectOption('quiet-gravity');
  await expect(page.locator('#reader-book-title')).toHaveText('Quiet Gravity');
  await expect.poll(async()=>{
    const t=await page.locator('#reader-text').textContent();
    return (t||'').trim().length;
  }).toBeGreaterThan(50);
  await expect(page.locator('#reader-saved')).toContainText('Last place saved on this browser');
});

test('Registered book selection survives an unavailable catalog request using embedded fallback',async({page})=>{
  await setRegistered(page);
  await stubReportCatalog(page);
  await page.route('**/assets/reader/catalog.json*',route=>route.abort('failed'));
  await page.goto('/book-reader');
  await expect(page.locator('#reader-book optgroup[label="Gravity Books"] option')).toHaveCount(15);
  await expect(page.locator('#reader-book option[value="systems-of-service"]')).toHaveText('Systems of Service');
});

test('Public report articles remain selectable without unlocking books',async({page})=>{
  await stubReportCatalog(page,[{
    slug:'example-public-edition',issue:1,title:'Example Public Report Edition',released:true
  }]);
  await page.goto('/book-reader');
  await expect(page.locator('#reader-gate')).toBeVisible();
  await expect(page.locator('#reader-book optgroup[label="Gravity Books"] option')).toHaveCount(0);
  await expect(page.locator('#reader-book option[value="gravity-report-example-public-edition"]')).toHaveText('Issue 01 · Example Public Report Edition');
});
