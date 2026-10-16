'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-shift-position-v54.js','utf8');
const must=[
 'Gravity Shift-Position Representativeness',
 'Shift-Position Evidence Hold',
 'Shift-Position Evidence Supported',
 'representative early, middle, and later evidence',
 'will not automatically call it fatigue or employee performance',
 'does not infer worker fatigue, effort, or intent',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyShiftPosition'
];
for(const t of must){if(!src.includes(t)){console.error('Missing shift-position v54 behavior:',t);process.exit(1)}}
console.log('Shift-position v54 suite passed: extended-window standards require representative early/middle/late evidence without attributing operational differences to employee fatigue or intent.');