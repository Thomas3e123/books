import {topics,validateInput,createTemplate,validatePlan,reviews} from './gravity-action-plan-core.mjs';
const $=id=>document.getElementById(id),KEY='gravity.actionPlan.v1';let state=null,busy=false;
const localDate=new Date();$('start').value=[localDate.getFullYear(),String(localDate.getMonth()+1).padStart(2,'0'),String(localDate.getDate()).padStart(2,'0')].join('-');
const status=message=>{$('status').textContent=message};
const readInput=()=>validateInput(Object.fromEntries(new FormData($('plan-form'))));
const setBusy=value=>{busy=value;$('build').disabled=value;$('ai-build').disabled=value};
// Keep all answers in the form, but show only the current question.
const questionSteps=[...document.querySelectorAll('.question-step')];let questionIndex=0;
const nextLabels=['Next: Who will lead it?','Next: What have you seen?','Next: What should happen?','Next: What could affect it?','Next: Choose your timing','Next: Check my answers'];
function summarizeAnswers(){
 const summary=$('answer-summary');summary.replaceChildren();
 for(const [id,label] of [['topic','Problem area'],['problem','Problem'],['owner','Who will lead it'],['restaurant','Restaurant'],['baseline','What you have seen'],['goal','Desired result'],['context','Things to consider'],['start','Start date'],['pace','Time to put it into practice']]){
  const field=$(id);summary.append(node('dt',label),node('dd',field.tagName==='SELECT'?field.selectedOptions[0].textContent:field.value.trim()||'Not supplied — settle this during review'));
 }
}
function showQuestion(index,focus=true){
 questionIndex=index;questionSteps.forEach((step,i)=>{step.hidden=i!==index});
 $('step-progress').textContent='Step '+(index+1)+' of '+questionSteps.length;
 $('step-back').hidden=index===0;$('step-next').hidden=index===questionSteps.length-1;
 $('step-next').textContent=nextLabels[index]||'Next';$('step-skip').hidden=![2,3,4].includes(index);$('step-error').textContent='';
 if(index===questionSteps.length-1)summarizeAnswers();
 if(focus){const legend=questionSteps[index].querySelector('legend');legend.tabIndex=-1;legend.focus();}
}
function validQuestion(){
 for(const field of questionSteps[questionIndex].querySelectorAll('input,select,textarea')){
  field.setCustomValidity('');
  if(field.id==='problem'&&field.value.trim().length<15)field.setCustomValidity('Describe what keeps happening in at least 15 characters. You can follow the example below.');
  if(field.id==='owner'&&!field.value.trim())field.setCustomValidity('Type a role such as Closing manager, or Me — manager.');
  if(!field.reportValidity()){$('step-error').textContent=field.validationMessage;return false;}
 }return true;
}
$('step-next').onclick=()=>{if(validQuestion())showQuestion(Math.min(questionIndex+1,questionSteps.length-1))};
$('step-back').onclick=()=>showQuestion(Math.max(0,questionIndex-1));
$('step-skip').onclick=()=>{questionSteps[questionIndex].querySelector('textarea').value='';showQuestion(questionIndex+1)};
$('plan-form').addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('')});
showQuestion(0,false);
function invalidate(){if(!state)return;state.reviewed=false;$('reviewed').checked=false;status('Draft changed. Review the edits and save or download a backup.');}
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el}
function edit(text,set,tag='p'){const el=node(tag,text,'edit');el.contentEditable='plaintext-only';el.setAttribute('role','textbox');el.setAttribute('aria-label','Edit '+text.slice(0,65));el.addEventListener('input',()=>{set(el.textContent.slice(0,5000));invalidate()});return el}
function heading(root,text){root.append(node('h3',text))}
function render(){
 const {input,plan}=state,t=topics[input.topic],root=$('plan-document');root.replaceChildren();
 $('empty').hidden=true;$('result').hidden=false;$('reviewed').checked=!!state.reviewed;$('review-notes').value=state.notes;$('decision').value=state.decision;
 $('mode-label').textContent=(state.mode==='ai'?'AI-generated draft':'Draft plan')+' · Check before using';
 root.append(edit(plan.title,v=>plan.title=v,'h2'));
 root.append(node('p','Person leading this: '+input.owner,'meta'));
 const steps=node('ol',undefined,'plain-plan');
 plan.steps.forEach(step=>{const li=node('li');li.append(edit(step.timing,v=>step.timing=v,'strong'),edit(step.action,v=>step.action=v));steps.append(li)});
 root.append(steps);

}
const blankItem=()=>({issue:'To be recorded',control:'Confirm approved temporary control',owner:'Assign owner',due:'Set deadline',evidence:'Record how closure will be verified'});
function setPlan(input,plan,mode){state={version:1,input,plan:validatePlan(plan),mode,reviewed:false,notes:'',decision:'pending',checked:[],handoff:[blankItem()]};render();status(mode==='ai'?'AI draft ready. Check every step, assumptions, and unanswered question.':'Your draft plan is ready. Read the list and change anything that does not fit your restaurant.');$('output-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
$('plan-form').onsubmit=e=>{e.preventDefault();if(questionIndex<questionSteps.length-1){if(validQuestion())showQuestion(questionIndex+1);return}for(let i=0;i<questionSteps.length-1;i++){const invalid=[...questionSteps[i].querySelectorAll('input,textarea,select')].some(field=>!field.checkValidity());if(invalid){showQuestion(i);validQuestion();return}}try{const input=readInput();setPlan(input,createTemplate(input),'template')}catch(err){$('step-error').textContent=err.message;status(err.message)}};
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
$('example').onclick=()=>{$('topic').value='closing';$('problem').value='Closing tasks are marked complete, but the opening manager finds unfinished work three mornings a week.';$('owner').value='Closing manager';$('baseline').value='Example only: three mornings in one week had unfinished closing work.';$('goal').value='No unfinished item reaches opening without an accepted handoff, owner, and deadline.';$('restaurant').value='Practice restaurant';$('context').value='Fictional example: two new closers need practice with the approved closing routine.';questionSteps.forEach(step=>step.querySelectorAll('input,textarea').forEach(field=>field.setCustomValidity('')));showQuestion(0);status('Fictional example loaded. Click Next to walk through each answer, then build the draft. Replace example facts before using it at work.')};
$('pace').onchange=()=>{$('pace-help').textContent=$('pace').value==='60'?'60 days: more time for learning and practice. Check and correct at Day 30; final review at Day 60.':'30 days: faster implementation. Use this when the team can make time for concentrated work; final review at Day 30.'};
$('reviewed').onchange=()=>{if(state)state.reviewed=$('reviewed').checked};$('review-notes').oninput=()=>{if(state){state.notes=$('review-notes').value;invalidate()}};$('decision').onchange=()=>{if(state){state.decision=$('decision').value;invalidate()}};
function snapshot(){if(!state)throw Error('Build a plan first.');return {...state,savedAt:new Date().toISOString()}}
$('save').onclick=()=>{try{localStorage.setItem(KEY,JSON.stringify(snapshot()));status('Saved on this browser profile. Download a backup for recovery or another device.')}catch{status('Could not save on this device. Your draft is still visible. Download a backup now.')}};
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('download').onclick=()=>download('gravity-action-plan-backup.json',JSON.stringify(snapshot(),null,2),'application/json');
$('text-export').onclick=()=>{const lines=state.plan.steps.map((step,i)=>`${i+1}. ${step.timing}\n${step.action}`).join('\n\n');download('gravity-action-plan.txt',`DRAFT — Check against your restaurant’s approved procedures before using.\n\n${state.plan.title}\nPerson leading this: ${state.input.owner}\n\n${lines}\n`,'text/plain;charset=utf-8')};
$('print').onclick=()=>window.print();

function validateBackup(raw){
 if(!raw||raw.version!==1||!['ai','template'].includes(raw.mode))throw Error('Unsupported backup.');
 const input=validateInput(raw.input),plan=validatePlan(raw.plan);
 if(typeof raw.reviewed!=='boolean'||typeof raw.notes!=='string'||raw.notes.length>5000||!['pending','Keep','Change','Retire','Expand'].includes(raw.decision))throw Error('Invalid review record.');
 if(!Array.isArray(raw.checked)||raw.checked.length>10||raw.checked.some(v=>typeof v!=='boolean'))throw Error('Invalid checklist record.');
 if(!Array.isArray(raw.handoff)||raw.handoff.length<1||raw.handoff.length>10)throw Error('Invalid handoff.');
 for(const item of raw.handoff)for(const key of ['issue','control','owner','due','evidence'])if(typeof item[key]!=='string'||item[key].length>5000)throw Error('Invalid handoff item.');
 return {...raw,input,plan};
}
function load(raw){const next=validateBackup(raw);state=next;for(const [key,value] of Object.entries(state.input))if($(key))$(key).value=value;$('pace').onchange();showQuestion(questionSteps.length-1,false);render();status('Plan restored. Check dates and current procedures before using it. No cloud records were changed.')}
$('load').onclick=()=>{try{const raw=localStorage.getItem(KEY);if(!raw){status('No saved plan was found on this browser profile.');return}load(JSON.parse(raw))}catch{status('Saved plan could not be loaded. The current draft is unchanged. Restore a valid backup.')}};
$('restore').onchange=async()=>{try{const file=$('restore').files[0];if(!file)return;if(file.size>200000)throw Error('Backup too large.');load(JSON.parse(await file.text()))}catch(e){status('Could not restore backup: '+e.message+' Current draft unchanged.')}finally{$('restore').value=''}};
$('clear').onclick=()=>{if(!confirm('Clear the saved plan and this workspace? Download a backup first if you need to keep it.'))return;try{localStorage.removeItem(KEY)}catch{status('Could not clear device storage. Current workspace kept.');return}state=null;$('plan-document').replaceChildren();$('result').hidden=true;$('empty').hidden=false;status('Saved plan and working output cleared. Problem inputs remain available.')};
