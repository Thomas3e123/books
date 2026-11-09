const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

test('Guide registry routes all published Gravity resources to valid same-site destinations',async({page})=>{
  await page.goto('/gravity-aware');
  const registry=await page.evaluate(()=>window.__GRAVITY_GUIDE_REGISTRY__);
  expect(registry).toBeTruthy();
  expect(registry.resources.length).toBe(214);
  const site=path.resolve(__dirname,'../../site');
  const redirects=fs.readFileSync(path.join(site,'_redirects'),'utf8').split(/\r?\n/);
  const validRedirects=new Set(redirects.map(line=>line.trim().split(/\s+/)).filter(parts=>parts.length>=3&&!parts[0].includes('*')&&/^(200|301|302)!?$/.test(parts[2])).map(parts=>parts[0]));
  const standaloneResponse=await page.request.get('/gravity-guide-registry-v2.json');
  expect(standaloneResponse.ok()).toBe(true);
  const standalone=await standaloneResponse.json();
  expect(standalone.resources).toHaveLength(214);
  for(const item of standalone.resources){
    expect(item.url,'Standalone registry must use same-origin Gravity paths: '+item.id).toMatch(/^\\/(?!\\/)/);
    expect(item.url).not.toContain('thomasmonroebooks.com');
  }
  for(const item of registry.resources){
    expect(item.url, 'Gravity destination for '+item.id).toMatch(/^\/(?!\/)/);
    expect(item.url, 'Do not send Gravity users to the publisher site: '+item.id).not.toMatch(/thomasmonroebooks\.com|netlify\.app/i);
    const target=item.url.split(/[?#]/)[0].replace(/\/$/,'')||'/';
    const isFile=[target,target+'.html',target+'/index.html'].some(p=>fs.existsSync(path.join(site,'.'+p)));
    expect(isFile||validRedirects.has(target)||target==='/','Broken Gravity Guide destination: '+item.id+' at '+item.url).toBe(true);
  }
});

test('A real Guide scheduling answer opens Shift Lab on Gravity, not Thomas Monroe Books',async({page})=>{
  // Exercise the real offline fallback deterministically, without requiring a paid AI request.
  await page.route('**/.netlify/functions/gravity-guide',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"synthetic test: AI unavailable"}'}));
  await page.goto('/gravity-aware');
  await page.locator('#gravity-guide-launcher').click();
  await expect(page.locator('#gravity-guide-panel')).toBeVisible();
  await page.locator('#gravity-guide-input').fill('I need help with scheduling');
  await page.locator('#gravity-guide-form button[type="submit"]').click();
  const link=page.locator('#gravity-guide-panel a[href="/gravity-shift-lab"]').last();
  await expect(link).toHaveAttribute('href','/gravity-shift-lab');
  await link.click();
  await expect(page).toHaveURL(/\/gravity-shift-lab$/);
});

test('Guide SOP and document recommendations remain on the Gravity primary site',async({page})=>{
  // Exercise the real offline fallback deterministically, without requiring a paid AI request.
  await page.route('**/.netlify/functions/gravity-guide',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"synthetic test: AI unavailable"}'}));
  await page.goto('/gravity-aware');
  await page.locator('#gravity-guide-launcher').click();
  const input=page.locator('#gravity-guide-input');
  await input.fill('find an sop');
  await page.locator('#gravity-guide-form button[type="submit"]').click();
  await expect(page.locator('#gravity-guide-panel a[href="/gravity-sop-foundry"]').last()).toHaveAttribute('href','/gravity-sop-foundry');
  await input.fill('create a document');
  await page.locator('#gravity-guide-form button[type="submit"]').click();
  await expect(page.locator('#gravity-guide-panel a[href="/gravity-document-studio"]').last()).toHaveAttribute('href','/gravity-document-studio');
  const hrefs=await page.locator('#gravity-guide-panel a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  expect(hrefs.every(h=>h?.startsWith('/')&&!h.startsWith('//'))).toBe(true);
});
