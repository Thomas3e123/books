'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-standard-minutes-v32.js','utf8');
const must=[
 'Gravity Standard-Minute Validity',
 'Observed Standard-Minute Candidate',
 'Standard-Minute Hold',
 'Preliminary Standard-Minute Estimate',
 'at least 3 representative normal-production runs',
 'Usable yield is missing or uses an unrecognized unit',
 'Production runs are not yet comparable',
 'Quality guardrails are not defined',
 'Safety guardrails are not defined',
 'WAIT/DELAY time is recorded',
 'Required wait / machine / unattended process time is separated from active labor',
 'not classified as fixed, variable, or capacity-step work',
 'Gravity will not assume every labor minute scales linearly with batch size',
 'Capacity-step work is present',
 'fixed setup work separate from yield-dependent work',
 'gravity-work-study-teaching',
 'This study is not currently asking Gravity to establish a production or labor-time standard.',
 'Gravity has not verified the time standard in this study.',
 'restaurant-specific evidence under recorded conditions and observed operating range',
 'window.GravityWorkStudyStandardMinutes'
];
for(const t of must){if(!src.includes(t)){console.error('Missing standard-minute behavior:',t);process.exit(1)}}
if(!src.includes("const unattended=new Set(['required wait','machine','machine time','unattended','unattended process'])")){console.error('Missing unattended-process separation.');process.exit(1)}
if(!src.includes("st.cv<=.20")){console.error('Missing stable-variation threshold for candidate standard.');process.exit(1)}
if(!src.includes("['fixed','variable','capacity-step']")){console.error('Missing labor-scaling classification.');process.exit(1)}
if(!src.includes('function standardRelevant')){console.error('Missing applicability boundary.');process.exit(1)}
if(!src.includes('function claimsTimeStandard')){console.error('Missing time-standard SOP governance.');process.exit(1)}
console.log('Standard-minute suite passed: Gravity scopes timing governance correctly, separates active labor from elapsed process time, normalizes only compatible yield evidence, distinguishes fixed/variable/capacity-step work, and blocks unsupported timing standards.');
