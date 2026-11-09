const {test,expect}=require('@playwright/test');

test('AI prompt directory advertises the same count as the shipped data index',async({page})=>{
  const response=await page.request.get('/assets/data/restaurant-ai-prompts-350.json');
  expect(response.ok()).toBe(true);
  const prompts=await response.json();
  expect(Array.isArray(prompts)).toBe(true);
  expect(prompts).toHaveLength(350);
  const ids=new Set(prompts.map(p=>p.id));
  expect(ids.size).toBe(350);
  await page.goto('/restaurant-ai-prompt-search');
  await expect(page.locator('.ai-prompt-count strong')).toHaveText('350');
  await expect(page).toHaveTitle(/350 Restaurant AI Prompts/);
  await expect(page.locator('main')).toContainText('Search all 350');
});

test('AI prompt search loads the current 350-prompt JSON, not obsolete indices',async({page})=>{
  const hits=[];
  await page.route('**/assets/data/restaurant-ai-prompts-*.json',route=>{
    hits.push(route.request().url());
    return route.continue();
  });
  await page.goto('/restaurant-ai-prompt-search');
  await expect.poll(()=>hits.length).toBeGreaterThan(0);
  expect(hits.every(url=>url.includes('restaurant-ai-prompts-350.json'))).toBe(true);
});
