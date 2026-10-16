'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-expert-reasoning-v7.js');
const src=fs.readFileSync(file,'utf8');
const store={};
const localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
const document={getElementById:()=>null,querySelectorAll:()=>[],addEventListener:()=>{},head:{appendChild:()=>{}},createElement:()=>({style:{},dataset:{},appendChild:()=>{}})};
class MutationObserver{constructor(){} observe(){}}
const window={};
vm.runInNewContext(src,{localStorage,document,MutationObserver,window,setTimeout:()=>0,clearTimeout:()=>{},console});
const r=window.GravityWorkStudyExpertReasoner;if(!r)throw new Error('Expert reasoner did not initialize');
function put(id,answers){const all=JSON.parse(localStorage.getItem('gravityWorkStudyReasoningV7')||'{}');all[id]={version:1,studyId:id,answers};localStorage.setItem('gravityWorkStudyReasoningV7',JSON.stringify(all));}
const tests=[
 ['bottleneck','adv-b1',{constraintLoaded:'Yes',constraintStarved:'Yes',constraintBlocked:'No',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['dish','adv-d1',{machineStarved:'Yes',downstreamBlocked:'Yes',arrivalBurstOnly:'No',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['cycle','adv-c1',{repeatComparable:'No',outlierDominated:'No',patternRepeated:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['sampling','adv-s1',{representativeWindow:'No',randomEnough:'Yes',categoryStable:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['service','adv-sv1',{waitpointRepeated:'Yes',handoffRepeated:'Yes',mixComparable:'No',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['flow','adv-f1',{queueRepeated:'Yes',burstOnly:'Yes',sharedConstraint:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['beforeafter','adv-ba1',{causeTied:'Yes',alternativeChange:'Yes',effectRepeated:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['custom','adv-x1',{patternRepeated:'Yes',causeTested:'Yes',conflictFound:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['motion','adv-m1',{motionRepeated:'No',temporaryCause:'No',qualityTradeoff:'No',alternativeRuled:'Yes'},'Possible Cause',true],
 ['prep','adv-p1',{yieldMet:'Yes',batchRepresentative:'No',interruptionsRepeated:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['setup','adv-st1',{lateStepRepeated:'Yes',externalTiming:'No',ownershipClear:'No',alternativeRuled:'Yes'},'Possible Cause',true],
 ['bottleneck','adv-b2',{constraintLoaded:'Yes',constraintStarved:'No',constraintBlocked:'Yes',alternativeRuled:'Yes'},'Possible Cause',true],
 ['dish','adv-d2',{machineStarved:'No',downstreamBlocked:'No',arrivalBurstOnly:'Yes',alternativeRuled:'Yes'},'Possible Cause',true],
 ['sampling','adv-s2',{representativeWindow:'Yes',randomEnough:'Yes',categoryStable:'Yes',alternativeRuled:'No'},'Pattern',false],
 ['cycle','adv-c2',{repeatComparable:'Yes',outlierDominated:'No',patternRepeated:'No',alternativeRuled:'Yes'},'Possible Cause',true],
 ['service','adv-sv2',{waitpointRepeated:'Yes',handoffRepeated:'No',mixComparable:'Yes',alternativeRuled:'Yes'},'Possible Cause',true],
 ['flow','adv-f2',{queueRepeated:'No',burstOnly:'No',sharedConstraint:'Yes',alternativeRuled:'Yes'},'Raw Evidence',true],
 ['beforeafter','adv-ba2',{causeTied:'No',alternativeChange:'No',effectRepeated:'Yes',alternativeRuled:'Yes'},'Possible Cause',true],
 ['custom','adv-x2',{patternRepeated:'No',causeTested:'Yes',conflictFound:'No',alternativeRuled:'Yes'},'Possible Cause',true],
 ['motion','adv-m2',{motionRepeated:'Yes',temporaryCause:'No',qualityTradeoff:'Yes',alternativeRuled:'Yes'},'Tested Finding',true]
];
const failures=[];
for(const [method,id,answers,stage,block] of tests){put(id,answers);const a=r.assess(method,id,{total:900});if(a.stage!==stage)failures.push(`${id}: expected ${stage}, got ${a.stage}`);if(a.blockVerified!==block)failures.push(`${id}: expected block ${block}, got ${a.blockVerified}`);if(stage==='Raw Evidence'&&!a.conflicts?.length&&['adv-b1','adv-d1','adv-c1','adv-s1','adv-sv1','adv-f1','adv-ba1','adv-x1'].includes(id))failures.push(`${id}: expected explicit conflict explanation`)}
for(const token of ['detectExpertConflicts','Conflicting evidence','Attribution is unresolved','Separate burst capacity from normal capacity']){if(!src.includes(token))failures.push(`Missing adversarial safeguard: ${token}`)}
if(failures.length){console.error('Work Study adversarial suite FAILED');failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`Work Study adversarial suite passed ${tests.length} conflicting, misleading, and insufficient-evidence cases.`);
