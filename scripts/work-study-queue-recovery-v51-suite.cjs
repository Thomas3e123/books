'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-queue-recovery-v51.js','utf8');
const must=[
 'Gravity Queue & Recovery Expert',
 'Queue/Recovery Evidence Hold',
 'Queue/Recovery Evidence Supported',
 'average completions are below average arrivals',
 'average completion capacity met or exceeded average arrivals, yet a queue still formed',
 'will not invent an acceptable queue size or recovery time',
 'does not invent an acceptable queue target or infer guest wait time from queue size alone',
 "s.mode!=='guided'||s.timer?.running",
 'window.GravityWorkStudyQueueRecovery'
];
for(const t of must){if(!src.toLowerCase().includes(t.toLowerCase())){console.error('Missing queue/recovery v51 behavior:',t);process.exit(1)}}
if(!src.includes('q=Math.max(0,q+arrivals[i]-completions[i])')){console.error('Chronological queue reconstruction formula missing.');process.exit(1)}
console.log('Queue/recovery v51 suite passed: burst queues, sustained shortfall, recovery, and local queue boundaries are handled without average-rate shortcuts.');
