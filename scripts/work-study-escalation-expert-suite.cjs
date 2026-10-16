'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-escalation-expert-v25.js','utf8');
const must=[
 'Gravity Scope & Escalation Check',
 'Is this still a work-study problem?',
 'Stop Study — Protect People / Product First',
 'Hold Study — Restore Normal Equipment Condition',
 'Escalate — HR / Management Process',
 'Specialist Input Required',
 'Work Study Scope Clear',
 'data-action="approve-sop"'
];
for(const token of must){if(!src.includes(token)){console.error('Missing escalation safeguard:',token);process.exit(1)}}
function verdict(a){if(a.immediateSafety==='Yes'||a.foodSafety==='Yes')return'Stop Study — Protect People / Product First';if(a.equipmentFault==='Yes')return'Hold Study — Restore Normal Equipment Condition';if(a.hrIssue==='Yes')return'Escalate — HR / Management Process';if(a.specialistNeeded==='Yes')return'Specialist Input Required';if(['immediateSafety','foodSafety','equipmentFault','hrIssue','specialistNeeded'].some(k=>!a[k]||a[k]==='Unknown'))return'Scope Check Incomplete';return'Work Study Scope Clear'}
const no={immediateSafety:'No',foodSafety:'No',equipmentFault:'No',hrIssue:'No',specialistNeeded:'No'};
const cases=[
 ['normal work study',no,'Work Study Scope Clear'],
 ['immediate safety',{...no,immediateSafety:'Yes'},'Stop Study — Protect People / Product First'],
 ['food safety',{...no,foodSafety:'Yes'},'Stop Study — Protect People / Product First'],
 ['equipment fault',{...no,equipmentFault:'Yes'},'Hold Study — Restore Normal Equipment Condition'],
 ['hr issue',{...no,hrIssue:'Yes'},'Escalate — HR / Management Process'],
 ['specialist issue',{...no,specialistNeeded:'Yes'},'Specialist Input Required'],
 ['unknown boundary',{...no,equipmentFault:'Unknown'},'Scope Check Incomplete']
];
for(const [name,a,want] of cases){const got=verdict(a);if(got!==want){console.error(`${name}: expected ${want}, got ${got}`);process.exit(1)}}
console.log(`Work Study escalation expert suite passed: ${cases.length} scope-boundary cases.`);
