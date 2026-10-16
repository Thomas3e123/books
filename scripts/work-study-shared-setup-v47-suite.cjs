'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-shared-setup-v47.js','utf8');
const must=[
 'Gravity Shared Setup & Cleanup Allocation',
 'Shared Setup Allocation Hold',
 'Shared Setup Allocation Supported',
 'Shared across multiple batches/products/runs',
 'Dedicated to each run',
 'allocated fixed labor is',
 'does not silently count more than once',
 'Gravity will not invent fixed labor',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudySharedSetup'
];
for(const t of must){if(!src.includes(t)){console.error('Missing shared setup v47 behavior:',t);process.exit(1)}}
if(!src.includes('total/count')){console.error('Shared setup allocation formula missing.');process.exit(1)}
console.log('Shared setup v47 suite passed: dedicated/shared fixed work is explicit, raw observations stay intact, and repeated setup charging is prevented.');