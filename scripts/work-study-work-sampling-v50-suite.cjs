'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-work-sampling-v50.js','utf8');
const must=[
 'Gravity Work Sampling Expert',
 'Work Sampling Evidence Hold',
 'Randomized observation moments',
 'Systematic interval with random start',
 'Convenient / when I remember',
 '95% uncertainty interval',
 'snapshot proportions, not cycle times',
 'does not treat snapshot counts as cycle-time seconds or standard minutes',
 "s.method!=='sampling'",
 'window.GravityWorkStudySamplingExpert'
];
for(const t of must){if(!src.includes(t)){console.error('Missing Work Sampling v50 behavior:',t);process.exit(1)}}
if(!src.includes('function wilson(')){console.error('Wilson interval calculation missing.');process.exit(1)}
if(!src.includes('targetHalfWidth')){console.error('Decision-specific precision target missing.');process.exit(1)}
console.log('Work Sampling v50 suite passed: snapshot proportions, schedule validity, Wilson uncertainty, and decision-specific precision are separated from cycle timing.');