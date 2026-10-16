'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-sequence-expert-v11.js'),src=fs.readFileSync(file,'utf8');
const store={};const localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>{store[k]=String(v)}};
const document={getElementById:()=>null,querySelectorAll:()=>[],addEventListener:()=>{},documentElement:{},head:{appendChild:()=>{}},createElement:()=>({dataset:{},style:{},appendChild:()=>{}})};class MutationObserver{constructor(){}observe(){}};const window={};
vm.runInNewContext(src,{localStorage,document,MutationObserver,window,alert:()=>{},console});const r=window.GravityWorkStudySequenceExpert;if(!r)throw Error('Sequence expert did not initialize');
function put(id,a){const all=JSON.parse(localStorage.getItem('gravityWorkStudySequenceV11')||'{}');all[id]={studyId:id,answers:a};localStorage.setItem('gravityWorkStudySequenceV11',JSON.stringify(all));}
const clean={constraintMoved:'No',secondaryExposed:'No',alternatingConstraint:'No',conditionsSegmented:'Yes',downstreamProtected:'Yes',upstreamProtected:'Yes',systemOutcomeKnown:'Yes',systemImproved:'Yes',stabilizedRetest:'Yes'};
const cases=[
 ['clean',clean,false,'Tested Finding'],
 ['localOnly',{...clean,systemOutcomeKnown:'No'},true,'Possible Cause'],
 ['downstream',{...clean,downstreamProtected:'No'},true,'Possible Cause'],
 ['upstream',{...clean,upstreamProtected:'No'},true,'Possible Cause'],
 ['movedGood',{...clean,constraintMoved:'Yes'},false,'Tested Finding'],
 ['movedUnknown',{...clean,constraintMoved:'Yes',systemOutcomeKnown:'No'},true,'Possible Cause'],
 ['secondaryGood',{...clean,secondaryExposed:'Yes'},false,'Tested Finding'],
 ['secondaryUnknown',{...clean,secondaryExposed:'Yes',systemOutcomeKnown:'No'},true,'Possible Cause'],
 ['alternatingBad',{...clean,alternatingConstraint:'Yes',conditionsSegmented:'No'},true,'Possible Cause'],
 ['alternatingGood',{...clean,alternatingConstraint:'Yes',conditionsSegmented:'Yes'},false,'Tested Finding'],
 ['unstable',{...clean,stabilizedRetest:'No'},true,'Possible Cause'],
 ['noSystemGain',{...clean,systemImproved:'No'},true,'Tested Finding'],
 ['unknown',{...clean,systemImproved:'Unknown'},true,'Pattern']
];
const failures=[];for(const [id,a,block,stage] of cases){put(id,a);const x=r.assess(id);if(x.blockVerified!==block)failures.push(`${id}: expected block ${block}, got ${x.blockVerified}`);if(x.stage!==stage)failures.push(`${id}: expected stage ${stage}, got ${x.stage}`);}
put('movedNote',{...clean,constraintMoved:'Yes'});const moved=r.assess('movedNote');if(!moved.recs.some(x=>/next study target/i.test(x)))failures.push('moved constraint did not identify next study target');
for(const token of ['Gravity Constraint Sequence Check','move to another step','end-to-end','local improvement'])if(!src.includes(token))failures.push(`missing sequence concept: ${token}`);
if(failures.length){console.error('Work Study sequence expert suite FAILED');failures.forEach(x=>console.error('- '+x));process.exit(1)}console.log(`Work Study constraint-sequence expert suite passed ${cases.length} sequence/system-effect cases plus moved-constraint guidance.`);
