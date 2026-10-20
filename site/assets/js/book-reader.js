(()=>{
'use strict';
const REG='gravity_founding_year_download_access_v1';
const VKEY='gravity_voice_name_v1';
const EMBEDDED_CATALOG=[{"id": "quiet-gravity", "title": "Quiet Gravity", "text": "/assets/reader/quiet-gravity.txt", "pdf": "/assets/downloads/quiet-gravity-gravity-elite-2026-09-11-155-pages.pdf", "characters": 375229}, {"id": "owners-chair", "title": "The Owner’s Chair", "text": "/assets/reader/owners-chair.txt", "pdf": "/assets/downloads/the-owners-chair-gravity-elite-2026-09-11-212-pages.pdf", "characters": 296838}, {"id": "systems-of-service", "title": "Systems of Service", "text": "/assets/reader/systems-of-service.txt", "pdf": "/assets/downloads/systems-of-service-gravity-elite-v2-2026-09-11-253-pages.pdf", "characters": 512298}, {"id": "employee-training-sop-tracker", "title": "Employee Training & SOP Tracker", "text": "/assets/reader/employee-training-sop-tracker.txt", "pdf": "/assets/downloads/employee-training-sop-tracker-gravity-elite-v2-2026-09-12-257-interior-pages.pdf", "characters": 263507}, {"id": "labor-control-scheduling-planner", "title": "Labor Control & Scheduling Planner", "text": "/assets/reader/labor-control-scheduling-planner.txt", "pdf": "/assets/downloads/labor-control-scheduling-planner-gravity-elite-v2-2026-09-12-371-interior-372-digital-pages.pdf", "characters": 424801}, {"id": "sop-station-operations-builder", "title": "Restaurant SOP & Station Operations Builder", "text": "/assets/reader/sop-station-operations-builder.txt", "pdf": "/assets/downloads/restaurant-sop-station-operations-builder-gravity-elite-v3-2026-09-13-258-pages.pdf", "characters": 336866}, {"id": "food-cost-waste-inventory", "title": "Food Cost, Waste & Inventory Control", "text": "/assets/reader/food-cost-waste-inventory.txt", "pdf": "/assets/downloads/food-cost-waste-inventory-control-318-pages.pdf", "characters": 402216}, {"id": "hiring-retention", "title": "Hiring, Interviewing & Employee Retention Tracker", "text": "/assets/reader/hiring-retention.txt", "pdf": "/assets/downloads/hiring-interviewing-employee-retention-tracker-gravity-elite-208-pages.pdf", "characters": 177964}, {"id": "guest-recovery", "title": "Guest Service, Complaints & Recovery Workbook", "text": "/assets/reader/guest-recovery.txt", "pdf": "/assets/downloads/guest-service-complaints-recovery-workbook-gravity-elite-2026-09-13-191-pages.pdf", "characters": 131467}, {"id": "ai-prompts", "title": "Restaurant AI Prompts & Systems Workbook — 325 Prompts", "text": "/assets/reader/ai-prompts.txt", "pdf": "/assets/free-resources/ai/RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_325_PROMPTS_2026-10-20.pdf", "characters": 207351}, {"id": "sop-library-v1", "title": "Gravity Restaurant SOP Library — Volume 1", "text": "/assets/reader/sop-library-v1.txt", "pdf": "/assets/downloads/gravity-restaurant-sop-library-volume-1-gravity-elite-v2-2026-09-13-369-pages.pdf", "characters": 702569}, {"id": "sop-library-v2", "title": "Gravity Restaurant SOP Library — Volume 2", "text": "/assets/reader/sop-library-v2.txt", "pdf": "/assets/downloads/gravity-restaurant-sop-library-volume-2-gravity-elite-v2-2026-09-13-370-pages.pdf", "characters": 699870}, {"id": "sop-library-v3", "title": "Gravity Restaurant SOP Library — Volume 3", "text": "/assets/reader/sop-library-v3.txt", "pdf": "/assets/downloads/gravity-restaurant-sop-library-volume-3-specialty-advanced-hard-to-find-sops.pdf", "characters": 853112}, {"id": "bar-pour-cost", "title": "Restaurant Bar & Beverage Pour Cost Control", "text": "/assets/reader/bar-pour-cost.txt", "pdf": "/assets/downloads/GRAVITY_Restaurant_Bar_Beverage_Pour_Cost_Control_v1.0.pdf", "characters": 344492}, {"id": "bar-inventory", "title": "Restaurant Bar & Beverage Inventory & Ordering", "text": "/assets/reader/bar-inventory.txt", "pdf": "/assets/downloads/GRAVITY_Restaurant_Bar_Beverage_Inventory_Ordering_v1.0.pdf", "characters": 100731}];
let catalog=[],chunks=[],idx=0,current='',loadToken=0;
let audioCtx=null,sourceNode=null,activeResolve=null,loopActive=false,playing=false,paused=false,runToken=0,mode='';
const $=id=>document.getElementById(id);
const status=t=>{const el=$('reader-status');if(el)el.textContent=t;};

function isReaderBoilerplate(t){
  t=String(t||'').trim();
  if(!t)return false;
  if(/^PAGE\s+\d+\s*$/i.test(t)||/^\d+\s*$/.test(t))return true;
  if(/^GRAVITY\s*[|•]\s*\d+\s*$/i.test(t))return true;
  if(/^GRAVITY\s*[•|]\s*THE RESTAURANT LEADERSHIP SYSTEM\s*$/i.test(t))return true;
  if(/^THE GRAVITY RESTAURANT LEADERSHIP SYSTEM\s*[•|]\s*(?:PAGE\s*)?\d+\s*$/i.test(t))return true;
  if(/^THE GRAVITY SYSTEM\s*(?:[|•]\s*THOMAS MONROE BOOKS\s*)?(?:[|•]\s*)?(?:PAGE\s*)?\d+\s*$/i.test(t))return true;
  if(/^THE GRAVITY SYSTEM\s+\d+\s+THOMAS MONROE BOOKS\s*$/i.test(t))return true;
  if(/^\d+\s+THE GRAVITY SYSTEM(?:\s*[|•]\s*THOMAS MONROE BOOKS)?\s*$/i.test(t))return true;
  if(/^THOMAS MONROE BOOKS\s*(?:[|•]\s*)?(?:PAGE\s*)?\d+\s*$/i.test(t))return true;
  if(/^GRAVITY ELITE MASTER\s+\d+(?:\.\d+)?\s*[|•]\s*SEPTEMBER\s+20\d{2}\s*$/i.test(t))return true;
  return false;
}
function cleanReaderText(text){
  const lines=String(text||'').replace(/\r/g,'').split('\n');
  const out=[];
  for(let line of lines){
    const t=line.trim();
    if(isReaderBoilerplate(t))continue;
    out.push(line.replace(/[ \t]+$/,''));
  }
  return out.join('\n').replace(/\n{4,}/g,'\n\n\n').trim();
}

function chunkText(text,max=2200){
  const paras=cleanReaderText(text).split(/\n\s*\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const out=[];let cur='';
  for(const p of paras){
    if((cur+'\n\n'+p).length<=max){cur+=(cur?'\n\n':'')+p;continue;}
    if(cur)out.push(cur);cur='';
    if(p.length<=max){cur=p;continue;}
    const sent=p.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[p];
    for(const x of sent){
      if((cur+' '+x).length>max){if(cur)out.push(cur.trim());cur=x.trim();}
      else cur+=(cur?' ':'')+x.trim();
    }
  }
  if(cur)out.push(cur);
  return out.flatMap(part=>{const pieces=[];while(part.length>max){let cut=part.lastIndexOf(' ',max);if(cut<1)cut=max;pieces.push(part.slice(0,cut));part=part.slice(cut).trimStart()}if(part)pieces.push(part);return pieces});
}

async function hash(s){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function finishActive(){if(activeResolve){const r=activeResolve;activeResolve=null;r();}}

function unlockNeuralAudio(){
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return false;
  try{
    if(!audioCtx)audioCtx=new C();
    if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    return true;
  }catch(_){return false;}
}
function stopNeuralSource(){
  if(sourceNode){try{sourceNode.onended=null;sourceNode.stop(0)}catch(_){}try{sourceNode.disconnect()}catch(_){}sourceNode=null;}
}
async function neural(text,token){
  mode='neural';
  if(!unlockNeuralAudio())throw new Error('Web Audio is unavailable');
  if(audioCtx.state==='suspended')await audioCtx.resume();
  const voice=$('reader-voice').value,speed=Number($('reader-speed').value)||.98;
  const key=await hash(voice+'|'+speed+'|'+text),fake=new Request(location.origin+'/__gravity_voice_cache__/'+key+'.mp3');
  let blob=null,cache=null;
  if('caches' in window){try{cache=await caches.open('gravity-neural-voice-v2');const hit=await cache.match(fake);if(hit)blob=await hit.blob();}catch(_){cache=null;}}
  if(!blob){
    const r=await fetch('/.netlify/functions/gravity-tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice,speed})});
    if(!r.ok){let detail='';try{detail=(await r.json()).error||''}catch(_){detail=await r.text().catch(()=> '')}throw new Error(detail||('TTS HTTP '+r.status));}
    const ct=(r.headers.get('content-type')||'').toLowerCase();if(!ct.includes('audio'))throw new Error('TTS did not return audio');
    blob=await r.blob();
    if(cache){try{await cache.put(fake,new Response(blob,{headers:{'Content-Type':'audio/mpeg'}}))}catch(_){}}
  }
  const raw=await blob.arrayBuffer();
  const buffer=await audioCtx.decodeAudioData(raw.slice(0));
  if(token!==runToken)return;
  if(paused)await audioCtx.suspend();
  if(token!==runToken)return;
  stopNeuralSource();
  return new Promise((resolve,reject)=>{
    try{
      activeResolve=resolve;const s=audioCtx.createBufferSource();sourceNode=s;s.buffer=buffer;s.connect(audioCtx.destination);
      s.onended=()=>{if(sourceNode===s)sourceNode=null;activeResolve=null;resolve();};
      s.start(0);
    }catch(e){activeResolve=null;reject(e);}
  });
}

function paint(){
  const book=catalog.find(x=>x.id===current);
  $('reader-book-title').textContent=book?.title||'Choose a book';
  $('reader-text').textContent=chunks[idx]||'';
  $('reader-part').textContent=chunks.length?`Part ${idx+1} of ${chunks.length}`:'—';
  $('reader-percent').textContent=chunks.length?Math.round((idx+1)/chunks.length*100)+'%':'0%';
  $('reader-prev').disabled=idx<=0;$('reader-next').disabled=idx>=chunks.length-1;
  if(current)localStorage.setItem('gravity_reader_progress_'+current,String(idx));
}

function hardStop(message){
  runToken++;playing=false;paused=false;loopActive=false;
  stopNeuralSource();
  if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  finishActive();mode='';
  if($('reader-play'))$('reader-play').textContent='Play';
  if(message)status(message);
}

async function loadBook(id){
  hardStop();const token=++loadToken;current=id;chunks=[];idx=0;paint();const book=catalog.find(x=>x.id===id);if(!book){status('Choose a book to begin.');return;}
  status('Loading '+book.title+'…');let r;try{r=await fetch(book.text+'?v=20261010-sync',{cache:'no-store'});}catch(e){if(token===loadToken)status('This book could not be loaded. Check your connection and try again.');return;}if(token!==loadToken)return;
  if(!r.ok){status('This book could not be loaded.');return;}
  const text=await r.text();if(token!==loadToken)return;chunks=chunkText(text);
  idx=Math.min(Math.max(0,chunks.length-1),Math.max(0,Number(localStorage.getItem('gravity_reader_progress_'+id)||0)));
  paint();status('Ready. Your place is saved automatically on this browser.');
}

async function runReader(){
  if(loopActive||!chunks.length)return;
  loopActive=true;const token=++runToken;playing=true;paused=false;$('reader-play').textContent='Pause';status('Reading with '+(($('reader-voice').value==='marin')?'Marin':'Cedar')+' neural voice.');
  while(token===runToken&&playing&&idx<chunks.length){
    try{await neural(chunks[idx],token);}
    catch(e){if(token!==runToken)break;console.warn('Gravity Reader neural voice unavailable:',e);status('Neural voice is unavailable. No device voice was substituted.');playing=false;paused=false;$('reader-play').textContent='Play';break;}
    if(token!==runToken||!playing)break;
    if(idx<chunks.length-1){idx++;paint();}
    else{playing=false;paused=false;$('reader-play').textContent='Play';status('End of book.');break;}
  }
  if(token===runToken)loopActive=false;
}

function pause(){
  if(!playing)return;playing=false;paused=true;
  if(mode==='neural'&&audioCtx)audioCtx.suspend().catch(()=>{});
  $('reader-play').textContent='Resume';status('Paused.');
}
function resume(){
  if(!paused){unlockNeuralAudio();runReader();return;}
  paused=false;playing=true;$('reader-play').textContent='Pause';status('Reading with '+(($('reader-voice').value==='marin')?'Marin':'Cedar')+' neural voice.');
  if(mode==='neural'&&audioCtx&&loopActive){audioCtx.resume().catch(()=>{hardStop('Neural voice is unavailable.');});return;}
  loopActive=false;unlockNeuralAudio();runReader();
}

async function init(){
  if(localStorage.getItem(REG)!=='registered'){$('reader-app').hidden=true;$('reader-gate').hidden=false;return;}
  $('reader-gate').hidden=true;$('reader-app').hidden=false;
  catalog=EMBEDDED_CATALOG.slice();
  try{
    const r=await fetch('/assets/reader/catalog.json?v=20260923-reader2',{cache:'no-store'});
    if(r.ok){const remote=await r.json();if(Array.isArray(remote.books)&&remote.books.length)catalog=remote.books;}
  }catch(_){/* Embedded catalog keeps the reader usable if catalog fetch fails. */}
  const sel=$('reader-book');
  sel.innerHTML='<option value="">Choose a Gravity book…</option>'+catalog.map(b=>`<option value="${b.id}">${b.title}</option>`).join('');
  if(!catalog.length){status('No books are available in the reader catalog.');return;}
  $('reader-voice').value=localStorage.getItem(VKEY)||'cedar';
  sel.onchange=()=>loadBook(sel.value);$('reader-voice').onchange=()=>{hardStop('Voice changed. Press Play to continue.');localStorage.setItem(VKEY,$('reader-voice').value)};$('reader-speed').onchange=()=>hardStop('Speed changed. Press Play to continue.');
  $('reader-play').onclick=()=>{unlockNeuralAudio();if(playing)pause();else if(paused)resume();else runReader();};
  $('reader-stop').onclick=()=>hardStop('Stopped. Your place is saved.');
  $('reader-prev').onclick=()=>{hardStop();if(idx>0){idx--;paint();status('Moved back one part.');}};
  $('reader-next').onclick=()=>{hardStop();if(idx<chunks.length-1){idx++;paint();status('Moved forward one part.');}};
  status(catalog.length+' Gravity books available. Choose a book to begin.');
}

window.addEventListener('gravity-reader-read',async e=>{
  const id=(e.detail&&e.detail.book)||'quiet-gravity';
  if(localStorage.getItem(REG)!=='registered'){
    status('Register once to unlock the books in the Reader.');
    const gate=$('reader-gate');if(gate)gate.hidden=false;
    return;
  }
  unlockNeuralAudio();
  const sel=$('reader-book');if(sel)sel.value=id;
  try{await loadBook(id);if(e.detail?.autoplay!==false)await runReader();}
  catch(err){console.warn('Gravity Reader request failed:',err);status('I could not open that book. Choose it from the Book list and try again.');}
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
