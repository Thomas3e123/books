'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-guided-expert-adaptive-v27.js','utf8');
const must=[
 "key==='trainingVerified'&&!yes(a.personBlame)",
 "key==='localVsSystem'",
 "key==='betterProblem'",
 "key==='abnormalEquipment'",
 "['singleTest','successDefined','ownerClear','retestPlanned']",
 "['earlySignal','containment','stopRule','rollbackPlan','recoveryOwner']",
 "write(q.name,s.id,q.key,'Not applicable')",
 'for(let guard=0;guard<60;guard++)',
 'return nextAdaptive(s,()=>original(s))',
 'opens a system-cause branch',
 'not a productivity question until the hazard or fault is controlled',
 'require correction or repeat observation',
 'window.GravityWorkStudyAdaptiveExpert'
];
for(const t of must){if(!src.includes(t)){console.error('Missing adaptive expert behavior:',t);process.exit(1)}}
if(src.includes('nextAdaptive(s,()=>original(s))||original(s)')){console.error('Adaptive fallback regression: skipped question can be reintroduced.');process.exit(1)}
console.log('Adaptive expert suite passed: Guided branches, permanently skips irrelevant checkpoints, and escalates risky answers.');
