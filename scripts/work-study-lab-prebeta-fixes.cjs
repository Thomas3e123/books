'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function mustReplace(text,oldText,newText,label){
  if(!text.includes(oldText)) throw new Error('Missing patch target: '+label);
  return text.replace(oldText,newText);
}

// WEB FIXES
const webFile=path.join(root,'site','assets','js','gravity-work-study-v2.js');
let web=fs.readFileSync(webFile,'utf8');
web=mustReplace(web,
"const steps=['start','problem','demand','people','method','elements','observe','facts','interpret','review','sop'];",
"const steps=['start','problem','demand','people','method','elements','guardrails','observe','facts','interpret','review','sop'];",
'web progress steps');
web=mustReplace(web,
"elements:[],observations:[],timer:{running:false,startedAt:null,category:null,elementId:null}",
"elements:[],observations:[],completedUnits:1,guardrails:{quality:'',safety:''},timer:{running:false,startedAt:null,category:null,elementId:null}",
'web study model');
web=mustReplace(web,
"case'elements':out=screenElements();break;case'observe':out=screenObserve();break;",
"case'elements':out=screenElements();break;case'guardrails':out=screenGuardrails();break;case'observe':out=screenObserve();break;",
'web render route');
web=mustReplace(web,
"<button class=\"ws2-btn primary\" data-next=\"observe\">Begin Observation</button><button class=\"ws2-btn\" data-next=\"method\">Back</button>",
"<button class=\"ws2-btn primary\" data-next=\"guardrails\">Quality &amp; Safety</button><button class=\"ws2-btn\" data-next=\"method\">Back</button>",
'web elements next');
const guardrailFn=`function screenGuardrails(){return shell(\`<div class="ws2-card"><div class="ws2-eyebrow">Higher standard</div><h2>What must remain true even if we make this faster?</h2><p class="ws2-muted">Speed alone is not the higher standard. Record the quality, service, safety, and sustainability conditions the improved method must protect.</p><label class="ws2-field"><span>Quality / service guardrails</span><textarea id="g-quality" placeholder="Correct recipe, no increase in remakes, service requirement...">\${esc(s.guardrails.quality)}</textarea></label><label class="ws2-field"><span>Safety / sustainability guardrails</span><textarea id="g-safety" placeholder="No unsafe reach, congestion, lifting risk, or unsustainable pace...">\${esc(s.guardrails.safety)}</textarea></label><div class="ws2-actions"><button class="ws2-btn primary" data-next="observe">Begin Observation</button><button class="ws2-btn" data-next="elements">Back</button></div></div>\`)}\n`;
web=mustReplace(web,'function elapsed(){return s.timer.running&&s.timer.startedAt?',guardrailFn+'function elapsed(){return s.timer.running&&s.timer.startedAt?','web guardrail function');
web=mustReplace(web,
"<label class=\"ws2-field\"><span>Current work element</span><select id=\"o-element\">${s.elements.map(e=>`<option value=\"${e.id}\" ${s.timer.elementId===e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select></label><div id=\"ws2-timer\"",
"<label class=\"ws2-field\"><span>Current work element</span><select id=\"o-element\">${s.elements.map(e=>`<option value=\"${e.id}\" ${s.timer.elementId===e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select></label><label class=\"ws2-field\"><span>Completed units during this observation</span><input id=\"o-units\" type=\"number\" min=\"0\" step=\"1\" value=\"${esc(s.completedUnits)}\"></label><div id=\"ws2-timer\"",
'web completed units input');
web=mustReplace(web,
"const unitSec=total||null;const throughput=unitSec?3600/unitSec:null;const demand=s.demand.selected??d?.peak??null;return{cats,total,work,throughput,demand,gap:Number.isFinite(demand)&&Number.isFinite(throughput)?throughput-demand:null}",
"const units=Math.max(0,safeNum(s.completedUnits)||0),unitSec=total&&units?total/units:null;const throughput=unitSec?3600/unitSec:null;const demand=s.demand.selected??d?.peak??null;return{cats,total,work,units,throughput,demand,gap:Number.isFinite(demand)&&Number.isFinite(throughput)?throughput-demand:null}",
'web throughput math');
web=mustReplace(web,
"const f=calcFacts(),stats=[['Observed time',f.total?fmt(f.total/60,2)+' min':'—'],['Work'",
"const f=calcFacts(),stats=[['Observed time',f.total?fmt(f.total/60,2)+' min':'—'],['Completed units',f.units||'—'],['Work'",
'web facts units');
web=mustReplace(web,
"strength=s.observations.length>=8?'Adequate':'Preliminary'",
"strength='Preliminary'",
'web fixed-count evidence rule');
web=mustReplace(web,
"outcome='Verified Improvement';conclusion='The measured process met the current demand target under the recorded conditions without a dominant avoidable-delay pattern in this sample.'",
"outcome='Promising — Verify Further';conclusion='The measured process met the current demand target in this observed sample without a dominant avoidable-delay pattern. Verify with additional representative observations under comparable conditions before establishing a permanent standard.'",
'web overclaim');
web=mustReplace(web,
"case'elements':$$('#element-list .ws2-row').forEach((r,i)=>{const e=s.elements.find(x=>x.id===r.dataset.id);if(e)e.name=$('input',r).value.trim()||`Step ${i+1}`});break;case'interpret':",
"case'elements':$$('#element-list .ws2-row').forEach((r,i)=>{const e=s.elements.find(x=>x.id===r.dataset.id);if(e)e.name=$('input',r).value.trim()||`Step ${i+1}`});break;case'guardrails':s.guardrails.quality=$('#g-quality')?.value.trim()||'';s.guardrails.safety=$('#g-safety')?.value.trim()||'';break;case'interpret':",
'web guardrail capture');
web=mustReplace(web,
"$$('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));}",
"$$('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));const units=$('#o-units');if(units)units.oninput=()=>{s.completedUnits=Math.max(0,Number(units.value)||0);save('')};}",
'web units binding');
web=mustReplace(web,
"s.sop.status='Approved';s.status='Verified';saveHistory();save('SOP contribution approved and study saved')",
"s.sop.status='Management Approved Draft';s.status='Completed';saveHistory();save('SOP contribution approved as a management draft and study saved')",
'web SOP verification overclaim');
fs.writeFileSync(webFile,web);

