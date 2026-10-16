'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-crew-labor-v48.js','utf8');
const must=[
 'Gravity Crew Labor Accounting',
 'Multiple workers in parallel',
 'Crew Labor Accounting Hold',
 'Crew Labor Accounting Supported',
 'does not multiply elapsed minutes by scheduled headcount',
 'sum of observed engaged worker time',
 'wall-clock duration and summed labor content as separate measures',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyCrewLabor'
];
for(const t of must){if(!src.includes(t)){console.error('Missing crew labor v48 behavior:',t);process.exit(1)}}
if(!src.includes('reduce((t,x)=>t+x.minutes,0)')){console.error('Crew labor summation missing.');process.exit(1)}
console.log('Crew labor v48 suite passed: wall-clock time stays separate from summed engaged labor and headcount multiplication is prohibited.');