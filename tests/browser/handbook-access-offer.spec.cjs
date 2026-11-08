'use strict';
const {test,expect}=require('@playwright/test');
const statusUrl='**/.netlify/functions/handbook-creator?action=status';
const respond=(page,result,status=200)=>page.route(statusUrl,route=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(result)}));

test('Handbook landing displays no unverified free or paid offer while the status is pending',async({page})=>{
 await page.route(statusUrl,async route=>{await new Promise(resolve=>setTimeout(resolve,1100));await route.fulfill({status:200,contentType:'application/json',body:'{"free":true,"price":2900,"currency":"USD","paymentReady":false}'});});
 await page.goto('/gravity-handbook-creator',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#offer')).toContainText('Checking current access');
 await expect(page.locator('#buy')).toBeHidden();
 await expect(page.locator('#offer')).toContainText('Free during the Founding Year');
 await expect(page.locator('#buy')).toBeHidden();
});

test('Handbook landing shows paid offer only after verified server status',async({page})=>{
 await respond(page,{free:false,price:2900,currency:'USD',paymentReady:false});
 await page.goto('/gravity-handbook-creator');
 await expect(page.locator('#offer')).toHaveText('$29 · unlimited handbooks');
 await expect(page.locator('#buy')).toBeVisible();
 await expect(page.locator('#buy')).toBeDisabled();
 await expect(page.locator('#buy')).toHaveText('Checkout is not available yet');
});

test('Handbook landing does not promise free downloads during server outage',async({page})=>{
 await respond(page,{error:'Access status temporarily unavailable'},503);
 await page.goto('/gravity-handbook-creator');
 await expect(page.locator('#offer')).toHaveText('Current download access could not be verified');
 await expect(page.locator('#offer-details')).not.toContainText('free through');
 await expect(page.locator('#buy')).toBeHidden();
});

test('Handbook editor displays current free status from server',async({page})=>{
 await respond(page,{free:true,price:2900,currency:'USD',paymentReady:false});
 await page.goto('/handbook-creator/index.html');
 await expect(page.locator('#creator-access-status')).toHaveText('FREE · FOUNDING YEAR');
 await expect(page.locator('.founding-banner')).toContainText('Free during the Founding Year');
 await expect(page.locator('#saved')).toContainText('Saved on this device');
});

test('Handbook editor updates to paid status without changing project access',async({page})=>{
 await respond(page,{free:false,price:2900,currency:'USD',paymentReady:true});
 await page.goto('/handbook-creator/index.html');
 await expect(page.locator('#creator-access-status')).toHaveText('$29 · UNLIMITED');
 await expect(page.locator('.founding-banner')).toContainText('$29 for unlimited handbooks');
 await expect(page.locator('#saved')).toContainText('Saved on this device');
});

test('Handbook editor shows check-access warning when status cannot be verified',async({page})=>{
 await respond(page,{error:'Service unavailable'},503);
 await page.goto('/handbook-creator/index.html');
 await expect(page.locator('#creator-access-status')).toHaveText('CHECK ACCESS');
 await expect(page.locator('.founding-banner')).toContainText('Current access offer unavailable');
 await expect(page.locator('#saved')).toContainText('Saved on this device');
});
