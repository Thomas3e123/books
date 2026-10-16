'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-synthesis-v24.js','utf8');
const must=[
 'Gravity Expert Synthesis',
 'What do all of the expert checks mean together?',
 'Study integrity',
 'Measurement quality',
 'Problem definition',
 'Action design',
 'Failure & recovery',
 'Hold — Resolve Before Standardizing',
 'Proceed With Caution',
 'Expert Path Clear',
 'controlled result label or repeatability requirement'
];
for(const token of must){if(!src.includes(token)){console.error('Missing synthesis safeguard:',token);process.exit(1)}}
function verdict(checks){const blocked=checks.filter(c=>c.block),cautions=checks.filter(c=>!c.block&&/caution|provisional|promising|not yet/i.test(c.status||''));if(!checks.length)return'Expert Review Incomplete';if(blocked.length)return'Hold — Resolve Before Standardizing';if(cautions.length)return'Proceed With Caution';return'Expert Path Clear'}
const cases=[
 ['nothing complete',[],'Expert Review Incomplete'],
 ['integrity hold',[{block:true,status:'Integrity Hold — Inconclusive'}],'Hold — Resolve Before Standardizing'],
 ['measurement caution',[{block:false,status:'Measurement Caution'}],'Proceed With Caution'],
 ['all clear',[{block:false,status:'Integrity Supported'},{block:false,status:'Measurement Quality Supported'},{block:false,status:'Problem Definition Supported'}],'Expert Path Clear']
];
for(const [name,c,want] of cases){const got=verdict(c);if(got!==want){console.error(`${name}: expected ${want}, got ${got}`);process.exit(1)}}
console.log(`Work Study synthesis suite passed: ${cases.length} orchestration cases.`);
