'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-guided-expert-interview-v26.js','utf8');
const voice=fs.readFileSync('site/assets/js/gravity-work-study-earbud-mode-v18.js','utf8');
const must=[
 'Gravity · ${esc(item.m.label)}',
 'I need one expert checkpoint before we continue.',
 'If you do not know, choose Unknown',
 'gravityWorkStudyEscalationV25',
 'gravityWorkStudyDiagnosticV22',
 'gravityWorkStudyIntegrityV19',
 'gravityWorkStudyActionV21',
 'gravityWorkStudyFailureV23',
 'window.GravityWorkStudyGuidedVoice?.speak',
 'body.ws26-active [data-ws13]{display:none!important}',
 'window.GravityWorkStudyGuidedExpertInterview'
];
for(const token of must){if(!src.includes(token)){console.error('Missing Guided expert interview behavior:',token);process.exit(1)}}
if(!voice.includes("document.querySelector('[data-ws26] .ws26-q')")){console.error('Guided voice does not prioritize the expert checkpoint.');process.exit(1)}
const expected={
 escalation:{store:'gravityWorkStudyEscalationV25',count:5,screens:['problem','people','guardrails']},
 diagnostic:{store:'gravityWorkStudyDiagnosticV22',count:11,screens:['people','method','facts','interpret']},
 integrity:{store:'gravityWorkStudyIntegrityV19',count:10,screens:['facts','interpret']},
 action:{store:'gravityWorkStudyActionV21',count:8,screens:['review']},
 failure:{store:'gravityWorkStudyFailureV23',count:8,screens:['sop']}
};
for(const [name,cfg] of Object.entries(expected)){
 if(!src.includes(`${name}:{store:'${cfg.store}'`)){console.error('Missing module/store mapping:',name);process.exit(1)}
 for(const screen of cfg.screens){if(!src.includes(`'${screen}'`)){console.error(`Missing ${name} screen ${screen}`);process.exit(1)}}
}
const keyPatterns={
 escalation:['immediateSafety','foodSafety','equipmentFault','hrIssue','specialistNeeded'],
 diagnostic:['personBlame','trainingVerified','materialsReady','equipmentNormal','upstreamEffect','downstreamEffect','policyEffect','failureMode','localVsSystem','problemMatchesEvidence','betterProblem'],
 integrity:['observerInterfered','boundaryChanged','conditionsChanged','mixedWork','abnormalEquipment','trainingContextKnown','interruptionsTagged','recordedLive','matchesQuestion','definitionConsistent'],
 action:['causeLinked','singleTest','successDefined','qualityProtected','safetyProtected','stopRule','ownerClear','retestPlanned'],
 failure:['likelyFailure','earlySignal','containment','stopRule','rollbackPlan','recoveryOwner','secondaryRisk','revalidateTrigger']
};
let total=0;
for(const [name,keys] of Object.entries(keyPatterns)){
 const unique=new Set(keys);if(unique.size!==keys.length){console.error('Duplicate key inside module:',name);process.exit(1)}
 if(keys.length!==expected[name].count){console.error(`Unexpected ${name} question count.`);process.exit(1)}
 for(const key of keys){if(!src.includes(`['${key}'`)){console.error(`Missing ${name} checkpoint ${key}`);process.exit(1)}}
 total+=keys.length;
}
if(total!==42){console.error(`Expected 42 Guided expert checkpoints, found ${total}.`);process.exit(1)}
const orderedScreens=['problem','people','method','guardrails','observe','facts','interpret','review','sop'];
for(let i=1;i<orderedScreens.length;i++){if(orderedScreens.indexOf(orderedScreens[i])<=orderedScreens.indexOf(orderedScreens[i-1])){console.error('Screen-order simulation failed.');process.exit(1)}}
console.log(`Guided expert interview simulation passed: ${total} expert checkpoints across escalation, diagnosis, integrity, action, and failure/recovery layers, with voice priority and no duplicate keys inside a layer.`);
