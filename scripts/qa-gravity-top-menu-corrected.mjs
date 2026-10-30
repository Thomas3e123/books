import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT=path.resolve('site');
const OUT='docs/audits/gravity-top-menu-corrected-2026-10-30.md';
const LIVE='https://gravityleadershipsystem.com';
const PORT=42783;
const BASE='http://127.0.0.1:'+PORT;
const all=fs.readdirSync(ROOT).filter(n=>n.endsWith('.html'));
const html=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const root=all.filter(n=>/<header\b[^>]*class\s*=\s*["'][^"']*\bsite-header\b/i.test(html(n)));
const focused=root.filter(n=>html(n).includes('id="gravity-site-menu-access"')&&html(n).includes('gravity-program-focus-style'));
const normal=root.filter(n=>!focused.includes(n));
const expected=['/','/gravity-report','/gravity-assist','/operating-systems','/gravity-aware','/books','/book-reader','/restaurant-management-forms-checklists','/gravity-fulfillment-center','/standards-library','/apps/sop-foundry/access','/knowledge-center','/help-center','/windows-programs','/testing-room','/contact','/start-here'];
const issues=[],samples=[];
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 const raw=decodeURIComponent(new URL(req.url,BASE).pathname);
 const clean=raw==='/'?'/index.html':raw;
 let relative=clean.slice(1);
 let p=path.resolve(ROOT,relative);
 if(!p.startsWith(ROOT+path.sep)&&p!==ROOT){res.writeHead(403);res.end();return}
 if(!fs.existsSync(p)||!fs.statSync(p).isFile()){
  if(!path.extname(relative)){p=path.resolve(ROOT,relative+'.html')}
 }
 if(!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);res.end('Not found');return}
 res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');
 res.writeHead(200);fs.createReadStream(p).pipe(res);
});
await new Promise(resolve=>server.listen(PORT,'127.0.0.1',resolve));
let checks=0,regular=0,workroom=0,mobileOpen=0,unusual=all.filter(n=>!root.includes(n));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
async function check(name,isMobile,context){
 const page=await context.newPage();
 const route=BASE+'/'+name.replace(/\.html$/,'');
 const isFocused=focused.includes(name);
 try{
  const response=await page.goto(route,{waitUntil:'domcontentloaded',timeout:25000});
  if(!response?.ok())throw Error('Local HTTP '+(response?.status()||'none'));
  const result=await page.evaluate(({isFocused,isMobile})=>{
    const host=isFocused?document.querySelector('#gravity-site-menu-access'):document.querySelector('header.site-header');
    if(!host)return {error:'Missing appropriate menu host'};
    const nav=isFocused?host.querySelector('nav'):host.querySelector('#site-nav');
    if(!nav)return {error:'Missing appropriate navigation'};
    let opened=null,visible=null;
    if(isMobile){
      if(isFocused){const details=host.querySelector('details'),summary=host.querySelector('summary');summary?.click();opened=!!details?.open;visible=getComputedStyle(nav).display!=='none'}
      else {const button=host.querySelector('[data-menu-toggle]');button?.click();opened=nav.classList.contains('open')&&button?.getAttribute('aria-expanded')==='true';visible=getComputedStyle(nav).display!=='none'}
    }
    return {links:[...nav.querySelectorAll('a[href]')].map(a=>new URL(a.href,location.href).pathname.replace(/\/$/,'')||'/'),labels:[...nav.querySelectorAll('a[href]')].map(a=>a.textContent.trim()),opened,visible,navRight:nav.getBoundingClientRect().right,viewport:innerWidth};
  },{isFocused,isMobile});
  if(result.error)throw Error(result.error);
  const mode=isMobile?'390px mobile':'1366px desktop';
  const found=result.links||[];
  const absent=isFocused?['/','/gravity-report','/operating-systems','/books','/start-here'].filter(t=>!found.includes(t)):expected.filter(t=>!found.includes(t));
  const dupe=found.filter((t,i)=>found.indexOf(t)!==i);
  if(absent.length)issues.push([name,mode,'Missing: '+absent.join(', ')]);
  if(dupe.length)issues.push([name,mode,'Duplicate: '+[...new Set(dupe)].join(', ')]);
  if(result.labels.some(t=>t==='15 Systems'))issues.push([name,mode,'Outdated Systems label']);
  if(!isFocused&&found.length!==17)issues.push([name,mode,'Expected 17 links, found '+found.length]);
  if(isMobile&&(!result.opened||!result.visible))issues.push([name,mode,'Menu did not open']);
  if(!isMobile&&!isFocused&&result.navRight>result.viewport+8)issues.push([name,mode,'Top nav extends beyond viewport']);
  checks++;
  if(isFocused)workroom++;else regular++;
  if(isMobile&&result.opened&&result.visible)mobileOpen++;
 }catch(e){issues.push([name,isMobile?'mobile':'desktop',String(e.message||e).slice(0,150)])}
 finally{await page.close()}
}
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:{width:mobile?390:1366,height:mobile?844:900},hasTouch:mobile,isMobile:mobile});
 await context.route('**/*',route=>{if(route.request().url().startsWith(BASE))return route.continue();return route.abort()});
 let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<root.length){const x=root[cursor++];await check(x,mobile,context)}}));
 await context.close();
}
// Confirm several representative pages on the actual public host without
// flooding production with 242 browser requests or confusing rate-limits with broken links.
const liveList=['/','/gravity-report','/gravity-report-guests','/windows-programs','/gravity-shift-lab'];
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await context.route('**/*',route=>{const u=route.request().url();if(u.startsWith(LIVE))return route.continue();return route.abort()});
for(const slug of liveList){
 const page=await context.newPage();
 try{
  const response=await page.goto(LIVE+slug,{waitUntil:'domcontentloaded',timeout:25000});
  if(!response?.ok()){samples.push([slug,'HTTP '+(response?.status()||'none')]);continue}
  const a=await page.evaluate(()=>{
   const special=document.querySelector('#gravity-site-menu-access');
   if(special){const x=special.querySelector('summary');x?.click();return {links:special.querySelectorAll('nav a').length,opens:!!special.querySelector('details[open]')}}
   const nav=document.querySelector('header.site-header #site-nav'),button=document.querySelector('header.site-header [data-menu-toggle]');
   button?.click();return {links:nav?.querySelectorAll('a').length,opens:nav?.classList.contains('open')&&button?.getAttribute('aria-expanded')==='true',systems:nav?.textContent.includes('Operating Systems')}
  });
  samples.push([slug,'HTTP 200; '+JSON.stringify(a)]);
 }catch(e){samples.push([slug,'Browser check unavailable: '+String(e.message||e).slice(0,100)])}
 finally{await page.close()}
}
await context.close();await browser.close();server.close();
const text=[
 '# Gravity menu corrective QA — 2026-10-30','',
 'This test used real headless Chrome against every top-level Gravity HTML page in a local HTTP serving of the isolated production source, plus five low-volume smoke checks against the actual published host. App subpages, manuals and manager-only pages were inventoried separately.','',
 '| Measure | Result |','| --- | ---: |',
 '| Root HTML files | '+all.length+' |',
 '| Standard public-header pages | '+root.length+' |',
 '| Regular full top menus | '+normal.length+' |',
 '| Focused workspaces with separate Site Menu | '+focused.length+' |',
 '| Nonstandard root documents | '+unusual.length+' |',
 '| Planned desktop/mobile checks | '+(root.length*2)+' |',
 '| Completed browser checks | '+checks+' |',
 '| Mobile menus opened successfully | '+mobileOpen+' |',
 '| Local menu problems | '+issues.length+' |','',
 '## Problems','',...(issues.length?issues.map(x=>'- '+x[0]+' ('+x[1]+'): '+x[2]):['No problems identified in local production-source browser checks.']),'',
 '## Live published-host sampling','',
 ...samples.map(s=>'- '+s[0]+': '+s[1]),'',
 '## Scope exclusions','',
 'Custom SOP Foundry employee/manager rooms and downloadable manuals retain their own navigation. Their lack of a full public top menu is intentional; the public header is not imposed inside workrooms.',
 'Manager-only root document(s): '+unusual.join(', ')+'.','',
 'No files on the Thomas Monroe Books site are modified by this audit.'
];
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,text.join('\n')+'\n');
console.log(JSON.stringify({checked:checks,expected:root.length*2,issues:issues.length,open:mobileOpen,sourcePages:all.length,live:samples,report:OUT}));
