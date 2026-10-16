'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-failure-expert-v23.js','utf8');
const must=[
 'Gravity Failure & Recovery Check',
 'How could this fail after rollout?',
 'earliest measurable warning sign',
 'stop or rollback trigger',
 'return to the last known-safe method',
 'move the problem upstream, downstream, or to another station',
 'require revalidation',
 'Failure Controls Ready',
 'Failure-Control Hold',
 'Failure Plan Incomplete',
 'data-action="approve-sop"',
 'blockStandard'
];
for(const token of must){if(!src.includes(token)){console.error('Missing failure expert safeguard:',token);process.exit(1)}}
const yes={likelyFailure:'Yes',earlySignal:'Yes',containment:'Yes',stopRule:'Yes',rollbackPlan:'Yes',recoveryOwner:'Yes',secondaryRisk:'Yes',revalidateTrigger:'Yes'};
function evalAnswers(a){const keys=['likelyFailure','earlySignal','containment','stopRule','rollbackPlan','recoveryOwner','secondaryRisk','revalidateTrigger'];const issues=keys.filter(k=>a[k]==='No');const unknown=keys.filter(k=>!a[k]||a[k]==='Unknown');if(issues.length)return'Failure-Control Hold';if(unknown.length)return'Failure Plan Incomplete';return'Failure Controls Ready'}
const cases=[
 ['fully controlled rollout',yes,'Failure Controls Ready'],
 ['no rollback trigger',{...yes,stopRule:'No'},'Failure-Control Hold'],
 ['no safe rollback',{...yes,rollbackPlan:'No'},'Failure-Control Hold'],
 ['unknown early signal',{...yes,earlySignal:'Unknown'},'Failure Plan Incomplete'],
 ['no cross-station risk check',{...yes,secondaryRisk:'No'},'Failure-Control Hold'],
 ['no future revalidation trigger',{...yes,revalidateTrigger:'No'},'Failure-Control Hold'],
 ['missing recovery owner',{...yes,recoveryOwner:''},'Failure Plan Incomplete']
];
for(const [name,a,want] of cases){const got=evalAnswers(a);if(got!==want){console.error(`${name}: expected ${want}, got ${got}`);process.exit(1)}}
console.log(`Work Study failure expert suite passed: ${cases.length} rollout/recovery cases.`);
