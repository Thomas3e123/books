const {test,expect}=require('@playwright/test');

function trackedEvent(page,name){
  return page.evaluate(({name})=>{
    const row=Array.from(window.dataLayer||[]).find(args=>args[0]==='event'&&args[1]===name);
    return row?row[2]||{}:null;
  },{name});
}

test('Hosted Inventory Center records app use without field contents',async({page})=>{
  await page.goto('/apps/inventory-center/index.html?gravity_analytics_test=1');
  await expect.poll(()=>trackedEvent(page,'gravity_product_open')).toMatchObject({
    product_slug:'inventory-center-app',
    product_surface:'web',
    interaction_type:'open'
  });
  await page.locator('#backup-json').evaluate(el=>el.click());
  await expect.poll(()=>trackedEvent(page,'gravity_product_interaction')).toMatchObject({
    product_slug:'inventory-center-app',
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

test('Standalone product analytics honors Do Not Track',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'doNotTrack',{configurable:true,value:'1'});});
  await page.goto('/apps/inventory-center/index.html?gravity_analytics_test=1');
  expect(await page.evaluate(()=>window.dataLayer||[])).toHaveLength(0);
});
