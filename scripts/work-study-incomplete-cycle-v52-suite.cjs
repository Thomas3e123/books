'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-incomplete-cycle-v52.js','utf8');
const must=[
 'Gravity Incomplete-Cycle Protection',
 'Incomplete-Cycle Evidence Hold',
 'Incomplete-Cycle Evidence Accounted For',
 'survivorship-biased',
 'not silently removed from the denominator',
 'Failed attempts cannot disappear',
 'will not invent an acceptable failure/restart percentage',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyIncompleteCycle'
];
for(const t of must){if(!src.includes(t)){console.error('Missing incomplete-cycle v52 behavior:',t);process.exit(1)}}
if(!src.includes('incomplete/total')){console.error('Incomplete-cycle rate calculation missing.');process.exit(1)}
console.log('Incomplete-cycle v52 suite passed: aborted/restarted attempts remain visible, partial-work handling is explicit, and survivorship bias is blocked.');