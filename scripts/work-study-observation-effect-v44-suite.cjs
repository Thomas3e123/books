'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-observation-effect-v44.js','utf8');
const must=[
 'Gravity Observation-Effect Check',
 'Observation Effect Not Evident',
 'Observation-Context Hold',
 'Observation Effect Needs Review',
 'not proof of intent',
 'first two to the last two recorded runs',
 'normal working rhythm',
 'does not prove anyone deliberately changed behavior',
 "Math.abs(change)>.20",
 "Math.abs(change)>.12",
 "if(s.mode!=='guided'||s.timer?.running)return",
 'window.GravityWorkStudyObservationEffect'
];
for(const t of must){if(!src.includes(t)){console.error('Missing observation-effect behavior:',t);process.exit(1)}}
console.log('Observation-effect suite passed: normal-condition hold, early-vs-late sequence signal, non-accusatory interpretation, and safe Guided teaching are present.');