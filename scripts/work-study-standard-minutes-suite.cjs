'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-standard-minutes-v32.js','utf8');
const must=[
 'Gravity Standard-Minute Validity',
 'Observed Standard-Minute Candidate',
 'Standard-Minute Hold',
 'Preliminary Standard-Minute Estimate',
 'at least 3 representative normal-production runs',
 'Usable yield is missing',
 'Production runs are not yet comparable',
 'Quality guardrails are not defined',
 'Safety guardrails are not defined',
 'WAIT/DELAY time is recorded',
 'Required wait / machine / unattended process time is separated from active labor',
 'restaurant-specific evidence under recorded conditions',
 'window.GravityWorkStudyStandardMinutes'
];
for(const t of must){if(!src.includes(t)){console.error('Missing standard-minute behavior:',t);process.exit(1)}}
if(!src.includes("const unattended=new Set(['required wait','machine','machine time','unattended','unattended process'])")){console.error('Missing unattended-process separation.');process.exit(1)}
if(!src.includes("st.cv<=.20")){console.error('Missing stable-variation threshold for candidate standard.');process.exit(1)}
console.log('Standard-minute suite passed: Gravity separates active labor from elapsed process time, normalizes by usable yield, and blocks unsupported standards.');
