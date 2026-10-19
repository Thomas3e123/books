'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const files=[
  ['Shift Lab','site/assets/js/gravity-shift-lab.js'],
  ['Shift Lab first-schedule walkthrough','site/assets/js/gravity-shift-first-schedule-tour-v1.js'],
  ['Work Study Lab','site/gravity-work-study-lab.html']
];
const path='windows/WEB_WINDOWS_PARITY_STATUS.json';
const status=JSON.parse(fs.readFileSync(path,'utf8'));
let failures=[];
for(const [name,file] of files){
 if(!fs.existsSync(file)){failures.push('Missing web source: '+file);continue;}
 const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const entry=status.components.find(e=>e.web_source===file);
 if(!entry){failures.push(name+': no Windows parity declaration');continue;}
 if(entry.web_sha256!==hash)failures.push(name+': website changed since Windows parity was last reviewed ('+file+').');
 if(entry.windows_status!=='verified')failures.push(name+': Windows parity is '+entry.windows_status+'.');
 if(!entry.windows_build_sha||!entry.windows_test_evidence)failures.push(name+': verified Windows build ID or test evidence missing.');
}
if(failures.length){console.error('\nWINDOWS PARITY NOT CONFIRMED:\n'+failures.map(s=>' - '+s).join('\n'));console.error('\nThis gate does not build Windows installers. Update the Windows program, record a tested build, and update the parity file after validation.');process.exitCode=1;}
else console.log('Web/Windows parity declarations and reviewed source hashes match.');
