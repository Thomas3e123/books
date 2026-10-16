(()=>{'use strict';
const STUDY='gravityWorkStudyV2',STORE='gravityWorkStudySequenceV11';
const qs=[
 ['constraintMoved','After the change, did the main queue or limiting point move to another step?'],
 ['secondaryExposed','Did removing the first constraint expose another limiting step that was previously hidden?'],
 ['alternatingConstraint','Does the limiting step change under different demand, product mix, staffing, or operating conditions?'],
 ['conditionsSegmented','If the constraint changes by condition, were those conditions separated and studied independently?'],
 ['downstreamProtected','Did downstream waiting, queue, rework, quality, or workload stay the same or improve?'],
 ['upstreamProtected','Did upstream starvation, queue, replenishment pressure, or workload stay the same or improve?'],
 ['systemOutcomeKnown','Was the end-to-end restaurant outcome measured rather than only a local task or station metric?'],
 ['systemImproved','Did the end-to-end system actually improve under the tested condition?'],
 ['stabilizedRetest','Was the changed process observed again after the new flow had time to stabilize?']
];
function loadStudy(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function all(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function rec(id){const x=all();x[id]=x[id]||{version:1,studyId:id,answers:{},createdAt:new Date().toISOString()};return{x,r:x[id]}}
function save(x){localStorage.setItem(STORE,JSON.stringify(x))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveVisible(s){const {x,r}=rec(s.id);document.querySelectorAll('[data-ws11-answer]').forEach(el=>r.answers[el.dataset.ws11Answer]=el.value||'');r.updatedAt=new Date().toISOString();x[s.id]=r;save(x)}
function assess(id){const {r}=rec(id),a=r.answers||{},yes=k=>a[k]==='Yes',no=k=>a[k]==='No',unknown=k=>!a[k]||a[k]==='Unknown',issues=[],warnings=[],notes=[];
 for(const [k,q] of qs)if(unknown(k))warnings.push(`Unanswered sequence checkpoint: ${q}`);
 if(no('systemOutcomeKnown'))issues.push('The claimed improvement is based on a local metric while the end-to-end restaurant outcome is still unknown.');
 if(no('downstreamProtected'))issues.push('The local change created or may have created downstream deterioration, so Gravity will not call it a system improvement.');
 if(no('upstreamProtected'))issues.push('The local change created or may have created upstream deterioration, starvation, or workload pressure.');
 if(no('stabilizedRetest'))issues.push('The changed process was not retested after the new flow stabilized, so the first post-change result may be transitional.');
 if(yes('alternatingConstraint')&&no('conditionsSegmented'))issues.push('The limiting step changes by operating condition, but those conditions were not separated. One blended conclusion would hide multiple truths.');
 if(yes('constraintMoved')&&no('systemOutcomeKnown'))issues.push('The constraint moved, but the total-system effect was not measured. Gravity cannot tell whether the change improved the restaurant or only relocated the queue.');
 if(yes('secondaryExposed')&&no('systemOutcomeKnown'))issues.push('A second constraint was exposed, but the end-to-end effect of the change is unknown.');
 if(yes('constraintMoved')&&yes('systemOutcomeKnown')&&yes('systemImproved')&&yes('downstreamProtected')&&yes('upstreamProtected'))notes.push('The first constraint appears to have been improved and the limiting point moved. Treat the new limiting step as the next study target rather than evidence that the first improvement failed.');
 if(yes('secondaryExposed')&&yes('systemOutcomeKnown')&&yes('systemImproved'))notes.push('The change improved the overall system and exposed a secondary constraint. The next improvement cycle should study that newly visible limit.');
 if(yes('alternatingConstraint')&&yes('conditionsSegmented'))notes.push('The constraint changes by condition, and the conditions were segmented. Keep condition-specific conclusions instead of forcing one universal bottleneck.');
 let stage='Tested Finding',blockVerified=false,finding='Constraint sequence and end-to-end effects are sufficiently understood for Gravity to consider a stronger system conclusion.';
 if(issues.length){stage='Possible Cause';blockVerified=true;finding='Gravity found a constraint-migration, sequence, or local-optimization risk. A local improvement is not yet proven to be an end-to-end system improvement.'}
 else if(warnings.length){stage='Pattern';blockVerified=true;finding='The sequence evidence is incomplete. Gravity will not verify a system improvement while it is still unknown where the constraint moved or what happened end to end.'}
 else if(no('systemImproved')){stage='Tested Finding';blockVerified=true;finding='The local change did not produce a verified end-to-end system improvement.';issues.push('Do not standardize a local speed gain as an improvement when the full process did not improve.');}
 return{stage,blockVerified,finding,recs:[...issues,...warnings,...notes],answers:a,issues,warnings,notes};
}
function css(){if(document.getElementById('ws11-style'))return;const e=document.createElement('style');e.id='ws11-style';e.textContent='.ws11{border:1px solid rgba(209,153,87,.75);border-radius:16px;padding:16px;margin:0 0 16px;background:linear-gradient(145deg,rgba(14,27,37,.99),rgba(34,43,49,.99));color:#f7f2e8}.ws11 h3{margin:.2rem 0 .5rem;color:#fff}.ws11 p,.ws11 small{color:#cbd6da}.ws11-q{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:12px;align-items:center;padding:9px 0;border-top:1px solid rgba(255,255,255,.1)}.ws11 select{width:100%;min-height:42px;border-radius:9px;border:1px solid #a98761;background:#fbfaf7;color:#17252d;padding:8px}.ws11-find{border-left:4px solid #d19a57;padding:10px 12px;background:rgba(255,255,255,.06);border-radius:8px;margin-top:10px}@media(max-width:700px){.ws11-q{grid-template-columns:1fr}}';document.head.appendChild(e)}
function render(){const s=loadStudy(),root=document.getElementById('ws2-app');if(!s||!root)return;root.querySelectorAll('[data-ws11]').forEach(n=>n.remove());css();const {r}=rec(s.id);
 if(s.screen==='interpret'){const box=document.createElement('section');box.className='ws11';box.dataset.ws11='sequence';box.innerHTML=`<div class="ws5-k">Gravity Constraint Sequence Check</div><h3>Did the improvement solve the system problem—or move it?</h3><p>Gravity follows the constraint through the process so a faster local step is not mistaken for a better restaurant system.</p>${qs.map(([k,q])=>`<div class="ws11-q"><label for="ws11-${esc(k)}">${esc(q)}</label><select id="ws11-${esc(k)}" data-ws11-answer="${esc(k)}"><option value="">Choose</option>${['Yes','No','Unknown'].map(v=>`<option ${r.answers[k]===v?'selected':''}>${v}</option>`).join('')}</select></div>`).join('')}<small>When a change exposes the next constraint, Gravity treats that as the next improvement target—not automatically as failure.</small>`;root.querySelector('main')?.insertAdjacentElement('afterbegin',box)}
 if(['review','sop'].includes(s.screen)){const a=assess(s.id),box=document.createElement('section');box.className='ws11';box.dataset.ws11='finding';box.innerHTML=`<div class="ws5-k">Gravity Constraint Sequence Reasoning</div><h3>${esc(a.stage)}</h3><div class="ws11-find"><strong>Sequence finding:</strong> ${esc(a.finding)}</div>${a.recs.length?`<ul>${a.recs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`;root.querySelector('main')?.insertAdjacentElement('afterbegin',box)}
}
document.addEventListener('change',e=>{if(e.target.matches('[data-ws11-answer]')){const s=loadStudy();if(s)saveVisible(s)}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-next="review"]');if(!b)return;const s=loadStudy();if(!s||s.mode!=='guided')return;saveVisible(s);const a=assess(s.id);if(a.warnings.length){e.preventDefault();e.stopImmediatePropagation();alert('Gravity needs the remaining constraint-sequence answers before it can issue a Guided Results Review.');}},true);
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});render();
window.GravityWorkStudySequenceExpert={assess,questions:qs};
})();
