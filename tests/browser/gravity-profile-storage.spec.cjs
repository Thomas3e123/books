const {test,expect}=require('@playwright/test');

test('Restaurant profile save and clear failures preserve the form for retry',async({page})=>{
  await page.goto('/gravity-assist');
  await page.locator('#ga-profile-edit').click();
  const name=page.locator('#ga-prof-name'), status=page.locator('#ga-profile-status');
  await name.fill('Test Kitchen');
  await page.evaluate(()=>{
    const set=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
    Storage.prototype.setItem=function(key,value){
      if(key==='gravityAssistRestaurantProfileV1')return;
      return set.call(this,key,value);
    };
    Storage.prototype.removeItem=function(){throw Error('Storage unavailable')};
    window.allowProfileSave=()=>Storage.prototype.setItem=set;
    window.allowProfileClear=()=>Storage.prototype.removeItem=remove;
  });
  await page.locator('#ga-profile-save').click();
  await expect(status).toContainText('Could not save');
  await expect(name).toBeVisible();
  await expect(name).toHaveValue('Test Kitchen');
  await page.evaluate(()=>window.allowProfileSave());
  await page.locator('#ga-profile-save').click();
  await page.locator('#ga-profile-edit').click();
  await page.locator('#ga-profile-clear').click();
  await expect(status).toContainText('Could not confirm');
  await expect(name).toHaveValue('Test Kitchen');
  await page.evaluate(()=>window.allowProfileClear());
  await page.locator('#ga-profile-clear').click();
  await expect(status).toContainText('Profile cleared');
  await page.reload();
  await page.locator('#ga-profile-edit').click();
  await expect(name).toHaveValue('');
});
