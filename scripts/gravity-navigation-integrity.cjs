'use strict';
// Read-only link audit for the staged Gravity site. Makes HEAD requests only.
const fs=require('node:fs'),path=require('node:path');
const site=path.join(__dirname,'..','site'),host='https://gravity-leadership-system.netlify.app';
const pages=[];
function scan(d){for(const item of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,item.name);if(item.isDirectory())scan(f);else if(item.name.endsWith('.html'))pages.push(f)}}
scan(site);
const targets=new Map(),ignored=[];
function remember(key,page,kind){if(!targets.has(key))targets.set(key,{pages:new Set(),kinds:new Set()});targets.get(key).pages.add(page);targets.get(key).kinds.add(kind)}
for(const f of pages){
 const rel=path.relative(site,f).split(path.sep).join('/');
 const html=fs.readFileSync(f,'utf8');
 for(const m of html.matchAll(/<(a|link|script|img|iframe|source)\b[^>]*>/gi)){
  const tag=m[0],type=m[1].toLowerCase(),attr=type==='a'||type==='link'?'href':'src';
  const a=tag.match(new RegExp('(?:^|\\s)'+attr+'\\s*=\\s*(["\x27])([\\s\\S]*?)\\1','i'));
  if(!a)continue;
  const raw=a[2].trim().replace(/&amp;/g,'&');
  if(!raw||raw.startsWith('#')||/^(data:|javascript:|mailto:|tel:|blob:)/i.test(raw))continue;
  let u;
  try{u=new URL(raw,host+'/'+rel)}catch{ignored.push({page:rel,attribute:attr,value:raw.slice(0,90)});continue}
  if(u.hostname==='thomasmonroebooks.com'||u.hostname==='www.thomasmonroebooks.com'){
    ignored.push({page:rel,externalLegacy:u.pathname,kind:'old-domain'});
    continue;
  }
  if(u.hostname!=='gravity-leadership-system.netlify.app')continue;
  const clean=u.pathname.replace(/\/+/g,'/');
  if(/\.(pdf|zip|exe|docx)(?:$)/i.test(clean))continue;
  if(clean.includes('/*'))continue;
  const key=clean+(u.search||'');
  remember(key,rel,type);
 }
}
const rows=[],queue=[...targets.entries()];
async function worker(){
 while(queue.length){
  const entry=queue.shift();if(!entry)break;
  const [target,info]=entry;
  try{
   const res=await fetch(host+target,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(22000),headers:{'User-Agent':'GravityOwnSiteReadOnlyNavigationAudit/1.0'}});
   rows.push({target,status:res.status,ok:res.status<400,finalUrl:res.url,sourcePages:[...info.pages].slice(0,8),totalReferences:info.pages.size,kinds:[...info.kinds]});
  }catch(e){rows.push({target,ok:false,error:String(e).slice(0,180),sourcePages:[...info.pages].slice(0,8),kinds:[...info.kinds]})}
 }
}
(async()=>{
 await Promise.all(Array.from({length:10},worker));
 rows.sort((a,b)=>a.target.localeCompare(b.target));
 const failures=rows.filter(r=>!r.ok);
 const result={checkedAt:new Date().toISOString(),site:host,method:'HEAD only',noWrites:true,pagesScanned:pages.length,uniqueInternalTargets:rows.length,success:rows.length-failures.length,failures,oldDomainReferences:ignored.filter(x=>x.kind==='old-domain').slice(0,75),ignoredOther:ignored.filter(x=>x.kind!=='old-domain'),results:rows};
 fs.writeFileSync('gravity-navigation-integrity.json',JSON.stringify(result,null,2));
 console.log('GRAVITY_NAVIGATION_INTEGRITY '+JSON.stringify({pagesScanned:result.pagesScanned,uniqueInternalTargets:rows.length,passing:result.success,failures:failures.length,failedRoutes:failures.slice(0,30),oldDomainMentions:result.oldDomainReferences.length}));
 if(failures.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=1});
