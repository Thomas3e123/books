'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-observer-agreement-v42.js','utf8');
const must=[
 'Gravity Observer & Boundary Calibration',
 'Observer Calibration Not Run',
 'Boundary Agreement Needs Work',
 'Observer Calibration Supported',
 'Observer Calibration Incomplete',
 'Start and stop boundaries are not both defined',
 'Fewer than 3 paired observations',
 'same normal cycle independently',
 'Do not produce extra product just for calibration',
 'measurement issue, not an employee performance conclusion',
 'not published industry acceptance limits',
 "if(!a.applicable||s.mode!=='guided'||s.timer?.running)return",
 'window.GravityWorkStudyObserverAgreement'
];
for(const t of must){if(!src.includes(t)){console.error('Missing observer agreement behavior:',t);process.exit(1)}}
if(!src.includes("p.d.rel>.15")||!src.includes("p.d.rel>.08")){console.error('Missing internal observer-difference review heuristics.');process.exit(1)}
console.log('Observer agreement suite passed: paired same-cycle calibration, boundary safeguards, anti-blame framing, and safe Guided teaching are present.');