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
async function speak(text,force=false){if((!force&&!voiceOn())||!text)return;stopNeuralAudio();const token=speechToken;const part=cleanText(text).slice(0,2800),voice=getVoice();voiceStatus('Generating '+voiceLabel(voice)+'…');try{const key=await hash(voice+'|.98|'+part),fake=new Request(location.origin+'/__gravity_voice_cache__/'+key+'.mp3');let blob=null,cache=null;if('caches'in window){try{cache=await caches.open('gravity-neural-voice-v2');const hit=await cache.match(fake);if(hit)blob=await hit.blob()}catch(_){cache=null}}if(!blob){const r=await fetch('/.netlify/functions/gravity-tts',{method:'POST',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json'},body:JSON.stringify({text:part,voice,speed:.98})});if(!r.ok){let detail='';try{detail=(await r.json()).error||''}catch(_){detail=await r.text().catch(()=>'')}throw new Error(detail||('TTS HTTP '+r.status))}const ct=(r.headers.get('content-type')||'').toLowerCase();if(!ct.includes('audio'))throw new Error('TTS did not return audio');blob=await r.blob();if(cache){try{await cache.put(fake,new Response(blob,{headers:{'Content-Type':'audio/mpeg'}}))}catch(_){}}}await playNeuralBlob(blob,voice,token)}catch(e){if(token!==speechToken)return;console.warn('Gravity neural voice unavailable:',e);voiceStatus(voiceLabel(voice)+' neural voice unavailable')}}
function localFallback(q){if(/employee.*(phone|code|pin|access)|(?:phone|code|pin).*employee/i.test(q))return 'Hosted employee access is live. Open your restaurant link at /e/CODE, or open Employee Access and enter your restaurant code and employee PIN. Ask your manager for those details. Managers publish the employee library; their working copy remains local.';if(/schedule|labor|coverage/i.test(q))return 'Start with Gravity Shift Lab for schedule building, availability, coverage, planned labor and safer shift validation. It supports explicit OFF and overnight shifts and blocks ambiguous or invalid time ranges. If you only need a calculation, use Gravity Numbers Lab.';if(/sop|procedure|poster|training/i.test(q))return 'Start with Gravity SOP Foundry. It works from the controlled 525-SOP library, separates working and published copies, supports training and editable posters, and keeps retraining decisions with the manager.';if(/inventory|barcode|reorder|receiv/i.test(q))return 'Start with Gravity Inventory Center. Use the guided Profile → Locations → Items → Starting Stock → Daily Changes → Count & Verify → Reorder → Review & Backup process, with barcode choices and backup controls.';if(/book|read/i.test(q))return 'Open Gravity Book Reader to read current digital Gravity books aloud. Founding Year registration is required for the substantive book content.';return 'I could not reach the AI service. You can still use Start Here, Gravity Assist, Books, the SOP Library, or the Help Center.'}
async function ask(q){q=String(q||'').trim();if(!q)return;add('user',q);history.push('Visitor: '+q);const t=add('guide','Thinking…');try{const r=await fetch('/.netlify/functions/gravity-guide',{method:'POST',signal:AbortSignal.timeout(25000),headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,page:location.pathname,history:history.slice(-6)})});if(!r.ok)throw new Error('guide');const j=await r.json(),ans=String(j.answer||'').trim();if(!ans)throw new Error('Empty guide response');t.remove();add('guide',ans,actions(q,ans));history.push('Gravity Guide: '+ans);history=history.slice(-8);speak(ans)}catch(e){const ans='The AI service is unavailable. This is saved guidance: '+localFallback(q);t.remove();add('guide',ans,actions(q,ans));history.push('Gravity Guide: '+ans);speak(ans)}}
function setup(){const form=document.querySelector(FORM),root=document.querySelector(ROOT);if(!form||!root)return;if(localStorage.getItem(ONKEY)===null)localStorage.setItem(ONKEY,'on');const footer=root.querySelector('.gg-footer');if(footer&&!document.getElementById('gravity-guide-voice')){const wrap=document.createElement('span');wrap.className='gg-voice-tools';wrap.innerHTML='<label class="gg-sr-only" for="gravity-guide-voice">Gravity voice</label><select id="gravity-guide-voice" title="AI-generated neural voice"><option value="cedar">Cedar</option><option value="marin">Marin</option></select><button type="button" class="gg-text-btn" id="gravity-guide-voice-test">Test voice</button><button type="button" class="gg-text-btn" id="gravity-guide-voice-toggle"></button><small id="gravity-guide-voice-status">Neural voice ready</small>';footer.firstElementChild?.replaceWith(wrap);const sel=wrap.querySelector('#gravity-guide-voice'),test=wrap.querySelector('#gravity-guide-voice-test'),btn=wrap.querySelector('#gravity-guide-voice-toggle');sel.value=getVoice();sel.onchange=()=>{stopNeuralAudio();localStorage.setItem(VKEY,sel.value);voiceStatus(voiceLabel(sel.value)+' selected')};const paint=()=>btn.textContent=voiceOn()?'Voice: On':'Voice: Off';paint();btn.onclick=()=>{unlockNeuralAudio();localStorage.setItem(ONKEY,voiceOn()?'off':'on');if(!voiceOn())stopNeuralAudio();paint();voiceStatus(voiceOn()?'Neural voice ready':'Voice off')};test.onclick=()=>{unlockNeuralAudio();speak('This is the Gravity Guide natural neural voice.',true)}}form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();unlockNeuralAudio();const inp=form.querySelector('input[name="question"]')||form.querySelector('input');const q=inp?.value||'';if(inp)inp.value='';document.querySelector('#gravity-guide-starters')?.setAttribute('hidden','');ask(q)},true);root.addEventListener('click',e=>{const b=e.target.closest('[data-gg-question]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();unlockNeuralAudio();document.querySelector('#gravity-guide-starters')?.setAttribute('hidden','');ask(b.dataset.ggQuestion||b.textContent)},true);root.querySelector('#gravity-guide-reset')?.addEventListener('click',()=>{history=[];stopNeuralAudio()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();