const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:8765';
function workspace(rows){return {restaurant:'QA Fictional Restaurant',sops:rows,recipes:[],sopSourceVersion:'gravity-sop-volumes-1-3-2026-10-07-rc9'};}
const row=(id)=>({id,title:id,station:'QA',steps:['Fictional step'],status:'Draft',isSample:false,trainingRequirement:'none',changeSummary:'Audit only'});
async function api(page,path,opts){return page.evaluate(async({path,opts})=>{try{const response=await fetch(path,opts);return {status:response.status,data:await response.json()}}catch(e){return {error:String(e.message||e)}}},{path,opts})}
const put=(page,rows)=>api(page,'/api/workroom',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(workspace(rows))});
test('Two open Foundry tabs must not silently delete each other\'s saved SOP drafts',async({browser})=>{
 const context=await browser.newContext({baseURL:BASE});
 try{
  await context.addInitScript(()=>sessionStorage.setItem('gravityFoundryRoleV15','build'));
  const a=await context.newPage();await a.goto('/apps/sop-foundry/desktop-settings.html');
  expect((await put(a,[row('qa_baseline')])).status).toBe(200);
  const b=await context.newPage();await b.goto('/apps/sop-foundry/desktop-settings.html');
  expect((await api(b,'/api/workroom')).data.data.sops).toHaveLength(1);
  const aSave=await put(a,[row('qa_baseline'),row('qa_first_tab')]);expect(aSave.status).toBe(200);
  const bSave=await put(b,[row('qa_baseline'),row('qa_second_tab')]);
  // Both successful saves must preserve BOTH new records; otherwise the stale
  // second tab must be rejected clearly rather than silently losing tab A.
  if(bSave.status===200){
    const fresh=await context.newPage();await fresh.goto('/apps/sop-foundry/desktop-settings.html');
    const ids=(await api(fresh,'/api/workroom')).data.data.sops.map(s=>s.id);
    expect(ids).toContain('qa_first_tab');
    expect(ids).toContain('qa_second_tab');
  }else{
    expect([409,412]).toContain(bSave.status);
    // After a conflict, this tab must refresh its cached state before exporting a full backup.
    const backup=(await api(b,'/api/desktop-backup')).data;
    expect(backup.state.workroom.sops.map(x=>x.id)).toContain('qa_first_tab');
    expect(backup.state.workroom.sops.map(x=>x.id)).not.toContain('qa_second_tab');
    const fresh=await context.newPage();await fresh.goto('/apps/sop-foundry/desktop-settings.html');
    expect((await api(fresh,'/api/workroom')).data.data.sops.map(x=>x.id)).toContain('qa_first_tab');
  }
 }finally{await context.close()}
});
