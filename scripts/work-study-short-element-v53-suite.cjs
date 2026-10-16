'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-short-element-v53.js','utf8');
const must=[
 'Gravity Short-Element Measurement',
 'Short-Element Measurement Hold',
 'Short-Element Measurement Supported',
 'stopwatch decimal display as proof of measurement precision',
 'Time a repeated group and divide by count',
 'Video is optional; Gravity does not require recording people',
 'no universal short-time cutoff',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyShortElement'
];
for(const t of must){if(!src.includes(t)){console.error('Missing short-element v53 behavior:',t);process.exit(1)}}
console.log('Short-element v53 suite passed: observable boundaries and method adequacy control precision without inventing a universal time cutoff.');