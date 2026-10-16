'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-production-pause-v28.js','utf8');
const must=[
 "Paused — Awaiting Normal Production",
 'normal production drives observation timing',
 'Never create avoidable food waste solely to complete a work-study sample',
 'batchSize',
 'yield',
 'equipment',
 'conditions',
 'lastObservationCount',
 'runCount',
 'Resume for today’s normal production',
 'window.GravityWorkStudyProductionPause'
];
for(const t of must){if(!src.includes(t)){console.error('Missing production pause behavior:',t);process.exit(1)}}
if(!src.includes("r.lastObservationCount=(s.observations||[]).length")){console.error('Production run boundary not preserved');process.exit(1)}
if(!src.includes("s.status='In Progress'")){console.error('Resume status missing');process.exit(1)}
console.log('Production pause suite passed: normal-production pause/resume, run boundaries, waste safeguard, and run context are present.');
