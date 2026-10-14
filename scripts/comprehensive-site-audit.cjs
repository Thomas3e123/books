'use strict';
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(site);const htmlFiles=files.filter(f=>f.endsWith('.html'));const rel=f=>path.relative(site,f).replace(/\\/g,'/');
const existsRoute=u=>{let p=u.split(/[?#]/)[0];if(!p||p==='/')return fs.existsSync(path.join(site,'index.html'));p=p.replace(/^\//,'').replace(/\/$/,'');return fs.existsSync(path.join(site,p))||fs.existsSync(path.join(site,p+'.html'))||fs.existsSync(path.join(site,p,'index.html'));};
const errors=[],warnings=[];const add=(a,f,m)=>a.push(`${f}: ${m}`);
const redirects=fs.readFileSync(path.join(site,'_redirects'),'utf8').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#')).map(x=>x.split(/\s+/)[0]);
function routeExists(u){if(existsRoute(u))return true;const p=u.split(/[?#]/)[0];return redirects.includes(p)||redirects.includes(p.replace(/\/$/,''));}
for(const f of htmlFiles){const r=rel(f),s=fs.readFileSync(f,'utf8'),isInternal=/^(apps\/|assets\/downloads\/)/.test(r),isNoindex=/name=["']robots["'][^>]*noindex|noindex[^>]*name=["']robots["']/i.test(s);
 if(!/<title>[^<]+<\/title>/i.test(s))add(errors,r,'missing title');
 if(!isInternal&&!isNoindex&&!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(s)&&!isInternal&&!isNoindex&&!/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(s))add(warnings,r,'missing meta description');
 if(!isInternal&&!isNoindex&&!/<link[^>]+rel=["']canonical["']/i.test(s)&&!/(testing-room-manager|registration-thanks|review-thanks)/.test(r))add(warnings,r,'missing canonical');
 const h1=(s.match(/<h1\b/gi)||[]).length;if(h1!==1&&!isInternal&&!isNoindex&&!/(testing-room-manager|registration-thanks|review-thanks)/.test(r))add(warnings,r,`H1 count ${h1}`);
 const ids=[...s.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]).filter(x=>!x.includes('${'));const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];if(dup.length)add(errors,r,`duplicate IDs: ${dup.slice(0,8).join(', ')}`);
 for(const m of s.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)){let u=m[1];if(!u||u.includes('${')||/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(u))continue;if(u.startsWith('//'))continue; if(u.startsWith('/')){if(!routeExists(u)&&!u.startsWith('/.netlify/')&&!u.startsWith('/testing-room/'))add(errors,r,`broken local target ${u}`);}else{const clean=u.split(/[?#]/)[0];if(!clean)continue;const target=path.resolve(path.dirname(f),clean);if(!fs.existsSync(target))add(errors,r,`missing relative asset ${u}`);}}
 if(/\b350\s+(?:current\s+)?(?:Gravity\s+)?SOP/i.test(s))add(warnings,r,'contains stale 350-SOP current wording');
 if(/\b189\s+(?:AI\s+)?prompts?/i.test(s))add(warnings,r,'contains stale 189-prompt wording');
 if(/Search\s+215\s+Prompts|Search all 215|215-prompt Gravity digital workbook|215 controlled prompts|Loading the 215-prompt/i.test(s))add(warnings,r,'contains stale 215-prompt current wording');
 if(/testing-room-manager/.test(r)&&!/noindex/i.test(s))add(errors,r,'manager page is not explicitly noindex');
}
const sitemap=fs.readFileSync(path.join(site,'sitemap.xml'),'utf8');if(/testing-room-manager/i.test(sitemap))errors.push('sitemap.xml: includes private manager route');
const js=fs.readFileSync(path.join(site,'assets/js/site.js'),'utf8');if(!/page_location\s*:/.test(js))warnings.push('assets/js/site.js: GA4 page_location is not explicitly sanitized; query tokens may be captured');
const tr=fs.readFileSync(path.join(site,'testing-room.html'),'utf8');if(/page:location\.href/.test(tr))errors.push('testing-room.html: private return token can be copied into stored message page context via location.href');
if(/history\.replaceState\([^;]+\?t=/.test(tr))warnings.push('testing-room.html: private return token remains in browser URL after join');
const promptJs=fs.readFileSync(path.join(site,'assets/js/ai-prompt-search.js'),'utf8');if(/restaurant-ai-prompts-215\.json/.test(promptJs))errors.push('assets/js/ai-prompt-search.js: live prompt search still loads 215-prompt index');
const prompt250=path.join(site,'assets/data/restaurant-ai-prompts-250.json');if(!fs.existsSync(prompt250))errors.push('prompt index: 250-prompt JSON is missing');else{try{const j=JSON.parse(fs.readFileSync(prompt250,'utf8'));if(j.length!==250)errors.push(`prompt index: expected 250 prompts, found ${j.length}`);}catch(e){errors.push('prompt index: 250-prompt JSON is invalid');}}
const testingFn=path.join(root,'functions/testing-room/index.mjs');if(fs.existsSync(testingFn)){const fn=fs.readFileSync(testingFn,'utf8');if(/(?:MANAGER|ADMIN)[A-Z0-9_]*(?:KEY|TOKEN)[^\n]{0,80}["'][A-Za-z0-9_-]{16,}["']/.test(fn))errors.push('testing-room function: possible hard-coded manager credential');}
console.log(`AUDIT_HTML_PAGES=${htmlFiles.length}`);console.log(`AUDIT_FILES=${files.length}`);console.log(`ERRORS=${errors.length}`);errors.forEach(x=>console.log('ERROR '+x));console.log(`WARNINGS=${warnings.length}`);warnings.forEach(x=>console.log('WARN '+x));
fs.writeFileSync(path.join(root,'site-audit-report.txt'),[`HTML pages: ${htmlFiles.length}`,`Site files: ${files.length}`,`Errors: ${errors.length}`,...errors.map(x=>'ERROR '+x),`Warnings: ${warnings.length}`,...warnings.map(x=>'WARN '+x),''].join('\n'));
process.exitCode=errors.length?2:0;
