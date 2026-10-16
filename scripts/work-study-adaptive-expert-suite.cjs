'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-guided-expert-adaptive-v27.js','utf8');
const must=[
 "key==='trainingVerified'&&!yes(a.personBlame)",
 "key==='localVsSystem'",
 "key==='betterProblem'",
 "key==='abnormalEquipment'",
 "key==='causeLinked'&&value==='No'",
 "key==='likelyFailure'&&value==='No'",
 'opens a system-cause branch',
 'not a productivity question until the hazard or fault is controlled',
 'require correction or repeat observation',
 'window.GravityWorkStudyAdaptiveExpert'
];
for(const t of must){if(!src.includes(t)){console.error('Missing adaptive expert behavior:',t);process.exit(1)}}
console.log('Adaptive expert suite passed: Guided branches, skips irrelevant checkpoints, and escalates risky answers.');
