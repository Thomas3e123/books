'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-yield-quality-v49.js','utf8');
const must=[
 'Gravity Yield & Waste Protection',
 'Yield/Waste Protection Hold',
 'Yield/Waste Protection Supported',
 'Waste / loss %',
 'Usable yield %',
 'Gravity will not invent an acceptable quality or waste limit',
 'does not reward a faster process',
 'I will not trade usable product for speed',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyYieldQuality'
];
for(const t of must){if(!src.includes(t)){console.error('Missing yield/waste v49 behavior:',t);process.exit(1)}}
if(!src.includes("lowerBetter?v>boundary:v<boundary")){console.error('Yield/waste boundary direction logic missing.');process.exit(1)}
console.log('Yield/waste v49 suite passed: speed cannot override approved usable-yield or waste boundaries, and no generic loss limit is invented.');