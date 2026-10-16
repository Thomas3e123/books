'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-hold-expert-v15.js');
const src=fs.readFileSync(file,'utf8');
const store={};
const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)}};
const document={getElementById:()=>null,documentElement:{},querySelectorAll:()=>[],addEventListener:()=>{},head:{appendChild:()=>{}},createElement:()=>({})};
class MO{observe(){}}
const ctx={window:{},document,localStorage,MutationObserver:MO,console};ctx.window=ctx;
vm.runInNewContext(src,ctx);
const assess=ctx.GravityWorkStudyHoldExpert.assess;
function put(id,a){store.gravityWorkStudyHoldV15=JSON.stringify({[id]:{version:1,studyId:id,answers:a}});return assess(id)}
const base={processChanged:'No',demandChanged:'No',performanceHolding:'Yes',qualityHolding:'Yes',safetyHolding:'Yes',reworkHolding:'Yes',trainingCurrent:'Yes',recentCheck:'Yes'};
const cases=[
 ['holds',base,'Hold Confirmed','HOLD',false],
 ['process changed',{...base,processChanged:'Yes'},'Revalidation Required','VERIFY',true],
 ['demand changed',{...base,demandChanged:'Yes'},'Revalidation Required','VERIFY',true],
 ['performance drift',{...base,performanceHolding:'No'},'Drift Detected','CORRECT',true],
 ['quality drift',{...base,qualityHolding:'No'},'Drift Detected','CORRECT',true],
 ['safety drift',{...base,safetyHolding:'No'},'Drift Detected','CORRECT',true],
 ['rework drift',{...base,reworkHolding:'No'},'Drift Detected','CORRECT',true],
 ['training stale',{...base,trainingCurrent:'No'},'Revalidation Required','VERIFY',true],
 ['check stale',{...base,recentCheck:'No'},'Revalidation Required','VERIFY',true],
 ['unknown',{...base,recentCheck:'Unknown'},'Hold Evidence Incomplete','VERIFY',true]
];
for(const [name,a,status,stage,block] of cases){const r=put('x',a);if(r.status!==status||r.stage!==stage||r.blockHold!==block)throw new Error(`${name}: got ${r.status}/${r.stage}/${r.blockHold}`)}
if(!src.includes('An operational standard is not permanent truth'))throw new Error('Missing hold truth language');
console.log(`Work Study hold expert suite passed ${cases.length} drift/revalidation cases.`);
