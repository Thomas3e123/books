(()=>{'use strict';
const STUDY='gravityWorkStudyV2';
function state(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function load(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return{}}}
const stores={escalation:'gravityWorkStudyEscalationV25',diagnostic:'gravityWorkStudyDiagnosticV22',integrity:'gravityWorkStudyIntegrityV19',action:'gravityWorkStudyActionV21',failure:'gravityWorkStudyFailureV23'};
function ans(name,id){return load(stores[name])[id]?.answers||{}}
function write(name,id,key,value){const store=stores[name];if(!store)return;const x=load(store);x[id]=x[id]||{version:1,studyId:id,answers:{},createdAt:new Date().toISOString()};x[id].answers=x[id].answers||{};x[id].answers[key]=value;x[id].updatedAt=new Date().toISOString();localStorage.setItem(store,JSON.stringify(x))}
function yes(v){return v==='Yes'} function no(v){return v==='No'} function unk(v){return !v||v==='Unknown'}
function shouldAsk(name,key,s){const a=ans(name,s.id);
 if(name==='escalation')return true;
 if(name==='diagnostic'){
  if(key==='trainingVerified'&&!yes(a.personBlame))return false;
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
  if(['singleTest','successDefined','ownerClear','retestPlanned'].includes(key)&&a.causeLinked==='No')return false;
  return true;
 }
 if(name==='failure'){
  if(['earlySignal','containment','stopRule','rollbackPlan','recoveryOwner'].includes(key)&&a.likelyFailure==='No')return false;
  return true;
 }
 return true;
}
function followUp(name,key,value,s){
 if(name==='escalation'&&['immediateSafety','foodSafety','equipmentFault'].includes(key)&&value==='Yes')return 'This is not a productivity question until the hazard or fault is controlled. Gravity will keep the study on hold and direct you to the proper safety or specialist path.';
 if(name==='diagnostic'&&key==='personBlame'&&value==='Yes')return 'Before judging the person, Gravity will verify training, materials, equipment, upstream and downstream flow, and policy effects.';
 if(name==='diagnostic'&&['upstreamEffect','downstreamEffect','policyEffect'].includes(key)&&value==='Yes')return 'That answer opens a system-cause branch. Gravity will trace that path before accepting a local-station explanation.';
 if(name==='integrity'&&['observerInterfered','boundaryChanged','conditionsChanged','mixedWork'].includes(key)&&value==='Yes')return 'That answer weakens the current evidence. Gravity will require correction or repeat observation before accepting a strong conclusion.';
 if(name==='action'&&key==='causeLinked'&&value==='No')return 'Gravity will stop the dependent action-design questions here. Redesign the proposed change so it tests the supported cause first.';
 if(name==='failure'&&key==='likelyFailure'&&value==='No')return 'Gravity will not force detailed recovery questions until the likely failure mode is identified.';
 return '';
}
function nextAdaptive(s,base){if(!base)return null;for(let guard=0;guard<60;guard++){const q=base();if(!q)return null;if(shouldAsk(q.name,q.key,s))return q;write(q.name,s.id,q.key,'Not applicable')}return null}
function install(){const w=window.GravityWorkStudyGuidedExpertInterview;if(!w||w.__adaptive)return false;const original=w.nextQuestion.bind(w);w.nextQuestion=function(s){return nextAdaptive(s,()=>original(s))};w.__adaptive=true;w.shouldAsk=shouldAsk;w.followUp=followUp;return true}
function decorate(){const s=state(),box=document.querySelector('[data-ws26]');if(!s||!box)return;box.querySelectorAll('[data-ws26-choice]').forEach(b=>{if(b.dataset.ws27)return;b.dataset.ws27='1';b.addEventListener('click',()=>{const w=window.GravityWorkStudyGuidedExpertInterview;const item=w?.nextQuestion?.(s);if(!item)return;const msg=followUp(item.name,item.key,b.dataset.ws26Choice,s);if(msg)setTimeout(()=>window.GravityWorkStudyGuidedVoice?.speak?.(msg,true),120)},true)})}
const mo=new MutationObserver(()=>{install();decorate()});mo.observe(document.documentElement,{subtree:true,childList:true});install();decorate();
window.GravityWorkStudyAdaptiveExpert={shouldAsk,followUp,nextAdaptive,write};
})();
