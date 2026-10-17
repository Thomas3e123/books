'use strict';
const fs=require('node:fs'),path=require('node:path');
const here=__dirname,root=path.resolve(here,'..','..'),siteJs=path.join(root,'site','assets','js'),siteCss=path.join(root,'site','assets','css','gravity-work-study-v2.css'),upgrade=path.join(root,'scripts','upgrade-work-study-lab-v2.cjs'),out=path.join(here,'expert');
if(!fs.existsSync(upgrade))throw new Error('Website Work Study installer not found.');
const src=fs.readFileSync(upgrade,'utf8');
const matches=[...src.matchAll(/\['(gravity-work-study-[^']+\.js)','([^']+)'\]/g)];
const names=['gravity-work-study-v2.js',...matches.map(m=>m[1])];
const unique=[...new Set(names)];
for(const required of ['gravity-work-study-clock-control-v32.js','gravity-work-study-standard-minutes-v33.js','gravity-work-study-evidence-package-v56.js','gravity-work-study-ergonomics-v57.js','gravity-work-study-learning-curve-v58.js','gravity-work-study-context-conditions-v59.js','gravity-work-study-sustainable-pace-v60.js','gravity-work-study-expert-triage-v61.js'])if(!unique.includes(required))throw new Error('Parity check failed. Missing '+required);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of unique){const from=path.join(siteJs,name),to=path.join(out,name);if(!fs.existsSync(from))throw new Error('Missing expert source '+name);let code=fs.readFileSync(from,'utf8');if(name==='gravity-work-study-process-map-v34.js')code=code.replace("fetch('/.netlify/functions/work-study-process-file'","fetch('https://thomasmonroebooks.com/.netlify/functions/work-study-process-file'");fs.writeFileSync(to,code,'utf8');}
fs.copyFileSync(siteCss,path.join(out,'gravity-work-study-v2.css'));
const loader=`(()=>{'use strict';const files=${JSON.stringify(unique)};let i=0;function next(){if(i>=files.length){document.documentElement.dataset.gravityExpertStack='v61';window.dispatchEvent(new CustomEvent('gravity-work-study-windows-ready',{detail:{count:files.length,stack:'v61'}}));return}const s=document.createElement('script');s.src='expert/'+files[i++];s.onload=next;s.onerror=()=>{document.body.insertAdjacentHTML('afterbegin','<div style="padding:14px;background:#5c1b22;color:white;font-weight:800">Gravity Windows expert stack failed to load.</div>')};document.body.appendChild(s)}next()})();\n`;
fs.writeFileSync(path.join(here,'expert-loader.js'),loader,'utf8');
const manifest={stack:'v61',generatedAt:new Date().toISOString(),count:unique.length,files:unique,source:'site/assets/js + scripts/upgrade-work-study-lab-v2.cjs',docxReader:'https://thomasmonroebooks.com/.netlify/functions/work-study-process-file'};
fs.writeFileSync(path.join(out,'windows-expert-manifest.json'),JSON.stringify(manifest,null,2),'utf8');
console.log(`Synchronized ${unique.length} Work Study scripts plus premium CSS into Windows. Full expert stack through v61 verified.`);
