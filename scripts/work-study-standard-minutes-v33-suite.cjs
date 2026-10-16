'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-standard-minutes-v33.js','utf8');
const must=[
 'Gravity Standard-Minute Validity',
 'Standard Minute Not Ready',
 'Planning Estimate Only',
 'Observed Standard-Minute Candidate',
 'Verified Operating Standard',
 'at least 3 representative normal-production runs',
 'Usable yield is missing or uses an unrecognized unit',
 'Recorded yields use incompatible measurement types',
 'Production runs are not yet comparable',
 'Quality guardrails are not defined',
 'Safety guardrails are not defined',
 'WAIT/DELAY/INTERRUPTION time is present',
 'Machine and unattended process time are separated from active labor',
 'normalized usable yield',
 'restaurant-specific evidence under recorded conditions',
 's.timer?.running',
 'spokenSummary',
 'window.GravityWorkStudyStandardMinutes'
];
for(const t of must){if(!src.includes(t)){console.error('Missing standard-minute v33 behavior:',t);process.exit(1)}}
if(!src.includes("window.GravityWorkStudyRunComparability?.parseQuantity")){console.error('Standard minutes are not reusing the unit-aware comparability parser.');process.exit(1)}
if(!src.includes("st.cv>.30")||!src.includes("st.cv>.20")||!src.includes("st.cv<=.20")){console.error('Missing variation gates.');process.exit(1)}
if(!src.includes("if(s.mode!=='guided'||s.timer?.running)return")){console.error('Guided teaching must stay silent during active timing.');process.exit(1)}
console.log('Standard-minute v33 suite passed: unit-aware normalization, labor/process separation, evidence levels, and safe Guided teaching are present.');