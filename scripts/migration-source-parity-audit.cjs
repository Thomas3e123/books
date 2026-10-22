'use strict';
// Offline-safe production parity audit. No API writes, no Netlify deployment, no account changes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const pagePaths=[];function walk(d){for(const ent of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,ent.name);if(ent.isDirectory())walk(p);else if(ent.name.endsWith('.html'))pagePaths.push(path.relative(root,p).replace(/\\/g,'/'));}}walk(site);
const baseFiles=JSON.parse(cp.execFileSync('git',['ls-tree','-r','--name-only','main','site'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean).map(x=>JSON.stringify(x)).join(',' ).replace(/^/,'[').concat(']'));
const baselineSet=new Set(baseFiles),currentSet=new Set(cp.execFileSync('git',['ls-files','site'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean));
const failures=[],notices=[],changeSummary=[];let noBaseline=0,common=0,navPages=0;
function readBase(p){try{return cp.execFileSync('git',['show','main:'+p],{cwd:root,encoding:'utf8',maxBuffer:12*1024*1024});}catch(e){return null;}}
function extractNav(s){return s.match(/<nav\b[^>]*\b(?:id=["']site-nav["']|data-menu\b)[^>]*>[\s\S]*?<\/nav>/i)?.[0]||'';}
function elements(s,t){const re=new RegExp('<'+t+'\\b[^>]*>','gi');return(s.match(re)||[]).map(x=>x.replace(/\s+/g,' ').replace(/https:\/\/(?:www\.)?(?:gravityleadershipsystem\.com|gravity-leadership-system\.netlify\.app|thomasmonroebooks\.com)/g,'{ORIGIN}').replace(/[?&]v=[^"' ]+/g,'?v={VER}'));}
function anchorList(nav){return [...nav.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({href:m[1].replace(/https:\/\/[^/]+/,'{ORIGIN}'),text:m[2].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim()}));}
function summary(title,msg,p){failures.push({page:p,check:title,reason:msg});}
for(const p of pagePaths){
 const newer=fs.readFileSync(path.join(root,p),'utf8'),older=readBase(p);
 if(!older){noBaseline++;notices.push({page:p,note:'new page not on baseline'});continue}
 common++;const olderNav=extractNav(older),newNav=extractNav(newer);
 if(!!olderNav!==!!newNav)summary('nav-missing','Main menu removed',p);
 if(olderNav) {navPages++;const oldLinks=anchorList(olderNav),newLinks=anchorList(newNav);if(JSON.stringify(oldLinks)!==JSON.stringify(newLinks))summary('nav-mismatch',JSON.stringify({old:oldLinks,new:newLinks}).slice(0,1800),p);}
 for(const elem of ['script','form','button','input','iframe']){const a=elements(older,elem),b=elements(newer,elem);if(elem==='script'&&a.length===b.length)continue;if(a.length!==b.length)summary(elem+'-count',a.length+' vs '+b.length,p);}
 const imgsOld=[...older.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)/gi)].map(x=>x[1]);
 const imgsNew=[...newer.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)/gi)].map(x=>x[1]);
 if(JSON.stringify(imgsOld)!==JSON.stringify(imgsNew)) summary('images-changed',JSON.stringify({old:imgsOld.slice(0,8),new:imgsNew.slice(0,8)}),p);
 const linksOld=[...older.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)].map(x=>x[0]);
 const linksNew=[...newer.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)].map(x=>x[0]);
 if(JSON.stringify(linksOld)!==JSON.stringify(linksNew)) summary('stylesheets-changed','Stylesheet link set altered',p);
 if(!newer.includes('gravity-migration-preview-notice'))summary('preview-notice','Migration warning not installed',p);
 const oldIds=[...older.matchAll(/\bid=["']([^"']+)["']/gi)].map(x=>x[1]);
 const newIds=[...newer.matchAll(/\bid=["']([^"']+)["']/gi)].map(x=>x[1]).filter(x=>x!=='gravity-migration-preview-notice');
 if(JSON.stringify(oldIds)!==JSON.stringify(newIds))summary('id-changes',JSON.stringify({old:oldIds.slice(0,20),new:newIds.slice(0,20)}).slice(0,900),p);
 const bodyOpen=newer.match(/<body\b[^>]*>/i)?.[0]||'';
 if(!bodyOpen)summary('body-missing','Body element missing',p);
 if(!/content="noindex,nofollow"/i.test(newer))summary('noindex-missing','Preview meta noindex absent',p);
 if(/<div id="gravity-migration-preview-notice"[^>]*style="[^"]*position:relative/i.test(newer))summary('notice-flow','Preview notice still pushes header down',p);
}
const criticalExact=['site/assets/js/site.js','site/assets/css/styles.css','site/assets/css/gravity-refinement.css','site/assets/images/gravity-system-mark.svg','site/_redirects',...Array.from(currentSet).filter(x=>x.startsWith('functions/'))];
for(const f of criticalExact) {
 const a=readBase(f);if(a===null){if(!f.startsWith('functions/'))summary('missing-base',f,'general');continue}
 const b=fs.readFileSync(path.join(root,f),'utf8');
 if(a!==b)summary('critical-file-changed','Must preserve exactly: '+f,'general');
}
const difference=cp.execFileSync('git',['diff','--name-only','main','HEAD','--','site','functions','netlify'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
const unexpected=difference.filter(x=>!(x.endsWith('.html')||['site/_headers','site/robots.txt','site/sitemap.xml'].includes(x)));
for(const f of unexpected)summary('unexpected-file-change','Unexpected live file change',f);
const report={run_at:new Date().toISOString(),base:'main',comparison:'audit branch staging build, no production change',pages_found:pagePaths.length,pages_compared:common,nav_pages:navPages,new_pages:noBaseline,changed_count:difference.length,unexpected_source_changes:unexpected,issue_count:failures.length,issues:failures,notes:notices};
fs.writeFileSync(path.join(root,'gravity-source-parity-report.json'),JSON.stringify(report,null,2));
let text='# Gravity / TMB Source Parity Audit\n\n';
text+='- Date: '+report.run_at+'\n- Compared HTML pages: '+common+'\n- Main navigations compared: '+navPages+'\n- Critical assets/scripts/redirects: compared against main\n- Differences in source: '+difference.length+'\n- Unexpected modifications: '+unexpected.length+'\n- Failures: '+failures.length+'\n\n';
for(const f of failures.slice(0,70)) text+='- **'+f.check+'** on '+f.page+': '+f.reason+'\n';
fs.writeFileSync(path.join(root,'gravity-source-parity-report.md'),text);
console.log(JSON.stringify({pages_found:report.pages_found,pages_compared:common,nav_pages:navPages,changed_count:difference.length,unexpected_source_changes:unexpected,issues:failures.slice(0,40),totalIssues:failures.length},null,2));
if(failures.length)process.exitCode=1;
