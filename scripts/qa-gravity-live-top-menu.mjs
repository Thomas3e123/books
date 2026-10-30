/* Live public-site menu QA across every static root page, desktop and mobile.
   This is a read-only browser test. Pages without standard site-header (e.g.
   internal manager workrooms) are reported separately, not rewritten. */
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const ROOT=path.resolve('site');
const BASE=(process.env.GRAVITY_URL||'https://gravityleadershipsystem.com').replace(/\/$/,'');
const OUT='docs/audits/gravity-top-menu-live-2026-10-30.md';
const items=fs.readdirSync(ROOT).filter(x=>x.endsWith('.html'));
const pages=items.filter(x=>/header[^>]+class\s*=\s*["'][^"']*site-header/i.test(fs.readFileSync(path.join(ROOT,x),'utf8')));
const uniqueExpected=['/','/gravity-report','/gravity-assist','/operating-systems','/gravity-aware','/books','/book-reader','/restaurant-management-forms-checklists','/gravity-fulfillment-center','/standards-library','/apps/sop-foundry/access','/knowledge-center','/help-center','/windows-programs','/testing-room','/contact','/start-here'];
const failures=[],errors=[];
let checked=0,opened=0,desktopOverflow=0;
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']});
async function visit(pageName,mobile,context){
 const page=await context.newPage();const url=BASE+'/'+pageName.replace(/\.html$/,'');
 try {
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
  if(!response||!response.ok())throw Error('HTTP '+(response?.status()||'no-response'));
  await page.waitForTimeout(175);
  const v=await page.evaluate(()=>{
   const nav=document.querySelector('header.site-header nav#site-nav'),button=document.querySelector('header.site-header [data-menu-toggle]');
   if(!nav||!button)return {ok:false,issue:'header/nav/toggle not found'};
   const links=[...nav.querySelectorAll('a[href]')].map(a=>new URL(a.href,location.href).pathname.replace(/\/$/,'')||'/');
   const title=[...nav.querySelectorAll('a[href]')].map(a=>a.textContent.trim());
   let toggled=null,display=null,expanded=null;
   if(matchMedia('(max-width: 1180px)').matches){button.click();toggled=nav.classList.contains('open');display=getComputedStyle(nav).display;expanded=button.getAttribute('aria-expanded');}
   const nr=nav.getBoundingClientRect();
   return {ok:true,links,title,toggled,display,expanded,navRight:nr.right,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,menuVisible:getComputedStyle(button).display!=='none'};
  });
  if(!v.ok)failures.push([pageName,mobile?'mobile':'desktop',v.issue]);
  else {
   const delta=uniqueExpected.filter(x=>!v.links.includes(x));
   const duplicate=v.links.filter((x,i)=>v.links.indexOf(x)!==i);
   if(delta.length)failures.push([pageName,mobile?'mobile':'desktop','Missing menu items: '+delta.join(', ')]);
   if(duplicate.length)failures.push([pageName,mobile?'mobile':'desktop','Duplicate destinations: '+[...new Set(duplicate)].join(', ')]);
   if(v.links.length!==uniqueExpected.length)failures.push([pageName,mobile?'mobile':'desktop','Expected 17 menu links; got '+v.links.length]);
   if(v.title.some(t=>t==='15 Systems'))failures.push([pageName,mobile?'mobile':'desktop','Stale 15 Systems label']);
   if(mobile&&(!v.menuVisible||!v.toggled||v.display==='none'||v.expanded!=='true'))failures.push([pageName,'mobile','Menu did not visibly open after clicking Menu']);
   if(!mobile&&v.navRight>v.viewport+10){desktopOverflow++;failures.push([pageName,'desktop','Menu extends beyond viewport right edge']);}
   checked++;
   if(mobile&&v.toggled)opened++;
  }
 }catch(e){errors.push([pageName,mobile?'mobile':'desktop',String(e.message||e).slice(0,180)])}
 finally{await page.close()}
}
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:{width:mobile?390:1366,height:mobile?844:900},isMobile:mobile,hasTouch:mobile});
 await context.route('**/*',route=>{const url=route.request().url();if(/^https?:/i.test(url)&&!url.startsWith(BASE))return route.abort();route.continue()});
 let index=0;const jobs=Array.from({length:4},async()=>{while(index<pages.length){const p=pages[index++];await visit(p,mobile,context)}});
 await Promise.all(jobs);await context.close();
}
await browser.close();
const hasNoHeader=items.filter(x=>!pages.includes(x));
const out=[
 '# Gravity live top-menu verification — 2026-10-30','',
 'Production URL: '+BASE,'',
 '**Source scope:** '+items.length+' root HTML files; '+pages.length+' expected standard top menus; '+hasNoHeader.length+' nonstandard root documents (reviewed separately).',
 '**Browser:** Headless Chrome, 1366px desktop and 390px mobile.',
 '**Navigation:** All 17 approved public destinations required, with no duplicates; menu must open on mobile.',
 '',
 '| Metric | Result |','| --- | ---: |',
 '| Desktop + mobile page checks planned | '+(pages.length*2)+' |',
 '| Completed DOM inspections | '+checked+' |',
 '| Mobile menu opens | '+opened+' of '+pages.length+' |',
 '| Desktop navigation overflows | '+desktopOverflow+' |',
 '| Menu issues | '+failures.length+' |',
 '| HTTP/browser errors | '+errors.length+' |','',
 '## Menu problems','',
 ...(failures.length?failures.map(x=>'- **'+x[0]+'** ('+x[1]+'): '+x[2]):['None found.']), '',
 '## HTTP / browser problems','',
 ...(errors.length?errors.map(x=>'- **'+x[0]+'** ('+x[1]+'): '+x[2]):['None found.']), '',
 '## Nonstandard root documents','',
 ...(hasNoHeader.length?hasNoHeader.map(p=>'- '+p):['None']), '',
 'This is browser inspection of the currently deployed public host at the time of the test. Deployment commit must be verified separately against Netlify.',
 ];
 fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,out.join('\n')+'\n');
 console.log(JSON.stringify({pages:pages.length,checked,opened,failures:failures.length,httpErrors:errors.length,report:OUT}));
