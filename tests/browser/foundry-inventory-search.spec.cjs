const {test,expect}=require('@playwright/test');

const syntheticSops=[
 {id:'qa_pizza',title:'Pizza Station Closing',station:'Pizza',sourceId:'QA-PIZ-001',category:'Closing',purpose:'Close the pizza station safely and correctly.',role:'Pizza cook',revision:'1.0',effectiveDate:'2026-11-09',approvedBy:'QA Manager',status:'Approved',steps:['Clean the oven safely.'],checks:'Manager sign-off',trainingRequirement:'review'},
 {id:'qa_dish',title:'Dish Pit Closing',station:'Dish',sourceId:'QA-DISH-001',category:'Closing',purpose:'Finish dishes and sanitize the dish area.',role:'Dish operator',revision:'1.0',effectiveDate:'2026-11-09',approvedBy:'QA Manager',status:'Approved',steps:['Wash, rinse, sanitize.'],checks:'Sanitizer check',trainingRequirement:'review'}
];
const now='2026-11-09T18:00:00.000Z';
function inventoryFixture(){
 return {
  schemaVersion:1,
  profile:{restaurant:'Gravity QA Fictional Restaurant',store:'',city:'',state:''},
  locations:[{id:'loc_qa',name:'Walk-in Cooler',routeOrder:1,area:'Kitchen',notes:''}],
  items:[
   {id:'qa_chicken',name:'Chicken Breast',category:'Proteins',vendor:'QA Supplier',sku:'CH-001',barcode:'',unit:'lb',casePack:1,cost:3.5,yieldPct:100,par:12,reorder:4,primaryLocation:'loc_qa',balances:{loc_qa:8},active:true},
   {id:'qa_lettuce',name:'Romaine Lettuce',category:'Produce',vendor:'QA Produce',sku:'LT-002',barcode:'',unit:'each',casePack:1,cost:2,yieldPct:100,par:10,reorder:3,primaryLocation:'loc_qa',balances:{loc_qa:5},active:true}
  ],
  movements:[{id:'qa_receive',type:'receiving',itemId:'qa_chicken',date:'2026-11-09',at:now,qty:8,unitCost:3.5,reference:'QA-PO-101',reasonCode:'',fromLocation:'',toLocation:'loc_qa'}],
  costHistory:[],counts:[],sales:[],createdAt:now,updatedAt:now
 };
}
test('Employee SOP search selects only a matching published procedure and clears unrelated details',async({page})=>{
 await page.route('**/apps/sop-foundry/web-api-shim.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* isolated synthetic SOP backend */'}));
 await page.route('**/apps/sop-foundry/room-gate.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* bypass test-only login; no real staff PIN */'}));
 await page.route('**/apps/sop-foundry/hosted-bridge.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* no hosted account */'}));
 await page.route('**/api/published-sops*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{sops:syntheticSops},canBuild:false})}));
 await page.goto('/apps/sop-foundry/staff-sops.html');
 const input=page.locator('#search'),list=page.locator('#list .item');
 await expect(list).toHaveCount(2);
 await expect(page.locator('#detail h2').first()).toHaveText('Pizza Station Closing');
 await input.fill('Dish');
 await expect(list).toHaveCount(1);
 await expect(list.first()).toContainText('Dish Pit Closing');
 // Users must not see an unrelated SOP's instructions when their filtered list shows only Dish.
 await expect(page.locator('#detail h2').first()).toHaveText('Dish Pit Closing');
 await input.fill('zzzx_missing_procedure_9283');
 await expect(page.locator('#list')).toContainText('No published SOPs match');
 await expect(page.locator('#detail')).not.toContainText('Dish Pit Closing');
 await input.fill('');
 await expect(list).toHaveCount(2);
});

test('Inventory item search filters by SKU, category and resets without editing records',async({page})=>{
 const seed=inventoryFixture();
 await page.addInitScript(x=>localStorage.setItem('gravityInventoryCenter.v1',JSON.stringify(x)),seed);
 await page.goto('/apps/inventory-center/index.html');
 await page.locator('[data-view="items"]').first().click();
 const q=page.locator('#item-search'),rows=page.locator('#items-table tbody tr');
 await expect(rows).toHaveCount(2);
 await q.fill('CH-001');
 await expect(rows).toHaveCount(1);
 await expect(rows.first()).toContainText('Chicken Breast');
 await q.fill('');
 await page.locator('#item-category-filter').selectOption('Produce');
 await expect(rows).toHaveCount(1);
 await expect(rows.first()).toContainText('Romaine Lettuce');
 await page.locator('#item-category-filter').selectOption('');
 await expect(rows).toHaveCount(2);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')));
 expect(saved.items).toHaveLength(2);
 expect(saved.movements).toHaveLength(1);
});

test('Inventory history search returns real records by item category and vendor as promised',async({page})=>{
 await page.addInitScript(x=>localStorage.setItem('gravityInventoryCenter.v1',JSON.stringify(x)),inventoryFixture());
 await page.goto('/apps/inventory-center/index.html');
 await page.locator('[data-view="history"]').first().click();
 const q=page.locator('#history-search'),rows=page.locator('#history-table tbody tr');
 await expect(rows).toHaveCount(1);
 await q.fill('QA-PO-101');
 await expect(rows).toHaveCount(1);
 await q.fill('Proteins');
 await expect(rows).toHaveCount(1);
 await expect(rows.first()).toContainText('Chicken Breast');
 await q.fill('QA Supplier');
 await expect(rows).toHaveCount(1);
 await q.fill('not-an-inventory-record');
 await expect(rows).toHaveCount(0);
 await expect(page.locator('#history-empty')).toBeVisible();
 await q.fill('');
 await expect(rows).toHaveCount(1);
});
