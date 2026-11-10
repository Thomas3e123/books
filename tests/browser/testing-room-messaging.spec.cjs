const {test,expect}=require('@playwright/test');

test('Testing Room refreshes once and keeps a returning tester conversation usable',async({page})=>{
  const messages=[{id:'synthetic-1',sender:'manager',body:'Synthetic manager reply',created_at:'2026-11-10T10:00:00Z'}];
  let reads=0;
  await page.addInitScript(()=>{
    localStorage.setItem('gravity_testing_room_token_v1','synthetic-test-session');
    const original=window.setInterval;
    window.__testingRoomPolls=[];
    window.setInterval=function(fn,ms,...args){
      if(ms===15000&&String(fn).includes('loadMessages()'))window.__testingRoomPolls.push(ms);
      return original.call(window,fn,ms,...args);
    };
  });
  await page.route('**/testing-room/**',async route=>{
    const req=route.request(),endpoint=new URL(req.url()).pathname.replace(/^\/testing-room\//,'');
    if(endpoint==='messages'){
      reads++;
      return route.fulfill({contentType:'application/json',body:JSON.stringify({messages})});
    }
    if(endpoint==='groups')return route.fulfill({contentType:'application/json',body:JSON.stringify({groups:[]})});
    if(endpoint==='message'&&req.method()==='POST'){
      const body=JSON.parse(req.postData()||'{}');
      messages.push({id:'synthetic-2',sender:'tester',body:body.body,created_at:'2026-11-10T10:01:00Z'});
      return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,id:'synthetic-2'})});
    }
    return route.fulfill({status:404,contentType:'application/json',body:'{"error":"Synthetic endpoint not found"}'});
  });
  await page.goto('/testing-room');
  await expect(page.locator('#room')).toBeVisible();
  await expect(page.locator('#thread')).toContainText('Synthetic manager reply');
  expect(await page.evaluate(()=>window.__testingRoomPolls)).toEqual([15000]);
  await page.locator('#msg-body').fill('Synthetic tester follow-up');
  await page.locator('#send-btn').click();
  await expect(page.locator('#thread')).toContainText('Synthetic tester follow-up');
  await expect(page.locator('#send-status')).toContainText('Sent.');
  expect(reads).toBeGreaterThanOrEqual(2);
});

test('Testing Room manager can read and reply to a synthetic tester thread',async({page})=>{
  const messages=[{id:'synthetic-msg',sender:'tester',body:'Synthetic tester question',created_at:'2026-11-10T10:00:00Z'}];
  await page.route('**/testing-room/**',async route=>{
    const req=route.request(),endpoint=new URL(req.url()).pathname.replace(/^\/testing-room\//,'');
    if(endpoint==='manager/testers')return route.fulfill({contentType:'application/json',body:JSON.stringify({testers:[{id:'synthetic-tester',display_name:'Synthetic Tester',email:'synthetic@example.invalid',interests:['Website'],status:'active',helpful_level:0,updated_at:'2026-11-10T10:00:00Z',unread:1}]})});
    if(endpoint==='manager/thread/synthetic-tester')return route.fulfill({contentType:'application/json',body:JSON.stringify({messages})});
    if(endpoint==='manager/reply'&&req.method()==='POST'){
      const body=JSON.parse(req.postData()||'{}');
      if(req.headers().authorization!=='Bearer synthetic-manager-key'||body.testerId!=='synthetic-tester')return route.fulfill({status:401,contentType:'application/json',body:'{"error":"Unauthorized synthetic request"}'});
      messages.push({id:'synthetic-reply',sender:'manager',body:body.body,created_at:'2026-11-10T10:02:00Z'});
      return route.fulfill({contentType:'application/json',body:'{"ok":true,"id":"synthetic-reply"}'});
    }
    return route.fulfill({status:404,contentType:'application/json',body:'{"error":"Synthetic endpoint not found"}'});
  });
  await page.goto('/testing-room-manager');
  await page.locator('#key').fill('synthetic-manager-key');
  await page.locator('#login-btn').click();
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('#tester-list button').first().click();
  await expect(page.locator('#thread')).toContainText('Synthetic tester question');
  await page.locator('#reply').fill('Synthetic manager confirmation');
  await page.locator('#reply-btn').click();
  await expect(page.locator('#thread')).toContainText('Synthetic manager confirmation');
});
