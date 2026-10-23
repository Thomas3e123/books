'use strict';
/*
 * Read-only endpoint/source parity checks. Uses GET only.
 * Compares live TMB to live new Gravity preview over all stored HTML paths.
 * This does not upload, register, deploy, run a Netlify function, or read customer data.
 */
const fs=require('node:fs'),path=require('node:path');
const site=path.resolve(__dirname,'..','site');
const oldHost='https://thomasmonroebooks.com';
const newHost='https://gravity-leadership-system.netlify.app';
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
 const f=path.join(d,e.name);
 if(e.isDirectory())walk(f);else if(e.name.endsWith('.html')) files.push(path.relative(site,f).replace(/\\/g,'/'));
}}
walk(site);
const critical=['index.html','gravity-assist.html','gravity-sop-foundry.html','gravity-shift-lab.html','gravity-inventory-center.html','gravity-work-study-lab.html','windows-programs.html','register.html','contact.html','gravity-report.html','apps/sop-foundry/employee-access.html'];
const report={timestamp:new Date().toISOString(),type:'read-only live static HTML audit',oldHost,newHost,pages:files.length,results:[],issues:[],notes:[]};
const normalize=s=>String(s||'').replace(/https?:\/\/(?:thomasmonroebooks\.com|gravityleadershipsystem\.com|gravity-leadership-system\.netlify\.app)/g,'{ORIGIN}').replace(/\s+/g,' ').trim();
const title=s=>(s.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'';
const nav=s=>(s.match(/<nav\b[^>]*(?:data-menu|site-nav)[^>]*>([\s\S]*?)<\/nav>/i)||[])[1]||'';
const links=s=>[...s.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>[normalize(m[1]),normalize(m[2].replace(/<[^>]*>/g,'')).replace(/&amp;/g,'&')]);
const count=(s,tag)=>[...s.matchAll(new RegExp('<'+tag+'\\b','gi'))].length;
async function get(host,file) {
 const url=host+'/'+file;
 try {
   const signal=AbortSignal.timeout(18000);
   const response=await fetch(url,{signal,redirect:'follow',headers:{'User-Agent':'GravityMigrationReadOnlyAudit/1.0'}});
   const body=await response.text();
   return {status:response.status,url:response.url,body,contentType:response.headers.get('content-type'),robots:response.headers.get('x-robots-tag')||''};
 } catch(e){return {status:0,url,error:String(e),body:''}}
}
async function test(file){
 const [a,b]=await Promise.all([get(oldHost,file),get(newHost,file)]);
 const result={page:file,TMB:a.status,GRAVITY:b.status,titleTMB:normalize(title(a.body)),titleGravity:normalize(title(b.body)),navigationTMB:links(nav(a.body)).length,navigationGravity:links(nav(b.body)).length,previewNotice:b.body.includes('gravity-migration-preview-notice'),robots:b.robots||null,
  formCount:[count(a.body,'form'),count(b.body,'form')],scriptCount:[count(a.body,'script'),count(b.body,'script')],imageCount:[count(a.body,'img'),count(b.body,'img')]};
 const issues=[];
 if(a.status!==200 || b.status!==200)issues.push('http-status-discrepancy');
 if(normalize(title(a.body))!==normalize(title(b.body)) && a.status===200 && b.status===200)issues.push('title-discrepancy');
 if(JSON.stringify(links(nav(a.body)))!==JSON.stringify(links(nav(b.body))))issues.push('nav-link-discrepancy');
 if(!result.previewNotice)issues.push('missing-preview-warning');
 if(result.formCount[0]!==result.formCount[1])issues.push('form-count-discrepancy');
 if(result.scriptCount[0]!==result.scriptCount[1]){
   const sourceCount=count(fs.readFileSync(path.join(site,file),'utf8'),'script');
   result.scriptDiff={source:sourceCount,liveTMB:result.scriptCount[0],liveGravity:result.scriptCount[1]};
   // The existing Netlify TMB site injects a single post-processing monitoring script
   // into HTML responses; it is not present in either Git branch's page source.
   // Distinguish this known live-only difference from a loss of application scripts.
   if(result.scriptCount[0]===sourceCount+1 && result.scriptCount[1]===sourceCount){
     result.scriptDiff.explanation='One additional TMB Netlify-injected script; source scripts retained';
   } else issues.push('application-script-count-discrepancy');
 }
 if(result.imageCount[0]!==result.imageCount[1])issues.push('image-count-discrepancy');
 if(!/noindex/i.test(b.robots) && !/content=["']noindex/i.test(b.body))issues.push('preview-indexing-risk');
 if(issues.length){result.issues=issues;report.issues.push({page:file,issues,aError:a.error,bError:b.error})}
 report.results.push(result);
 console.log(JSON.stringify(result));
}
(async()=>{
 const queue=[...files];let completed=0;const workers=Array.from({length:6},async()=>{while(queue.length){const file=queue.shift();if(file)await test(file);completed++;}});
 await Promise.all(workers);
 const highlights=report.results.filter(x=>critical.includes(x.page));
 const summary={checked:report.results.length,pages:files.length,issues:report.issues.length,failed:report.issues.slice(0,35),criticalPages:highlights};
 fs.writeFileSync('gravity-live-static-parity.json',JSON.stringify(report,null,2));
 console.log('LIVE_STATIC_PARITY_SUMMARY '+JSON.stringify(summary));
 if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
