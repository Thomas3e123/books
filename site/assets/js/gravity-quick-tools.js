(()=>{'use strict';
const $=id=>document.getElementById(id),box=$('gravity-quick-workspace'),form=$('gravity-quick-form'),out=$('gravity-quick-result');
const tools={
systems:{title:'Five-question system check',intro:'Choose the current state of each control. A concern or an unknown is a reason to investigate, not proof of failure.',questions:[['Leadership','Do managers complete and review shift handoffs?'],['People','Are employees trained and verified for their assigned stations?'],['Food cost','Are inventory, waste and portion variances checked routinely?'],['Service','Are guest problems documented and followed through?'],['Standards','Are current SOPs accessible and consistently followed?']],options:['Clear with evidence','Needs review','Unknown'],links:{Leadership:'/gravity-assist',People:'/gravity-sop-foundry','Food cost':'/operating-systems#system-finder',Service:'/operating-systems#system-finder',Standards:'/standards-library'}},
food:{title:'Food-Cost Leak Finder',intro:'Select the strongest evidence available for each potential leak.',questions:[['Waste','Is avoidable waste recorded by item and reason?'],['Portions','Are recipe portions and actual serving sizes checked?'],['Receiving','Are deliveries checked against quantities, quality and invoices?'],['Inventory','Are counts reconciled to sales and purchasing?'],['Pricing','Are recipe costs and menu prices reviewed after cost changes?']],options:['Controlled and verified','Possible leak','Not measured'],links:{Waste:'/operating-systems#system-finder',Portions:'/standards-library',Receiving:'/operating-systems#system-finder',Inventory:'/operating-systems#system-finder',Pricing:'/operating-systems#system-finder'}},
sop:{title:'Which SOP First?',intro:'Choose the area with the most serious unverified exposure. Consider safety and repeat errors before convenience.',questions:[['Food safety','Are safe handling, holding and sanitation steps verified?'],['Opening / closing','Are critical opening and closing duties completed consistently?'],['Production','Are recipe and station methods repeatable?'],['Service','Are service recovery and handoff steps consistent?'],['Training','Are new employees trained and signed off?']],options:['Verified','Needs standard or retraining','Unknown'],links:{'Food safety':'/standards-library','Opening / closing':'/gravity-sop-foundry',Production:'/gravity-sop-foundry',Service:'/standards-library',Training:'/gravity-sop-foundry'}},
plan:{title:'30-Day Install Plan',intro:'Select the area to improve and Gravity will create a practical starter sequence. Adjust owners and deadlines to your operation.',questions:[['Focus','Which operating area needs the first installation?']],options:['Leadership','People / training','Food cost','Service','SOP standards'],links:{}}
};
function make(tag,txt){const e=document.createElement(tag);if(txt)e.textContent=txt;return e}
function track(eventName,kind){
 if(typeof window.gravityAnalyticsEvent==='function' && Object.prototype.hasOwnProperty.call(tools,kind))
  window.gravityAnalyticsEvent(eventName,{assessment_type:kind});
}
function openTool(kind){
 const t=tools[kind];if(!t||!box||!form||!out)return;
 box.hidden=false;box.dataset.tool=kind;
 $('gravity-quick-title').textContent=t.title;$('gravity-quick-intro').textContent=t.intro;
 form.replaceChildren();out.replaceChildren();
 t.questions.forEach(([area,q],i)=>{
  const f=make('fieldset'),l=make('legend',q),s=make('select');s.name='q'+i;s.required=true;
  s.style.cssText='width:100%;max-width:540px;padding:10px;margin:8px 0 16px';
  const ph=make('option','Select one');ph.value='';s.append(ph);
  t.options.forEach((opt,j)=>{const o=make('option',opt);o.value=String(j);s.append(o)});
  f.append(l,s);form.append(f)
 });
 const submit=make('button','Generate next steps');submit.type='submit';submit.className='btn btn-primary';form.append(submit);
 track('gravity_assessment_start',kind);
 box.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('[data-gravity-tool]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.gravityTool)));
form.addEventListener('submit',e=>{e.preventDefault();const t=tools[box.dataset.tool],v=t.questions.map((_,i)=>form.elements['q'+i].value);if(v.some(x=>x==='')){out.textContent='Answer each question before continuing.';return}track('gravity_assessment_complete',box.dataset.tool);out.replaceChildren();const h=make('h3','Your recommended first step');out.append(h);let focus,action,href='/operating-systems#system-finder';if(box.dataset.tool==='plan'){focus=t.options[Number(v[0])];action='Starter plan (not yet validated against your operation). Days 1–3: name an accountable owner and gather baseline evidence. Days 4–7: confirm the actual cause and choose a measurable standard. Days 8–14: train, install the control and record exceptions. Days 15–21: measure results and correct gaps. Days 22–30: verify sustained performance, assign review cadence and document the hold.';href=focus==='SOP standards'?'/gravity-sop-foundry':'/operating-systems#system-finder'}else{
 const ranked=v.map((x,i)=>({i,score:Number(x),severity:Number(x)===1?2:Number(x)===2?1:0}));
 const highest=Math.max(...ranked.map(x=>x.severity));
 const tied=ranked.filter(x=>x.severity===highest);
 const unknownCount=ranked.filter(x=>x.score===2).length;
 if(highest===0){
   focus='No immediate weakness identified';
   action='All five answers were marked verified. This short self-assessment has not established a weakest system. Select an important control for a documented spot-check and verify real results.';
   href='/gravity-aware';
 }else if(unknownCount===ranked.length){
   focus='Evidence is insufficient';
   action='All areas are marked Unknown. No weakest system can be established from these answers. Assign someone to inspect actual records and work before ranking priorities.';
   href='/gravity-aware';
 }else if(tied.length>1){
   focus='Several areas need investigation';
   action='Multiple areas require review; compare urgency, safety, customer impact and available evidence before setting a priority: '+tied.map(x=>t.questions[x.i][0]).join(', ')+'. These answers are not proof of a cause or solution.';
   if(unknownCount)action+=' Gather evidence for unknown controls as well.';
   href='/gravity-aware';
 }else{
   const pick=tied[0];
   focus=t.questions[pick.i][0];href=t.links[focus];
   action=pick.score===2?'Evidence is missing or unknown for this control. Assign someone to inspect and document the actual situation before choosing a fix.':'This control needs review. Observe the work, compare results with the standard, and prove the cause before correcting it.';
   if(ranked.filter(x=>x.severity>0).length>1)action+=' Other flagged areas also require follow-up.';
 }
 }out.append(make('p','Priority: '+focus),make('p',action),make('p','Assign an owner, deadline and measurable proof of completion. A recommendation is not a verified solution.'));const a=make('a','Open relevant Gravity resources');a.href=href;a.className='btn btn-outline';a.addEventListener('click',()=>track('gravity_assessment_resource_open',box.dataset.tool));out.append(a);const p=make('button','Copy result');p.type='button';p.style.marginLeft='10px';p.addEventListener('click',async()=>{const text='Gravity Aware — '+focus+'\n'+action+'\nOwner: ____ Deadline: ____ Proof: ____';try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);p.textContent='Copied';}catch{let fallback=out.querySelector('textarea');if(!fallback){fallback=make('textarea');fallback.setAttribute('aria-label','Result to copy');fallback.readOnly=true;fallback.rows=6;fallback.style.width='100%';out.append(fallback);}fallback.value=text;fallback.focus();fallback.select();p.textContent='Select and copy the result below';}});out.append(p)});
let requestedTool='';
try {requestedTool=new URLSearchParams(window.location.search).get('tool')||'';} catch (_) {}
if (Object.prototype.hasOwnProperty.call(tools,requestedTool)) openTool(requestedTool);
})();