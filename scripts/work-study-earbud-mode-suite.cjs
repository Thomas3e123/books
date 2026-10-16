'use strict';
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-earbud-mode-v18.js'),'utf8');
const required=[
 ['guided entry greeting','Hello. I’m Gravity. I’ll take you through this.'],
 ['guided only',"s.mode!=='guided'"],
 ['observation cue','Observation cue.'],
 ['speech synthesis','speechSynthesis.cancel()'],
 ['automatic sync','function sync()'],
 ['guided click hook','[data-mode="guided"]'],
 ['guided start hook','[data-start="guided"]']
];
for(const [name,text] of required)if(!src.includes(text))throw new Error(`Missing automatic Guided voice behavior: ${name}`);
for(const banned of ['Test earbud','Off until you test audio','Turn off','tested:false'])if(src.includes(banned))throw new Error(`Old Earbud Mode setup remains: ${banned}`);
console.log('Work Study Guided voice suite passed automatic speech-on-Guided, greeting, and observation-cue safeguards.');
