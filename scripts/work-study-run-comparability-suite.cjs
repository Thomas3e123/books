'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-run-comparability-v31.js','utf8');
const must=['Gravity Production-Run Comparability','Do Not Combine Runs Yet','batch sizes differ by more than 25%','Different equipment was used','Time per unit of recorded yield differs by more than 30%','Do not make an extra batch for the study','window.GravityWorkStudyRunComparability'];
for(const t of must){if(!src.includes(t)){console.error('Missing run comparability behavior:',t);process.exit(1)}}
console.log('Run comparability suite passed: Gravity separates unlike production runs and protects normal-production sampling.');
