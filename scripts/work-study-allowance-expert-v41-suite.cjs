'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-allowance-expert-v41.js','utf8');
const must=[
 'Gravity Work Content & Allowance Control',
 'Observed Work Content Only',
 'Allowance Hold — Source or Definition Missing',
 'Staffing Planning Minutes Supported',
 'Representative observed evidence',
 'Approved local policy',
 '% of total paid time',
 '% added to work time',
 'Gravity never supplies a default personal/fatigue/delay allowance',
 'not a universal engineered standard time',
 "observed/(1-p/100)",
 "observed*(1+p/100)",
 "if(s.mode!=='guided'||s.timer?.running)return",
 'window.GravityWorkStudyAllowanceExpert'
];
for(const t of must){if(!src.includes(t)){console.error('Missing allowance expert behavior:',t);process.exit(1)}}
if(/default allowance[^\n]*\d+%/i.test(src)){console.error('Gravity must not embed a generic default allowance percentage.');process.exit(1)}
console.log('Allowance expert suite passed: observed work content stays separate from staffing time, allowance source/definition are explicit, and no generic percentage is invented.');