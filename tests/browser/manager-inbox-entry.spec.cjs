const {test,expect}=require('@playwright/test');

for(const room of [
  {page:'/testing-room-manager',endpoint:'/testing-room/manager/testers',list:'testers',focus:'tab-testers'},
  {page:'/pilot-room-manager',endpoint:'/pilot-room/api/manager/participants',list:'participants',focus:'status-filter'},
]){
  test(room.page+' supports keyboard retry and transfers focus into the loaded inbox',async({page})=>{
    let requests=0;
    await page.route('**'+room.endpoint,async route=>{
      requests++;
      await route.fulfill(requests===1
        ? {status:503,json:{error:'Temporary service interruption'}}
        : {json:{[room.list]:[]}});
    });
    await page.goto(room.page);
    const key=page.locator('#key');
    await key.fill('synthetic-test-key');
    await key.press('Enter');
    await expect(page.getByRole('status').filter({hasText:'Temporary service interruption'})).toBeVisible();
    await expect(page.locator('#login')).toBeVisible();
    await key.press('Enter');
    await expect(page.locator('#'+room.focus)).toBeFocused();
    await expect(page.locator('#login')).toBeHidden();
    expect(requests).toBe(2);
  });
}
