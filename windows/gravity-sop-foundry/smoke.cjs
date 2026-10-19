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
  const w=await fetch('/api/workroom');
  if(!w.ok)throw Error('Build Room workspace unavailable: '+w.status);
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
  await window.GravityFoundryWeb.save(original);
  return {room:'build',referenceBytes:raw.length,localStorage:true,workspace:true};
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
