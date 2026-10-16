(()=>{'use strict';
const STUDY='gravityWorkStudyV2';
function state(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function load(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return{}}}
const stores={escalation:'gravityWorkStudyEscalationV25',diagnostic:'gravityWorkStudyDiagnosticV22',integrity:'gravityWorkStudyIntegrityV19',action:'gravityWorkStudyActionV21',failure:'gravityWorkStudyFailureV23'};
function ans(name,id){return load(stores[name])[id]?.answers||{}}
function yes(v){return v==='Yes'} function no(v){return v==='No'} function unk(v){return !v||v==='Unknown'}
function shouldAsk(name,key,s){const a=ans(name,s.id);
 if(name==='escalation'){
  if(key==='specialistNeeded'&&(yes(a.immediateSafety)||yes(a.foodSafety)||yes(a.equipmentFault)))return true;
  return true;
 }
 if(name==='diagnostic'){
  if(key==='trainingVerified'&&!yes(a.personBlame))return false;
  if(key==='upstreamEffect'&&no(a.materialsReady)&&!unk(a.materialsReady))return true;
  if(key==='downstreamEffect'&&no(a.materialsReady)&&!unk(a.materialsReady))return true;
  if(key==='localVsSystem'&&!(yes(a.upstreamEffect)||yes(a.downstreamEffect)||yes(a.policyEffect)||yes(a.personBlame)))return false;
  if(key==='betterProblem'&&!(yes(a.upstreamEffect)||yes(a.downstreamEffect)||yes(a.policyEffect)||no(a.problemMatchesEvidence)))return false;
  return true;
 }
 if(name==='integrity'){
  if(key==='abnormalEquipment'&&ans('escalation',s.id).equipmentFault==='Yes')return false;
  if(key==='trainingContextKnown'&&ans('diagnostic',s.id).trainingVerified)return false;
  return true;
 }
 if(name==='action'){
  if(key==='singleTest'&&a.causeLinked==='No')return false;
  if(key==='successDefined'&&a.causeLinked==='No')return false;
  if(key==='ownerClear'&&a.causeLinked==='No')return false;
  if(key==='retestPlanned'&&a.causeLinked==='No')return false;
  return true;
 }
 if(name==='failure'){
  if(key==='earlySignal'&&a.likelyFailure==='No')return false;
  if(key==='containment'&&a.likelyFailure==='No')return false;
  if(key==='stopRule'&&a.likelyFailure==='No')return false;
  if(key==='rollbackPlan'&&a.likelyFailure==='No')return false;
  if(key==='recoveryOwner'&&a.likelyFailure==='No')return false;
  return true;
 }
 return true;
}
function followUp(name,key,value,s){
 if(name==='escalation'&&['immediateSafety','foodSafety','equipmentFault'].includes(key)&&value==='Yes')return 'This is not a productivity question until the hazard or fault is controlled. Gravity will keep the study on hold and direct you to the proper safety or specialist path.';
 if(name==='diagnostic'&&key==='personBlame'&&value==='Yes')return 'Before judging the person, Gravity will verify training, materials, equipment, upstream/downstream flow, and policy effects.';
 if(name==='diagnostic'&&['upstreamEffect','downstreamEffect','policyEffect'].includes(key)&&value==='Yes')return 'That answer opens a system-cause branch. Gravity will trace that path before accepting a local-station explanation.';
 if(name==='integrity'&&['observerInterfered','boundaryChanged','conditionsChanged','mixedWork'].includes(key)&&value==='Yes')return 'That answer weakens the current evidence. Gravity will require correction or repeat observation before accepting a strong conclusion.';
 if(name==='action'&&key==='causeLinked'&&value==='No')return 'Gravity will stop action-design questioning here. Redesign the proposed change so it tests the supported cause first.';
 if(name==='failure'&&key==='likelyFailure'&&value==='No')return 'Gravity will not force a detailed recovery checklist for a failure mode that has not been identified. It will require the likely failure mode to be defined first.';
 return '';
}
function nextAdaptive(s,base){if(!base)return null;const q=base();if(!q)return null;const {name,key}=q;if(shouldAsk(name,key,s))return q;
 const mod=q.m,a=ans(name,s.id);const idx=mod.qs.findIndex(([k])=>k===key);for(let i=idx+1;i<mod.qs.length;i++){const [k,text]=mod.qs[i];if(!a[k]&&shouldAsk(name,k,s))return{name,m:mod,key:k,q:text}}
 return null;
}
function install(){const w=window.GravityWorkStudyGuidedExpertInterview;if(!w||w.__adaptive)return false;const original=w.nextQuestion.bind(w);w.nextQuestion=function(s){return nextAdaptive(s,()=>original(s))||original(s)};w.__adaptive=true;w.shouldAsk=shouldAsk;w.followUp=followUp;return true}
function decorate(){const s=state(),box=document.querySelector('[data-ws26]');if(!s||!box)return;box.querySelectorAll('[data-ws26-choice]').forEach(b=>{if(b.dataset.ws27)return;b.dataset.ws27='1';b.addEventListener('click',()=>{const w=window.GravityWorkStudyGuidedExpertInterview;const item=w?.nextQuestion?.(s);if(!item)return;const msg=followUp(item.name,item.key,b.dataset.ws26Choice,s);if(msg)setTimeout(()=>window.GravityWorkStudyGuidedVoice?.speak?.(msg,true),120)},true)})}
const mo=new MutationObserver(()=>{install();decorate()});mo.observe(document.documentElement,{subtree:true,childList:true});install();decorate();
window.GravityWorkStudyAdaptiveExpert={shouldAsk,followUp,nextAdaptive};
})();
