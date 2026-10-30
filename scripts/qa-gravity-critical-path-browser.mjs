import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE='https://gravityleadershipsystem.com';
const OUT='docs/audits/gravity-critical-path-browser-2026-10-30.md';
const routes=[
 ['/', 'header.site-header'],
 ['/start-here','main'],
 ['/gravity-report','#report-search'],
 ['/gravity-report/why-do-my-restaurant-managers-keep-making-excuses','.report-body'],
 ['/book-reader','#reader-gate, #reader-app'],
 ['/register','main'],
 ['/windows-programs','main'],
 ['/gravity-assist','main'],
 ['/gravity-sop-foundry','#gravity-site-menu-access'],
 ['/gravity-shift-lab','#gravity-site-menu-access'],
 ['/gravity-inventory-center','#gravity-site-menu-access'],
 ['/gravity-work-study-lab','#gravity-site-menu-access'],
 ['/knowledge-center','main'],
 ['/restaurant-management-forms-checklists','main'],
 ['/testing-room','#join-card'],
 ['/testing-room-manager','#key'],
 ['/apps/sop-foundry/access','#gravity-site-menu-access'],
 ['/apps/inventory-center/index','#gravity-site-menu-access']
];
const failures=[],warnings=[],results=[];
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:{width:mobile?390:1366,height:mobile?844:900},hasTouch:mobile,isMobile:mobile});
 await context.route('**/*',route=>{
  let u=route.request().url();
  if(u.startsWith(BASE))return route.continue();
  return route.abort();
 });
 let index=0;
 await Promise.all(Array.from({length:3},async()=>{
  while(index<routes.length){
   const [route,selector]=routes[index++];
   const page=await context.newPage();
   let errors=[];
   page.on('pageerror',err=>{if(errors.length<4)errors.push(String(err.message).slice(0,140))});
   try{
    const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:27000});
    if(!response||response.status()!==200)throw Error('HTTP '+(response?.status()||'no response'));
    const required=await page.locator(selector).first().count();
    if(!required)failures.push([route,mobile?'mobile':'desktop','Expected UI missing: '+selector]);
    const v=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
      links:document.querySelectorAll('a[href]').length,
      buttons:document.querySelectorAll('button').length,
      h1:document.querySelector('h1')?.textContent?.trim().slice(0,90)||''}));
    if(v.scroll>v.width+12)warnings.push([route,mobile?'mobile':'desktop','Horizontal overflow '+(v.scroll-v.width)+'px']);
    if(errors.length)warnings.push([route,mobile?'mobile':'desktop','JS exceptions: '+errors.join(' | ')]);
    results.push({route,device:mobile?'390px mobile':'1366px desktop',status:200,buttons:v.buttons,links:v.links,h1:v.h1,errors:errors.length});
   }catch(e){failures.push([route,mobile?'mobile':'desktop',String(e.message).slice(0,170)])}
   finally{await page.close()}
  }
 }));
 await context.close();
}
let secret='not checked';
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await context.route('**/*',route=>route.request().url().startsWith(BASE)?route.continue():route.abort());
let page=await context.newPage();
try{
 const response=await page.goto(BASE+'/testing-room',{waitUntil:'domcontentloaded',timeout:27000});
 if(response?.status()!==200)throw Error('Testing Room not HTTP 200');
 const brand=page.locator('header.site-header a.brand');
 await brand.tap();await page.waitForTimeout(70);await brand.tap();
 await page.waitForURL('**/testing-room-manager',{timeout:4500});
 const loginVisible=await page.locator('#login').isVisible();
 const inboxVisible=await page.locator('#app').isVisible();
 if(!loginVisible||inboxVisible)failures.push(['Testing Room founder gesture','mobile','Manager inbox not correctly gated']);
 secret=loginVisible&&!inboxVisible?'2-tap shortcut opens protected key form':'FAILED';
}catch(e){failures.push(['Testing Room founder gesture','mobile',String(e.message).slice(0,160)]);secret='FAILED'}
await context.close();await browser.close();
const rows=[
 '# Gravity live critical-path browser QA — 2026-10-30','',
 'All navigation was against the real Gravity production hostname in Chrome, using read-only paths and no test registrations or submissions. External third-party calls were disabled for repeatability. This does not prove database persistence or actual delivery of email/voice.',
 '',
 '| Metric | Result |','| --- | ---: |',
 '| Pages chosen | '+routes.length+' |',
 '| Desktop and mobile checks planned | '+routes.length*2+' |',
 '| HTTP 200 pages inspected | '+results.length+' |',
 '| Critical failures | '+failures.length+' |',
 '| Warnings | '+warnings.length+' |',
 '| Founder shortcut | '+secret+' |',
 '','## Critical issues','',...(failures.length?failures.map(x=>'- '+x[0]+' ('+x[1]+'): '+x[2]):['None recorded.']),
 '','## Warnings requiring interpretation','',...(warnings.length?warnings.map(x=>'- '+x[0]+' ('+x[1]+'): '+x[2]):['None recorded.']),
 '','## Route inventory','',
 '| Route | Device | Status | Buttons | Links | JS exceptions |',
 '| --- | --- | ---: | ---: | ---: | ---: |',
 ...results.map(x=>'| '+x.route+' | '+x.device+' | '+x.status+' | '+x.buttons+' | '+x.links+' | '+x.errors+' |'),
 '','## Limitations','',
 'No private account was created, existing user data was not altered, and manager authentication was not bypassed. Tool save/persist workflows, mobile PDF rendering, real email and voice delivery require separate authenticated end-to-end QA.',
];
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,rows.join('\n')+'\n');
console.log(JSON.stringify({pages:routes.length,inspected:results.length,failures:failures.length,warnings:warnings.length,founder:secret,report:OUT}));
