(()=>{
'use strict';
const REG='gravity_founding_year_download_access_v1';
const VKEY='gravity_voice_name_v1';
const EMBEDDED_CATALOG=[{"id": "quiet-gravity", "title": "Quiet Gravity", "text": "/assets/reader/quiet-gravity.txt", "pdf": "/assets/downloads/quiet-gravity-gravity-elite-2026-09-11-155-pages.pdf", "characters": 375229}, {"id": "owners-chair", "title": "The Owner’s Chair", "text": "/assets/reader/owners-chair.txt", "pdf": "/assets/downloads/the-owners-chair-gravity-elite-2026-09-11-212-pages.pdf", "characters": 296838}, {"id": "systems-of-service", "title": "Systems of Service", "text": "/assets/reader/systems-of-service.txt", "pdf": "/assets/downloads/systems-of-service-gravity-elite-v2-2026-09-11-253-pages.pdf", "characters": 512298}, {"id": "employee-training-sop-tracker", "title": "Employee Training & SOP Tracker", "text": "/assets/reader/employee-training-sop-tracker.txt", "pdf": "/assets/downloads/employee-training-sop-tracker-gravity-elite-v2-2026-09-12-257-interior-pages.pdf", "characters": 263507}, {"id": "labor-control-scheduling-planner", "title": "Labor Control & Scheduling Planner", "text": "/assets/reader/labor-control-scheduling-planner.txt", "pdf": "/assets/downloads/labor-control-scheduling-planner-gravity-elite-v2-2026-09-12-371-interior-372-digital-pages.pdf", "characters": 424801}, {"id": "sop-station-operations-builder", "title": "Restaurant SOP & Station Operations Builder", "text": "/assets/reader/sop-station-operations-builder.txt", "pdf": "/assets/downloads/restaurant-sop-station-operations-builder-gravity-elite-v3-2026-09-13-258-pages.pdf", "characters": 336866}, {"id": "food-cost-waste-inventory", "title": "Food Cost, Waste & Inventory Control", "text": "/assets/reader/food-cost-waste-inventory.txt", "pdf": "/assets/downloads/food-cost-waste-inventory-control-318-pages.pdf", "characters": 402216}, {"id": "hiring-retention", "title": "Hiring, Interviewing & Employee Retention Tracker", "text": "/assets/reader/hiring-retention.txt", "pdf": "/assets/downloads/hiring-interviewing-employee-retention-tracker-gravity-elite-208-pages.pdf", "characters": 177964}, {"id": "guest-recovery", "title": "Guest Service, Complaints & Recovery Workbook", "text": "/assets/reader/guest-recovery.txt", "pdf": "/assets/downloads/guest-service-complaints-recovery-workbook-gravity-elite-2026-09-13-191-pages.pdf", "characters": 131467}, {"id": "ai-prompts", "title": "Restaurant AI Prompts & Systems Workbook — 325 Prompts", "text": "/assets/reader/ai-prompts.txt", "pdf": "/assets/free-resources/ai/RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_325_PROMPTS_2026-10-20.pdf", "characters": 207351}, {"id": "sop-library-v1", "title": "Gravity Restaurant SOP Library — Volume 1", "text": "/assets/reader/sop-library-v1.txt", "pdf": "/assets/downloads/gravity-restaurant-sop-library-volume-1-gravity-elite-v2-2026-09-13-369-pages.pdf", "characters": 702569}, {"id": "sop-library-v2", "title": "Gravity Restaurant SOP Library — Volume 2", "text": "/assets/reader/sop-library-v2.txt", "pdf": "/assets/downloads/gravity-restaurant-sop-library-volume-2-gravity-elite-v2-2026-09-13-370-pages.pdf", "characters": 699870}, {"id": "sop-library-v3", "title": "Gravity Restaurant SOP Library — Volume 3", "text": "/assets/reader/sop-library-v3.txt", "pdf": "/assets/downloads/gravity-restaurant-sop-library-volume-3-specialty-advanced-hard-to-find-sops.pdf", "characters": 853112}, {"id": "bar-pour-cost", "title": "Restaurant Bar & Beverage Pour Cost Control", "text": "/assets/reader/bar-pour-cost.txt", "pdf": "/assets/downloads/GRAVITY_Restaurant_Bar_Beverage_Pour_Cost_Control_v1.0.pdf", "characters": 344492}, {"id": "bar-inventory", "title": "Restaurant Bar & Beverage Inventory & Ordering", "text": "/assets/reader/bar-inventory.txt", "pdf": "/assets/downloads/GRAVITY_Restaurant_Bar_Beverage_Inventory_Ordering_v1.0.pdf", "characters": 100731}];
let catalog=[],reportArticles=[],chunks=[],idx=0,current='',loadToken=0;
let audioCtx=null,sourceNode=null,activeResolve=null,loopActive=false,playing=false,paused=false,runToken=0,mode='';
let gainNode=null,bassNode=null,trebleNode=null,decodedBuffer=null,decodedForPart=-1,playedSeconds=0,sourceStartedAt=0,sourceOffset=0,partDuration=0;
let contentPart=0,sleepAt=0,savingAllowed=false;
let wakeSentinel=null,wakeRequestGeneration=0;
const LASTBOOK='gravity_reader_last_book_v2', PREFS='gravity_reader_preferences_v2';
const progressKey=id=>'gravity_reader_checkpoint_v2_'+id;
function readStorage(key){try{return localStorage.getItem(key)}catch{return null}}
function writeStorage(key,value){try{localStorage.setItem(key,value)}catch(_){}}
function readCheckpoint(book){
 try{const p=JSON.parse(readStorage(progressKey(book))||'null');if(p&&Number.isFinite(p.part)&&p.part>=0)return p;}catch(_){}
 const part=Number(readStorage('gravity_reader_progress_'+book));
 return Number.isFinite(part)&&readStorage('gravity_reader_progress_'+book)!==null?{part,seconds:0}:null;
}
function formatTime(seconds){seconds=Math.max(0,Math.floor(Number(seconds)||0));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function currentTime(){
 if(sourceNode&&audioCtx&&audioCtx.state!=='closed')
   return Math.max(0,Math.min(partDuration||Infinity,sourceOffset+Math.max(0,audioCtx.currentTime-sourceStartedAt)));
 return Math.max(0,playedSeconds);
}
function showPosition(){
 const seek=$('reader-seek'),clock=$('reader-time');
 if(!seek||!clock)return;
 const now=currentTime(),max=Math.max(0,partDuration||0);
 seek.disabled=!max||!chunks.length;
 seek.max=String(Math.max(1,Math.round(max*10)));seek.step='1';
 if(!seek.matches(':active'))seek.value=String(Math.min(Math.round(now*10),Number(seek.max)));
 clock.textContent=formatTime(now)+' / '+(max?formatTime(max):'Audio loads when you press Play');
}
function saveCheckpoint(){
 if(!savingAllowed||!current||!chunks.length)return;
 const part=Math.max(0,Math.min(chunks.length-1,idx));
 const seconds=partDuration?Math.min(currentTime(),partDuration):playedSeconds;
 writeStorage(progressKey(current),JSON.stringify({part,seconds:Number(Math.max(0,seconds).toFixed(1)),updatedAt:new Date().toISOString(),totalParts:chunks.length}));
 writeStorage('gravity_reader_progress_'+current,String(part));
 writeStorage(LASTBOOK,current);
}
function storePrefs(){
 const prefs={skipFront:$('reader-skip-front')?.checked!==false,continuous:$('reader-continuous')?.checked!==false,volume:Number($('reader-volume')?.value??100),bass:Number($('reader-bass')?.value??0),treble:Number($('reader-treble')?.value??0),keepAwake:$('reader-keep-awake')?.checked!==false,voice:$('reader-voice')?.value||'cedar',speed:$('reader-speed')?.value||'0.98'};
 writeStorage(PREFS,JSON.stringify(prefs));
}
function wakeMessage(message){
 const info=$('reader-awake-status');if(info)info.textContent=message;
}
function releaseScreenWake(){
 wakeRequestGeneration++;
 const held=wakeSentinel;wakeSentinel=null;
 if(held)held.release().catch(()=>{});
 if($('reader-keep-awake')?.checked===false)wakeMessage('Screen wake lock is off.');
 else wakeMessage('Screen wake lock is inactive while not listening.');
}
async function holdScreenWake(){
 if(!$('reader-keep-awake')?.checked||!playing||document.hidden)return;
 if(wakeSentinel)return;
 if(!navigator.wakeLock||typeof navigator.wakeLock.request!=='function'){
   wakeMessage('This browser cannot prevent screen sleep. Keep your device awake manually.');
   return;
 }
 const generation=++wakeRequestGeneration;
 try{
   const held=await navigator.wakeLock.request('screen');
   if(generation!==wakeRequestGeneration||!playing||document.hidden||!$('reader-keep-awake')?.checked){
     held.release().catch(()=>{});
     return;
   }
   wakeSentinel=held;wakeMessage('Screen kept awake while listening. This may increase battery use.');
   held.addEventListener('release',()=>{
     if(wakeSentinel===held){
       wakeSentinel=null;
       wakeMessage(document.hidden?'Screen wake lock released while this tab is hidden.':'Screen wake lock was released by the device.');
     }
   });
 }catch(error){
   if(generation===wakeRequestGeneration){
     wakeMessage('Screen wake lock not allowed by this browser or device. Check your screen timeout setting.');
   }
 }
}
function mainContentOffset(text){
 const lines=String(text||'').replace(/\r/g,'').split('\n');
 // Recognize actual standalone narrative headings, rather than TOC entries with page numbers.
 const toc=lines.findIndex((line,i)=>i<550&&/^(?:table of contents|contents)(?:\s*[-—]\s*continued)?\s*$/i.test(line.trim()));
 const copyright=lines.findIndex((line,i)=>i<160&&/copyright/i.test(line.trim()));
 const earliest=Math.max(0,toc>=0?toc+3:copyright>=0?copyright+3:0);
 const heading=/^(?:introduction|foreword|prologue|preface|author['’]s note|chapter\s+(?:1|one)|part\s+(?:i|1|one)|how to use (?:this|the) (?:book|workbook|library)|chapter 1\s*[-—:]\s*[^.]+)$/i;
 for(let i=earliest;i<Math.min(lines.length,1500);i++){
   if(!heading.test(lines[i].trim()))continue;
   // Genuine chapter/narrative headings are followed by prose, not rows of a contents list.
   const next=lines.slice(i+1,i+12).map(x=>x.trim()).filter(Boolean);
   // Do not confuse a TOC entry ("Chapter 1 — ...") with the actual chapter:
   // within a contents list, its next line is typically another chapter/part.
   const followsAnotherEntry=/^(?:chapter\s+\d+|part\s+(?:[ivx]+|\d+|one|two|three)|quiet mirror|appendix\s+|contents|conclusion\b|about\b|selected notes\b)/i.test(next[0]||'');
   if(followsAnotherEntry)continue;
   const isNarrative=line=>line.length>=48&&
      !/\.{3,}\s*\d+\s*$/.test(line)&&
      !/^(?:chapter\s+\d+|part\s+|quiet mirror|appendix\s+|contents|conclusion\b|about\b|selected notes\b|[\d.]+\s+[A-Z])/i.test(line);
   const hasProse=next.slice(0,9).some(isNarrative);
   if(!hasProse)continue;
   return lines.slice(0,i).join('\n').length+1;
 }
 // Volumes built as procedural libraries may begin with SOP IDs rather than
 // chapters or narrative introductions. Skip their TOC by finding the first
 // actual controlled procedure heading (not the "V3-001 - ..." contents row).
 const firstSop=lines.findIndex((line,i)=>i>toc&&i<1800&&/^V3-001\s*\|\s*[^\n]+$/.test(line.trim()));
 if(firstSop>toc)return lines.slice(0,firstSop).join('\n').length+1;
 return 0;
}

const $=id=>document.getElementById(id);
const status=t=>{const el=$('reader-status');if(el)el.textContent=t;};
// Dedicated Pause control: the Play button never turns into a second Pause.
function updateTransport(){
 const play=$('reader-play'),pauseButton=$('reader-pause');
 if(play){
   play.textContent=paused?'Resume':playing?'Playing…':'Play';
   play.disabled=playing||!chunks.length;
   play.setAttribute('aria-label',paused?'Resume book narration':playing?'Narration playing':'Play book narration');
 }
 if(pauseButton)pauseButton.disabled=!playing;
}

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
function finishActive(result='interrupted'){
 if(activeResolve){const resolve=activeResolve;activeResolve=null;resolve(result);}
}
function unlockNeuralAudio(){
 const C=window.AudioContext||window.webkitAudioContext;
 if(!C)return false;
 try{
  if(!audioCtx||audioCtx.state==='closed'){
    audioCtx=new C();
    gainNode=audioCtx.createGain();
    bassNode=audioCtx.createBiquadFilter();bassNode.type='lowshelf';bassNode.frequency.value=180;
    trebleNode=audioCtx.createBiquadFilter();trebleNode.type='highshelf';trebleNode.frequency.value=3200;
    bassNode.connect(trebleNode);trebleNode.connect(gainNode);gainNode.connect(audioCtx.destination);
    gainNode.gain.value=Number($('reader-volume')?.value??100)/100;
    bassNode.gain.value=Number($('reader-bass')?.value??0);
    trebleNode.gain.value=Number($('reader-treble')?.value??0);
  }
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return true;
 }catch(_){return false;}
}
function stopNeuralSource(){
 if(sourceNode){
  try{sourceNode.onended=null;sourceNode.stop(0)}catch(_){}
  try{sourceNode.disconnect()}catch(_){}
  sourceNode=null;
 }
 finishActive('interrupted');
}
async function playDecodedAudio(buffer,token){
 if(token!==runToken)return 'interrupted';
 const offset=Math.min(Math.max(0,playedSeconds),Math.max(0,buffer.duration-.005));
 partDuration=buffer.duration;
 if(offset>=buffer.duration-.02){showPosition();return 'ended';}
 if(paused&&audioCtx.state!=='suspended')await audioCtx.suspend();
 if(token!==runToken)return 'interrupted';
 return new Promise((resolve,reject)=>{
  try{
   activeResolve=resolve;
   sourceOffset=offset;sourceStartedAt=audioCtx.currentTime;
   const source=audioCtx.createBufferSource();sourceNode=source;
   source.buffer=buffer;source.connect(bassNode||gainNode||audioCtx.destination);
   source.onended=()=>{
     if(sourceNode!==source)return;
     playedSeconds=buffer.duration;sourceNode=null;activeResolve=null;
     showPosition();resolve('ended');
   };
   source.start(0,offset);
   showPosition();
  }catch(err){activeResolve=null;reject(err);}
 });
}
async function neural(text,token){
 mode='neural';
 if(!unlockNeuralAudio())throw new Error('Web Audio is unavailable');
 if(audioCtx.state==='suspended'&&!paused)await audioCtx.resume();
 let buffer=decodedForPart===idx?decodedBuffer:null;
 if(!buffer){
  const voice=$('reader-voice').value,speed=Number($('reader-speed').value)||.98;
  const key=await hash(voice+'|'+speed+'|'+text),fake=new Request(location.origin+'/__gravity_voice_cache__/'+key+'.mp3');
  let blob=null,cache=null;
  if('caches' in window){
   try{cache=await caches.open('gravity-neural-voice-v2');const hit=await cache.match(fake);if(hit)blob=await hit.blob();}catch(_){cache=null;}
  }
  if(!blob){
   const r=await fetch('/.netlify/functions/gravity-tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice,speed})});
   if(!r.ok){let detail='';try{detail=(await r.json()).error||''}catch(_){detail=await r.text().catch(()=> '')}throw new Error(detail||('TTS HTTP '+r.status));}
   const ct=(r.headers.get('content-type')||'').toLowerCase();if(!ct.includes('audio'))throw new Error('TTS did not return audio');
   blob=await r.blob();
   if(cache){try{await cache.put(fake,new Response(blob,{headers:{'Content-Type':'audio/mpeg'}}))}catch(_){}}
  }
  const raw=await blob.arrayBuffer();
  if(token!==runToken)return 'interrupted';
  buffer=await audioCtx.decodeAudioData(raw.slice(0));
  if(token!==runToken)return 'interrupted';
  decodedBuffer=buffer;decodedForPart=idx;
 }
 return playDecodedAudio(buffer,token);
}
function paint(){
 const book=catalog.find(x=>x.id===current);
 $('reader-book-title').textContent=book?.title||'Choose a book';
 $('reader-text').textContent=chunks[idx]||'';
 $('reader-part').textContent=chunks.length?`Part ${idx+1} of ${chunks.length}`:'—';
 $('reader-percent').textContent=chunks.length?Math.round((idx+1)/chunks.length*100)+'%':'0%';
 $('reader-prev').disabled=idx<=0;
 $('reader-next').disabled=idx>=chunks.length-1;
 updateTransport();
 showPosition();
}
function hardStop(message){
 saveCheckpoint();
 runToken++;playing=false;paused=false;loopActive=false;
 releaseScreenWake();
 // Store the playback location BEFORE stopping the WebAudio source.
 playedSeconds=currentTime();
 stopNeuralSource();
 if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
 updateTransport();
 mode='';showPosition();
 if(message)status(message);
}
function applyPart(part,seconds=0){
 idx=Math.max(0,Math.min(chunks.length-1,part));
 playedSeconds=Math.max(0,Number(seconds)||0);partDuration=0;
 decodedBuffer=null;decodedForPart=-1;
 paint();saveCheckpoint();
}
async function loadBook(id){
 hardStop();
 const token=++loadToken;
 savingAllowed=false;current=id;chunks=[];idx=0;playedSeconds=0;partDuration=0;contentPart=0;decodedBuffer=null;decodedForPart=-1;
 paint();
 const book=catalog.find(x=>x.id===id);
 if(!book){status('Choose a book to begin.');return;}
 status('Loading '+book.title+'…');
 let r;try{r=await fetch(book.text+(book.text.includes('?')?'&':'?')+'v=20261028-report-reader',{cache:'no-store'});}
 catch(_){if(token===loadToken)status('This book could not be loaded. Check your connection and try again.');return;}
 if(token!==loadToken)return;
 if(!r.ok){status('This book could not be loaded.');return;}
 let text=await r.text();if(token!==loadToken)return;
 const mainStart=book.kind==='report'?0:mainContentOffset(text);
 const front=mainStart>0?chunkText(text.slice(0,mainStart)):[];
 const body=mainStart>0?chunkText(text.slice(mainStart)):chunkText(text);
 chunks=[...front,...body];contentPart=front.length;
 if(!chunks.length){status('This book has no readable text.');return;}
 const saved=readCheckpoint(id);
 if(saved){
   idx=Math.max(0,Math.min(chunks.length-1,Number(saved.part)||0));
   playedSeconds=Math.max(0,Number(saved.seconds)||0);
 }else if($('reader-skip-front')?.checked&&contentPart>0){
   idx=contentPart;playedSeconds=0;
 }else{idx=0;playedSeconds=0;}
 savingAllowed=true;
 paint();saveCheckpoint();
 const msg=saved?`Resumed at Part ${idx+1}, ${formatTime(playedSeconds)}. Press Play to continue.`:
  contentPart&&idx===contentPart?'Front matter skipped. Press Play for the book content.':'Ready. Press Play to begin.';
 status(msg);
 const note=$('reader-saved');if(note)note.textContent='Last place saved on this browser: Part '+(idx+1)+' of '+chunks.length+(saved?', '+formatTime(playedSeconds):'')+'.';
}
async function runReader(){
 if(loopActive||!chunks.length)return;
 if(!unlockNeuralAudio()){status('Your browser does not support Gravity neural audio.');return;}
 loopActive=true;const token=++runToken;playing=true;paused=false;
 holdScreenWake();
 updateTransport();
 status('Reading with '+(($('reader-voice').value==='marin')?'Marin':'Cedar')+' neural voice.');
 while(token===runToken&&playing&&idx<chunks.length){
  try{
   const finished=await neural(chunks[idx],token);
   if(token!==runToken||finished!=='ended'||!playing)break;
  }catch(e){
   if(token!==runToken)break;
   console.warn('Gravity Reader neural voice unavailable:',e);
   playing=false;paused=false;updateTransport();releaseScreenWake();
   status('Neural voice is unavailable. '+(e?.message||'Please try again')+'. No device voice was substituted.');
   saveCheckpoint();break;
  }
  if(idx<chunks.length-1){
   // Save the NEXT part before requesting its audio, avoiding repeats when reopening.
   idx++;playedSeconds=0;partDuration=0;decodedBuffer=null;decodedForPart=-1;paint();saveCheckpoint();
   if(!$('reader-continuous')?.checked){
     playing=false;paused=false;updateTransport();releaseScreenWake();
     status('Part completed. Press Play to continue with Part '+(idx+1)+'.');
     break;
   }
  }else{
   playing=false;paused=false;updateTransport();releaseScreenWake();
   status('End of book. Your listening position is saved.');
   saveCheckpoint();break;
  }
 }
 if(token===runToken)loopActive=false;
}
function pause(){
 if(!playing)return;
 playing=false;paused=true;
 playedSeconds=currentTime();
 releaseScreenWake();
 saveCheckpoint();
 if(audioCtx)audioCtx.suspend().catch(()=>{});
 updateTransport();status('Paused at '+formatTime(playedSeconds)+'.');
 showPosition();
}
function resume(){
 if(!paused){runReader();return;}
 paused=false;playing=true;updateTransport();
 holdScreenWake();
 status('Continuing from '+formatTime(playedSeconds)+'.');
 if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{hardStop('Neural audio could not resume.');});
 if(!loopActive)runReader();
}
function seekWithinPart(seconds){
 if(!chunks.length)return;
 const wasPlaying=playing;
 hardStop();
 playedSeconds=Math.max(0,partDuration?Math.min(partDuration-.01,Number(seconds)||0):Number(seconds)||0);
 // Preserve decoded audio and its known duration so seeking never makes an extra TTS request.
 saveCheckpoint();showPosition();
 if(wasPlaying)runReader();
 else status('Position set to '+formatTime(playedSeconds)+'. Press Play to continue.');
}
function jumpPart(to,keepPlaying=true){
 if(!chunks.length)return;
 const wasPlaying=playing;
 hardStop();
 applyPart(to,0);
 if(wasPlaying&&keepPlaying)runReader();
 else status('Moved to Part '+(idx+1)+'. Press Play to continue.');
}
function skipFrontMatter(){
 if(!chunks.length)return;
 if(!contentPart){status('No separate copyright/contents section was identified for this book.');return;}
 jumpPart(contentPart);
 status('Skipped to book content, Part '+(idx+1)+'.');
}
function tick(){
 if(!chunks.length)return;
 showPosition();
 if(playing){
   saveCheckpoint();
   if(sleepAt&&Date.now()>=sleepAt){
     sleepAt=0;if($('reader-sleep'))$('reader-sleep').value='0';
     hardStop('Sleep timer finished. Your place has been saved.');
   }
 }
}
setInterval(tick,1000);
window.addEventListener('pagehide',()=>{saveCheckpoint();releaseScreenWake();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){saveCheckpoint();releaseScreenWake();}
 else if(playing)holdScreenWake();
});

function updateBookButtons(){
  const box=$('reader-book-buttons');if(!box)return;
  box.querySelectorAll('button[data-book-id]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.bookId===current));
  });
}
function renderBookButtons(){
  const box=$('reader-book-buttons'),panel=$('reader-available-books');if(!box||!panel)return;
  box.replaceChildren();
  for(const book of catalog.filter(b=>b.kind!=='report')){
    const button=document.createElement('button');
    button.type='button';button.dataset.bookId=book.id;button.textContent=book.title;
    button.setAttribute('aria-pressed','false');
    button.onclick=async()=>{
      const sel=$('reader-book');if(sel)sel.value=book.id;
      await loadBook(book.id);
      updateBookButtons();
      panel.open=false;
    };
    box.appendChild(button);
  }
  const summary=panel.querySelector('summary');
  if(summary)summary.textContent='Browse '+catalog.filter(b=>b.kind!=='report').length+' Gravity books — tap a title';
  if(window.matchMedia?.('(max-width:860px)').matches)panel.open=true;
  updateBookButtons();
}

function renderReportButtons(){
 const panel=$('reader-available-articles'),box=$('reader-article-buttons');
 if(!panel||!box)return;
 box.replaceChildren();
 for(const article of reportArticles){
  const button=document.createElement('button');
  button.type='button';button.dataset.bookId=article.id;button.textContent=article.title;
  button.setAttribute('aria-pressed',String(article.id===current));
  button.onclick=async()=>{
   const sel=$('reader-book');if(sel)sel.value=article.id;
   await loadBook(article.id);updateBookButtons();panel.open=false;
  };
  box.appendChild(button);
 }
 const summary=panel.querySelector('summary');
 if(summary)summary.textContent='Listen to The Gravity Report — '+reportArticles.length+' published article'+(reportArticles.length===1?'':'s');
 const status=$('reader-article-count');
 if(status)status.textContent=reportArticles.length+' published Gravity Report article'+(reportArticles.length===1?' is':'s are')+' available to listen to. New articles appear here on their scheduled release dates.';
}

async function init(){
 const booksUnlocked=readStorage(REG)==='registered';
 // The Gravity Report is public to listen to. Book titles retain the registration gate.
 $('reader-gate').hidden=booksUnlocked;
 $('reader-app').hidden=false;
 $('reader-available-books').hidden=!booksUnlocked;
 catalog=booksUnlocked?EMBEDDED_CATALOG.slice():[];
 try{
  const r=await fetch('/assets/reader/catalog.json?v=20260923-reader2',{cache:'no-store'});
  if(booksUnlocked&&r.ok){const remote=await r.json();if(Array.isArray(remote.books)&&remote.books.length)catalog=remote.books;}
 }catch(_){/* Embedded catalog keeps the reader usable if catalog fetch fails. */}
 // Only released issues enter the audio catalog; the endpoint is public,
 // while the existing Book Reader registration gate still protects the narration room.
 reportArticles=[];
 try{
  const response=await fetch('/gravity-report/articles.json',{cache:'no-store'});
  if(response.ok){
   const payload=await response.json();
   if(Array.isArray(payload.articles)){
    reportArticles=payload.articles.filter(a=>a.released&&/^[-a-z0-9]+$/.test(a.slug)&&Number.isInteger(a.issue)&&a.issue>0).map(a=>({
     id:'gravity-report-'+a.slug,
     kind:'report',
     title:'Issue '+String(a.issue).padStart(2,'0')+' · '+a.title,
     text:'/gravity-report/reader-text?slug='+encodeURIComponent(a.slug),
     original:'/gravity-report/'+a.slug
    }));
    catalog=catalog.concat(reportArticles);
   }
  }
 }catch(_){const note=$('reader-article-count');if(note)note.textContent='Articles cannot be listed right now. The books remain available.';}
 const sel=$('reader-book');
 sel.innerHTML='<option value="">Choose a book or article…</option>'+
   '<optgroup label="Gravity Books">'+catalog.filter(b=>b.kind!=='report').map(b=>`<option value="${b.id}">${b.title}</option>`).join('')+'</optgroup>'+
   '<optgroup label="The Gravity Report — Published Articles">'+reportArticles.map(b=>`<option value="${b.id}">${b.title}</option>`).join('')+'</optgroup>';
 renderBookButtons();renderReportButtons();
 if(!catalog.length){status('Published Gravity Report articles are temporarily unavailable. Try again shortly.');return;}
 let savedPrefs={};try{savedPrefs=JSON.parse(readStorage(PREFS)||'{}')||{}}catch(_){}
 $('reader-voice').value=['cedar','marin'].includes(savedPrefs.voice)?savedPrefs.voice:(readStorage(VKEY)||'cedar');
 if(!['cedar','marin'].includes($('reader-voice').value))$('reader-voice').value='cedar';
 if(savedPrefs.speed&&[...$('reader-speed').options].some(o=>o.value===savedPrefs.speed))$('reader-speed').value=savedPrefs.speed;
 $('reader-skip-front').checked=savedPrefs.skipFront!==false;
 $('reader-continuous').checked=savedPrefs.continuous!==false;
 $('reader-keep-awake').checked=savedPrefs.keepAwake!==false;
 wakeMessage('Screen wake lock activates only during playback, if supported.');
 $('reader-volume').value=String(Math.max(0,Math.min(100,Number(savedPrefs.volume??100))));
 $('reader-bass').value=String(Math.max(-12,Math.min(12,Number(savedPrefs.bass??0))));
 $('reader-treble').value=String(Math.max(-12,Math.min(12,Number(savedPrefs.treble??0))));
 const updateLevels=()=>{
   $('reader-volume-level').textContent=$('reader-volume').value+'%';
   for(const band of ['bass','treble']){
     const value=Number($('reader-'+band).value);
     $('reader-'+band+'-level').textContent=(value>0?'+':'')+value+' dB';
   }
 };
 updateLevels();
 sel.onchange=async()=>{await loadBook(sel.value);updateBookButtons();};
 $('reader-voice').onchange=()=>{
   hardStop('Voice changed. Press Play to continue.');
   decodedBuffer=null;decodedForPart=-1;partDuration=0;
   writeStorage(VKEY,$('reader-voice').value);storePrefs();
 };
 $('reader-speed').onchange=()=>{
   hardStop('Speed changed. Press Play to continue.');
   decodedBuffer=null;decodedForPart=-1;partDuration=0;storePrefs();
 };
 $('reader-skip-front').onchange=storePrefs;
 $('reader-continuous').onchange=storePrefs;
 $('reader-keep-awake').onchange=()=>{storePrefs();if($('reader-keep-awake').checked){if(playing)holdScreenWake();}else releaseScreenWake();};
 $('reader-skip-now').onclick=skipFrontMatter;
 $('reader-volume').oninput=()=>{
   // This gain stage is the independent narration volume. EQ changes do not touch it.
   if(gainNode)gainNode.gain.value=Number($('reader-volume').value)/100;
   updateLevels();storePrefs();
 };
 $('reader-bass').oninput=()=>{
   if(bassNode)bassNode.gain.value=Number($('reader-bass').value);
   updateLevels();storePrefs();
 };
 $('reader-treble').oninput=()=>{
   if(trebleNode)trebleNode.gain.value=Number($('reader-treble').value);
   updateLevels();storePrefs();
 };
 $('reader-eq-reset').onclick=()=>{
   $('reader-bass').value='0';$('reader-treble').value='0';
   if(bassNode)bassNode.gain.value=0;
   if(trebleNode)trebleNode.gain.value=0;
   updateLevels();storePrefs();
   // EQ reset intentionally retains the independent narration volume.
 };
 $('reader-play').onclick=()=>{unlockNeuralAudio();if(paused)resume();else if(!playing)runReader();};
 $('reader-pause').onclick=pause;
 $('reader-stop').onclick=()=>hardStop('Stopped. Your precise place is saved.');
 $('reader-back').onclick=()=>seekWithinPart(currentTime()-15);
 $('reader-forward').onclick=()=>seekWithinPart(currentTime()+15);
 $('reader-restart-part').onclick=()=>seekWithinPart(0);
 $('reader-start-over').onclick=()=>{
   if(!chunks.length)return;
   const shouldSkip=$('reader-skip-front').checked&&contentPart>0;
   jumpPart(shouldSkip?contentPart:0);
   status(shouldSkip?'Started over after front matter. Press Play.':'Started book over. Press Play.');
 };
 $('reader-prev').onclick=()=>{if(idx>0)jumpPart(idx-1);};
 $('reader-next').onclick=()=>{if(idx<chunks.length-1)jumpPart(idx+1);};
 $('reader-seek').onchange=()=>seekWithinPart(Number($('reader-seek').value)/10);
 $('reader-sleep').onchange=()=>{
   const minutes=Number($('reader-sleep').value)||0;
   sleepAt=minutes?Date.now()+minutes*60000:0;
   status(minutes?'Sleep timer set for '+minutes+' minutes.':'Sleep timer turned off.');
 };
 status(catalog.filter(b=>b.kind!=='report').length+' Gravity books and '+reportArticles.length+' published articles available. Choose a title to begin.');
 updateTransport();showPosition();
 // Reopening restores the most recently selected book, its part and offset.
 // Do NOT autoplay without a user's gesture; mobile browsers require a tap.
 const deepSlug=new URLSearchParams(location.search).get('article');
 if(deepSlug){
  const article=reportArticles.find(a=>a.id==='gravity-report-'+deepSlug);
  if(article){sel.value=article.id;await loadBook(article.id);updateBookButtons();return;}
  status('This report article is not yet available for listening, or the issue list could not be loaded.');
 }
 const last=readStorage(LASTBOOK);
 if(last&&catalog.some(b=>b.id===last)){
   sel.value=last;
   await loadBook(last);updateBookButtons();
 }
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
  try{await loadBook(id);updateBookButtons();if(e.detail?.autoplay!==false)await runReader();}
  catch(err){console.warn('Gravity Reader request failed:',err);status('I could not open that book. Choose it from the Book list and try again.');}
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
