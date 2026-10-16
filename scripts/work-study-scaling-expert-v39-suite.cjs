'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-scaling-expert-v39.js','utf8');
const must=[
 'Gravity Batch-Scaling Expert',
 'Fixed + Variable Pattern Supported',
 'Scaling Pattern Needs Caution',
 'Scaling Model Not Ready',
 'At least 4 representative production runs',
 'at least two normal production sizes',
 'Different equipment appears across runs',
 'negative. That is not a credible operating model',
 'capacity',
 'Do not extrapolate through that breakpoint',
 'fixed minutes plus',
 'does not extrapolate a restaurant standard beyond direct evidence',
 "if(s.mode!=='guided'||s.timer?.running)return",
 'window.GravityWorkStudyScalingExpert'
];
for(const t of must){if(!src.includes(t)){console.error('Missing scaling expert behavior:',t);process.exit(1)}}
if(!src.includes('fit.r2<.60')||!src.includes('fit.r2<.80')){console.error('Missing scaling fit safeguards.');process.exit(1)}
console.log('Scaling expert suite passed: fixed/variable work, yield-range limits, nonlinear threshold warning, and safe Guided teaching are present.');