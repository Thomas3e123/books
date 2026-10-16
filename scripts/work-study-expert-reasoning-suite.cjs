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
const cases=[
 ['bottleneck','b1',{constraintLoaded:'No',constraintStarved:'Yes',constraintBlocked:'No',alternativeRuled:'No'},true,'Possible Cause'],
 ['bottleneck','b2',{constraintLoaded:'Yes',constraintStarved:'No',constraintBlocked:'No',alternativeRuled:'Yes'},false,'Tested Finding'],
 ['motion','m1',{motionRepeated:'Yes',temporaryCause:'Yes',qualityTradeoff:'No',alternativeRuled:'No'},true,'Possible Cause'],
 ['motion','m2',{motionRepeated:'Yes',temporaryCause:'No',qualityTradeoff:'No',alternativeRuled:'Yes'},false,'Tested Finding'],
 ['dish','d1',{machineStarved:'Yes',downstreamBlocked:'No',arrivalBurstOnly:'No',alternativeRuled:'No'},true,'Tested Finding'],
 ['sampling','s1',{representativeWindow:'No',randomEnough:'No',categoryStable:'No',alternativeRuled:'No'},true,'Raw Evidence'],
 ['sampling','s2',{representativeWindow:'Yes',randomEnough:'Yes',categoryStable:'Yes',alternativeRuled:'Yes'},false,'Tested Finding'],
 ['cycle','c1',{repeatComparable:'Yes',outlierDominated:'Yes',patternRepeated:'No',alternativeRuled:'No'},true,'Raw Evidence'],
 ['cycle','c2',{repeatComparable:'Yes',outlierDominated:'No',patternRepeated:'Yes',alternativeRuled:'Yes'},false,'Tested Finding'],
 ['prep','p1',{yieldMet:'No',batchRepresentative:'Yes',interruptionsRepeated:'No',alternativeRuled:'No'},true,'Tested Finding'],
 ['service','sv1',{waitpointRepeated:'Yes',handoffRepeated:'Yes',mixComparable:'No',alternativeRuled:'No'},true,'Raw Evidence'],
 ['setup','st1',{lateStepRepeated:'Yes',externalTiming:'Yes',ownershipClear:'Yes',alternativeRuled:'No'},true,'Tested Finding'],
 ['flow','f1',{queueRepeated:'Yes',burstOnly:'Yes',sharedConstraint:'No',alternativeRuled:'No'},true,'Pattern'],
 ['beforeafter','ba1',{causeTied:'No',alternativeChange:'Yes',effectRepeated:'Yes',alternativeRuled:'No'},true,'Possible Cause'],
 ['beforeafter','ba2',{causeTied:'Yes',alternativeChange:'No',effectRepeated:'Yes',alternativeRuled:'Yes'},false,'Tested Finding'],
 ['custom','x1',{patternRepeated:'Yes',causeTested:'Yes',conflictFound:'Yes',alternativeRuled:'No'},true,'Possible Cause'],
 ['custom','x2',{patternRepeated:'Yes',causeTested:'Yes',conflictFound:'No',alternativeRuled:'Yes'},false,'Tested Finding']
];
const failures=[];
for(const [method,id,answers,block,stage] of cases){put(id,answers);const a=r.assess(method,id,{total:600});if(a.blockVerified!==block)failures.push(`${id}: expected blockVerified ${block}, got ${a.blockVerified}`);if(a.stage!==stage)failures.push(`${id}: expected stage ${stage}, got ${a.stage}`);if(!a.finding)failures.push(`${id}: missing method-specific finding`)}
// Maturity chain: verified numerical result must still stop at Verified Knowledge unless an operational standard is explicitly established.
const sid='mat1';put(sid,{causeTied:'Yes',alternativeChange:'No',effectRepeated:'Yes',alternativeRuled:'Yes'});localStorage.setItem('gravityWorkStudyV2',JSON.stringify({id:sid,method:'beforeafter',observations:[{seconds:120},{seconds:120},{seconds:120}],gravityReview:{outcome:'Verified Improvement'},sop:{status:'Management Approved Draft'}}));if(r.maturity(JSON.parse(localStorage.getItem('gravityWorkStudyV2')))!=='Verified Knowledge')failures.push('Maturity chain promoted beyond Verified Knowledge without an Operational Standard status.');
for(const token of ['Raw Evidence','Pattern','Possible Cause','Tested Finding','Verified Knowledge','Operational Standard','false bottleneck','Gravity Expert Reasoning Check']){if(!src.includes(token))failures.push(`Reasoning layer missing concept: ${token}`)}
if(failures.length){console.error('Work Study expert reasoning suite FAILED');failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`Work Study expert reasoning suite passed ${cases.length} method-specific reasoning cases plus knowledge-maturity safeguards.`);
