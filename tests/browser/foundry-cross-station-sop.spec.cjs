const {test,expect}=require('@playwright/test');

const sops=[
 {id:'qa-pizza',title:'Pizza Station Opening',station:'Pizza',sourceId:'QA-PIZZA-OPEN',category:'Opening',purpose:'Prepare the pizza station.',role:'Cook',revision:'1.0',effectiveDate:'2026-11-10',approvedBy:'Synthetic Manager',status:'Approved',steps:['Check station supplies.'],trainingRequirement:'review'},
 {id:'qa-dish',title:'Dish Pit Closing',station:'Dish Pit',sourceId:'QA-DISH-CLOSE',category:'Closing',purpose:'Close the dish pit.',role:'Dish operator',revision:'1.0',effectiveDate:'2026-11-10',approvedBy:'Synthetic Manager',status:'Approved',steps:['Clean and sanitize racks.'],trainingRequirement:'review'},
];
async function mockPublishedEmployee(page){
 // Replace only test-browser API calls. These fictional records never go to a real restaurant.
 await page.route('**/apps/sop-foundry/room-gate.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* isolated synthetic access */'}));
 await page.route('**/apps/sop-foundry/hosted-bridge.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* isolated synthetic session */'}));
 await page.route('**/apps/sop-foundry/web-api-shim.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* synthetic API only */'}));
 await page.route('**/api/published-sops*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{sops},canBuild:false})}));
 await page.route('**/api/published-posters*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({posters:[{id:'qa-poster',title:'Dish Pit Poster',station:'Dish Pit',revision:'1'}]})}));
 await page.addInitScript(()=>localStorage.setItem('gravity-foundry-employee-profile-v1-local',JSON.stringify({homeStation:'Pizza',name:'Synthetic Tester'})));
}
test('Cross-station SOP QR opens the requested published procedure despite stored Pizza station',async({page})=>{
 await mockPublishedEmployee(page);
 await page.goto('/apps/sop-foundry/staff-sops.html?from=poster&poster=qa-poster#qa-dish');
 await expect(page.locator('#detail h2')).toHaveText('Dish Pit Closing');
 await expect(page.locator('#station')).toHaveValue('All stations');
 await expect(page.locator('#list .item')).toHaveCount(2);
 await expect(page.locator('#list button[data-id="qa-dish"]')).toHaveCount(1);
 await expect(page.locator('#buildLink')).toBeHidden();
});
test('Employee station preference still applies on ordinary SOP entry without an explicit link',async({page})=>{
 await mockPublishedEmployee(page);
 await page.goto('/apps/sop-foundry/staff-sops.html');
 await expect(page.locator('#station')).toHaveValue('Pizza');
 await expect(page.locator('#detail h2')).toHaveText('Pizza Station Opening');
 await expect(page.locator('#list .item')).toHaveCount(1);
 await page.locator('#station').selectOption('Dish Pit');
 await expect(page.locator('#detail h2')).toHaveText('Dish Pit Closing');
});
