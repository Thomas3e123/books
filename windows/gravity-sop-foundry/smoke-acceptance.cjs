'use strict';
// Expanded Windows acceptance tests use isolated disposable Foundry profile only.
// They exercise shared website APIs from the packaged Windows renderer.
const assert=require('node:assert/strict');
const renderer=(win,fn,...args)=>win.webContents.executeJavaScript('('+fn.toString()+')('+args.map(JSON.stringify).join(',')+')',true);
async function run(win){
  const result=await renderer(win,async function(){
    const req=async(path,method='GET',value)=>{
      const options={method,headers:{'Content-Type':'application/json'}};
      if(value!==undefined)options.body=JSON.stringify(value);
      const response=await fetch(path,options);
      return {status:response.status,body:await response.json()};
    };
    const fail=message=>{throw Error(message)};
    const baseline=structuredClone(await window.GravityFoundryWeb.load());
    if(!baseline.workroom?.sops?.length||baseline.workroom.sops.length<525)fail('Master SOPs not initialized');
    if(window.foundrySopUrl('sample-sop-test')!=='')fail('Windows generated an unscannable local-protocol QR URL without hosting');
    if(window.foundryQr('')!=='')fail('Windows generated a QR matrix from an empty URL');
    const recipeId='gravity-acceptance-recipe';
    const recipe={id:recipeId,title:'Gravity Acceptance Tomato Sauce',type:'food',station:'Prep',ingredients:['Tomatoes','Salt'],steps:['Combine ingredients']};
    const created=await req('/api/staff-recipes','POST',{recipes:[recipe],duplicates:'skip'});
    if(created.status!==200||created.body.imported!==1)fail('Recipe import failed: '+JSON.stringify(created));
    const skipped=await req('/api/staff-recipes','POST',{recipes:[recipe],duplicates:'skip'});
    if(skipped.status!==200||skipped.body.skipped!==1)fail('Recipe duplicate skip failed: '+JSON.stringify(skipped));
    const replaced=await req('/api/staff-recipes','POST',{recipes:[{...recipe,steps:['Mix tomatoes and salt','Verify safe storage']}],duplicates:'replace'});
    if(replaced.status!==200||replaced.body.imported!==1)fail('Recipe replacement failed: '+JSON.stringify(replaced));
    const current=await window.GravityFoundryWeb.load();
    const imported=current.workroom.recipes.find(r=>r.id===recipeId);
    if(!imported||imported.status!=='Draft'||imported.revision==='1.0')fail('Replacement recipe must remain draft with revised number');
    if(!current.history.some(e=>e.item?.id===recipeId))fail('Replaced recipe not archived');
    if(current.publishedRecipes[recipeId])fail('Draft recipe exposed in published Employee Library');
    const posterId='gravity-acceptance-poster';
    const rejected=await req('/api/posters','POST',{id:posterId,title:'Accept Poster',lines:'Step 1',status:'Active',sopId:'unknown-sop'});
    if(rejected.status!==400)fail('Poster accepted link to nonpublished SOP');
    const poster=await req('/api/posters','POST',{id:posterId,title:'Acceptance Poster',lines:'Wash and prepare station',status:'Active',relatedSopIds:[]});
    if(poster.status!==200)fail('Poster creation failed: '+JSON.stringify(poster));
    const library=await req('/api/published-posters');
    if(library.status!==200||!library.body.posters.some(x=>x.id===posterId))fail('Active poster not visible to Employee Library');
    const snapshot=await req('/api/desktop-backup');
    if(snapshot.status!==200||snapshot.body.product!=='Gravity SOP Foundry')fail('Full manager backup unavailable');
    const old=snapshot.body.state;
    if(!old.workroom.recipes.some(r=>r.id===recipeId)||!old.posters[posterId]||!old.history.length||!old.pins)fail('Full backup missing recipes, posters, revision history, or PIN settings');
    const update=await req('/api/desktop-settings','POST',{name:'MUTATED NOT TO SAVE'});
    if(update.status!==200)fail('Test mutation failed');
    const pin=await req('/api/room-settings','POST',{room:'staff',pin:'9876'});
    if(pin.status!==200)fail('Staff PIN mutation failed');
    const restored=await req('/api/desktop-backup','POST',snapshot.body);
    if(restored.status!==200)fail('Full backup restore failed: '+JSON.stringify(restored));
    if((await req('/api/desktop-backup')).status!==403)fail('Restore failed to lock manager session');
    const bad=await req('/api/room-access','POST',{room:'staff',pin:'9876'});
    if(bad.status!==403)fail('Mutated staff PIN survived a full restore');
    const staff=await req('/api/room-access','POST',{room:'staff',pin:String(old.pins.staff)});
    if(staff.status!==200)fail('Original staff PIN not restored');
    const staffPublic=await req('/api/published-posters');
    if(staffPublic.status!==200||!staffPublic.body.posters.some(x=>x.id===posterId))fail('Restored poster unavailable to employees');
    for(const [url,method,data] of [['/api/workroom','GET'],['/api/desktop-backup','GET'],['/api/signals','GET'],['/api/history','GET'],['/api/staff-recipes','POST',{recipes:[recipe]}]]){
      const checked=await req(url,method,data);
      if(checked.status!==403)fail('Employee role accessed manager-only endpoint '+url+': '+checked.status);
    }
    await req('/api/room-access','DELETE');
    const manager=await req('/api/room-access','POST',{room:'build',pin:String(old.pins.build)});
    if(manager.status!==200)fail('Restored Build Room PIN did not work');
    const verified=await req('/api/desktop-backup');
    if(verified.status!==200)fail('Full restore not readable after new manager authentication');
    if(!verified.body.state.workroom.recipes.some(r=>r.id===recipeId)||!verified.body.state.posters[posterId])fail('Full restore lost recipe or poster');
    if(verified.body.state.branding?.name==='MUTATED NOT TO SAVE')fail('Edited branding survived backup restoration');
    // Roll back the entire disposable acceptance dataset after successful assertions.
    await window.GravityFoundryWeb.save(baseline);
    return{recipeImport:true,duplicateSkip:true,recipeRevisionArchived:true,unpublishedRecipePrivate:true,
      posterPublished:true,invalidPosterLinksRejected:true,fullBackupIncludesHistory:true,fullRestore:true,
      restoredPins:true,managerAutomaticallyLocked:true,employeeManagerAccessRejected:true,invalidLocalQRDisabled:true};
  });
  console.log('[FOUNDRY-ACCEPTANCE] backup, recipes, posters, roles, QR safety:',JSON.stringify(result));
  for(const [key,value] of Object.entries(result))assert.equal(value,true,key);
  // Exercise the app's real Print SOP button and Chromium's native PDF renderer.
  const prepared=await renderer(win,async function(){
    const app=await window.GravityFoundryWeb.load();
    const target=app.workroom.sops.find(x=>x.steps?.length>0);
    if(!target)throw Error('No printable SOP available');
    location.hash='#/sop/'+encodeURIComponent(target.id);
    const wait=ms=>new Promise(done=>setTimeout(done,ms));
    for(let i=0;i<50&&!document.querySelector('[data-action="print-sop"]');i++)await wait(75);
    const b=document.querySelector('[data-action="print-sop"]');
    if(!b)throw Error('Real SOP print button not rendered');
    b.click();
    for(let i=0;i<55&&!document.getElementById('foundryPrintPreview');i++)await wait(80);
    const preview=document.getElementById('foundryPrintPreview');
    if(!preview)throw Error('Foundry print preview did not open');
    const body=preview.querySelector('.foundry-print-page')?.textContent||'';
    if(!body.includes(target.title)||body.length<200)throw Error('Print preview missing SOP content');
    if(body.includes('gravityfoundry://'))throw Error('Private Windows URL appeared in printed QR');
    return {title:target.title,previewChars:body.length};
  });
  const pdf=Buffer.from(await win.webContents.printToPDF({printBackground:true,pageSize:'A4'}));
  if(pdf.length<9000||pdf.subarray(0,5).toString('ascii')!=='%PDF-')throw Error('Native SOP PDF rendering failed or empty: '+pdf.length);
  await renderer(win,()=>{document.getElementById('foundryPrintBack')?.click();return true});
  console.log('[FOUNDRY-ACCEPTANCE] actual SOP print/PDF:',JSON.stringify({...prepared,pdfBytes:pdf.length}));
  return{...result,sopPrintPreview:true,nativePdf:true};
}
module.exports={run};
