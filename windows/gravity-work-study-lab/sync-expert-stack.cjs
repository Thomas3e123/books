'use strict';
const fs=require('node:fs'),path=require('node:path');
const here=__dirname,root=path.resolve(here,'..','..'),siteJs=path.join(root,'site','assets','js'),siteCss=path.join(root,'site','assets','css','gravity-work-study-v2.css'),upgrade=path.join(root,'scripts','upgrade-work-study-lab-v2.cjs'),out=path.join(here,'expert');
if(!fs.existsSync(upgrade))throw new Error('Website Work Study installer not found.');
const src=fs.readFileSync(upgrade,'utf8');
const matches=[...src.matchAll(/\['(gravity-work-study-[^']+\.js)','([^']+)'\]/g)];
const names=['gravity-work-study-mutation-guard-v62.js','gravity-work-study-v2.js','gravity-work-study-guided-entry-v63.js',...matches.map(m=>m[1])];
const unique=[...new Set(names)];
for(const required of ['gravity-work-study-mutation-guard-v62.js','gravity-work-study-guided-entry-v63.js','gravity-work-study-clock-control-v32.js','gravity-work-study-standard-minutes-v33.js','gravity-work-study-evidence-package-v56.js','gravity-work-study-ergonomics-v57.js','gravity-work-study-learning-curve-v58.js','gravity-work-study-context-conditions-v59.js','gravity-work-study-sustainable-pace-v60.js','gravity-work-study-expert-triage-v61.js'])if(!unique.includes(required))throw new Error('Parity check failed. Missing '+required);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of unique){
 const from=path.join(siteJs,name),to=path.join(out,name);if(!fs.existsSync(from))throw new Error('Missing expert source '+name);let code=fs.readFileSync(from,'utf8');
 if(name==='gravity-work-study-process-map-v34.js'){
  const old="if(ext==='docx'){const contentBase64=toBase64(await f.arrayBuffer()),res=await fetch('/.netlify/functions/work-study-process-file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:f.name,mimeType:f.type,contentBase64})});const j=await res.json().catch(()=>({}));if(!res.ok)throw new Error(j.error||'Gravity could not read that DOCX.');return String(j.text||'')}";
  const replacement="if(ext==='docx'){const contentBase64=toBase64(await f.arrayBuffer());if(window.gravityDesktop?.readProcessFile){const j=await window.gravityDesktop.readProcessFile({fileName:f.name,mimeType:f.type,contentBase64});return String(j.text||'')}const res=await fetch('https://thomasmonroebooks.com/.netlify/functions/work-study-process-file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:f.name,mimeType:f.type,contentBase64})});const j=await res.json().catch(()=>({}));if(!res.ok)throw new Error(j.error||'Gravity could not read that DOCX.');return String(j.text||'')}";
  if(!code.includes(old))throw new Error('Windows DOCX compatibility patch no longer matches website process-map source.');
  code=code.replace(old,replacement);
 }
 if(name==='gravity-work-study-earbud-mode-v18.js'){
  code=code.replace("fetch('/.netlify/functions/gravity-tts'","fetch('https://thomasmonroebooks.com/.netlify/functions/gravity-tts'");
 }
 fs.writeFileSync(to,code,'utf8');
}
fs.copyFileSync(siteCss,path.join(out,'gravity-work-study-v2.css'));
const loader=`(()=>{'use strict';const files=${JSON.stringify(unique)};let i=0;function next(){if(i>=files.length){document.documentElement.dataset.gravityExpertStack='v63';window.dispatchEvent(new CustomEvent('gravity-work-study-windows-ready',{detail:{count:files.length,stack:'v63'}}));return}const s=document.createElement('script');s.src='expert/'+files[i++];s.onload=next;s.onerror=()=>{document.body.insertAdjacentHTML('afterbegin','<div style="padding:14px;background:#5c1b22;color:white;font-weight:800">Gravity Windows expert stack failed to load.</div>')};document.body.appendChild(s)}next()})();\n`;
fs.writeFileSync(path.join(here,'expert-loader.js'),loader,'utf8');
const manifest={stack:'v63',generatedAt:new Date().toISOString(),count:unique.length,files:unique,source:'site/assets/js + scripts/upgrade-work-study-lab-v2.cjs',windowsBridge:'durable-evidence-v1',guidedStability:'mutation-guard-v62 + guided-entry-v63',docxReader:'Electron main-process bridge to https://thomasmonroebooks.com/.netlify/functions/work-study-process-file',ttsReader:'https://thomasmonroebooks.com/.netlify/functions/gravity-tts'};
fs.writeFileSync(path.join(out,'windows-expert-manifest.json'),JSON.stringify(manifest,null,2),'utf8');
console.log(`Synchronized ${unique.length} Work Study scripts plus premium CSS into Windows. Full expert stack through v63 verified with Guided stability and durable Windows evidence bridge.`);
