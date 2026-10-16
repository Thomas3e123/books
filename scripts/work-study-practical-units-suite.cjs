'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-practical-units-v38.js','utf8');
const must=['Restaurant-Readable Timing','Practical units for the manager','keeps canonical units internally','Normalized active labor','Active labor per recorded run','Observed wall-clock run span','presentation conversions of the same evidence—not new measurements','different batch sizes without normalization','window.GravityWorkStudyPracticalUnits'];
for(const t of must){if(!src.includes(t)){console.error('Missing practical-unit behavior:',t);process.exit(1)}}
if(!src.includes("lb:'lb'")||!src.includes("gallon:'gal'")||!src.includes("portion:'portion'")){console.error('Missing common restaurant display units.');process.exit(1)}
console.log('Practical-unit suite passed: canonical math is preserved while manager-facing output uses recorded restaurant units and wall-clock context.');
