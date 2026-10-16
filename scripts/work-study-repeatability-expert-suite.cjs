'use strict';
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-repeatability-expert-v14.js');const src=fs.readFileSync(file,'utf8');
const store={};const localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>{store[k]=String(v)}};
const document={getElementById:()=>null,querySelectorAll:()=>[],addEventListener:()=>{},documentElement:{},head:{appendChild:()=>{}},createElement:()=>({dataset:{},style:{},appendChild:()=>{}})};class MutationObserver{constructor(){}observe(){}};const window={};
vm.runInNewContext(src,{localStorage,document,MutationObserver,window,alert:()=>{},console});const r=window.GravityWorkStudyRepeatabilityExpert;if(!r)throw new Error('Repeatability expert did not initialize');
function put(id,a){const all=JSON.parse(localStorage.getItem('gravityWorkStudyRepeatabilityV14')||'{}');all[id]={studyId:id,answers:a};localStorage.setItem('gravityWorkStudyRepeatabilityV14',JSON.stringify(all));}
const yes={repeatShift:'Yes',repeatPeople:'Yes',repeatDemand:'Yes',repeatMix:'Yes',repeatEquipment:'Yes',repeatQuality:'Yes',repeatSafety:'Yes',repeatRework:'Yes'};
const cases=[
 ['ready',yes,false,'Operational Standard'],
 ['oneShift',{...yes,repeatShift:'No'},true,'Tested Finding'],
 ['onePerson',{...yes,repeatPeople:'No'},true,'Tested Finding'],
 ['peakMissing',{...yes,repeatDemand:'No'},true,'Tested Finding'],
 ['mixMissing',{...yes,repeatMix:'Unknown'},true,'Verified Knowledge'],
 ['qualityFail',{...yes,repeatQuality:'No'},true,'Tested Finding'],
 ['safetyFail',{...yes,repeatSafety:'No'},true,'Tested Finding'],
 ['reworkFail',{...yes,repeatRework:'No'},true,'Tested Finding'],
 ['naPeople',{...yes,repeatPeople:'Not applicable'},false,'Operational Standard']
];
const f=[];for(const [id,a,b,s] of cases){put(id,a);const x=r.assess(id);if(x.blockStandard!==b)f.push(`${id}: block ${x.blockStandard}`);if(x.stage!==s)f.push(`${id}: stage ${x.stage}`)}
if(!src.includes('Gravity Repeatability Check')||!src.includes('durable restaurant standard'))f.push('missing repeatability concepts');if(f.length){console.error(f.join('\n'));process.exit(1)}console.log(`Work Study repeatability expert suite passed ${cases.length} standardization cases.`);
