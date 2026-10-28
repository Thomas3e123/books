import {topics,validateInput,createTemplate,validatePlan,reviews} from './gravity-action-plan-core.mjs';
const $=id=>document.getElementById(id),KEY='gravity.actionPlan.v1';let state=null,busy=false;
const localDate=new Date();$('start').value=[localDate.getFullYear(),String(localDate.getMonth()+1).padStart(2,'0'),String(localDate.getDate()).padStart(2,'0')].join('-');
const status=message=>{$('status').textContent=message};
const readInput=()=>validateInput(Object.fromEntries(new FormData($('plan-form'))));
const setBusy=value=>{busy=value;$('build').disabled=value;$('ai-build').disabled=value};
function invalidate(){if(!state)return;state.reviewed=false;$('reviewed').checked=false;status('Draft changed. Review the edits and save or download a backup.');}
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el}
function edit(text,set,tag='p'){const el=node(tag,text,'edit');el.contentEditable='plaintext-only';el.setAttribute('role','textbox');el.setAttribute('aria-label','Edit '+text.slice(0,65));el.addEventListener('input',()=>{set(el.textContent.slice(0,5000));invalidate()});return el}
function heading(root,text){root.append(node('h3',text))}
function render(){
 const {input,plan}=state,t=topics[input.topic],root=$('plan-document');root.replaceChildren();
 $('empty').hidden=true;$('result').hidden=false;$('reviewed').checked=!!state.reviewed;$('review-notes').value=state.notes;$('decision').value=state.decision;
 $('mode-label').textContent=(state.mode==='ai'?'AI-generated draft':'Guided template')+' · Manager review required';
 root.append(edit(plan.title,v=>plan.title=v,'h2'));
 root.append(node('p',[input.restaurant||'Restaurant not specified','Owner: '+input.owner,'Start: '+input.start,input.pace+'-day path'].join(' · '),'meta'));
 heading(root,'The problem');root.append(node('p',input.problem));if(input.context)root.append(node('p','Operating context: '+input.context));
 heading(root,'The result to work toward');root.append(edit(plan.objective,v=>plan.objective=v));
 heading(root,'Baseline and measures');root.append(node('p',input.baseline||'Baseline unknown — record actual observations before claiming improvement.'));root.append(edit(plan.measure,v=>plan.measure=v));
 heading(root,'The smallest useful set of working aids');root.append(node('p','Suggested owning system: '+t.system));const tools=node('ol');for(const name of t.tools)tools.append(node('li',name+' — draft aid to customize; not a newly approved Gravity form.'));root.append(tools);const work=node('a','Continue in '+t.workspaceName);work.href=t.workspace;root.append(work);root.append(node('p','This link opens the workspace. It does not transfer this plan automatically.','hint'));
 heading(root,'Implementation steps');const steps=node('ol');plan.steps.forEach((s,i)=>{const li=node('li');li.append(edit(s.timing,v=>s.timing=v,'h4'),edit(s.action,v=>s.action=v),node('strong','Evidence to keep'),edit(s.evidence,v=>s.evidence=v));steps.append(li)});root.append(steps);
 for(const [key,title] of [['checklist','Working checklist'],['training','Short training aid'],['assumptions','Assumptions and limits'],['questions','Questions to settle']]){
  heading(root,title);const list=node('ul');plan[key].forEach((value,i)=>{const li=node('li');li.append(edit(value,v=>plan[key][i]=v));if(key==='checklist'){const label=node('label',undefined,'check');const cb=node('input');cb.type='checkbox';cb.checked=!!state.checked[i];cb.setAttribute('aria-label','Record checklist item '+(i+1)+' complete');cb.onchange=()=>{state.checked[i]=cb.checked;status('Checklist updated. Save or download to keep this change.')};label.append(cb,node('span','Recorded complete by manager'));li.append(label)}list.append(li)});root.append(list);
 }
 heading(root,'Open-item handoff');root.append(node('p','Record only operational information. Leave confidential details in the restaurant’s authorized system.'));
 for(const [i,item] of state.handoff.entries()){
  const box=node('div',undefined,'review-date');box.append(node('h4','Open item '+(i+1)));
  for(const [key,label] of [['issue','What remains / why'],['control','Temporary control'],['owner','Next owner'],['due','Due date / time'],['evidence','Evidence required / closure record']]){box.append(node('strong',label),edit(item[key],v=>item[key]=v))}root.append(box);
 }
 const add=node('button','Add open item');add.type='button';add.onclick=()=>{if(state.handoff.length>=10){status('Keep this plan to ten open items. Start another plan if needed.');return}state.handoff.push(blankItem());invalidate();render()};root.append(add);
 heading(root,'Review dates');for(const r of reviews(input)){const box=node('div',undefined,'review-date');box.append(node('strong',r.label+' · '+r.date),node('p',r.purpose));root.append(box)}root.append(node('p','These dates do not create calendar reminders. Record the evidence before deciding whether to keep, change, retire, or expand the method.','hint'));
 heading(root,'Gravity source guidance');const links=node('div',undefined,'source-links');for(const [url,title] of [['/start-here','Start Here: installation pace and first tools'],['/'+t.source,t.name],['/restaurant-shift-handoff-checklist','Shift handoff: owners, deadlines, and verified closure']]){if([...links.children].some(a=>a.getAttribute('href')===url))continue;const a=node('a',title);a.href=url;links.append(a)}root.append(links,node('p','Source snapshot: October 28, 2026. Source links explain the basis; generated additions and your edits remain draft working aids.','hint'));
}
const blankItem=()=>({issue:'To be recorded',control:'Confirm approved temporary control',owner:'Assign owner',due:'Set deadline',evidence:'Record how closure will be verified'});
function setPlan(input,plan,mode){state={version:1,input,plan:validatePlan(plan),mode,reviewed:false,notes:'',decision:'pending',checked:[],handoff:[blankItem()]};render();status(mode==='ai'?'AI draft ready. Check every step, assumptions, and unanswered question.':'Guided template ready. It uses your problem, owner, dates, baseline, and selected Gravity guidance. Customize it before use.');$('output-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
$('plan-form').onsubmit=e=>{e.preventDefault();try{setPlan(readInput(),createTemplate(readInput()),'template')}catch(err){status(err.message)}};
$('ai-build').onclick=async()=>{
 if(busy||!$('plan-form').reportValidity())return;let input;try{input=readInput()}catch(e){status(e.message);return}setBusy(true);status('Connecting to AI drafting…');
 try{
  const res=await fetch('/.netlify/functions/gravity-action-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(55000)});
  if(!res.ok){let msg='AI drafting is unavailable. Your inputs are unchanged. Use Build guided action plan.';try{msg=(await res.json()).error||msg}catch{}throw Error(msg)}
  if(!(res.headers.get('content-type')||'').includes('application/x-ndjson'))throw Error('AI drafting returned an unexpected response. Use the guided template.');
  const reader=res.body.getReader(),decoder=new TextDecoder();let buffer='',result=null;
  const processLine=line=>{if(!line.trim())return;const event=JSON.parse(line);if(event.type==='progress')status(event.message);if(event.type==='error')throw Error(event.message);if(event.type==='result')result=event};
  while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>100000)throw Error('AI response too large. Use the guided template.');const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines)processLine(line)}buffer+=decoder.decode();processLine(buffer);
  if(!result)throw Error('No completed AI draft was received. Use the guided template.');setPlan(input,result.plan,'ai');
 }catch(e){status(e.name==='TimeoutError'?'AI drafting timed out. Your inputs are unchanged. Use the guided template.':e.message)}finally{setBusy(false)}
};
$('example').onclick=()=>{$('topic').value='closing';$('problem').value='Closing tasks are marked complete, but the opening manager finds unfinished work three mornings a week.';$('owner').value='Closing manager';$('baseline').value='Example only: three mornings in one week had unfinished closing work.';$('goal').value='No unfinished item reaches opening without an accepted handoff, owner, and deadline.';status('Example filled in. Replace example observations with verified facts before using the plan.')};
$('pace').onchange=()=>{$('pace-help').textContent=$('pace').value==='60'?'60 days: extra learning and practice. Day 30 is midpoint correction; Day 60 is the final decision.':'30 days: concentrated implementation with a final decision on Day 30.'};
$('reviewed').onchange=()=>{if(state)state.reviewed=$('reviewed').checked};$('review-notes').oninput=()=>{if(state){state.notes=$('review-notes').value;invalidate()}};$('decision').onchange=()=>{if(state){state.decision=$('decision').value;invalidate()}};
function snapshot(){if(!state)throw Error('Build a plan first.');return {...state,savedAt:new Date().toISOString()}}
$('save').onclick=()=>{try{localStorage.setItem(KEY,JSON.stringify(snapshot()));status('Saved on this browser profile. Download a backup for recovery or another device.')}catch{status('Could not save on this device. Your draft is still visible. Download a backup now.')}};
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('download').onclick=()=>download('gravity-action-plan-backup.json',JSON.stringify(snapshot(),null,2),'application/json');
$('text-export').onclick=()=>{const copy=$('plan-document').cloneNode(true);copy.querySelectorAll('button').forEach(el=>el.remove());copy.querySelectorAll('label.check').forEach((el,i)=>el.replaceWith(node('p',state.checked[i]?'[Complete — manager recorded]':'[Not recorded complete]')));copy.querySelectorAll('p,h2,h3,h4,li,strong,a').forEach(el=>el.append(document.createTextNode('\n')));const doc=copy.textContent;download('gravity-action-plan.txt',`${state.mode==='ai'?'AI-GENERATED DRAFT':'GUIDED TEMPLATE'} — Manager review required\nManager review recorded: ${state.reviewed?'Yes':'No'}\n\n${doc}\n\nReview notes:\n${state.notes||'None recorded'}\nManager decision: ${state.decision}\n`,'text/plain;charset=utf-8')};
$('print').onclick=()=>{const marker=node('p','Manager review recorded: '+(state.reviewed?'Yes':'No')+' · Current decision: '+state.decision);const notes=node('p','Review notes: '+(state.notes||'None recorded'));$('plan-document').prepend(marker);$('plan-document').append(notes);window.print();marker.remove();notes.remove()};
function validateBackup(raw){
 if(!raw||raw.version!==1||!['ai','template'].includes(raw.mode))throw Error('Unsupported backup.');
 const input=validateInput(raw.input),plan=validatePlan(raw.plan);
 if(typeof raw.reviewed!=='boolean'||typeof raw.notes!=='string'||raw.notes.length>5000||!['pending','Keep','Change','Retire','Expand'].includes(raw.decision))throw Error('Invalid review record.');
 if(!Array.isArray(raw.checked)||raw.checked.length>10||raw.checked.some(v=>typeof v!=='boolean'))throw Error('Invalid checklist record.');
 if(!Array.isArray(raw.handoff)||raw.handoff.length<1||raw.handoff.length>10)throw Error('Invalid handoff.');
 for(const item of raw.handoff)for(const key of ['issue','control','owner','due','evidence'])if(typeof item[key]!=='string'||item[key].length>5000)throw Error('Invalid handoff item.');
 return {...raw,input,plan};
}
function load(raw){const next=validateBackup(raw);state=next;for(const [key,value] of Object.entries(state.input))if($(key))$(key).value=value;$('pace').onchange();render();status('Plan restored. Check dates and current procedures before using it. No cloud records were changed.')}
$('load').onclick=()=>{try{const raw=localStorage.getItem(KEY);if(!raw){status('No saved plan was found on this browser profile.');return}load(JSON.parse(raw))}catch{status('Saved plan could not be loaded. The current draft is unchanged. Restore a valid backup.')}};
$('restore').onchange=async()=>{try{const file=$('restore').files[0];if(!file)return;if(file.size>200000)throw Error('Backup too large.');load(JSON.parse(await file.text()))}catch(e){status('Could not restore backup: '+e.message+' Current draft unchanged.')}finally{$('restore').value=''}};
$('clear').onclick=()=>{if(!confirm('Clear the saved plan and this workspace? Download a backup first if you need to keep it.'))return;try{localStorage.removeItem(KEY)}catch{status('Could not clear device storage. Current workspace kept.');return}state=null;$('plan-document').replaceChildren();$('result').hidden=true;$('empty').hidden=false;status('Saved plan and working output cleared. Problem inputs remain available.')};
