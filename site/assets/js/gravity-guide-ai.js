(()=>{
'use strict';
const FORM='#gravity-guide-form', MSG='#gravity-guide-messages', ROOT='#gravity-guide-root';
const VKEY='gravity_voice_name_v1', ONKEY='gravity_voice_enabled_v2';
let audioCtx=null,sourceNode=null,history=[],speechToken=0,resolveSpeech=null;
const getVoice=()=>localStorage.getItem(VKEY)||'cedar';
const voiceOn=()=>localStorage.getItem(ONKEY)!=='off';
const voiceLabel=v=>v==='marin'?'Marin':'Cedar';

function cleanText(text){return String(text||'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1')}
function add(role,text,actions=[]){
  const box=document.querySelector(MSG);if(!box)return null;
  const n=document.createElement('div');n.className='gg-message '+role;
  const p=document.createElement('p');p.textContent=cleanText(text);n.appendChild(p);
  if(actions.length){
    const d=document.createElement('div');d.className='gg-actions';d.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px';
    actions.forEach((a,i)=>{
      const x=document.createElement('a');x.href=a.url;x.textContent=cleanText(a.label);x.className='gg-action-link'+(i===0?' primary':'');
      x.style.cssText=i===0?'display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 14px;border-radius:999px;background:#d0a25b;color:#102832;font-weight:850;text-decoration:none;border:1px solid #d0a25b':'display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 14px;border-radius:999px;background:transparent;color:inherit;font-weight:800;text-decoration:none;border:1px solid currentColor';
      d.appendChild(x);
    });
    n.appendChild(d);
  }
  box.appendChild(n);const body=n.closest('.gg-body');requestAnimationFrame(()=>{if(body)body.scrollTop=body.scrollHeight});return n;
}
const direct=[
  [/employee.*(phone|code|pin|access)|(?:phone|code|pin).*employee/i,'Open Employee Access','/e'],
  [/work[ -]?study|task[ -]?timing|motion[ -]?study|bottleneck|time[ -]?study/i,'Open Gravity Work Study Lab','/gravity-work-study-lab'],
  [/sop|procedure|poster|training/i,'Open Gravity SOP Foundry','/gravity-sop-foundry'],
  [/schedule|scheduling|labor|coverage|shift[ -]?lab/i,'Open Gravity Shift Lab','/gravity-shift-lab'],
  [/inventory|barcode|reorder|receiv/i,'Open Gravity Inventory Center','/gravity-inventory-center'],
  [/recipe|ingredient|recipe[ -]?works/i,'Open Gravity Recipe Works','/gravity-recipe-works'],
  [/numbers?[ -]?lab|calculator|calculation|food[ -]?cost|pricing|yield/i,'Open Gravity Numbers Lab','/gravity-numbers-lab'],
  [/quick[ -]?tools|qr[ -]?code|conversion|label maker|recipe scaling/i,'Open Gravity Quick Tools','/gravity-quick-tools'],
  [/document[ -]?studio|build.*document|policy|form library/i,'Open Gravity Document Studio','/gravity-document-studio'],
  [/forms?[ -]?personalizer|personalize.*form|sign/i,'Open Gravity Forms Personalizer','/gravity-forms-personalizer'],
  [/gravity[ -]?aware|needs attention|assessment/i,'Open Gravity Aware','/gravity-aware'],
  [/gravity[ -]?assist|work room|self-service/i,'Open Gravity Assist','/gravity-assist'],
  [/sop[ -]?library|volume 1|volume 2|volume 3/i,'Open the Gravity SOP Library','/gravity-sop-library-set'],
  [/book reader|read.*book|digital book/i,'Open Gravity Book Reader','/book-reader'],
  [/books|workbooks/i,'Open Books','/books'],
  [/resource center|customer resources|downloads?/i,'Open the Resource Center','/customer-resources'],
  [/start here|where.*start|getting started/i,'Open Start Here','/start-here'],
  [/help center|knowledge center|support/i,'Open Help','/help']
];
function navIntent(text){return /\b(take me|go to|open|show me|send me|bring me|direct me|link me|where is|where can i|how do i get|navigate)\b/i.test(String(text||''))}
function normalizeUrl(url){const s=String(url||'').trim();if(!s)return'';return s.replace(/^https?:\/\/(?:www\.)?thomasmonroebooks\.com/i,'')||'/'}
function words(text){return String(text||'').toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2)}
function actions(q,answer=''){
  const combined=(String(q||'')+' '+cleanText(answer)).trim();
  const d=direct.find(([pattern])=>pattern.test(combined));if(d)return[{label:d[1],url:d[2]}];
  const db=window.__GRAVITY_GUIDE_REGISTRY__,qw=words(q),aw=words(answer),sc=[];
  (db?.resources||[]).forEach(r=>{
    if(!r.public_recommend||r.status!=='live'||!r.url)return;
    const name=String(r.name||'').toLowerCase(),hay=(r.name+' '+(r.purpose||'')+' '+(r.keywords||[]).join(' ')+' '+(r.aliases||[]).join(' ')).toLowerCase();let s=0;
    qw.forEach(x=>{if(name.includes(x))s+=5;else if(hay.includes(x))s+=2});
    aw.forEach(x=>{if(name.includes(x))s+=4;else if(hay.includes(x))s+=1});
    if(String(answer||'').toLowerCase().includes(name)&&name.length>4)s+=20;
    if(String(q||'').toLowerCase().includes(name)&&name.length>4)s+=25;
    if(s)sc.push([s,r]);
  });
  sc.sort((a,b)=>b[0]-a[0]);let picked=sc.filter(([s])=>s>=4).slice(0,navIntent(q)?2:1);if(navIntent(q)&&!picked.length&&sc.length)picked=sc.slice(0,1);
  return picked.map(([,r],i)=>({label:(i?'Also consider ':'Open ')+r.name,url:normalizeUrl(r.url)}));
}
async function hash(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function voiceStatus(text){const el=document.getElementById('gravity-guide-voice-status');if(el)el.textContent=text;}
function unlockNeuralAudio(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;try{if(!audioCtx)audioCtx=new C();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return true}catch(_){return false}}
function stopNeuralAudio(){speechToken++;if(resolveSpeech){resolveSpeech();resolveSpeech=null}if(sourceNode){try{sourceNode.onended=null;sourceNode.stop(0)}catch(_){}try{sourceNode.disconnect()}catch(_){}sourceNode=null}}
async function playNeuralBlob(blob,voice,token){if(token!==speechToken)return;if(!unlockNeuralAudio())throw new Error('Web Audio is unavailable');if(audioCtx.state==='suspended')await audioCtx.resume();const raw=await blob.arrayBuffer();const buffer=await audioCtx.decodeAudioData(raw.slice(0));if(token!==speechToken)return;return new Promise((resolve,reject)=>{try{resolveSpeech=resolve;const s=audioCtx.createBufferSource();sourceNode=s;s.buffer=buffer;s.connect(audioCtx.destination);s.onended=()=>{if(sourceNode===s)sourceNode=null;resolveSpeech=null;resolve()};s.start(0);voiceStatus(voiceLabel(voice)+' neural voice')}catch(e){reject(e)}})}
async function speechBlob(part,voice,token,preload=false){
 const key=await hash(voice+'|.98|'+part);
 if(token!==speechToken&&!preload)return null;
 const request=new Request(location.origin+'/__gravity_voice_cache__/'+key+'.mp3');
 let cache=null,blob=null;
 try{if('caches'in window){cache=await caches.open('gravity-neural-voice-v2');const hit=await cache.match(request);if(hit)blob=await hit.blob()}}catch(_){cache=null}
 if(!blob){
  const r=await fetch('/.netlify/functions/gravity-tts',{method:'POST',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json'},body:JSON.stringify({text:part,voice,speed:.98})});
  if(!r.ok)throw new Error('TTS HTTP '+r.status);
  if(!(r.headers.get('content-type')||'').toLowerCase().includes('audio'))throw new Error('Invalid audio response');
  blob=await r.blob();
  if(cache){const saving=cache.put(request,new Response(blob,{headers:{'Content-Type':'audio/mpeg'}})).catch(()=>{});if(preload)await saving;}
 }
 return token===speechToken||preload?blob:null;
}
function speechParts(text){
 let rest=cleanText(text).replace(/\s+/g,' ').trim().slice(0,2800),out=[];
 while(rest){
  const limit=out.length?600:210;
  if(rest.length<=limit){out.push(rest);break}
  let cut=rest.lastIndexOf('. ',limit);
  if(cut<limit*.45)cut=rest.lastIndexOf(' ',limit);
  if(cut<limit*.45)cut=limit;
  else if(rest.slice(cut,cut+2)==='. ')cut++;
  out.push(rest.slice(0,cut).trim());rest=rest.slice(cut).trim();
 }
 return out.filter(Boolean);
}
async function speak(text,force=false){
 if((!force&&!voiceOn())||!text)return;
 stopNeuralAudio();
 const token=speechToken,voice=getVoice(),parts=speechParts(text);
 if(!parts.length)return;
 voiceStatus('Preparing '+voiceLabel(voice)+'…');
 try{
  let current=speechBlob(parts[0],voice,token);
  let next=parts.length>1?speechBlob(parts[1],voice,token):null;
  // The guide answer often arrives before 2.2s, so an AI-wait acknowledgment
  // never plays. Fill *audio-generation* silence with the cached Cedar phrase.
  let firstReady=false,ackStarted=false;
  const acknowledgmentTimer=setTimeout(async ()=>{
   if(firstReady||token!==speechToken||!voiceOn()||!ackWarmPromise)return;
   const cue=await ackWarmPromise;
   if(!cue||firstReady||token!==speechToken)return;
   ackStarted=true;
   playNeuralBlob(cue,voice,token).catch(()=>{});
  },1300);
  try{
  for(let i=0;i<parts.length;i++){
   if(i===0){
    // Speech playback takes precedence over any introductory cue.
    current=current.then(blob=>{
     firstReady=true;clearTimeout(acknowledgmentTimer);
     if(ackStarted&&sourceNode){
      try{sourceNode.onended=null;sourceNode.stop(0);sourceNode.disconnect()}catch(_){}
      sourceNode=null;resolveSpeech=null;
     }
     return blob;
    });
   }
   const blob=await current;
   if(token!==speechToken)return;
   if(!blob)throw new Error('Audio interrupted');
   const following=i+2<parts.length?speechBlob(parts[i+2],voice,token):null;
   await playNeuralBlob(blob,voice,token);
   if(token!==speechToken)return;
   current=next;next=following;
  }
  }finally{clearTimeout(acknowledgmentTimer)}
 }catch(e){if(token!==speechToken)return;console.warn('Gravity neural voice unavailable',e);voiceStatus(voiceLabel(voice)+' neural voice unavailable')}
}
function localFallback(q){if(/employee.*(phone|code|pin|access)|(?:phone|code|pin).*employee/i.test(q))return 'Hosted employee access is live. Open your restaurant link at /e/CODE, or open Employee Access and enter your restaurant code and employee PIN. Ask your manager for those details. Managers publish the employee library; their working copy remains local.';if(/schedule|labor|coverage/i.test(q))return 'Start with Gravity Shift Lab for schedule building, availability, coverage, planned labor and safer shift validation. It supports explicit OFF and overnight shifts and blocks ambiguous or invalid time ranges. If you only need a calculation, use Gravity Numbers Lab.';if(/sop|procedure|poster|training/i.test(q))return 'Start with Gravity SOP Foundry. It works from the controlled 525-SOP library, separates working and published copies, supports training and editable posters, and keeps retraining decisions with the manager.';if(/inventory|barcode|reorder|receiv/i.test(q))return 'Start with Gravity Inventory Center. Use the guided Profile → Locations → Items → Starting Stock → Daily Changes → Count & Verify → Reorder → Review & Backup process, with barcode choices and backup controls.';if(/book|read/i.test(q))return 'Open Gravity Book Reader to read current digital Gravity books aloud. Founding Year registration is required for the substantive book content.';return 'I could not reach the AI service. You can still use Start Here, Gravity Assist, Books, the SOP Library, or the Help Center.'}
// Short, varied acknowledgments for requests that are still processing.
// Reuse the same Cedar audio cache; never assert that a lookup has finished.
const ACKNOWLEDGMENTS=[
 'Hold on. Let me check.',
 'Just a second. I will check.',
 'I will work on that now.',
 'Okay, yes. I will find out.',
 'I am getting your answer as we speak.',
 'Let me look into that.',
 'I will take a look.',
 'Let me work through that.',
 'Let me see what I can find.',
 'One moment while I look into it.'
];
let recentAck=[],askSequence=0,preparedAck='',ackWarmPromise=null;
function warmAcknowledgment(){
 if(!voiceOn()||ackWarmPromise)return;
 preparedAck=ACKNOWLEDGMENTS[Math.floor(Math.random()*ACKNOWLEDGMENTS.length)];
 // Prepare one small Cedar clip while the user reads or composes a question.
 // No audible playback until a request genuinely needs an acknowledgment.
 ackWarmPromise=speechBlob(preparedAck,getVoice(),speechToken,true).catch(()=>null);
}

function nextAcknowledgment(){
 const candidates=ACKNOWLEDGMENTS.filter(x=>!recentAck.includes(x));
 if(preparedAck&&candidates.includes(preparedAck)){const chosen=preparedAck;preparedAck='';recentAck.push(chosen);if(recentAck.length>5)recentAck.shift();return chosen;}
 const pool=candidates.length?candidates:ACKNOWLEDGMENTS;
 const chosen=pool[Math.floor(Math.random()*pool.length)];
 recentAck.push(chosen);if(recentAck.length>5)recentAck.shift();
 return chosen;
}
async function ask(q){
 q=String(q||'').trim();if(!q)return;
 const turn=++askSequence;
 stopNeuralAudio();
 add('user',q);history.push('Visitor: '+q);
 const t=add('guide','Thinking…');
 let pending=true;
 const timer=setTimeout(()=>{
  if(!pending||turn!==askSequence||!voiceOn())return;
  // This is an optional conversational cue, not proof a lookup is complete.
  const phrase=nextAcknowledgment();
  if(ackWarmPromise){ackWarmPromise.then(()=>{if(pending&&turn===askSequence)speak(phrase)});}
  else speak(phrase);
 },2200);
 try{
  const r=await fetch('/.netlify/functions/gravity-guide',{method:'POST',signal:AbortSignal.timeout(25000),headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,page:location.pathname,history:history.slice(-6)})});
  if(!r.ok)throw new Error('guide');
  const j=await r.json(),ans=String(j.answer||'').trim();
  if(!ans)throw new Error('Empty guide response');
  if(turn!==askSequence)return;
  t.remove();add('guide',ans,actions(q,ans));history.push('Gravity Guide: '+ans);
  history=history.slice(-8);speak(ans);
 }catch(e){
  if(turn!==askSequence)return;
  const ans='The AI service is unavailable. This is saved guidance: '+localFallback(q);
  t.remove();add('guide',ans,actions(q,ans));history.push('Gravity Guide: '+ans);speak(ans);
 }finally{pending=false;clearTimeout(timer)}
}
function setup(){const form=document.querySelector(FORM),root=document.querySelector(ROOT);if(!form||!root)return;if(localStorage.getItem(ONKEY)===null)localStorage.setItem(ONKEY,'on');setTimeout(warmAcknowledgment,400);const footer=root.querySelector('.gg-footer');if(footer&&!document.getElementById('gravity-guide-voice')){const wrap=document.createElement('span');wrap.className='gg-voice-tools';wrap.innerHTML='<label class="gg-sr-only" for="gravity-guide-voice">Gravity voice</label><select id="gravity-guide-voice" title="AI-generated neural voice"><option value="cedar">Cedar</option><option value="marin">Marin</option></select><button type="button" class="gg-text-btn" id="gravity-guide-voice-test">Test voice</button><button type="button" class="gg-text-btn" id="gravity-guide-voice-toggle"></button><small id="gravity-guide-voice-status">Neural voice ready</small>';footer.firstElementChild?.replaceWith(wrap);const sel=wrap.querySelector('#gravity-guide-voice'),test=wrap.querySelector('#gravity-guide-voice-test'),btn=wrap.querySelector('#gravity-guide-voice-toggle');sel.value=getVoice();sel.onchange=()=>{stopNeuralAudio();localStorage.setItem(VKEY,sel.value);voiceStatus(voiceLabel(sel.value)+' selected')};const paint=()=>btn.textContent=voiceOn()?'Voice: On':'Voice: Off';paint();btn.onclick=()=>{unlockNeuralAudio();localStorage.setItem(ONKEY,voiceOn()?'off':'on');if(!voiceOn())stopNeuralAudio();paint();voiceStatus(voiceOn()?'Neural voice ready':'Voice off')};test.onclick=()=>{unlockNeuralAudio();speak('This is the Gravity Guide natural neural voice.',true)}}form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();unlockNeuralAudio();const inp=form.querySelector('input[name="question"]')||form.querySelector('input');const q=inp?.value||'';if(inp)inp.value='';document.querySelector('#gravity-guide-starters')?.setAttribute('hidden','');ask(q)},true);root.addEventListener('click',e=>{const b=e.target.closest('[data-gg-question]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();unlockNeuralAudio();document.querySelector('#gravity-guide-starters')?.setAttribute('hidden','');ask(b.dataset.ggQuestion||b.textContent)},true);root.querySelector('#gravity-guide-reset')?.addEventListener('click',()=>{askSequence++;history=[];stopNeuralAudio()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();