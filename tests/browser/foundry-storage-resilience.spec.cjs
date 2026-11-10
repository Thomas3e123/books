const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:8765';
const QA_ID='qa_storage_procedure';
const original={id:QA_ID,title:'QA Fictional Original SOP',station:'QA',status:'Draft',isSample:false,revision:'1.0',steps:['Original fictional step'],changeSummary:'QA only',trainingRequirement:'none'};
function workroom(sop=original){return {sops:[sop],recipes:[],restaurant:'QA Fictional Restaurant',sopSourceVersion:'gravity-sop-volumes-1-3-2026-10-07-rc9'};}
async function request(page,path,opts={}){return page.evaluate(async({path,opts})=>{try{const r=await fetch(path,opts);return {status:r.status,data:await r.json()}}catch(e){return {error:String(e?.name||e),message:String(e?.message||e)}}},{path,opts});}
async function setup(page){
 await page.addInitScript(()=>sessionStorage.setItem('gravityFoundryRoleV15','build'));
 await page.goto('/apps/sop-foundry/desktop-settings.html');
 const result=await request(page,'/api/workroom',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(workroom())});
 expect(result.status).toBe(200);
 expect((await request(page,'/api/workroom')).data.data.sops[0].title).toBe(original.title);
}
test('Foundry failed IndexedDB save never leaks phantom changes through workroom reads or full backup',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
   const old=IDBObjectStore.prototype.put;
   window.__qaFailPut=false;
   IDBObjectStore.prototype.put=function(...args){if(window.__qaFailPut)throw new DOMException('QA forced quota exceeded','QuotaExceededError');return old.apply(this,args)};
   window.__qaFailPut=true;
 });
 const changed={...original,title:'QA UNSAVED CHANGES',steps:['This must not appear in a backup']};
 const res=await request(page,'/api/workroom',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(workroom(changed))});
 expect(res.error).toBeTruthy();
 const after=await request(page,'/api/workroom');
 expect(after.status).toBe(200);
 expect(after.data.data.sops[0].title).toBe(original.title);
 const backup=await request(page,'/api/desktop-backup');
 expect(backup.status).toBe(200);
 expect(backup.data.state.workroom.sops[0].title).toBe(original.title);
 await page.evaluate(()=>window.__qaFailPut=false);
 const retry=await request(page,'/api/workroom',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(workroom(changed))});
 expect(retry.status).toBe(200);
 await page.reload();
 expect((await request(page,'/api/workroom')).data.data.sops[0].title).toBe(changed.title);
});

test('Foundry does not silently sync between browsers, but a validated full backup transfers to a new browser',async({browser})=>{
 const a=await browser.newContext({baseURL:BASE}),b=await browser.newContext({baseURL:BASE});
 try{
  const first=await a.newPage();
  await setup(first);
  const second=await b.newPage();
  await second.addInitScript(()=>sessionStorage.setItem('gravityFoundryRoleV15','build'));
  await second.goto('/apps/sop-foundry/desktop-settings.html');
  const pre=await request(second,'/api/workroom');
  expect(pre.status).toBe(200);
  expect(pre.data.data).toBeNull();
  const exported=(await request(first,'/api/desktop-backup')).data;
  expect(exported.product).toBe('Gravity SOP Foundry');
  expect(exported.state.workroom.sops[0].title).toBe(original.title);
  const imported=await request(second,'/api/desktop-backup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(exported)});
  expect(imported.status).toBe(200);
  await second.evaluate(()=>sessionStorage.setItem('gravityFoundryRoleV15','build'));
  const after=await request(second,'/api/workroom');
  expect(after.data.data.sops[0].title).toBe(original.title);
  await second.reload();
  await second.evaluate(()=>sessionStorage.setItem('gravityFoundryRoleV15','build'));
  expect((await request(second,'/api/workroom')).data.data.sops[0].title).toBe(original.title);
  const unchanged=(await request(first,'/api/workroom')).data.data.sops;
  expect(unchanged).toHaveLength(1);
 }finally{await a.close();await b.close()}
});

test('Foundry rejects damaged full backup and keeps existing data intact',async({page})=>{
 await setup(page);
 const baseline=(await request(page,'/api/desktop-backup')).data;
 const damaged={...baseline,state:{...baseline.state,pins:{build:'invalid',staff:'0000'}}};
 const response=await request(page,'/api/desktop-backup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(damaged)});
 expect(response.status).toBe(400);
 expect((await request(page,'/api/workroom')).data.data.sops[0].title).toBe(original.title);
 await page.reload();
 expect((await request(page,'/api/workroom')).data.data.sops[0].title).toBe(original.title);
});
