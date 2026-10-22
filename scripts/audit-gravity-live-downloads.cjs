'use strict';
// HEAD-only audit of download links, source HTML and live Gravity preview.
// Does not trigger downloads, browser actions, form submissions or deployments.
const fs=require('node:fs'),path=require('node:path');
const site=path.resolve(__dirname,'..','site');
const host='https://gravity-leadership-system.netlify.app';
const html=[];function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(item.name.endsWith('.html'))html.push(p);}}walk(site);
const targets=new Map();const githubLinks=new Map();
for(const file of html){
 const source=fs.readFileSync(file,'utf8'),page=path.relative(site,file).replace(/\\/g,'/');
 for(const m of source.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)){
  const href=m[2];if(!/\.(?:pdf|zip|docx|exe)(?:[#?]|$)/i.test(href))continue;
  let u;try{u=new URL(href,host+'/'+page)}catch{continue}
  if(u.hostname==='gravity-leadership-system.netlify.app'){
    u.hash='';u.search='';
    const k=u.toString();if(!targets.has(k))targets.set(k,new Set());
    targets.get(k).add(page);
  } else if(u.hostname==='github.com' && /\/releases\/download\//.test(u.pathname)){
    const k=u.toString();if(!githubLinks.has(k))githubLinks.set(k,new Set());githubLinks.get(k).add(page);
  }
 }
}
const pending=[...targets],res=[];
(async()=>{
 async function worker(){
  while(pending.length){
   const [url,pages]=pending.shift()||[];
   if(!url)continue;
   try{
    const r=await fetch(url,{method:'HEAD',redirect:'follow',headers:{'user-agent':'GravityReadOnlyAssetsAudit/1.0'},signal:AbortSignal.timeout(25000)});
    const result={url:new URL(url).pathname,status:r.status,ok:r.ok,contentType:r.headers.get('content-type')||'',contentLength:r.headers.get('content-length'),pages:[...pages].slice(0,4)};
    if(r.ok && /text\/html/i.test(result.contentType)&&!/\.(?:html)$/i.test(url)){
      result.ok=false;result.issue='download request returned HTML; likely SPA fallback or missing asset';
    }
    res.push(result);
   }catch(err){res.push({url:new URL(url).pathname,ok:false,error:String(err).slice(0,200),pages:[...pages].slice(0,4)})}
  }
 }
 await Promise.all(Array.from({length:7},()=>worker()));
 res.sort((a,b)=>a.url.localeCompare(b.url));
 const missing=res.filter(x=>!x.ok),report={site:host,checkedAt:new Date().toISOString(),mode:'GET-free HEAD-only checks; no deploy and no forms',htmlPagesScanned:html.length,localDownloadUrls:targets.size,externalGitHubReleaseUrls:githubLinks.size,results:res,failures:missing};
 fs.writeFileSync('gravity-live-downloads-audit.json',JSON.stringify(report,null,2));
 console.log('DOWNLOAD_AUDIT_SUMMARY '+JSON.stringify({htmlPagesScanned:html.length,localDownloadUrls:targets.size,externalGitHubReleaseUrls:githubLinks.size,passes:res.length-missing.length,failures:missing.length,missing:missing.slice(0,35)}));
 if(missing.length)process.exitCode=2;
})().catch(err=>{console.error(err);process.exitCode=1});
