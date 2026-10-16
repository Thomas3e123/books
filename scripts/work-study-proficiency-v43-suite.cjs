'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-proficiency-v43.js','utf8');
const must=[
 'Gravity Proficiency Representativeness',
 'Proficiency Context Supported',
 'Proficiency Hold — Training Not Established',
 'Proficiency Representativeness Incomplete',
 'normally trained role',
 'one highly experienced person',
 'someone still learning the method',
 'Repeated runs appear to come from one person only',
 'not trained on the current method',
 'does not create employee performance ratings from a Work Study',
 "if(s.mode!=='guided'||s.timer?.running)return",
 'window.GravityWorkStudyProficiency'
];
for(const t of must){if(!src.includes(t)){console.error('Missing proficiency behavior:',t);process.exit(1)}}
console.log('Proficiency suite passed: training status, expert/learning bias, scope control, anti-blame framing, and safe Guided teaching are present.');