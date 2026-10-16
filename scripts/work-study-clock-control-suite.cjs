'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-clock-control-v32.js','utf8');
const must=[
 'Gravity Clock Control',
 'I hold it',
 'Gravity holds it',
 'Hybrid',
 'switch clock',
 'arrived',
 'complete',
 'heading',
 'I didn\'t understand that. Please say it again.',
 'if(s.timer?.running)stopCurrent();cycleOwner()',
 'window.GravityWorkStudyClockControl'
];
for(const t of must){if(!src.includes(t)){console.error('Missing clock control behavior:',t);process.exit(1)}}
if(!/walkStop/.test(src)||!/walkStart/.test(src)||!/search/.test(src)||!/wait/.test(src)||!/rework/.test(src)){console.error('Natural-language timing categories incomplete');process.exit(1)}
console.log('Clock control suite passed: ownership switching, natural phrases, repeat-on-unclear, and stop-before-switch safeguards are present.');
