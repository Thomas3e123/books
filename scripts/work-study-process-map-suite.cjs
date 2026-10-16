'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-process-map-v34.js','utf8');
const must=[
 'Gravity Proposed Observation Map',
 'This is not measured evidence.',
 'From written directions',
 'Gravity inferred — confirm it happens',
 'Use confirmed steps for observation',
 "sourceType:'written'",
 "sourceType:'gravity-inferred'",
 "proposedFromProcessMap:true",
 "confirmedByManager:true",
 "['fixed','variable','capacity-step']",
 'If you have the recipe or written production directions',
 'window.GravityWorkStudyProcessMap'
];
for(const t of must){if(!src.includes(t)){console.error('Missing process-map behavior:',t);process.exit(1)}}
if(!src.includes('Do you have the recipe or written production directions?')){console.error('Missing early written-process prompt.');process.exit(1)}
if(!src.includes('Actual production observation must confirm what really happens and how long it takes.')){console.error('Missing evidence-boundary warning.');process.exit(1)}
console.log('Process-map suite passed: written directions remain proposed evidence, inferred operational steps require confirmation, and confirmed steps carry traceable source/scaling metadata into observation.');
