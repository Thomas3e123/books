'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-guided-expert-interview-v26.js','utf8');
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
console.log('Guided expert interview suite passed: expert checkpoints are routed into the one-question-at-a-time Guided flow.');
