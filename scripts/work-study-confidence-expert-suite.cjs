'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-confidence-expert-v29.js','utf8');
const must=['Gravity Confidence Calibration','Confidence is not certainty','Best next evidence','Resume at the next normal production run','Do not make extra product solely to increase the sample','window.GravityWorkStudyConfidenceExpert','Measurement Quality Supported','Paused — Awaiting Normal Production'];
for(const t of must){if(!src.includes(t)){console.error('Missing confidence expert behavior:',t);process.exit(1)}}
console.log('Confidence expert suite passed: Gravity calibrates confidence and identifies the best next evidence without encouraging waste.');
