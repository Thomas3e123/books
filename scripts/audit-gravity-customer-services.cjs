'use strict';
// Read-only migration audit. No customer actions, no forms submission, no Netlify deployment.
const fs=require('node:fs');
const path=require('node:path');
const site=path.resolve(__dirname,'..','site');
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.html$/i.test(e.name))files.push(p)}}
walk(site);
const srcPath=p=>path.relative(site,p).replace(/\\/g,'/');
const wanted=['gravity-registration','gravity-report-opt-in','gravity-contact','gravity-customer-experience'];
const findings=[],registrations=[],assetUrls=new Map(),githubUrls=new Map(),manuals=[];
const attr=(tag,key)=>{let m=tag.match(new RegExp('(?:^|\\s)'+key+'\\s*=\\s*(["\x27])([\\s\\S]*?)\\1','i'));return m?m[2]:null};
for(const f of files){
 const route=srcPath(f),html=fs.readFileSync(f,'utf8');
 for(const m of html.matchAll(/<form\b[^>]*>/gi)){
  const tag=m[0],name=attr(tag,'name'),method=(attr(tag,'method')||'GET').toUpperCase(),action=attr(tag,'action');
  if(!name||!name.startsWith('gravity-'))continue;
  const netlify=/\sdata-netlify(?:\s*=\s*["']true["'])?|(?<!data-)\snetlify(?=\s|=|>)/i.test(tag);
  registrations.push({route,name,method,action,netlify});
  if(wanted.includes(name)&&method==='POST'&&action&&!/^mailto:/i.test(action)&&!netlify)findings.push({severity:'BLOCKER',route,check:'unregistered-form',detail:name+' is POST but not marked for Netlify build-time form detection'});
 }
 for(const match of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)){
  const href=match[2];if(!href||href.startsWith('#')||href.startsWith('mailto:'))continue;
  if(href.includes('github.com/Thomas3e123/books/releases/download/')){
    let u;try{u=new URL(href)}catch{continue}
    const p=u.pathname.match(/\/releases\/download\/([^/]+)\/([^?#]+)/);if(!p)continue;
    const tag=decodeURIComponent(p[1]),asset=decodeURIComponent(p[2]);
    (githubUrls.get(tag)??githubUrls.set(tag,new Map()).get(tag)).set(asset,(githubUrls.get(tag).get(asset)||new Set()).add(route));
    continue;
  }
  if(!/\.(pdf|docx|zip|exe)(?:[?#]|$)/i.test(href))continue;
  let u;try{u=new URL(href,'https://gravity-leadership-system.netlify.app/'+route)}catch{continue}
  if(u.hostname!=='gravity-leadership-system.netlify.app'&&!u.hostname.endsWith('gravityleadershipsystem.com'))continue;
  const rel=decodeURIComponent(u.pathname).replace(/^\/+/,'');
  (assetUrls.get(rel)??assetUrls.set(rel,new Set()).get(rel)).add(route);
 }
}
for(const [rel,pages] of assetUrls){
 const target=path.resolve(site,rel);
 if(!target.startsWith(site+path.sep)){findings.push({severity:'BLOCKER',check:'unsafe-link',detail:rel});continue}
 if(!fs.existsSync(target))findings.push({severity:'CHECK',check:'missing-local-download-asset',detail:rel,pages:[...pages].slice(0,4)});
}
const manualBases=['Gravity_SOP_Foundry_Windows_User_Manual','Gravity_Shift_Lab_Windows_User_Manual','Gravity_Inventory_Center_Windows_User_Manual','Gravity_Work_Study_Lab_Windows_User_Manual'];
for(const name of manualBases){
 const detail={name};
 for(const ext of ['pdf','docx','html'])detail[ext]=fs.existsSync(path.join(site,'assets/downloads/windows/manuals/current/'+name+'.'+ext));
 manuals.push(detail);
 if(Object.values(detail).some(v=>v===false))findings.push({severity:'BLOCKER',check:'current-manual-missing',detail:name});
}
const backend={};
for(const [key,p] of Object.entries({
 'Work Study links':'functions/work-study-link/index.mjs',
 'Gravity Guide':'functions/gravity-guide/guide-core.mjs',
 'Gravity TTS':'functions/gravity-tts/gravity-tts.js',
 'Testing Room':'functions/testing-room/index.mjs',
 'Audio transcription':'functions/work-study-transcribe/work-study-transcribe.js'
})){
 const source=fs.readFileSync(path.resolve(site,'..',p),'utf8');
 backend[key]={mentionsOldOrigin:source.includes('https://thomasmonroebooks.com'),mentionsPermanentGravityOrigin:source.includes('https://gravityleadershipsystem.com'),mentionsTemporaryGravityOrigin:source.includes('https://gravity-leadership-system.netlify.app')};
}
if(backend['Work Study links'].mentionsOldOrigin&&!backend['Work Study links'].mentionsTemporaryGravityOrigin)findings.push({severity:'BLOCKER',check:'work-study-pairing-links',detail:'Device pairing responses still direct customers to the old TMB domain'});
for(const key of ['Gravity Guide','Gravity TTS','Testing Room','Audio transcription'])if(!backend[key].mentionsPermanentGravityOrigin)findings.push({severity:'BLOCKER',check:'future-domain-origin',detail:key+' origin checks must be tested and configured before permanent domain cutover'});
const report={created:new Date().toISOString(),comparisonBranch:'audit/gravity-parity-2026-10-22',noNetlifyDeploy:true,htmlPages:files.length,registrations,downloadLinkCount:assetUrls.size,downloadLinkMissing:findings.filter(x=>x.check==='missing-local-download-asset').length,windowsReleases:Object.fromEntries([...githubUrls].map(([k,v])=>[k,[...v].map(([asset,pages])=>({asset,referencedOn:[...pages]}))])),manuals,backend,findings};
fs.writeFileSync('gravity-customer-service-gates.json',JSON.stringify(report,null,2));
console.log('CUSTOMER_SERVICE_AUDIT '+JSON.stringify({pages:files.length,forms:registrations,localAssets:assetUrls.size,missingAssets:report.downloadLinkMissing,releaseTags:[...githubUrls.keys()],manuals,backend,findings:findings.slice(0,35),totalFindings:findings.length}));
if(findings.some(x=>x.severity==='BLOCKER'))process.exitCode=2;
