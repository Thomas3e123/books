(()=>{'use strict';
const STUDY='gravityWorkStudyV2',STORE='gravityWorkStudyHoldV15';
const qs=[
 ['processChanged','Since this standard was verified, has the process, recipe, menu mix, equipment, layout, staffing model, or handoff design changed materially?'],
 ['demandChanged','Has the demand level or demand pattern changed materially from the conditions the standard was verified to handle?'],
 ['performanceHolding','Is the process still meeting its verified throughput, cycle-time, or service expectation under representative conditions?'],
 ['qualityHolding','Is quality still meeting the required standard without increased defects, remakes, or corrections?'],
 ['safetyHolding','Is the standard still being performed safely under current conditions?'],
 ['reworkHolding','Are rework, remakes, and downstream correction still controlled?'],
 ['trainingCurrent','Are the people expected to use this standard trained on the current version?'],
 ['recentCheck','Has the standard been checked recently enough to support saying it still holds?']
];
function loadStudy(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function all(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function rec(id){const x=all();x[id]=x[id]||{version:1,studyId:id,answers:{},createdAt:new Date().toISOString()};return{x,r:x[id]}}
function save(x){localStorage.setItem(STORE,JSON.stringify(x))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveVisible(s){const {x,r}=rec(s.id);document.querySelectorAll('[data-ws15-answer]').forEach(el=>r.answers[el.dataset.ws15Answer]=el.value||'');r.updatedAt=new Date().toISOString();x[s.id]=r;save(x)}
function assess(id){const {r}=rec(id),a=r.answers||{},yes=k=>a[k]==='Yes',no=k=>a[k]==='No',unknown=k=>!a[k]||a[k]==='Unknown',issues=[],warnings=[];
 if(yes('processChanged'))issues.push('A material process or operating-design change occurred after verification. Revalidate the standard under the new condition.');
 if(yes('demandChanged'))issues.push('Demand changed materially from the verified condition. Revalidate capacity and service performance before treating the old standard as current truth.');
 if(no('performanceHolding'))issues.push('Current performance is not holding at the verified level. Treat this as drift or a changed constraint, not as a valid held standard.');
 if(no('qualityHolding'))issues.push('Quality is no longer holding. The standard cannot remain accepted without investigation and correction.');
 if(no('safetyHolding'))issues.push('Safety is no longer holding. Stop treating the standard as valid until the safety issue is resolved and the method is revalidated.');
 if(no('reworkHolding'))issues.push('Rework/remakes are no longer controlled, so the apparent standard is not holding end to end.');
 if(no('trainingCurrent'))issues.push('Current users are not fully trained on the current standard. Correct training before judging process drift.');
 if(no('recentCheck'))issues.push('The standard has not been checked recently enough to support a current hold claim.');
 for(const [k,q] of qs)if(unknown(k))warnings.push(`Hold checkpoint not yet answered: ${q}`);
 let status='Hold Confirmed',stage='HOLD',blockHold=false,finding='The recorded operating standard still appears to hold under the current representative conditions.';
 const safetyFail=no('safetyHolding'),qualityFail=no('qualityHolding'),performanceFail=no('performanceHolding')||no('reworkHolding');
 if(issues.length){blockHold=true;if(safetyFail||qualityFail||performanceFail){status='Drift Detected';stage='CORRECT';finding='Gravity found evidence that the standard is no longer holding as verified. Correct the drift or changed condition, then re-study and verify before continuing to rely on the old standard.'}else{status='Revalidation Required';stage='VERIFY';finding='The old standard may still be useful, but operating conditions changed enough that Gravity requires revalidation before treating it as current truth.'}}
 else if(warnings.length){blockHold=true;status='Hold Evidence Incomplete';stage='VERIFY';finding='Gravity does not have enough current evidence to say the standard still holds. Complete a representative hold check before relying on it as verified current practice.'}
 return{status,stage,blockHold,finding,recs:[...issues,...warnings],answers:a,issues,warnings};
}
function eligible(s){if(!s||s.sop?.status!=='Operational Standard')return false;try{return window.GravityWorkStudyRepeatabilityExpert?.assess?.(s.id)?.stage==='Operational Standard'}catch{return false}}
function css(){if(document.getElementById('ws15-style'))return;const e=document.createElement('style');e.id='ws15-style';e.textContent='.ws15{border:1px solid rgba(83,160,139,.78);border-radius:16px;padding:16px;margin:0 0 16px;background:linear-gradient(145deg,rgba(8,43,42,.98),rgba(13,57,53,.98));color:#f5f2e9}.ws15 h3{margin:.2rem 0 .5rem;color:#fff}.ws15 p,.ws15 small{color:#c9dbd6}.ws15-q{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:12px;align-items:center;padding:9px 0;border-top:1px solid rgba(255,255,255,.1)}.ws15 select{width:100%;min-height:42px;border-radius:9px;border:1px solid #70aa9a;background:#f8fffc;color:#17312d;padding:8px}.ws15-find{border-left:4px solid #79c1ad;padding:10px 12px;background:rgba(255,255,255,.06);border-radius:8px;margin-top:10px}@media(max-width:700px){.ws15-q{grid-template-columns:1fr}}';document.head.appendChild(e)}
function render(){const s=loadStudy(),root=document.getElementById('ws2-app');if(!s||!root)return;root.querySelectorAll('[data-ws15]').forEach(n=>n.remove());if(!eligible(s)||s.screen!=='sop')return;css();const {r}=rec(s.id),a=assess(s.id),box=document.createElement('section');box.className='ws15';box.dataset.ws15='hold';box.innerHTML=`<div class="ws5-k">Gravity Hold Check</div><h3>Does this operating standard still hold?</h3><p>An operational standard is not permanent truth. Gravity rechecks it when conditions change or performance drifts.</p>${qs.map(([k,q])=>`<div class="ws15-q"><label for="ws15-${esc(k)}">${esc(q)}</label><select id="ws15-${esc(k)}" data-ws15-answer="${esc(k)}"><option value="">Choose</option>${['Yes','No','Unknown','Not applicable'].map(v=>`<option ${r.answers[k]===v?'selected':''}>${v}</option>`).join('')}</select></div>`).join('')}<div class="ws15-find"><strong>${esc(a.status)}:</strong> ${esc(a.finding)}</div>${a.recs.length?`<ul>${a.recs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`;root.querySelector('main')?.insertAdjacentElement('beforeend',box)}
document.addEventListener('change',e=>{if(e.target.matches('[data-ws15-answer]')){const s=loadStudy();if(s){saveVisible(s);render()}}});
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});
render();
window.GravityWorkStudyHoldExpert={assess,questions:qs};
})();
