'use strict';
const assert=require('node:assert/strict');
function renderer(win,fn,...args){return win.webContents.executeJavaScript('('+fn.toString()+')('+args.map(JSON.stringify).join(',')+')',true)}
async function run(win,base){
 const before=await renderer(win,async function(){
  if(!document.querySelector('#entry'))throw Error('Room sign-in form did not load');
  const d=await (await fetch('/api/room-access')).json();
  if(d.role)throw Error('Unexpected signed-in room on isolated test profile');
  const unauthorized=await fetch('/api/desktop-backup');
  if(unauthorized.status!==403)throw Error('Sensitive backup endpoint accessible without PIN: '+unauthorized.status);
  const wrong=await fetch('/api/room-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({room:'build',pin:'9999'})});
  if(wrong.status!==403)throw Error('Incorrect Build Room PIN was accepted');
  return {loginGate:true,wrongPinRejected:true,backupProtected:true};
 });
 console.log('[FOUNDRY-SMOKE] protected unauthenticated endpoints:',JSON.stringify(before));
 const nav=new Promise((resolve,reject)=>{
  const t=setTimeout(()=>reject(Error('Build Room navigation timeout')),25000);
  win.webContents.once('did-finish-load',()=>{clearTimeout(t);resolve()});
 });
 await renderer(win,function(){
  document.querySelector('[data-room="build"]').click();
  document.querySelector('#pin').value='0000';
  document.querySelector('#entry').requestSubmit();
  return true;
 });
 await nav;
 const manager=await renderer(win,async function(){
  const pause=ms=>new Promise(done=>setTimeout(done,ms));
  for(let i=0;i<80&&!(window.GravityFoundryWeb&&document.querySelector('[data-view="sops"]'));i++)await pause(80);
  const role=await (await fetch('/api/room-access')).json();
  if(role.role!=='build')throw Error('Build Room did not unlock');
  if(!document.querySelector('[data-view="sops"]'))throw Error('SOP editor navigation not mounted');
  // The first launch imports 525 master SOPs asynchronously. Wait for that to complete
  // before testing edits; an early direct API write would race the initial manual import.
  let library=null;
  for(let i=0;i<160;i++){
    const w=await fetch('/api/workroom');
    if(!w.ok)throw Error('Build Room workspace unavailable: '+w.status);
    const d=await w.json();
    if(d.data?.sops?.length>=525&&document.querySelector('#app .gravity-hero')){library=d.data;break;}
    await pause(100);
  }
  if(!library)throw Error('The full 525-SOP Build Room did not finish initializing');
  const sop=await fetch('/api/sop-source');
  if(!sop.ok)throw Error('SOP reference library failed: '+sop.status);
  const raw=await sop.text();
  if(raw.length<3000000)throw Error('Expected full SOP reference library: '+raw.length);
  const state=await window.GravityFoundryWeb.load();
  const original=structuredClone(state);
  const test={...state,branding:{...state.branding,name:'Gravity Foundry Windows Smoke Restaurant'}};
  await window.GravityFoundryWeb.save(test);
  const current=await window.GravityFoundryWeb.load();
  if(current.branding.name!=='Gravity Foundry Windows Smoke Restaurant')throw Error('Windows IndexedDB write failed');
  // Actual SOP lifecycle through the same local APIs used by the customer UI.
  const request=async(url,method,data)=>{
    const response=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    return {status:response.status,data:await response.json()};
  };
  const id='gravity-windows-lifecycle-smoke';
  const entry={id,title:'Candidate SOP lifecycle test',purpose:'Confirm repeatable safe operating steps.',role:'Assigned station employee',frequency:'Every shift',steps:['Check and prepare the workstation.','Complete the approved work in order.'],checks:'Manager checks the finished station.',records:'Log the completed station inspection.',correction:'Correct any missed requirement and notify the manager.',safety:'Follow restaurant safety standards.',approvedBy:'Candidate Test Manager',effectiveDate:new Date().toISOString().slice(0,10),trainingRequirement:'review',changeSummary:'Initial controlled release',status:'Approved',isSample:false};
  const saved=await request('/api/workroom','PUT',{...library,sops:[...library.sops,entry],recipes:library.recipes});
  if(saved.status!==200)throw Error('SOP save failed: '+JSON.stringify(saved.data));
  const published=await request('/api/published-sops','POST',{id});
  if(published.status!==200)throw Error('Approved SOP publication failed: '+JSON.stringify(published.data));
  const employee=await (await fetch('/api/published-sops')).json();
  if(!employee.data?.sops?.some(sop=>sop.id===id))throw Error('Published SOP not visible in Employee Library');
  const prior=await window.GravityFoundryWeb.load();
  const priorDraft=prior.workroom?.sops?.find(x=>x.id===id);
  if(!priorDraft)throw Error('SOP working copy vanished between save and revision, likely competing initialization');
  if(priorDraft.steps?.length!==2)throw Error('Unexpected original SOP step count: '+JSON.stringify(priorDraft.steps));
  const revision={...entry,steps:[...entry.steps,'Verify the records before closing the station.'],changeSummary:'Revised closing verification'};
  const changed=await request('/api/workroom','PUT',{...prior.workroom,sops:prior.workroom.sops.map(x=>x.id===id?revision:x),recipes:prior.workroom.recipes});
  if(changed.status!==200||changed.data.sopRevisions?.find(x=>x.id===id)?.status!=='Draft')throw Error('SOP revision did not return to Draft for reapproval: '+JSON.stringify({changed,priorDraft}));
  const archive=await window.GravityFoundryWeb.load();
  if(!archive.history.some(item=>item.item?.id===id&&item.kind==='sop'))throw Error('Previous SOP revision was not archived');
  if(!archive.publishedSops[id]||archive.publishedSops[id].steps.length!==2)throw Error('Draft change altered published employee SOP');
  await window.GravityFoundryWeb.save(original);
  return {room:'build',referenceBytes:raw.length,localStorage:true,workspace:true,sopSaved:true,approvedAndPublished:true,revisionArchived:true,publicationProtected:true};
 });
 console.log('[FOUNDRY-SMOKE] manager workspace / bundled SOP library:',JSON.stringify(manager));
 const screens=['import-export','history','poster-studio','employee-connection','desktop-settings','employee-app'];
 for(const page of screens){
   await win.loadURL(base+'/apps/sop-foundry/'+page+'.html');
   const state=await renderer(win,async function(page){
    const role=await (await fetch('/api/room-access')).json();
    if(role.role!=='build')throw Error('Manager session lost on '+page);
    if(document.body.children.length<1)throw Error('No content on '+page);
    if(location.pathname!=='/apps/sop-foundry/'+page+'.html')throw Error('Wrong page route');
    return {title:document.title,role:role.role};
   },page);
   console.log('[FOUNDRY-SMOKE] opened '+page+': '+state.title);
 }
 await win.loadURL(base+'/apps/sop-foundry/workroom');
 const reload=await renderer(win,async function(){
  const role=await (await fetch('/api/room-access')).json();
  if(role.role!=='build')throw Error('Session lost through extensionless route');
  return{extensionlessRoute:true,role:role.role};
 });
 assert.equal(reload.extensionlessRoute,true);
 return {before,manager,pages:screens.length,reload};
}
module.exports={run};
