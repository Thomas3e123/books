'use strict';
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-action-expert-v21.js'),'utf8');
const required=[
 ['title','Gravity Action Design Check'],
 ['cause link','directly address the cause or constraint'],
 ['single change','without mixing several unrelated changes'],
 ['success metric','specific measured result'],
 ['quality','quality standard explicitly protected'],
 ['safety','safety standard explicitly protected'],
 ['rollback','stop or roll back the test'],
 ['owner','clearly responsible'],
 ['retest','measured again under comparable conditions'],
 ['action hold','Action Hold — Redesign the Test'],
 ['unknown hold','Action Not Yet Ready'],
 ['sop block','does not support promoting this change yet']
];
for(const [name,text] of required)if(!src.includes(text))throw new Error(`Missing action expert safeguard: ${name}`);
if(!src.includes("['Yes','No','Unknown','Not applicable']"))throw new Error('Action expert must support explicit uncertainty');
console.log('Work Study action expert suite passed cause-link, controlled-test, quality, safety, rollback, ownership, retest, and SOP safeguards.');
