(()=>{'use strict';
const STUDY='gravityWorkStudyV2';
function state(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
const helpByScreen={
 problem:'If you are not sure, describe only what you can see: what is backing up, waiting, taking too long, being remade, or causing the manager to intervene.',
 demand:'If you do not know demand yet, use POS/ticket history or count the actual orders, units, racks, tables, or guests over a known time period. Gravity should not guess demand for you.',
 people:'If training status is unknown, choose Unknown. Gravity will treat that as context to verify, not as proof of a performance problem.',
 method:'If you do not know the boundary, stand where the work happens and identify the first observable event that starts the work and the last observable event that means one unit is finished.',
 elements:'If you do not know the steps, watch one complete cycle without timing it first. List the visible actions in order, then let Gravity help refine them.',
 guardrails:'If you are unsure, name the quality and safety conditions that absolutely cannot get worse. Ask the restaurant’s current SOP, recipe, food-safety rule, or equipment-safety requirement when needed.',
 observe:'If you are unsure what to record, do not coach the employee. Watch the work and use the category that best describes what is happening. Mark unusual interruptions as events rather than pretending they are normal work.',
 facts:'You do not need to explain the numbers yet. Gravity separates measurement from interpretation on purpose.',
 interpret:'It is acceptable to answer “I am not sure.” Gravity will independently review the measurements and tell you what the evidence does and does not support.',
 review:'If you do not know what management should do next, choose Continue study. Gravity will keep the evidence provisional rather than forcing a decision.',
 sop:'Do not turn a result into an operating standard unless Gravity’s repeatability check supports it. A useful finding can remain a draft while you gather stronger evidence.'
};
function css(){if(document.getElementById('ws16-style'))return;const e=document.createElement('style');e.id='ws16-style';e.textContent='.ws16-help{margin-top:10px;padding:11px 12px;border-radius:10px;background:rgba(255,255,255,.08);border-left:4px solid #7fb7a8;color:#e8f2ef;line-height:1.45}.ws16-help strong{color:#fff}.ws16-unknown{margin-left:4px!important;background:transparent!important;color:#fff!important;border-color:#8fb3aa!important}';document.head.appendChild(e)}
function render(){const s=state(),box=document.querySelector('[data-ws13]');if(!s||s.mode!=='guided'||!box)return;css();if(box.querySelector('[data-ws16-help]'))return;const h=helpByScreen[s.screen]||'If you do not know an answer, do not guess. Gravity will tell you what evidence to collect next.';const actions=box.querySelector('.ws13-actions');if(actions&&!actions.querySelector('[data-ws16-unknown]')){const b=document.createElement('button');b.type='button';b.className='secondary ws16-unknown';b.dataset.ws16Unknown='1';b.textContent='I don’t know yet';b.addEventListener('click',()=>{let p=box.querySelector('[data-ws16-help]');if(!p){p=document.createElement('div');p.className='ws16-help';p.dataset.ws16Help='1';p.innerHTML='<strong>That is okay. Do not guess.</strong> '+h;actions.insertAdjacentElement('afterend',p)}else p.hidden=!p.hidden});actions.appendChild(b)}
}
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
window.GravityWorkStudyFirstTimer={helpByScreen};
})();
