const {test,expect}=require('@playwright/test');

function trackedEvent(page,name){
  return page.evaluate(({name})=>{
    const rows=window.dataLayer||[];
    const row=Array.from(rows).find(args=>args[0]==='event'&&args[1]===name);
    return row?row[2]||{}:null;
  },{name});
}

test('Gravity records a product open and generic workspace interaction without control content',async({page})=>{
  await page.goto('/gravity-assist?gravity_analytics_test=1');
  await expect.poll(()=>trackedEvent(page,'gravity_product_open')).toMatchObject({
    product_slug:'gravity-assist',
    product_surface:'web'
  });
  await page.locator('#assist-task-grid button').first().click();
  await expect.poll(()=>trackedEvent(page,'gravity_product_interaction')).toMatchObject({
    product_slug:'gravity-assist',
    product_surface:'web',
    interaction_type:'button'
  });
  const params=await trackedEvent(page,'gravity_product_interaction');
  expect(Object.keys(params).sort()).toEqual([
    'gravity_site',
    'interaction_type',
    'page_category',
    'page_path_clean',
    'product_slug',
    'product_surface'
  ].sort());
});

test('Gravity sends no product analytics when Do Not Track is enabled',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'doNotTrack',{configurable:true,value:'1'});});
  await page.goto('/gravity-assist?gravity_analytics_test=1');
  await page.locator('#assist-task-grid button').first().click();
  expect(await page.evaluate(()=>window.dataLayer||[])).toHaveLength(0);
});

test('Local browser tests are excluded unless they explicitly enable test analytics',async({page})=>{
  const external=[];
  page.on('request',req=>{if(req.url().includes('googletagmanager.com'))external.push(req.url());});
  await page.goto('/gravity-assist');
  await page.locator('#assist-task-grid button').first().click();
  expect(await page.evaluate(()=>window.dataLayer||[])).toHaveLength(0);
  expect(external).toHaveLength(0);
});

test('QA flag excludes the rest of the current tab session',async({page})=>{
  await page.goto('/gravity-assist?gravity_analytics_test=1&gravity_qa=1');
  expect(await page.evaluate(()=>window.dataLayer||[])).toHaveLength(0);
  await page.goto('/gravity-document-studio?gravity_analytics_test=1');
  expect(await page.evaluate(()=>window.dataLayer||[])).toHaveLength(0);
});
