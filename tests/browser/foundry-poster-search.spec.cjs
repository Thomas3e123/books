const {test,expect}=require('@playwright/test');

const posters=[
 {id:'synthetic-pizza',title:'Pizza Station Safety',station:'Pizza',category:'Safety',revision:'1.1',status:'Active',lines:'Wash hands before handling food\nVerify the station checklist',note:'Approved by manager',relatedSopIds:['synthetic-pizza-sop']},
 {id:'synthetic-dish',title:'Dish Pit Closing',station:'Dish',category:'Closing',revision:'1.0',status:'Active',lines:'Wash, rinse, sanitize\nClear the closing racks',note:'Check manager sign-off',relatedSopIds:[]},
 {id:'synthetic-bar',title:'Bar Opening Reminder',station:'Bar',category:'Opening',revision:'2.0',status:'Active',lines:'Count the register\nCheck supplies',relatedSopIds:[]}
];
async function setup(page){
 // In-browser mock only: do not unlock a real restaurant or use real employee records.
 await page.route('**/apps/sop-foundry/room-gate.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* synthetic test bypass: no real room token */'}));
 await page.route('**/apps/sop-foundry/hosted-bridge.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* no external hosted session */'}));
 await page.route('**/apps/sop-foundry/web-api-shim.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* synthetic API mock */'}));
 await page.route('**/api/published-posters*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({posters,canBuild:false})}));
 await page.route('**/api/published-sops*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{sops:[{id:'synthetic-pizza-sop',title:'Pizza Safe Setup',station:'Pizza'}]}})}));
}
test('Mobile and desktop poster search show only matching instructions, not a stale unrelated poster',async({page})=>{
 await setup(page);
 await page.goto('/apps/sop-foundry/staff-posters.html');
 const list=page.locator('#list .item'),detail=page.locator('#detail');
 await expect(list).toHaveCount(3);
 await expect(detail.locator('h2')).toHaveText('Pizza Station Safety');
 await page.locator('#search').fill('Dish');
 await expect(list).toHaveCount(1);
 await expect(list.first()).toContainText('Dish Pit Closing');
 await expect(detail.locator('h2')).toHaveText('Dish Pit Closing');
 await expect(detail).not.toContainText('Wash hands before handling food');
 await page.locator('#search').fill('no_such_poster_9283');
 await expect(page.locator('#list')).toContainText('No active posters match.');
 await expect(detail).toContainText('No poster selected');
 await expect(detail).not.toContainText('Dish Pit Closing');
 await page.locator('#search').fill('');
 await expect(list).toHaveCount(3);
 await expect(detail.locator('h2')).toHaveText('Pizza Station Safety');
});
test('Station filter updates Poster Library detail and does not expose another station',async({page})=>{
 await setup(page);
 await page.goto('/apps/sop-foundry/staff-posters.html');
 const station=page.locator('#station'),detail=page.locator('#detail');
 await station.selectOption('Bar');
 await expect(page.locator('#list .item')).toHaveCount(1);
 await expect(detail.locator('h2')).toHaveText('Bar Opening Reminder');
 await expect(detail).not.toContainText('Dish Pit Closing');
 await station.selectOption('Dish');
 await expect(detail.locator('h2')).toHaveText('Dish Pit Closing');
 await page.locator('#search').fill('Pizza');
 await expect(page.locator('#list')).toContainText('No active posters match.');
 await expect(detail).toContainText('No poster selected');
 await station.selectOption('All stations');
 await expect(detail.locator('h2')).toHaveText('Pizza Station Safety');
});
test('Direct poster QR/bookmark opens its published poster and retains employee-only Build Room visibility',async({page})=>{
 await setup(page);
 await page.goto('/apps/sop-foundry/staff-posters.html#synthetic-dish');
 await expect(page.locator('#detail h2')).toHaveText('Dish Pit Closing');
 await expect(page.locator('#buildLink')).toBeHidden();
 await page.locator('#list button[data-id="synthetic-bar"]').click();
 await expect(page.locator('#detail h2')).toHaveText('Bar Opening Reminder');
 await expect(page).toHaveURL(/#synthetic-bar$/);
});

test('A real poster QR opens an approved cross-station poster when a home station is saved',async({page})=>{
 await setup(page);
 await page.addInitScript(()=>{
   localStorage.setItem('gravity-foundry-employee-profile-v1-local',JSON.stringify({name:'Synthetic Employee',homeStation:'Pizza'}));
 });
 await page.goto('/apps/sop-foundry/staff-posters.html?from=posterqr#synthetic-dish');
 await expect(page.locator('#detail h2')).toHaveText('Dish Pit Closing');
 await expect(page.locator('#station')).toHaveValue('All stations');
 await expect(page.locator('#list button[data-id="synthetic-dish"]')).toHaveCount(1);
 await expect(page.locator('#buildLink')).toBeHidden();
 await page.locator('#station').selectOption('Pizza');
 await expect(page.locator('#detail h2')).toHaveText('Pizza Station Safety');
});
