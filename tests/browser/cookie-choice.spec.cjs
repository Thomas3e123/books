const {test, expect} = require('@playwright/test');
const path = require('node:path');
const origin = 'https://gravityleadershipsystem.com';

for (const route of ['/gravity-assist', '/apps/inventory-center']) {
  test('analytics requires consent and can be withdrawn on ' + route, async ({page, context}) => {
    let tags = 0;
    await page.route('**/*', async request => {
      const url = new URL(request.request().url());
      if (url.hostname === 'www.googletagmanager.com') {
        tags++;
        return request.fulfill({body:'', contentType:'text/javascript'});
      }
      if (url.origin !== origin) return request.abort();
      if (url.pathname.startsWith('/assets/js/')) {
        return request.fulfill({path:path.join('site', url.pathname), contentType:'text/javascript'});
      }
      const script = url.pathname.startsWith('/apps/') ? 'product-analytics' : 'site';
      return request.fulfill({contentType:'text/html',body:'<main id="analytics-settings"></main><script src="/assets/js/gravity-cookie-choice.js"></script><script src="/assets/js/'+script+'.js"></script>'});
    });
    await page.goto(origin + route);
    expect(tags).toBe(0);
    await page.getByRole('button',{name:'Decline analytics'}).click();
    await page.reload();
    expect(tags).toBe(0);
    await page.getByRole('button',{name:'Allow analytics'}).click();
    await expect.poll(()=>tags).toBe(1);
    await context.addCookies([{name:'_ga',value:'test',url:origin}]);
    await page.getByRole('button',{name:'Decline analytics'}).click();
    await page.reload();
    expect(tags).toBe(1);
    expect((await context.cookies()).map(c=>c.name)).not.toContain('_ga');
  });
}
