const {test,expect}=require('@playwright/test');

test('Gravity Report searches released article text and grows beyond its initial cards',async({page})=>{
 await page.route('**/gravity-report/articles.json*',route=>route.fulfill({
  status:200,
  contentType:'application/json',
  body:JSON.stringify({articles:[
   {issue:1,title:'Why Do My Restaurant Managers Keep Making Excuses?',slug:'why-do-my-restaurant-managers-keep-making-excuses',category:'LEADERSHIP & ACCOUNTABILITY',release_date:'2026-10-20',released:true,summary:'A published leadership article.',search_text:'Why Do My Restaurant Managers Keep Making Excuses? LEADERSHIP & ACCOUNTABILITY A published leadership article. Evidence from a verified manager follow-through record.'},
   {issue:31,title:'How Do You Find Inventory Count Errors?',slug:'how-do-you-find-inventory-count-errors',category:'INVENTORY & RECORD ACCURACY',release_date:'2027-01-22',released:true,summary:'A published inventory article.',search_text:'How Do You Find Inventory Count Errors? INVENTORY & RECORD ACCURACY A published inventory article. Search-only variance phrase: apron ledger mismatch.'},
   {issue:32,title:'Why Are Closing Logs Incomplete?',slug:'why-are-closing-logs-incomplete',category:'SHIFT CONTROL & STANDARDS',release_date:'2027-01-26',released:false,summary:null,search_text:null}
  ]})
 }));
 await page.goto('/gravity-report');
 await expect(page.locator('#report-31')).toHaveCount(1);
 await expect(page.locator('#report-31')).toContainText('How Do You Find Inventory Count Errors?');
 await expect(page.locator('#report-32')).toHaveCount(1);
 await expect(page.locator('#report-32 a')).toHaveCount(0);

 const search=page.locator('#report-search');
 await search.fill('apron ledger mismatch');
 await expect(page.locator('#report-31')).toBeVisible();
 await expect(page.locator('#report-1')).toBeHidden();
 await expect(page.locator('#report-32')).toBeHidden();
 await expect(page.locator('#report-search-count')).toContainText('1 article match your search');

 await search.fill('');
 await page.locator('#report-category-filter').selectOption('INVENTORY & RECORD ACCURACY');
 await expect(page.locator('#report-31')).toBeVisible();
 await expect(page.locator('#report-1')).toBeHidden();
 await expect(page.locator('#report-32')).toBeHidden();
 await expect(page.locator('#report-search-count')).toContainText('1 article in Inventory & Record Accuracy');

 await search.fill('unreleased secret phrase');
 await expect(page.locator('.report-search-empty')).toBeVisible();
 await expect(page.locator('#report-32')).toBeHidden();
});
