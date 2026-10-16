'use strict';
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-earbud-mode-v18.js'),'utf8');
const required=[
 ['privacy default','enabled:false'],
 ['test required','tested:false'],
 ['private test prompt','If you heard this in your earbud, private coaching is ready.'],
 ['short prompt rule','short prompts only'],
 ['repeat cue','Repeat cue'],
 ['off control','Turn off'],
 ['guided only',"s.mode!=='guided'"],
 ['observation cue','Observation cue.'],
 ['speech synthesis','speechSynthesis.cancel()']
];
for(const [name,text] of required)if(!src.includes(text))throw new Error(`Missing Earbud Mode safeguard: ${name}`);
if(src.includes('p.enabled=true;p.tested=false'))throw new Error('Earbud Mode can enable without test');
console.log('Work Study Earbud Mode suite passed privacy, test-first, short-prompt, repeat, off, and Guided-only safeguards.');
