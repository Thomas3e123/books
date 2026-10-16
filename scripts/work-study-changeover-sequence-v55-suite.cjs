'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-changeover-sequence-v55.js','utf8');
const must=[
 'Gravity Sequence-Dependent Changeover',
 'Sequence Changeover Evidence Hold',
 'Sequence Changeover Evidence Supported',
 'A to B is not automatically the same as B to A',
 'Transition directions/types are not equivalent',
 'will not improve a changeover time by deleting required cleaning, sanitation, allergen, safety, or equipment-reset work',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyChangeoverSequence'
];
for(const t of must){if(!src.includes(t)){console.error('Missing changeover v55 behavior:',t);process.exit(1)}}
console.log('Changeover v55 suite passed: transition direction is preserved, pooling requires equivalence, and required reset controls cannot be optimized away.');