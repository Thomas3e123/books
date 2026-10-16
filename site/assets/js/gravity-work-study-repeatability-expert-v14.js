(()=>{'use strict';
const STUDY='gravityWorkStudyV2',STORE='gravityWorkStudyRepeatabilityV14';
const qs=[
 ['repeatShift','Has the result been repeated on another representative shift or day?'],
 ['repeatPeople','Has the result been repeated with another trained person or team when the standard is meant to apply beyond one person?'],
 ['repeatDemand','Has the result been checked at the demand level the standard is expected to handle, including peak demand when relevant?'],
 ['repeatMix','Has the result been checked with representative product, order, or table mix?'],
 ['repeatEquipment','Has the result held with normal equipment condition and normal operating settings?'],
 ['repeatQuality','Did quality remain within the required standard on the repeat check?'],
 ['repeatSafety','Did safety remain within the required standard on the repeat check?'],
 ['repeatRework','Did rework, remakes, or downstream correction remain controlled on the repeat check?']
];
function loadStudy(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function all(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function rec(id){const x=all();x[id]=x[id]||{version:1,studyId:id,answers:{},createdAt:new Date().toISOString()};return{x,r:x[id]}}
function save(x){localStorage.setItem(STORE,JSON.stringify(x))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveVisible(s){const {x,r}=rec(s.id);document.querySelectorAll('[data-ws14-answer]').forEach(el=>r.answers[el.dataset.ws14Answer]=el.value||'');r.updatedAt=new Date().toISOString();x[s.id]=r;save(x)}
function assess(id){const {r}=rec(id),a=r.answers||{},no=k=>a[k]==='No',unknown=k=>!a[k]||a[k]==='Unknown',issues=[],warnings=[];
 for(const [k,q] of qs){if(no(k))issues.push(`Repeatability checkpoint not supported: ${q}`);else if(unknown(k))warnings.push(`Repeatability checkpoint not yet answered: ${q}`)}
 let stage='Operational Standard',blockStandard=false,finding='The improvement has been repeated across the recorded representative operating conditions without a documented quality, safety, rework, or capacity failure.';
 if(issues.length){stage='Tested Finding';blockStandard=true;finding='The change may be a real improvement, but it has not held across all conditions required for a durable restaurant standard.'}
 else if(warnings.length){stage='Verified Knowledge';blockStandard=true;finding='The change has strong evidence, but repeatability is not complete enough to promote it to a durable operating standard.'}
 return{stage,blockStandard,finding,recs:[...issues,...warnings],answers:a,issues,warnings};
}
function css(){if(document.getElementById('ws14-style'))return;const e=document.createElement('style');e.id='ws14-style';e.textContent='.ws14{border:1px solid rgba(210,166,90,.75);border-radius:16px;padding:16px;margin:0 0 16px;background:linear-gradient(145deg,rgba(42,31,18,.98),rgba(58,43,24,.98));color:#f8f2e7}.ws14 h3{margin:.2rem 0 .5rem;color:#fff}.ws14 p,.ws14 small{color:#ddd1bd}.ws14-q{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:12px;align-items:center;padding:9px 0;border-top:1px solid rgba(255,255,255,.1)}.ws14 select{width:100%;min-height:42px;border-radius:9px;border:1px solid #b89b63;background:#fffdf8;color:#2b2925;padding:8px}.ws14-find{border-left:4px solid #d7a95e;padding:10px 12px;background:rgba(255,255,255,.06);border-radius:8px;margin-top:10px}@media(max-width:700px){.ws14-q{grid-template-columns:1fr}}';document.head.appendChild(e)}
function render(){const s=loadStudy(),root=document.getElementById('ws2-app');if(!s||!root)return;root.querySelectorAll('[data-ws14]').forEach(n=>n.remove());css();const {r}=rec(s.id);
 if(s.screen==='sop'&&s.gravityReview?.outcome==='Verified Improvement'){const box=document.createElement('section');box.className='ws14';box.dataset.ws14='repeatability';box.innerHTML=`<div class="ws5-k">Gravity Repeatability Check</div><h3>Is this ready to become a durable restaurant standard?</h3><p>A verified improvement can be true for one test and still be too narrow for a permanent SOP. Gravity checks whether the result holds across the conditions where the standard will actually be used.</p>${qs.map(([k,q])=>`<div class="ws14-q"><label for="ws14-${esc(k)}">${esc(q)}</label><select id="ws14-${esc(k)}" data-ws14-answer="${esc(k)}"><option value="">Choose</option>${['Yes','No','Unknown','Not applicable'].map(v=>`<option ${r.answers[k]===v?'selected':''}>${v}</option>`).join('')}</select></div>`).join('')}<small>“Not applicable” is acceptable only when that condition truly does not affect the intended standard.</small>`;root.querySelector('main')?.insertAdjacentElement('afterbegin',box)}
 if(s.screen==='sop'&&s.gravityReview?.outcome==='Verified Improvement'){const a=assess(s.id),box=document.createElement('section');box.className='ws14';box.dataset.ws14='finding';box.innerHTML=`<div class="ws5-k">Gravity Standardization Decision</div><h3>${esc(a.stage)}</h3><div class="ws14-find"><strong>Repeatability finding:</strong> ${esc(a.finding)}</div>${a.recs.length?`<ul>${a.recs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`;root.querySelector('main')?.insertAdjacentElement('beforeend',box)}
}
document.addEventListener('change',e=>{if(e.target.matches('[data-ws14-answer]')){const s=loadStudy();if(s)saveVisible(s)}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action="approve-sop"]');if(!b)return;const s=loadStudy();if(!s||s.gravityReview?.outcome!=='Verified Improvement')return;saveVisible(s);const a=assess(s.id);if(a.blockStandard){e.preventDefault();e.stopImmediatePropagation();alert('Gravity verified an improvement, but repeatability is not strong enough for a durable operating-standard approval. Keep the SOP contribution as a draft and repeat the study under the missing representative conditions.');}},true);
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});
render();
window.GravityWorkStudyRepeatabilityExpert={assess,questions:qs};
})();
