'use strict';
/**
 * Read-only outbound-link audit for the Gravity site, Windows source and manuals.
 * Direct links to publisher pages are not appropriate inside the Gravity product.
 * Does not scan binary ZIP/EXE/PDF/DOCX archives: those require release-asset QA.
 */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const roots=['site','windows','functions','handbook'];
const ext=/\.(?:html?|m?js|cjs|css|json|md|markdown|txt|xml|svg|ts|tsx|jsx|py|ps1|bat|cmd)$/i;
const excludes=['node_modules','.git','dist','build','.next','coverage','playwright-report','test-results'];
let total=0,matched=0,findings=[];
function visit(dir){
 if(!fs.existsSync(dir))return;
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
   if(excludes.includes(e.name))continue;
   const file=path.join(dir,e.name);
   if(e.isDirectory()){visit(file);continue}
   if(!e.isFile()||!ext.test(file))continue;
   const content=fs.readFileSync(file,'utf8');
   total++;
   const lines=content.split(/\r?\n/);
   lines.forEach((line,i)=>{
     // Both literal and slash-escaped domains cover bundled JS regexp and JSON.
     if(!/thomas(?:\\?\/)?monroebooks(?:\\?\.)?com|thomasmonroebooks\.com/i.test(line))return;
     matched++;
     const external=/thomasmonroebooks\s*\.\s*com|thomasmonroebooks\.com/i.test(line.replace(/\\/g,''));
     const kind=external?'old-publisher-domain':'publisher-wording';
     findings.push({path:path.relative(root,file).replace(/\\/g,'/'),line:i+1,kind,fragment:line.trim().slice(0,240)});
   });
 }
}
for(const dir of roots)visit(path.join(root,dir));
console.log('Gravity-to-TMB source audit: scanned '+total+' text files, '+matched+' flagged lines.');
for(const entry of findings){console.log(entry.kind+' '+entry.path+':'+entry.line+' '+entry.fragment)}
if(process.argv.includes('--strict') && findings.some(x=>x.kind==='old-publisher-domain'))process.exitCode=1;
if(process.argv.includes('--json'))console.log('AUDIT_JSON='+JSON.stringify({filesScanned:total,findings}));
