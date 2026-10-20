'use strict';
/**
 * Read-only public website acceptance tests. All edits to localStorage are confined
 * to a brand-new headless browser context; no submitted restaurant/tester records.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const BASE='https://thomasmonroebooks.com';
const failures=[], warnings=[], results=[];
const record=(n,ok,detail='')=>{results.push({name:n,pass:Boolean(ok),detail});console.log((ok?'PASS':'FAIL')+' '+n+(detail?' — '+detail:''));if(!ok)failures.push(n+': '+detail)};
const warn=(x)=>{warnings.push(x);console.log('WARN '+x)};
const must=(condition,msg)=>{if(!condition)throw Error(msg)};
const within=(p,ms,selector)=>p.locator(selector).waitFor({state:'visible',timeout:ms});
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const view of [{name:'desktop',width:1366,height:900},{name:'mobile',width:390,height:844}]){
   const ctx=await browser.newContext({viewport:{width:view.width,height:view.height},deviceScaleFactor:1});
   const page=await ctx.newPage();
   const uncaught=[];
   page.on('pageerror',e=>uncaught.push(String(e.message||e)));
   const routes=['/','/windows-programs','/gravity-sop-foundry','/gravity-shift-lab','/gravity-inventory-center','/gravity-work-study-lab','/testing-room','/gravity-assist','/knowledge-center'];
   for(const route of routes){
    const errs=uncaught.length;
    try{
     const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:45000});
     must(response&&response.status()===200,'HTTP '+(response?response.status():'no response'));
     must(await page.title(),'Missing page title');
     await page.waitForTimeout(600);
     record(view.name+' live page '+route,true, 'HTTP 200; title; '+(uncaught.length-errs)+' page errors');
     if(uncaught.length>errs)warn(view.name+' '+route+' uncaught browser error(s): '+uncaught.slice(errs,errs+3).join(' | ').slice(0,380));
    }catch(e){record(view.name+' live page '+route,false,String(e).slice(0,240))}
   }
   await ctx.close();
  }
  // Fresh first-time user: the original Windows/web blocker was an automatically
  // opened profile dialog overlaying the walkthrough's launch button.
  const ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
  try{
   const r=await page.goto(BASE+'/apps/inventory-center/index.html',{waitUntil:'domcontentloaded',timeout:45000});
   must(r.status()===200,'inventory page status '+r.status());
   await within(page,12000,'#inventory-start-guided');
   must(!(await page.locator('#profile-dialog').evaluate(x=>x.open)),'auto profile modal blocked first-time click');
   await page.locator('#inventory-start-guided').click({timeout:9000});
   must((await page.locator('#gif-progress').innerText()).includes('Step 1 of 29'),'wrong initial progress');
   await page.locator('#gif-next').click();
   must((await page.locator('#gif-progress').innerText()).includes('Step 2 of 29'),'wrong profile step');
   await page.locator('#gif-show').click();
   must(await page.locator('#profile-dialog').evaluate(x=>x.open),'profile modal was not opened by tour');
   await page.locator('#profile-restaurant').fill('Independent QA Restaurant');
   await page.locator('#save-profile').click();
   must(!(await page.locator('#profile-dialog').evaluate(x=>x.open)),'profile modal stayed open');
   await page.locator('#gif-next').waitFor({state:'visible',timeout:7000});
   must(!(await page.locator('#gravity-inventory-first-tour .gif-panel').evaluate(x=>x.hidden)),'walkthrough stayed hidden after profile save');
   await page.locator('#gif-next').click();await page.locator('#gif-next').click();
   must((await page.locator('#gif-progress').innerText()).includes('Step 4 of 29'),'navigation to location stage failed');
   await page.locator('#gif-show').click();
   must(await page.locator('#view-locations').evaluate(x=>x.classList.contains('active')),'Locations not displayed');
   await page.locator('#gif-exit').click();
   await page.locator('#inventory-start-guided').click();
   must((await page.locator('#gif-progress').innerText()).includes('Step 4 of 29'),'Resume failed');
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null'));
   must(stored&&stored.profile.restaurant==='Independent QA Restaurant','profile not saved locally');
   must(errors.length===0,'uncaught errors: '+errors.join(' | ').slice(0,300));
   record('Inventory first-use click → 29-step guide → profile Save → resume → Locations',true);
  }catch(e){record('Inventory first-use click → 29-step guide → profile Save → resume → Locations',false,String(e).slice(0,900))}
  await ctx.close();
  // Links need to work for both desktop and mobile.
  const linkctx=await browser.newContext({viewport:{width:1280,height:820}});
  const p=await linkctx.newPage();
  await p.goto(BASE+'/windows-programs',{waitUntil:'domcontentloaded'});
  for(const manual of ['Gravity_SOP_Foundry_Windows_User_Manual','Gravity_Shift_Lab_Windows_User_Manual','Gravity_Inventory_Center_Windows_User_Manual','Gravity_Work_Study_Lab_Windows_User_Manual']){
   const card=p.locator('.windows-current-manual').filter({has:p.locator('a[href*="'+manual+'.pdf"]')}).first();
   try{
    must(await card.count()===1,'Missing manual card for '+manual);
    const links=await card.locator('a[href]').evaluateAll(anchors=>anchors.map(a=>({href:a.href,label:(a.textContent||'').trim()})));
    const formats=['.pdf','.docx'].every(ext=>links.some(x=>new URL(x.href).pathname.endsWith('/manuals/current/'+manual+ext)));
    must(formats,'PDF or Word manual missing');
    const online=links.find(x=>/Read online/i.test(x.label));
    must(online&&online.href,'Read online manual link missing');
    const response=await p.request.get(online.href,{timeout:18000});
    must(response.status()===200,'Read online link returns HTTP '+response.status()+': '+online.href);
    record('Current manual accessible '+manual,true,'PDF+Word linked; online HTTP 200; '+online.href);
   }catch(e){record('Current manual accessible '+manual,false,String(e).slice(0,450))}
  }
  try{
   await p.goto(BASE+'/restaurant-ai-prompt-search',{waitUntil:'domcontentloaded',timeout:45000});
   await p.waitForFunction(()=>document.querySelector('#ai-prompt-search-status')?.textContent?.includes('250 prompts shown.'),{timeout:12000});
   await p.locator('#ai-prompt-query').fill('GRV-AI-250');
   must((await p.locator('#ai-prompt-results').innerText()).includes('GRV-AI-250'),'Prompt 250 not found');
   record('Live 250-prompt search data loads and last prompt is searchable',true);
  }catch(e){record('Live 250-prompt search data loads and last prompt is searchable',false,String(e).slice(0,300))}
  await p.goto(BASE+'/windows-programs',{waitUntil:'domcontentloaded'});
  const warning=await p.locator('.inventory-guided-firstclick-update').count();
  record('Old Windows Inventory preview issue disclosed',warning===1,'Existing public installer not misrepresented as fixed');
  await linkctx.close();
 }catch(e){record('Browser audit harness',false,String(e).slice(0,900))}
 finally{if(browser)await browser.close().catch(()=>{});}
 const report={timestamp:new Date().toISOString(),checks:results.length,passed:results.filter(x=>x.pass).length,failed:failures.length,failures,warnings,results};
 fs.writeFileSync('site-browser-checkup-results.json',JSON.stringify(report,null,2)+'\n');
 console.log('BROWSER_CHECKS='+report.checks+' PASSED='+report.passed+' FAILED='+report.failed+' WARNINGS='+warnings.length);
 if(failures.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exit(2)});
