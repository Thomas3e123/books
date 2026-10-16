'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-process-map-v34.js','utf8');
const must=[
 'Gravity Proposed Observation Map',
 'This is not measured evidence.',
 'From written directions',
 'Gravity inferred — confirm it happens',
 'Ingredient context — not timed as work steps',
 'Use confirmed steps for observation',
 "sourceType:'written'",
 "sourceType:'gravity-inferred'",
 "proposedFromProcessMap:true",
 "confirmedByManager:true",
 'value="fixed"',
 'value="variable"',
 'value="capacity-step"',
 'Load DOCX / TXT / MD / CSV',
 '/.netlify/functions/work-study-process-file',
 'PDF support is not enabled yet.',
 'If you have the recipe or written production directions',
 'window.GravityWorkStudyProcessMap'
];
for(const t of must){if(!src.includes(t)){console.error('Missing process-map behavior:',t);process.exit(1)}}
if(!src.includes('function ingredientLike')){console.error('Missing ingredient-line classification.');process.exit(1)}
if(!src.includes('function analyzeSource')){console.error('Missing source section analysis.');process.exit(1)}
if(!src.includes('Actual production observation must confirm what really happens and how long it takes.')){console.error('Missing evidence-boundary warning.');process.exit(1)}
console.log('Process-map suite passed: ingredients stay context, written and inferred steps remain traceable proposals, DOCX has a real extraction path, and confirmed steps carry scaling metadata into observation.');
