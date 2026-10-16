(()=>{'use strict';
const STUDY='gravityWorkStudyV2',STORE='gravityWorkStudyDiagnosticV22';
const qs=[
 ['personBlame','Is the problem currently being described mainly as one employee being slow, careless, unmotivated, or the problem?'],
 ['trainingVerified','Has Gravity verified that the person was trained to the current method and had a fair chance to perform it?'],
 ['materialsReady','Were ingredients, tools, supplies, information, and work inputs available when needed?'],
 ['equipmentNormal','Was the equipment operating normally and at expected capacity?'],
 ['upstreamEffect','Could an upstream station, decision, release pattern, or replenishment practice be creating the problem here?'],
 ['downstreamEffect','Could a downstream station, handoff, holding limit, or return flow be causing work to back up here?'],
 ['policyEffect','Could a rule, staffing practice, batching rule, scheduling choice, menu promise, or management policy be creating the observed behavior?'],
 ['failureMode','Did the study identify what actually fails first: wait, shortage, blockage, rework, remake, handoff miss, equipment delay, quality failure, or overload?'],
 ['localVsSystem','If this station became faster, is there evidence the whole process or guest outcome would improve rather than just move the problem?'],
 ['problemMatchesEvidence','Does the evidence collected still answer the original problem statement?'],
 ['betterProblem','After observing the work, is there a more accurate problem statement than the one the study started with?']
];
function study(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function all(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function rec(id){const a=all();a[id]=a[id]||{version:1,answers:{},createdAt:new Date().toISOString()};return{a,r:a[id]}}
function save(id,k,v){const {a,r}=rec(id);r.answers[k]=v;r.updatedAt=new Date().toISOString();a[id]=r;localStorage.setItem(STORE,JSON.stringify(a))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function assess(s){const {r}=rec(s.id),a=r.answers||{},yes=k=>a[k]==='Yes',no=k=>a[k]==='No',unk=k=>!a[k]||a[k]==='Unknown',issues=[],next=[];let reframe='';
 if(yes('personBlame')&&(no('trainingVerified')||unk('trainingVerified')))issues.push('The study risks blaming a person before confirming training and method readiness.');
 if(yes('personBlame')&&(no('materialsReady')||no('equipmentNormal')||yes('upstreamEffect')||yes('downstreamEffect')||yes('policyEffect')))issues.push('System conditions are still plausible causes, so an employee-performance conclusion is not supported.');
 if(no('materialsReady'))issues.push('Missing or late inputs can create apparent labor slowness.');
 if(no('equipmentNormal'))issues.push('Abnormal equipment condition contaminates a normal-method performance conclusion.');
 if(yes('upstreamEffect')&&yes('downstreamEffect'))issues.push('The observed station may be caught between two system constraints; isolate the direction of causation.');
 if(no('failureMode')||unk('failureMode'))next.push('Name the first observable failure in the chain before choosing a fix.');
 if(no('localVsSystem'))issues.push('A local speed improvement is not yet proven to improve the whole restaurant process.');
 if(no('problemMatchesEvidence'))issues.push('The evidence no longer cleanly answers the original problem statement.');
 if(yes('betterProblem'))reframe='Gravity recommends rewriting the problem statement around the observed system failure before continuing.';
 if(yes('upstreamEffect'))next.push('Trace one complete unit of work upstream to find the first point where readiness, release, or replenishment breaks down.');
 if(yes('downstreamEffect'))next.push('Trace completed work downstream to find where acceptance, holding, handoff, or return flow blocks the system.');
 if(yes('policyEffect'))next.push('Test the governing rule or management decision as a cause before changing employee expectations.');
 if(yes('personBlame')&&!yes('trainingVerified'))next.push('Verify current training and method understanding before evaluating individual performance.');
 const unanswered=qs.filter(([k])=>!a[k]).map(([k,q])=>q);
 let status='Diagnostic Check Incomplete';
 if(!unanswered.length)status=issues.length?'Reframe / Investigate System Cause':'Problem Definition Supported';
 return{status,issues,next:[...new Set(next)],reframe,unanswered,blockStrong:issues.length>0||unanswered.length>0};
}
function css(){if(document.getElementById('ws22-style'))return;const e=document.createElement('style');e.id='ws22-style';e.textContent='.ws22{margin:14px 0;padding:15px;border:1px solid rgba(201,151,78,.75);border-radius:14px;background:#0d222b;color:#f6f1e8}.ws22 h3{margin:.1rem 0 .4rem}.ws22 p,.ws22 small{color:#d3ddd9}.ws22-q{display:grid;grid-template-columns:1fr 150px;gap:10px;align-items:center;padding:8px 0;border-top:1px solid rgba(255,255,255,.1)}.ws22 select{min-height:40px;border-radius:8px;padding:7px;background:#fff;color:#17252d}.ws22-out{margin-top:10px;padding:10px;border-radius:9px;background:rgba(255,255,255,.06)}.ws22-warn{border-left:4px solid #d0a25b}.ws22-good{border-left:4px solid #7fb49e}@media(max-width:700px){.ws22-q{grid-template-columns:1fr}}';document.head.appendChild(e)}
function render(){const s=study();if(!s||s.mode!=='guided')return;const host=document.querySelector('[data-ws13]')||document.querySelector('#ws2-app');if(!host)return;css();let box=document.querySelector('[data-ws22]');if(!box){box=document.createElement('section');box.className='ws22';box.dataset.ws22='1';host.insertAdjacentElement('afterend',box)}const {r}=rec(s.id),a=r.answers||{},as=assess(s);box.innerHTML=`<h3>Gravity Diagnostic Expert</h3><p>Before I accept the problem as stated, I want to make sure we are studying the cause rather than blaming the nearest person or station.</p>${qs.map(([k,q])=>`<label class="ws22-q"><span>${esc(q)}</span><select data-ws22-answer="${k}"><option value="">Choose</option>${['Yes','No','Unknown'].map(v=>`<option${a[k]===v?' selected':''}>${v}</option>`).join('')}</select></label>`).join('')}<div class="ws22-out ${as.blockStrong?'ws22-warn':'ws22-good'}"><strong>${esc(as.status)}</strong>${as.reframe?`<p>${esc(as.reframe)}</p>`:''}${as.issues.length?`<ul>${as.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${as.next.length?`<p><strong>Next diagnostic move:</strong></p><ul>${as.next.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${!as.blockStrong?'<p>The original problem definition is supported well enough to continue with the current study.</p>':''}</div>`;box.querySelectorAll('[data-ws22-answer]').forEach(el=>el.addEventListener('change',()=>{save(s.id,el.dataset.ws22Answer,el.value);render()}));}
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
window.GravityWorkStudyDiagnosticExpert={questions:qs,assess};
})();