// WINDOWS FIXES
const winFile=path.join(root,'windows','gravity-work-study-lab','renderer.js');
let win=fs.readFileSync(winFile,'utf8');
win=mustReplace(win,
"guardrails:{quality:'',safety:''},events:[]",
"guardrails:{quality:'',safety:''},completedUnits:1,events:[]",
'windows study model');
win=mustReplace(win,
"function bindModes(){document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{current.mode=b.dataset.mode;renderSetup();});}",
"function bindModes(){document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=async()=>{current.mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x.dataset.mode===current.mode));await save();say('Gravity mode changed to '+current.mode+'.');});}",
'windows mode switching');
win=mustReplace(win,
"<section class=\"card\"><div class=\"timer\" id=\"clock\">",
"<section class=\"card\"><label class=\"field\"><span>Completed units during this observation</span><input id=\"completedUnits\" type=\"number\" min=\"0\" step=\"1\" value=\"${h(current.completedUnits)}\"></label><div class=\"timer\" id=\"clock\">",
'windows completed units input');
win=mustReplace(win,
"bindModes();document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>toggleCategory(b.dataset.cat));",
"bindModes();document.getElementById('completedUnits').oninput=e=>current.completedUnits=Math.max(0,Number(e.target.value)||0);document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>toggleCategory(b.dataset.cat));",
'windows completed units binding');
win=mustReplace(win,
"function analyze(){const t=totals(),total=Object.values(t).reduce((a,b)=>a+b,0),work=t.WORK,avoidable=t.WALK+t.WAIT+t.SEARCH+t.REPLENISH+t.REWORK+t.DELAY,demand=Number(current.demand.selected)||null;let outcome='Inconclusive',strength='More evidence needed'",
"function analyze(){const t=totals(),total=Object.values(t).reduce((a,b)=>a+b,0),work=t.WORK,avoidable=t.WALK+t.WAIT+t.SEARCH+t.REPLENISH+t.REWORK+t.DELAY,demand=Number(current.demand.selected)||null,units=Math.max(0,Number(current.completedUnits)||0),throughput=total&&units?units*3600000/total:null,gap=Number.isFinite(demand)&&Number.isFinite(throughput)?throughput-demand:null;let outcome='Inconclusive',strength='Preliminary'",
'windows analysis math');
win=mustReplace(win,
"if(total>0){const avoidPct=avoidable/total;",
"if(total>0){const avoidPct=avoidable/total;",
'windows analysis anchor');
win=mustReplace(win,
" return{outcome,strength,conclusion,recommendation,totalMs:total,totals:t,demand,createdAt:now()};}",
" if(gap!==null&&gap<0)recommendation+=' Measured rate is '+Math.abs(gap).toFixed(1)+' units/hour below the current demand target.';if(gap!==null&&gap>=0)recommendation+=' The measured sample met the current demand target; verify with additional representative observations before establishing a permanent standard.';return{outcome,strength,conclusion,recommendation,totalMs:total,totals:t,demand,units,throughput,gap,createdAt:now()};}",
'windows analysis return');
win=mustReplace(win,
"<div class=\"stat\"><span>Demand evidence</span><strong>${h(current.demand.evidence)}</strong></div>",
"<div class=\"stat\"><span>Completed units</span><strong>${h(r.units||0)}</strong></div><div class=\"stat\"><span>Measured rate</span><strong>${Number.isFinite(r.throughput)?r.throughput.toFixed(1)+'/hr':'—'}</strong></div><div class=\"stat\"><span>Demand evidence</span><strong>${h(current.demand.evidence)}</strong></div>",
'windows results throughput');
fs.writeFileSync(winFile,win);
console.log('Applied Work Study Lab pre-beta audit fixes to web and Windows sources.');
