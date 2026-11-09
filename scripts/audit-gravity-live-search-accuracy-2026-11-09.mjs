// Live Gravity search-quality test. No form submissions or account data.
import {chromium,devices} from 'playwright';
const BASE='https://gravityleadershipsystem.com';
const groups=[
 {route:'/knowledge-center',terms:['labor','food cost','training']},
 {route:'/standards-library',terms:['SOP','station','library']},
 {route:'/restaurant-management-forms-checklists',terms:['checklist','manager','labor']},
 {route:'/free-resources',terms:['workbook','download','food cost']},
 {route:'/help-center',terms:['download','printing','support']}
];
const siteSearch=[
 {query:'Shift Lab',expect:'/gravity-shift-lab'},
 {query:'inventory',expect:'/gravity-inventory-center'},
 {query:'SOP',expect:'/standards-library'},
 {query:'food cost',expect:'/operating-systems#food-cost-inventory'},
 {query:'document',expect:'/gravity-document-studio'},
 {query:'refund',expect:'/operating-systems#cash-loss-prevention'}
];
const results=[];const failures=[];
function put(data){results.push(data);if(!data.ok)failures.push(data)}
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [mode,device] of [['desktop',devices['Desktop Chrome']],['Pixel 7 simulated',devices['Pixel 7']]]){
  const context=await browser.newContext({...device,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(7000);
  let jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message.slice(0,180)));
  // Use a known visitor on the site search checks to bypass the intentional first-time modal.
  await page.addInitScript(()=>{try{localStorage.setItem('gravity_first_visit_welcomed_v1','1')}catch{}});
  for(const group of groups){
   const response=await page.goto(BASE+group.route,{waitUntil:'domcontentloaded',timeout:24000});
   const root=page.locator('[data-page-search]').first(),input=root.locator('[data-page-search-input]'),
     status=root.locator('[data-page-search-status]'),panel=root.locator('[data-page-search-results]');
   put({mode,route:group.route,test:'search widgets initialized',ok:response?.status()===200&&await input.count()===1&&await panel.count()===1});
   if(await input.count()===0)continue;
   for(const term of group.terms){
    await input.fill(term);
    await page.waitForTimeout(85);
    const buttons=panel.locator('button.page-search-result');
    const count=await buttons.count();const statusText=(await status.textContent()||'').trim();
    const titles=await buttons.allTextContents();
    const noMatches=/(?:No matches on this page)/.test(statusText);
    put({mode,route:group.route,test:'known relevant query',term,ok:count>0&&!noMatches&&/match/.test(statusText),resultCount:count,topResult:titles[0]?.slice(0,120),status:statusText});
   }
   // Safety and usability: unmatched input shows a message; never shows unrelated results.
   await input.fill('zzzxxyynotafoundresource991');
   await page.waitForTimeout(75);
   const none=(await status.textContent()||'').trim();
   const btnCount=await panel.locator('button.page-search-result').count();
   put({mode,route:group.route,test:'no matches state',ok:none==='No matches on this page'&&btnCount===0,status:none});
   const clear=root.locator('[data-page-search-clear]');
   await clear.click();
   put({mode,route:group.route,test:'clear resets search',ok:(await input.inputValue())===''&&(await panel.isHidden())&&await input.isFocused()});
   await input.fill(group.terms[0]);
   await input.press('Escape');
   put({mode,route:group.route,test:'Escape clears search',ok:(await input.inputValue())===''&&await panel.isHidden()});
   await input.fill(group.terms[0]);
   const first=panel.locator('button.page-search-result').first();
   if(await first.count()){
    await first.click();
    put({mode,route:group.route,test:'click search result jumps to section',ok:await panel.isHidden(),selected:group.terms[0]});
   }
  }
  // Site-wide search: specific named tools must lead to their canonical pages.
  await page.goto(BASE+'/knowledge-center',{waitUntil:'domcontentloaded',timeout:24000});
  const box=page.locator('#gravity-site-search'),toggle=box.locator('button').first(),
     input=box.locator('#gravity-site-search-input'),resultsBox=box.locator('#gravity-site-search-results');
  if(await toggle.count()){await toggle.click()}
  put({mode,route:'/knowledge-center',test:'site search opens',ok:await toggle.getAttribute('aria-expanded')==='true'&&await input.isVisible()});
  for(const query of siteSearch){
   await input.fill(query.query);
   const hrefs=await resultsBox.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
   // Some queries return lots of matches, but expected exact target must be offered.
   put({mode,test:'site-wide resource recommendation',query:query.query,expected:query.expect,ok:hrefs.includes(query.expect),actual:hrefs.slice(0,10)});
  }
  await input.fill('zzzxxyynotafoundresource991');
  put({mode,test:'site search zero result guidance',ok:(await resultsBox.textContent()||'').includes('No matching page'),text:(await resultsBox.textContent()||'').slice(0,170)});
  await input.press('Escape');
  put({mode,test:'site search Escape closes panel',ok:await box.locator('#gravity-site-search-panel').isHidden()&&await toggle.getAttribute('aria-expanded')==='false'});
  put({mode,test:'uncaught JavaScript exceptions',ok:jsErrors.length===0,exceptions:jsErrors.slice(0,10)});
  await context.close();
 }
 console.log('GRAVITY_LIVE_SEARCH_ACCURACY '+JSON.stringify({checked:results.length,passed:results.length-failures.length,failed:failures.length,failures,summary:results.map(v=>({mode:v.mode,route:v.route,test:v.test,term:v.term,query:v.query,ok:v.ok,resultCount:v.resultCount,topResult:v.topResult}))}));
 if(failures.length)process.exitCode=1;
}catch(error){console.error('GRAVITY_LIVE_SEARCH_ACCURACY_ERROR '+JSON.stringify({error:String(error.stack||error),checksDone:results.length,last:results.slice(-5)}));process.exitCode=1}
finally{if(browser)await browser.close()}
