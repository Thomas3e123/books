import {applyHelp,setHelp,actionHelp} from './help.mjs';
import {finishWithExamples} from './finish.mjs';
import {interviewLevels,included,businessTopics} from './levels.mjs';
import {styleFonts,styleRoles,styleFromPalette,normalizeStyle,contrast} from './styles.mjs';
import {uuid,VERSION,sections,questions,palettes,fresh,validate,setAnswer,skip,restore,stats,proof} from './core.mjs';
import {groupsForLevel,groupForCursor} from './groups.mjs';
import {createPDF,createWord} from './export.mjs';
const $=id=>document.getElementById(id);let pendingWrites=0;let db,project,mode='interview',queue=Promise.resolve(),lastPDF,conflict=false;const tabId=uuid();const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('gravity-handbook-private'):null;
function notice(t){$('message').textContent=t;}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function button(text,fn,cls=''){const b=el('button',text,cls);setHelp(b,actionHelp[text]);b.onclick=async()=>{try{await fn();}catch(e){notice(e.message||'The action could not be completed.');}};return b;}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function openDB(){db=await new Promise((res,rej)=>{const r=indexedDB.open('gravity.handbook.private.v2',1);r.onupgradeneeded=()=>{r.result.createObjectStore('projects',{keyPath:'projectId'});r.result.createObjectStore('recovery',{keyPath:'projectId'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function list(){return request(db.transaction('projects').objectStore('projects').getAll());}
function save(){
 if(conflict){notice('This project changed in another window. Download a backup of your current work, then reload before continuing.');return Promise.reject(Error('Save paused to prevent overwriting another window.'));}
 pendingWrites++;
 const snapshot=structuredClone(project);
 snapshot.updatedAt=new Date().toISOString();
 $('saved').textContent='Saving…';
 queue=queue.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{
  let settled=false,tx;
  function finish(error){
   if(settled)return;
   settled=true;
   pendingWrites=Math.max(0,pendingWrites-1);
   if(error){
    notice('Could not save on this device. Download a project backup now. '+(error.message||''));
    $('saved').textContent='NOT SAVED — download a backup';
    reject(error);
   }else resolve();
  }
  try{
   tx=db.transaction(['projects','recovery'],'readwrite');
   const store=tx.objectStore('projects');
   const r=store.get(snapshot.projectId);
   r.onsuccess=()=>{if(r.result)tx.objectStore('recovery').put(r.result);store.put(snapshot);};
   tx.oncomplete=()=>{
    // IndexedDB has committed the project. The optional last-selected project
    // hint must not leave that successful save permanently pending.
    let selectionSaved=true;
    try{localStorage.setItem('gravity.handbook.active',snapshot.projectId);}
    catch(e){selectionSaved=false;console.warn('Handbook recent-project preference unavailable.',e);}
    $('saved').textContent=selectionSaved
      ?'Saved on this device · '+new Date().toLocaleTimeString()
      :'Saved on this device · recent project selection not remembered';
    try{channel?.postMessage({id:snapshot.projectId,tabId});}
    catch(e){console.warn('Handbook cross-tab notification unavailable.',e);}
    finish();
   };
   tx.onerror=()=>finish(tx.error||Error('Handbook storage transaction failed'));
   tx.onabort=()=>finish(tx.error||Error('Handbook storage transaction aborted'));
  }catch(e){finish(e);}
 }));
 return queue;
}
channel&&(channel.onmessage=e=>{if(e.data.tabId!==tabId&&e.data.id===project?.projectId){conflict=true;notice('This handbook changed in another window. Back up current work and reload before editing further.');}});
function download(blob,name){const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download=name;a.textContent='Save '+name;notice('Your file is ready. If the download did not start, use this link: ');$('message').append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);if(a.isConnected)a.replaceWith(document.createTextNode('Link expired. Generate the file again if needed.'));},300000);}
function filename(ext){return (project.answers['welcome.name']||'Employee-Handbook').replace(/[^a-z0-9_-]/gi,'-').slice(0,70)+'.'+ext;}
async function refreshProjects(){const all=await list();$('projects').replaceChildren(...all.map(p=>{const o=el('option',p.title||'Untitled handbook');o.value=p.projectId;return o;}));$('projects').value=project.projectId;}
function businessFit(root){
 const panel=el('details');panel.open=(project.cursor===0||mode==='review')&&Object.keys(businessTopics).some(key=>!project.applicability?.[key]||project.applicability[key]==='unknown');
 panel.append(el('summary','Business fit — choose the topics your handbook needs'),el('p','These answers select interview topics; they do not write policies. Not sure keeps the topic visible. Changing a choice never removes saved handbook wording. Full always shows every question.'));
 for(const [key,topic]of Object.entries(businessTopics)){
  const label=el('label',topic.label);const select=el('select');select.id='fit-'+key;label.htmlFor=select.id;
  for(const [value,text]of [['unknown','Not sure — include for review'],['yes','Yes — include'],['no','No — does not apply']]){const option=el('option',text);option.value=value;select.append(option);}
  select.value=project.applicability?.[key]||'unknown';select.onchange=async()=>{project.applicability={...project.applicability,[key]:select.value};project.cursor=groupForCursor(project.cursor,project.interviewLevel,project.applicability).start;await save();render();notice('Business fit saved. Existing handbook wording is unchanged.');};
  panel.append(label,select,el('p',topic.description,'muted'));
 }
 if(project.applicability?.specialty==='yes'){
  panel.append(el('p','Select each specialized topic that applies. Until you select at least one, all specialty topics remain available for review.'));
  for(const q of questions.filter(q=>businessTopics.specialty.matches(q.id))){
   const label=el('label',undefined,'style-check');const box=el('input');box.type='checkbox';box.checked=project.applicability.specialties?.includes(q.id)||false;
   box.onchange=async()=>{const selected=new Set(project.applicability.specialties||[]);box.checked?selected.add(q.id):selected.delete(q.id);project.applicability.specialties=[...selected];project.cursor=groupForCursor(project.cursor,project.interviewLevel,project.applicability).start;await save();render();};label.append(box,document.createTextNode(q.label));panel.append(label);
  }
  panel.open=project.cursor===0||mode==='review';
 }root.append(panel);
}
function nav(){
 const active=questions.filter(q=>included(q,project.interviewLevel,project.applicability));const answered=active.filter(q=>project.answers[q.id]?.trim()&&!project.skips[q.id]).length;const later=active.filter(q=>project.skips[q.id]==='later').length;const excluded=active.filter(q=>project.skips[q.id]==='excluded').length;
 $('progress').replaceChildren(el('strong',`${answered} answered · ${later} for later · ${excluded} excluded`),el('p',`${interviewLevels[project.interviewLevel].name} interview · ${active.length} questions`,'muted'));const progress=el('progress');progress.max=active.length;progress.value=answered+excluded;$('progress').append(progress);
 for(const option of $('level').options)option.textContent=interviewLevels[option.value].name+' — '+questions.filter(q=>included(q,option.value,project.applicability)).length+' questions';$('level').value=project.interviewLevel;$('levelDescription').textContent=interviewLevels[project.interviewLevel].description;
 $('nav').replaceChildren(...sections.flatMap((s,i)=>{const first=s.questions.find(q=>included(q,project.interviewLevel,project.applicability));return first?[button(`${String(i+1).padStart(2,'0')}  ${s.title}`,async()=>{project.cursor=questions.indexOf(first);mode='interview';await save();render();window.scrollTo({top:0,behavior:'instant'});},s.questions.includes(questions[project.cursor])?'active':'')]:[];}));
}

function render(){nav();const root=$('main');root.replaceChildren();if(mode==='interview')interview(root);if(mode==='review')review(root);if(mode==='design')design(root);if(mode==='preview'||mode==='previewOnly'){preview(root,mode==='previewOnly');window.scrollTo({top:0,left:0,behavior:'instant'});}applyHelp();}
async function moveGroup(delta,confirmed=false){
 const group=groupForCursor(project.cursor,project.interviewLevel,project.applicability);
 if(delta>0){
  const unfinished=group.questions.filter(q=>project.skips[q.id]||!String(project.answers[q.id]||'').trim());
  if(unfinished.length&&!confirmed){
   document.getElementById('incomplete-set-warning')?.remove();
   const warning=el('section',undefined,'card notice');warning.id='incomplete-set-warning';warning.tabIndex=-1;warning.setAttribute('role','alert');
   warning.append(el('h2','This set has unanswered or skipped questions'),el('p','Review these questions before continuing. You can return and answer them, or choose to continue anyway.'));
   const items=el('ul');for(const q of unfinished)items.append(el('li',q.label));warning.append(items);
   warning.append(button('Return to questions',()=>{warning.remove();const card=$('question-'+unfinished[0].id);card?.focus();card?.scrollIntoView({block:'start'});},'light'),button('Continue anyway',()=>moveGroup(delta,true)));
   $('main').prepend(warning);warning.focus();warning.scrollIntoView({block:'start'});return;
  }
 }
 const interviewGroups=groupsForLevel(project.interviewLevel,project.applicability);const position=interviewGroups.indexOf(group);const target=interviewGroups[position+delta];
 if(target)project.cursor=target.start;else if(delta>0)mode='review';
 await save();render();$('main').scrollIntoView({block:'start'});
}
function interview(root){businessFit(root);
 const group=groupForCursor(project.cursor,project.interviewLevel,project.applicability),section=group.section;
 root.append(el('div',`${section.title} · Questions ${group.offset+1}–${group.offset+group.questions.length} of ${section.questions.length}`,'eyebrow'),el('h1',group.start===0?'Let’s make it yours.':section.title),el('p','Work through these questions together. Your answers save automatically. Saving or skipping moves you to the next question. Save & continue moves to the next set.'));
 for(const q of group.questions)questionCard(root,q,q===group.questions.at(-1));
 const actions=el('div',undefined,'question-foot');const prev=button('← Previous set',()=>moveGroup(-1),'light');prev.disabled=group.start===0;
 actions.append(prev);root.append(actions,button(section.id==='welcome'?'See my first section':'Preview handbook so far',async()=>{await save();mode='previewOnly';render();},'light'));
 const browse=el('details');browse.append(el('summary','Find another question in this section'));for(const item of section.questions)browse.append(button(item.label,async()=>{project.cursor=questions.indexOf(item);await save();render();document.getElementById('answer-'+item.id)?.focus();},'light'));root.append(browse);
}
function advanceQuestion(q){
 const group=groupForCursor(project.cursor,project.interviewLevel,project.applicability);const next=group.questions[group.questions.indexOf(q)+1];
 if(next){const card=$('question-'+next.id);card?.focus({preventScroll:true});card?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 else{$('save-'+q.id)?.focus({preventScroll:true});notice('Choice saved. Select Save & continue when you are ready for the next set.');}
}
function questionCard(root,q,isLast){
 const usesExample=()=>q.type!=='image'&&!project.skips[q.id]&&!String(project.answers[q.id]||'').trim();
 const saveLabel=()=>usesExample()?(isLast?'Use example, save & continue →':'Use example & save'):(isLast?'Save & continue →':'Save');
 let primarySave,replaceExample;
 const updateActions=()=>{if(primarySave){primarySave.textContent=saveLabel();setHelp(primarySave,actionHelp[saveLabel()]);}if(replaceExample){const current=String(project.answers[q.id]||'').trim();replaceExample.hidden=!current||current===q.example.replace(/^Example: /,'').trim();}};
const card=el('section',undefined,'card question-card');card.id='question-'+q.id;card.tabIndex=-1;card.append(el('h2',q.label));card.append(el('div','All questions are optional. Your wording becomes the handbook text.','muted'));if(q.legalReview)card.append(el('p','Jurisdiction-sensitive topic: this answer needs qualified legal review before employee use.','notice'));
 if(project.skips[q.id])card.append(el('p',project.skips[q.id]==='later'?'Saved for later.':'Excluded from the handbook.'),button('Restore this question',async()=>{restore(project,q.id);await save();render();},'light'));
 const label=el('label',q.id==='welcome.name'?'Restaurant or company name':`Your ${q.label.toLowerCase()} wording`);label.htmlFor='answer-'+q.id;card.append(label);
 if(q.type==='image'){const input=el('input');input.id='answer-'+q.id;input.type='file';input.accept='image/png,image/jpeg,image/webp';input.onchange=async()=>{try{const f=input.files[0];if(!f)return;if(f.size>4e6)throw Error('Choose a logo smaller than 4 MB.');if(!['image/png','image/jpeg','image/webp'].includes(f.type))throw Error('Use PNG, JPG, or WebP.');const bitmap=await createImageBitmap(f);if(bitmap.width*bitmap.height>20000000)throw Error('Logo dimensions are too large.');const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();setAnswer(project,q.id,canvas.toDataURL('image/png'));await save();render();}catch(e){notice('Logo could not be added: '+e.message);}};card.append(input);if(project.answers[q.id]){const img=el('img',undefined,'logo-preview');img.src=project.answers[q.id];img.alt='Restaurant logo';card.append(img,button('Remove logo',async()=>{setAnswer(project,q.id,'');await save();render();},'light'));}}
 else{const input=el(q.id==='welcome.name'?'input':'textarea');input.id='answer-'+q.id;input.spellcheck=true;input.lang='en-US';input.maxLength=q.id==='welcome.name'?140:20000;input.placeholder=q.example.replace(/^Example: /,'');input.value=project.answers[q.id]||'';input.oninput=()=>{setAnswer(project,q.id,input.value);updateActions();save().catch(()=>{});nav();};card.append(input);const done=button('Done typing',()=>{input.blur();primarySave?.scrollIntoView({block:'center',behavior:'smooth'});},'light');card.append(done);}
 const ex=el('div',undefined,'example');ex.append(el('strong','Example — optional starting point'),el('p',q.example.replace(/^Example: /,'')));const exampleActions=el('div',undefined,'row example-actions');if(q.type!=='image'){replaceExample=button('Replace with example',async()=>{const example=q.example.replace(/^Example: /,'');const current=project.answers[q.id]||'';if(current.trim()&&current.trim()!==example.trim()&&!confirm('Replace the wording currently in this answer box with the example? Your previous wording will remain in change history.'))return;setAnswer(project,q.id,example);await save();render();},'light');exampleActions.append(replaceExample);}primarySave=button(saveLabel(),async()=>{
 const adopted=usesExample();
 if(adopted){setAnswer(project,q.id,q.example.replace(/^Example: /,''));await save();render();}
 if(isLast){await moveGroup(1);}else{if(!adopted)await save();notice(adopted?'Example saved as your answer. You can edit it at any time.':'Saved.');advanceQuestion(q);}
 });primarySave.id='save-'+q.id;exampleActions.append(primarySave);updateActions();ex.append(exampleActions);card.append(ex);
 const controls=el('div',undefined,'row');for(const [name,state]of [['Skip for Now','later'],['Skip Altogether','excluded']])controls.append(button(name,async()=>{skip(project,q.id,state);await save();render();advanceQuestion(q);},'light'));card.append(controls);root.append(card);

}
function questionLink(q,label='Answer Now'){return button(label,async()=>{if(!included(q,project.interviewLevel,project.applicability)){project.interviewLevel='full';notice('Opened the Full interview to show this question. Your saved answers are unchanged.');}project.cursor=questions.indexOf(q);mode='interview';await save();render();document.getElementById('answer-'+q.id)?.focus();},'light');}
function review(root){businessFit(root);root.append(el('div','OWNER REVIEW','eyebrow'),el('h1','Make every word yours.'),el('p','Your interview level controls which questions are asked. Saved answers from other levels remain in the handbook unless you exclude them. Confirm Business fit, then review any unanswered or excluded topics. Interview levels organize coverage; they do not establish legal completeness.'),el('p','Review the wording, revisit postponed questions, and check missing information before sharing a handbook. Exports remain drafts.'));
 if(!project.answers['welcome.locations']){const n=el('div',undefined,'notice');n.append(el('strong','Operating locations are missing.'),el('p','Enter every city and state where employees work. Applicable employment requirements cannot be assessed without this information.'),questionLink(questions.find(q=>q.id==='welcome.locations')));root.append(n);}
 root.append(el('p','No automated legal-compliance determination is made. Entering a location does not certify policies. Pay, leave, protected rights, youth employment, safety, and alcohol rules require appropriate review.','notice'));
 const proofCard=el('section',undefined,'card');proofCard.append(el('h2','Writing review'),el('p','Browser spellcheck is available while typing. This review suggests spacing and repeated-word corrections; it is not a full grammar or AI rewrite service. Every change requires your approval.'));let found=0;for(const q of questions){if(q.type==='image'||project.skips[q.id])continue;const original=project.answers[q.id]||'',suggested=proof(original);if(original===suggested)continue;found++;const r=el('div',undefined,'review-row');r.append(el('h3',q.label),el('p','Current: '+original),el('p','Suggestion: '+suggested),button('Accept correction',async()=>{if(project.answers[q.id]!==original)throw Error('The answer changed. Review it again.');setAnswer(project,q.id,suggested);await save();render();}),questionLink(q,'Edit myself'));proofCard.append(r);}if(!found)proofCard.append(el('p','No common spacing or repeated-word issues found. Read your complete preview for wording and punctuation.'));root.append(proofCard);
 const search=el('input');search.placeholder='Find a question by topic…';search.setAttribute('aria-label','Search all questions');const results=el('div',undefined,'search-results');search.oninput=()=>{const term=search.value.trim().toLowerCase();results.replaceChildren(...(term?questions.filter(q=>(q.label+' '+q.id).toLowerCase().includes(term)).map(q=>questionLink(q,q.label)):[]));};root.append(search,results);
 for(const [name,filter]of [['Postponed questions',q=>project.skips[q.id]==='later'],['Excluded questions — reversible',q=>project.skips[q.id]==='excluded'],['Unanswered questions in this interview',q=>included(q,project.interviewLevel,project.applicability)&&!project.answers[q.id]&&!project.skips[q.id]],['Topics marked for legal review',q=>q.legalReview&&!project.skips[q.id]&&project.answers[q.id]]]){const group=el('details');const items=questions.filter(filter);group.open=name==='Postponed questions';group.append(el('summary',`${name} (${items.length})`));for(const q of items){const row=el('div',undefined,'review-row');row.append(el('h3',sections.find(s=>s.questions.includes(q)).title+' — '+q.label),questionLink(q));if(project.skips[q.id]==='later')row.append(button('Keep for Later',()=>notice('Kept for later: '+q.label),'light'));if(project.skips[q.id])row.append(button('Restore',async()=>{restore(project,q.id);await save();render();},'light'));if(project.skips[q.id]!=='excluded')row.append(button('Skip Altogether',async()=>{skip(project,q.id,'excluded');await save();render();},'light'));group.append(row);}root.append(group);}
 const history=el('details');history.append(el('summary','Recent changes (up to 100)'));for(const h of [...project.revisions].reverse()){if(!h.id||h.id==='welcome.logo')continue;const row=el('div',undefined,'review-row');row.append(el('p',h.id+': '+String(h.oldValue||'(empty)')+' → '+String(h.newValue||'(empty)')),button('Restore previous wording',async()=>{setAnswer(project,h.id,String(h.oldValue||''));await save();render();},'light'));history.append(row);}root.append(history);
 if(project.legacy)root.append(el('p','Imported from the older prototype: check all transferred answers. Original source data is retained in your project backup.','notice'));
 root.append(button('Preview only',()=>{mode='previewOnly';render();},'light'),button('Preview & download',()=>{mode='preview';render();}));
}
function customDesign(card){
 project.customStyle=normalizeStyle(project.customStyle,styleFromPalette(palettes.executive));const st=project.customStyle;
 card.append(el('p','Choose your own fonts and colors. These choices apply to the handbook preview, PDF, and Word exports.'));
 const starter=el('select');starter.setAttribute('aria-label','Start custom style from template');for(const [id,p]of Object.entries(palettes)){const o=el('option',p.name);o.value=id;starter.append(o);}starter.value='executive';card.append(el('label','Start from a template'),starter,button('Apply template to custom style',async()=>{project.customStyle=styleFromPalette(palettes[starter.value]);await save();render();},'light'));
 const layout=el('div',undefined,'custom-design-grid'),controls=el('div'),sample=el('div',undefined,'custom-style-sample'),warnings=el('div',undefined,'style-warnings');warnings.setAttribute('aria-live','polite');
 const update=()=>{sample.replaceChildren();sample.style.background=st.background==='white'?'#ffffff':'#fffaf0';sample.style.border=st.borders?'3px double '+st.accent:'1px solid #d9ded7';
 for(const [role,words]of [['cover',project.answers['welcome.name']||'Your company'],['section','Welcome to our team'],['topic','Our shared standards'],['body','We work together with care, respect, and clear expectations. This is a design sample, not wording added to your handbook.'],['footer','Working draft • 1 / 12']]){const n=el(role==='body'?'p':'div',words,'style-sample-'+role);n.style.fontFamily=styleFonts[st[role].font].css;n.style.color=st[role].color;if(st[role].font==='script')n.style.fontWeight='normal';if(st.dividers&&['section','footer'].includes(role)){n.style.borderTop='1px solid '+st.accent;n.style.paddingTop='16px';}sample.append(n);}
 warnings.replaceChildren();const bg=st.background==='white'?'#ffffff':'#fffaf0';const low=Object.keys(styleRoles).filter(r=>contrast(st[r].color,bg)<4.5);if(low.length)warnings.append(el('p','Low contrast: '+low.map(r=>styleRoles[r]).join(', ')+'. Choose darker text for easier reading.','notice'));if(st.body.font==='script')warnings.append(el('p','Script body text can be harder to read in long policies. Classic Serif or Modern Sans is recommended.','notice'));
 };
 const change=()=>{update();save().catch(()=>{});};
 const background=el('select');background.setAttribute('aria-label','Page background');for(const [value,name]of [['cream','Cream'],['white','White']]){const o=el('option',name);o.value=value;background.append(o);}background.value=st.background;background.onchange=()=>{st.background=background.value;change();};controls.append(el('label','Page background'),background);
 for(const [role,name]of Object.entries(styleRoles)){const field=el('fieldset');field.append(el('legend',name));const font=el('select');font.setAttribute('aria-label',name+' font');for(const [id,f]of Object.entries(styleFonts)){const o=el('option',f.label);o.value=id;font.append(o);}font.value=st[role].font;font.onchange=()=>{st[role].font=font.value;change();};const color=el('input');color.type='color';color.value=st[role].color;color.setAttribute('aria-label',name+' color');color.oninput=()=>{st[role].color=color.value;change();};field.append(font,color);controls.append(field);}
 const decoration=el('fieldset');decoration.append(el('legend','Borders & divider lines'));const accent=el('input');accent.type='color';accent.value=st.accent;accent.setAttribute('aria-label','Borders and divider lines color');accent.oninput=()=>{st.accent=accent.value;change();};decoration.append(accent);for(const [key,title]of [['borders','Show page borders'],['dividers','Show divider lines']]){const label=el('label',undefined,'style-check');const box=el('input');box.type='checkbox';box.checked=st[key];box.onchange=()=>{st[key]=box.checked;change();};label.append(box,document.createTextNode(title));decoration.append(label);}controls.append(decoration);
 const preview=el('div');preview.append(el('h3','Live style sample'),sample,warnings);layout.append(controls,preview);card.append(layout);update();
}
function design(root){root.append(el('div','DOCUMENT DESIGN','eyebrow'),el('h1','Use a template or create your own design'));const card=el('section',undefined,'card');card.append(el('label','Handbook design'));const select=el('select');select.setAttribute('aria-label','Color palette');for(const [id,p]of Object.entries(palettes)){const o=el('option',p.name);o.value=id;select.append(o);}const customOption=el('option','Create your own style');customOption.value='custom';select.append(customOption);select.value=project.palette;select.onchange=async()=>{if(select.value==='custom'&&!project.customStyle)project.customStyle=styleFromPalette(palettes[project.palette]||palettes.executive);project.palette=select.value;await save();render();window.scrollTo({top:0,left:0,behavior:'instant'});};card.append(select);if(project.palette==='custom')customDesign(card);if(project.palette==='script'){const sample=el('div',undefined,'script-sample');sample.append(el('div','Welcome to our team','script-sample-title'),el('strong','Signature Script'),el('p','Red calligraphy, gold borders, and forest-green details on warm ivory. Clear body text keeps every policy easy to read.'));card.append(sample);}for(const [key,label]of [['label','Edition name'],['date','Effective date (optional)']]){const l=el('label',label);const input=el('input');input.maxLength=key==='label'?60:40;input.id='edition-'+key;l.htmlFor=input.id;input.value=project.edition[key]||'';input.placeholder=key==='label'?'Example: First edition':'Example: January 1, 2027';input.oninput=()=>{project.edition[key]=input.value;save().catch(()=>{});};card.append(l,input);}card.append(questionLink(questions.find(q=>q.id==='welcome.logo'),'Add or change logo'));root.append(card,button('Preview only',()=>{mode='previewOnly';render();},'light'),button('Preview & download',()=>{mode='preview';render();}));}
function preview(root,only=false){root.append(el('div','HANDBOOK PREVIEW','eyebrow'),el('h1',project.answers['welcome.name']||'Your handbook takes shape.'),el('p',only?'Review your handbook using the PDF page layout. To get a file, choose Preview & download.':'Review your handbook, then choose a PDF or editable Word download below.','preview-note'));
 const actions=el('div',undefined,'row');if(!only)actions.append(button('Download PDF',async()=>{await queue;download(createPDF(project).doc.output('blob'),filename('pdf'));}),button('Download editable Word',async()=>{await queue;download(await createWord(project),filename('docx'));}),button('Print-ready PDF',()=>{download(createPDF(project).doc.output('blob'),filename('pdf'));notice('Open the downloaded PDF and choose Print. Use Actual size for US Letter paper.');},'light'));actions.append(button('Return to interview',()=>{mode='interview';render();},'light'));root.append(actions);
 if(stats(project).answered===0)root.append(el('p','No owner wording has been entered yet. The cover and acknowledgment layout are shown; add your welcome wording to create your first section.','notice'));
 const {pages}=createPDF(project);const container=el('div',undefined,'pages');container.setAttribute('aria-label','Paginated PDF preview');for(const p of pages){const page=el('article',undefined,'paper');page.style.background=p.background;for(const i of p.items){let n;if(i.kind==='text'){n=el('span',i.text,'line');Object.assign(n.style,{left:i.x+'px',top:(i.y-i.size*.82)+'px',fontSize:i.size+'px',fontFamily:i.font==='script'?'HandbookScript,cursive':i.font==='book'?'HandbookBook,serif':'HandbookUI,sans-serif',fontWeight:i.style==='bold'?'bold':'normal',fontStyle:i.style==='italic'?'italic':'normal',color:i.color});}else if(i.kind==='frame'){n=el('div');Object.assign(n.style,{position:'absolute',left:i.x+'px',top:i.y+'px',width:i.width+'px',height:i.height+'px',border:'1px solid '+i.color});}else if(i.kind==='rule'){n=el('div',undefined,'rule');Object.assign(n.style,{left:i.x+'px',top:i.y+'px',width:i.width+'px',background:i.color});}else{n=el('img');n.alt='Restaurant logo';n.src=i.src;Object.assign(n.style,{left:i.x+'px',top:i.y+'px',width:i.width+'px',height:i.height+'px'});}page.append(n);}container.append(page);}root.append(container);
}
for(const [id,level]of Object.entries(interviewLevels)){const o=el('option',`${level.name} — ${questions.filter(q=>included(q,id)).length} questions`);o.value=id;$('level').append(o);}
$('finishExamples').onclick=async()=>{
 const button=$('finishExamples');button.disabled=true;
 try{
  if(conflict)throw Error('This handbook changed in another window. Reload before continuing.');
  const added=finishWithExamples(project);await save();mode='review';render();window.scrollTo({top:0,behavior:'instant'});
  notice(`${added.length} remaining answers filled with examples. Existing answers and skipped questions were kept unchanged. Review your handbook, then choose Preview & download.`);
 }catch(e){notice(e.message||'Could not finish the interview.');}finally{button.disabled=false;}
};
$('level').onchange=async()=>{try{project.interviewLevel=$('level').value;project.cursor=groupForCursor(project.cursor,project.interviewLevel,project.applicability).start;mode='interview';await save();render();window.scrollTo({top:0,behavior:'instant'});notice('Interview level changed. All saved answers and design choices are preserved.');}catch(e){notice(e.message);}};
function openGuide(){ $('guide').showModal();$('guide').scrollTop=0; }
$('savingInstructions').onclick=()=>{$('savingHelp').open=true;openGuide();};
$('help').onclick=openGuide;$('closeGuide').onclick=()=>$('guide').close();
$('backup').onclick=()=>download(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),filename('gravityhandbook'));
$('new').onclick=async()=>{try{await queue;project=fresh();conflict=false;await save();await refreshProjects();mode='interview';render();}catch(e){notice(e.message);}};
$('duplicate').onclick=async()=>{try{await queue;project=validate(structuredClone(project));project.projectId=uuid();project.title+=' — copy';conflict=false;await save();await refreshProjects();mode='interview';render();}catch(e){notice(e.message);}};
$('projects').onchange=async()=>{try{await queue;project=validate(await request(db.transaction('projects').objectStore('projects').get($('projects').value)));conflict=false;mode='interview';render();await save();}catch(e){notice(e.message);}};
$('restore').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>8e6)throw Error('This backup is larger than 8 MB.');const next=validate(JSON.parse(await f.text()));await queue;next.projectId=uuid();next.title+=' — restored';project=next;conflict=false;await save();await refreshProjects();mode='interview';render();notice('Backup opened as a separate project. Existing handbooks were preserved.');}catch(e){notice('Backup not opened: '+e.message);}finally{e.target.value='';}};
for(const name of ['review','design','previewOnly','preview'])$(name).onclick=async()=>{try{await queue;mode=name;render();if(name==='design')window.scrollTo({top:0,left:0,behavior:'instant'});await refreshProjects();}catch(e){notice(e.message);}};
window.addEventListener('beforeunload',e=>{if(pendingWrites){e.preventDefault();e.returnValue='';}});
window.addEventListener('error',e=>notice('Something went wrong. Your last saved project is retained. '+e.message));window.addEventListener('unhandledrejection',e=>notice('Action could not finish: '+(e.reason?.message||e.reason)));
(async()=>{
 try{
  await openDB();
  const all=await list();
  let active=null;
  try{active=localStorage.getItem('gravity.handbook.active');}
  catch(e){console.warn('Recent handbook selection unavailable; saved projects remain accessible.',e);}
  project=validate(all.find(p=>p.projectId===active)||all[0]||fresh());
  await save();await refreshProjects();render();
 }catch(e){
  notice('Local project storage could not open or save: '+e.message+'. Existing projects have not been cleared. Try a regular browser window with storage enabled.');
 }
})();

function updateKeyboardSpace(){const v=window.visualViewport;const inset=v?Math.max(0,window.innerHeight-v.height-v.offsetTop):0;document.documentElement.style.setProperty('--keyboard-space',inset+'px');}
window.visualViewport?.addEventListener('resize',updateKeyboardSpace);updateKeyboardSpace();
