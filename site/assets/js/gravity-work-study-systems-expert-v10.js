(()=>{'use strict';
const STUDY='gravityWorkStudyV2',STORE='gravityWorkStudySystemsV10';
const qs=[
 ['demandStable','Was demand reasonably comparable or understood across the study window?'],
 ['staffingStable','Were staffing level and role assignments reasonably stable or explicitly accounted for?'],
 ['mixStable','Was product/order/table mix reasonably comparable or explicitly accounted for?'],
 ['equipmentStable','Were equipment condition, availability, and settings stable or explicitly accounted for?'],
 ['reworkControlled','Was rework/remake activity measured or ruled out as a hidden capacity drain?'],
 ['handoffControlled','Were upstream/downstream handoffs checked so one problem is not masking another?'],
 ['singleCause','Does the evidence support one primary cause rather than several simultaneous constraints?'],
 ['causeIsolated','Was the suspected cause isolated or tested while other material variables were held stable or accounted for?']
];
function loadStudy(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function all(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function rec(id){const x=all();x[id]=x[id]||{version:1,studyId:id,answers:{},createdAt:new Date().toISOString()};return{x,r:x[id]}}
function save(x){localStorage.setItem(STORE,JSON.stringify(x))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveVisible(s){const {x,r}=rec(s.id);document.querySelectorAll('[data-ws10-answer]').forEach(el=>r.answers[el.dataset.ws10Answer]=el.value||'');r.updatedAt=new Date().toISOString();x[s.id]=r;save(x)}
function assess(id){const {r}=rec(id),a=r.answers||{},no=k=>a[k]==='No',yes=k=>a[k]==='Yes',unknown=k=>!a[k]||a[k]==='Unknown',issues=[],warnings=[];
 if(no('demandStable'))issues.push('Demand changed materially or was not controlled, so the observed result may reflect demand conditions rather than the process itself.');
 if(no('staffingStable'))issues.push('Staffing or role assignment changed materially, so the process effect is not isolated.');
 if(no('mixStable'))issues.push('Product/order/table mix changed materially, so cycle or throughput differences may not be comparable.');
 if(no('equipmentStable'))issues.push('Equipment condition, availability, or settings changed materially during the study.');
 if(no('reworkControlled'))issues.push('Rework or remakes were not controlled, so hidden capacity loss may be distorting the result.');
 if(no('handoffControlled'))issues.push('Upstream/downstream handoffs were not checked, so a neighboring constraint may be masking the true cause.');
 if(no('singleCause'))issues.push('Evidence indicates more than one simultaneous constraint; Gravity will not force a single-cause conclusion.');
 if(no('causeIsolated'))issues.push('The suspected cause was not isolated from other material variables.');
 for(const [k,q] of qs)if(unknown(k))warnings.push(`Unanswered systems checkpoint: ${q}`);
 let stage='Tested Finding',blockVerified=false,finding='System context is sufficiently controlled for Gravity to consider a stronger causal conclusion.';
 if(issues.length){stage='Possible Cause';blockVerified=true;finding='Gravity found system-level confounders or multiple simultaneous constraints. The study may describe a real problem, but it does not yet isolate a verified cause.'}
 else if(warnings.length){stage='Pattern';blockVerified=true;finding='The study has useful evidence, but system context is incomplete. Gravity will not verify a cause while material operating conditions remain unknown.'}
 return{stage,blockVerified,finding,recs:[...issues,...warnings],answers:a,issues,warnings};
}
function css(){if(document.getElementById('ws10-style'))return;const e=document.createElement('style');e.id='ws10-style';e.textContent='.ws10{border:1px solid rgba(120,168,180,.7);border-radius:16px;padding:16px;margin:0 0 16px;background:linear-gradient(145deg,rgba(12,29,40,.98),rgba(18,42,54,.98));color:#f7f2e8}.ws10 h3{margin:.2rem 0 .5rem;color:#fff}.ws10 p,.ws10 small{color:#cbd6da}.ws10-q{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:12px;align-items:center;padding:9px 0;border-top:1px solid rgba(255,255,255,.1)}.ws10 select{width:100%;min-height:42px;border-radius:9px;border:1px solid #7395a0;background:#f8fbfc;color:#17252d;padding:8px}.ws10-find{border-left:4px solid #79aebb;padding:10px 12px;background:rgba(255,255,255,.06);border-radius:8px;margin-top:10px}@media(max-width:700px){.ws10-q{grid-template-columns:1fr}}';document.head.appendChild(e)}
function render(){const s=loadStudy(),root=document.getElementById('ws2-app');if(!s||!root)return;root.querySelectorAll('[data-ws10]').forEach(n=>n.remove());css();const {r}=rec(s.id);
 if(s.screen==='interpret'){const box=document.createElement('section');box.className='ws10';box.dataset.ws10='systems';box.innerHTML=`<div class="ws5-k">Gravity Systems Expert Check</div><h3>Could another operating condition explain this result?</h3><p>Gravity checks the surrounding restaurant system before accepting a single-cause explanation.</p>${qs.map(([k,q])=>`<div class="ws10-q"><label for="ws10-${esc(k)}">${esc(q)}</label><select id="ws10-${esc(k)}" data-ws10-answer="${esc(k)}"><option value="">Choose</option>${['Yes','No','Unknown'].map(v=>`<option ${r.answers[k]===v?'selected':''}>${v}</option>`).join('')}</select></div>`).join('')}<small>Guided mode requires these checkpoints before a verified causal conclusion.</small>`;root.querySelector('main')?.insertAdjacentElement('afterbegin',box)}
 if(['review','sop'].includes(s.screen)){const a=assess(s.id),box=document.createElement('section');box.className='ws10';box.dataset.ws10='finding';box.innerHTML=`<div class="ws5-k">Gravity Systems Reasoning</div><h3>${esc(a.stage)}</h3><div class="ws10-find"><strong>Systems finding:</strong> ${esc(a.finding)}</div>${a.recs.length?`<ul>${a.recs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`;root.querySelector('main')?.insertAdjacentElement('afterbegin',box)}
}
document.addEventListener('change',e=>{if(e.target.matches('[data-ws10-answer]')){const s=loadStudy();if(s)saveVisible(s)}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-next="review"]');if(!b)return;const s=loadStudy();if(!s||s.mode!=='guided')return;saveVisible(s);const a=assess(s.id);if(a.warnings.length){e.preventDefault();e.stopImmediatePropagation();alert('Gravity needs the remaining systems-context answers before it can issue a Guided Results Review.');}} ,true);
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});
render();
window.GravityWorkStudySystemsExpert={assess,questions:qs};
})();
