'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-diagnostic-expert-v22.js');
const src=fs.readFileSync(file,'utf8');
const required=[
 ['title','Gravity Diagnostic Expert'],
 ['person blame','personBlame'],
 ['training','trainingVerified'],
 ['materials','materialsReady'],
 ['equipment','equipmentNormal'],
 ['upstream','upstreamEffect'],
 ['downstream','downstreamEffect'],
 ['policy','policyEffect'],
 ['failure mode','failureMode'],
 ['system outcome','localVsSystem'],
 ['problem evidence fit','problemMatchesEvidence'],
 ['reframe','betterProblem'],
 ['nearest person safeguard','blaming the nearest person or station'],
 ['system cause status','Reframe / Investigate System Cause'],
 ['problem supported status','Problem Definition Supported']
];
for(const [name,text] of required)if(!src.includes(text))throw new Error(`Missing diagnostic expert safeguard: ${name}`);
const cases=[
 {name:'person blame without training',a:{personBlame:'Yes',trainingVerified:'No',materialsReady:'Yes',equipmentNormal:'Yes',upstreamEffect:'No',downstreamEffect:'No',policyEffect:'No',failureMode:'Yes',localVsSystem:'Yes',problemMatchesEvidence:'Yes',betterProblem:'No'},want:'blaming a person'},
 {name:'missing inputs mimic slowness',a:{personBlame:'Yes',trainingVerified:'Yes',materialsReady:'No',equipmentNormal:'Yes',upstreamEffect:'No',downstreamEffect:'No',policyEffect:'No',failureMode:'Yes',localVsSystem:'Yes',problemMatchesEvidence:'Yes',betterProblem:'Yes'},want:'Missing or late inputs'},
 {name:'equipment confounder',a:{personBlame:'No',trainingVerified:'Yes',materialsReady:'Yes',equipmentNormal:'No',upstreamEffect:'No',downstreamEffect:'No',policyEffect:'No',failureMode:'Yes',localVsSystem:'Yes',problemMatchesEvidence:'Yes',betterProblem:'Yes'},want:'Abnormal equipment'},
 {name:'cross station both directions',a:{personBlame:'No',trainingVerified:'Yes',materialsReady:'Yes',equipmentNormal:'Yes',upstreamEffect:'Yes',downstreamEffect:'Yes',policyEffect:'No',failureMode:'Yes',localVsSystem:'No',problemMatchesEvidence:'Yes',betterProblem:'Yes'},want:'two system constraints'},
 {name:'wrong problem',a:{personBlame:'No',trainingVerified:'Yes',materialsReady:'Yes',equipmentNormal:'Yes',upstreamEffect:'No',downstreamEffect:'No',policyEffect:'Yes',failureMode:'Yes',localVsSystem:'Yes',problemMatchesEvidence:'No',betterProblem:'Yes'},want:'evidence no longer cleanly answers'},
 {name:'sound problem',a:{personBlame:'No',trainingVerified:'Yes',materialsReady:'Yes',equipmentNormal:'Yes',upstreamEffect:'No',downstreamEffect:'No',policyEffect:'No',failureMode:'Yes',localVsSystem:'Yes',problemMatchesEvidence:'Yes',betterProblem:'No'},want:'Problem Definition Supported'}
];
function assess(a){const yes=k=>a[k]==='Yes',no=k=>a[k]==='No',unk=k=>!a[k]||a[k]==='Unknown',issues=[];if(yes('personBlame')&&(no('trainingVerified')||unk('trainingVerified')))issues.push('The study risks blaming a person before confirming training and method readiness.');if(yes('personBlame')&&(no('materialsReady')||no('equipmentNormal')||yes('upstreamEffect')||yes('downstreamEffect')||yes('policyEffect')))issues.push('System conditions are still plausible causes, so an employee-performance conclusion is not supported.');if(no('materialsReady'))issues.push('Missing or late inputs can create apparent labor slowness.');if(no('equipmentNormal'))issues.push('Abnormal equipment condition contaminates a normal-method performance conclusion.');if(yes('upstreamEffect')&&yes('downstreamEffect'))issues.push('The observed station may be caught between two system constraints; isolate the direction of causation.');if(no('localVsSystem'))issues.push('A local speed improvement is not yet proven to improve the whole restaurant process.');if(no('problemMatchesEvidence'))issues.push('The evidence no longer cleanly answers the original problem statement.');const allQ=['personBlame','trainingVerified','materialsReady','equipmentNormal','upstreamEffect','downstreamEffect','policyEffect','failureMode','localVsSystem','problemMatchesEvidence','betterProblem'];const unanswered=allQ.filter(k=>!a[k]);const status=!unanswered.length?(issues.length?'Reframe / Investigate System Cause':'Problem Definition Supported'):'Diagnostic Check Incomplete';return status+' '+issues.join(' ')}
for(const c of cases){const got=assess(c.a);if(!got.includes(c.want))throw new Error(`${c.name}: expected ${c.want}; got ${got}`)}
console.log(`Work Study diagnostic expert suite passed ${cases.length} problem-framing, human-factor, cross-station, and system-cause cases.`);
