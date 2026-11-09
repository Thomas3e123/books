// Live, read-only visitor sweep of top Gravity pages on desktop and a simulated Pixel 7.
// No form submissions or writes. Tests user-visible pages, menus and horizontal overflow.
import {chromium,devices} from 'playwright';
const ORIGIN='https://gravityleadershipsystem.com';
const routes=[
 '/','/start-here','/gravity-assist','/gravity-aware','/operating-systems','/standards-library',
 '/books','/book-reader','/free-resources','/knowledge-center','/restaurant-management-forms-checklists',
 '/gravity-sop-foundry','/gravity-shift-lab','/gravity-work-study-lab','/gravity-document-studio',
 '/gravity-forms-personalizer','/gravity-numbers-lab','/gravity-recipe-works',
 '/apps/inventory-center/index.html','/restaurant-ai-prompt-search','/help-center','/contact',
 '/support','/privacy','/terms','/register','/registration-thanks','/gravity-cloud-vault',
 '/gravity-handbook-creator','/handbook-creator/index.html','/windows-programs','/gravity-report',
 '/testing-room','/about','/gravity-fulfillment-center','/gravity-quick-tools'
];
const searchExpected=new Set(['/standards-library','/knowledge-center','/restaurant-management-forms-checklists','/free-resources','/help-center']);
let browser;const rows=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [mode,device] of [['desktop',devices['Desktop Chrome']],['Pixel 7 emulated',devices['Pixel 7']]]){
 const context=await browser.newContext({...device,serviceWorkers:'block'});
 const page=await context.newPage();page.setDefaultTimeout(5000);
 let pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e.message).slice(0,120)));
 for(const route of routes){
  pageErrors=[];
  const record={mode,route};
  try{
   const response=await page.goto(ORIGIN+route,{waitUntil:'domcontentloaded',timeout:24000});
   record.status=response?.status()??0;
   await page.waitForTimeout(180);
   const meta=await page.evaluate(()=>({
     width:innerWidth,
     docWidth:document.documentElement.scrollWidth,
     bodyWidth:document.body.scrollWidth,
     title:document.title,
     h1s:[...document.querySelectorAll('h1')].map(x=>x.textContent?.trim().slice(0,80)),
     robots:[...document.querySelectorAll('meta[name="robots"]')].map(x=>x.content),
     search:!!document.querySelector('input[type="search"]'),
     nav:!!document.querySelector('#site-nav')
   }));
   record.title=meta.title;record.h1Count=meta.h1s.length;record.overflow=Math.max(meta.docWidth,meta.bodyWidth)-meta.width;
   record.search=meta.search;record.missingSearch=searchExpected.has(route)&&!meta.search;
   record.nav=meta.nav;
   record.robotNoindex=meta.robots.some(x=>/\bnoindex\b/i.test(x));
   record.menu='not applicable';
   const toggle=page.locator('[data-menu-toggle]').first();
   if(mode.startsWith('Pixel') && await toggle.count() && await toggle.isVisible()){
     await toggle.click({timeout:4000});
     record.menu=await toggle.getAttribute('aria-expanded');
     if(record.menu==='true')await toggle.click({timeout:4000});
   }
   record.browserErrors=pageErrors.slice(0,3);
   record.ok=record.status===200&&meta.h1s.length===1&&record.overflow<=3&&!record.missingSearch&&
      !record.robotNoindex&&(record.menu==='not applicable'||record.menu==='true')&&record.browserErrors.length===0;
  }catch(e){record.ok=false;record.error=String(e?.message||e).slice(0,280)}
  rows.push(record);
 }
 await context.close();
 }
 const failed=rows.filter(x=>!x.ok);
 const tags={};for(const x of rows.filter(x=>!x.ok)){const tag=x.status!==200?'HTTP':x.overflow>3?'overflow':x.h1Count!==1?'H1':x.missingSearch?'missing search':x.robotNoindex?'robots noindex':x.menu==='false'?'mobile menu':x.browserErrors?.length?'JS error':'other';tags[tag]=(tags[tag]||0)+1}
 console.log('GRAVITY_LIVE_PAGE_SWEEP '+JSON.stringify({routes:routes.length,checks:rows.length,passed:rows.length-failed.length,failed:failed.length,failureTypes:tags,failures:failed,all:rows.map(x=>({route:x.route,mode:x.mode,ok:x.ok,status:x.status,overflow:x.overflow,menu:x.menu,search:x.search,robotNoindex:x.robotNoindex,error:x.error}))}));
 // Fail on objectively broken behavior, not on tests' own setup errors.
 if(failed.length)process.exitCode=1;
}catch(e){console.error('GRAVITY_LIVE_PAGE_SWEEP_ERROR '+String(e.stack||e));process.exitCode=1}
finally{if(browser)await browser.close()}
