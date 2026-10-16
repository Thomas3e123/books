(()=>{'use strict';
const STUDY='gravityWorkStudyV2',STORE='gravityWorkStudyClockControlV32';
const now=()=>new Date().toISOString();
function study(){try{return JSON.parse(localStorage.getItem(STUDY)||'null')}catch{return null}}
function prefs(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return{}}}
function savePrefs(x){x.updatedAt=now();localStorage.setItem(STORE,JSON.stringify(x))}
function speak(t){window.GravityWorkStudyGuidedVoice?.speak?.(t,true)}
function norm(t){return String(t||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim()}
const sets={
 walkStart:[/heading (?:to|over)/,/walking (?:to|over)/,/going (?:to|over)/,/moving (?:to|over)/,/taking .* to/,/on my way/],
 walkStop:[/\barrived\b/,/\bat the\b/,/\bi'm here\b/,/\bim here\b/,/\bmade it\b/,/\bwe're here\b/,/\bwere here\b/],
 stop:[/\bstop\b/,/\bcomplete\b/,/\bcompleted\b/,/\bdone\b/,/\bfinished\b/,/\bthat's finished\b/,/\bthats finished\b/],
 wait:[/\bwaiting\b/,/\bholding\b/,/not ready/,/waiting on/],
 search:[/looking for/,/trying to find/,/searching for/,/where(?:'s| is) the/],
 found:[/\bfound it\b/,/\bgot it\b/],
 work:[/\bstarting\b/,/\bbeginning\b/,/working on/,/starting now/,/back to work/,/back at it/,/\bcontinuing\b/,/\bresuming\b/],
 rework:[/\brework/,/\bremaking\b/,/redo(?:ing)?/,/doing .* again/],
 machine:[/mixer running/,/machine running/,/oven started/,/cooking started/,/blender running/,/processor running/],
 interruption:[/\binterruption\b/,/got interrupted/,/someone stopped me/,/had to stop/]
};
function has(list,t){return list.some(r=>r.test(t))}
function classify(raw,s=study()){const t=norm(raw),running=!!s?.timer?.running,current=String(s?.timer?.category||'').toLowerCase();if(!t)return{intent:'unknown',confidence:0};
 if(/switch (?:the )?(?:clock|timer)|switch clock|switch timing control/.test(t))return{intent:'switch',confidence:.99};
 if(/you take (?:the )?(?:clock|timer)|you handle timing/.test(t))return{intent:'owner-gravity',confidence:.99};
 if(/i(?:'ll| will)? take (?:the )?(?:clock|timer)|give me (?:the )?(?:clock|timer)/.test(t))return{intent:'owner-user',confidence:.99};
 if(has(sets.walkStop,t)&&running&&current==='walk')return{intent:'stop',confidence:.99,label:'Walk complete'};
 if(has(sets.found,t)&&running&&current==='search')return{intent:'stop',confidence:.99,label:'Search complete'};
 if(has(sets.stop,t)&&running)return{intent:'stop',confidence:.98,label:'Segment complete'};
 if(has(sets.walkStart,t))return{intent:'start',category:'walk',confidence:.95,label:'Walk'};
 if(has(sets.search,t))return{intent:'start',category:'search',confidence:.94,label:'Search'};
 if(has(sets.rework,t))return{intent:'start',category:'rework',confidence:.94,label:'Rework'};
 if(has(sets.machine,t))return{intent:'start',category:'required wait',confidence:.91,label:'Machine / required process time'};
 if(has(sets.wait,t))return{intent:'start',category:'wait',confidence:.91,label:'Wait'};
 if(has(sets.interruption,t))return{intent:'event',confidence:.9,label:'Interruption'};
 if(has(sets.work,t))return{intent:'start',category:'work',confidence:.88,label:'Active labor'};
 return{intent:'unknown',confidence:0};}
function button(q){return document.querySelector(q)}
function stopCurrent(){const s=study();if(!s?.timer?.running)return true;const b=button('[data-action="stop-timer"]');if(!b)return false;b.click();return true}
function startCategory(cat){const s=study();if(s?.timer?.running&&!stopCurrent())return false;const b=button(`[data-timer-cat="${cat}"]`);if(!b)return false;b.click();return true}
function currentOwner(){const p=prefs();return p.owner||'hybrid'}
function setOwner(owner,announce=true){const p=prefs();p.owner=owner;savePrefs(p);if(announce)speak(owner==='gravity'?'Clock control switched to Gravity.':owner==='user'?'Clock control switched to you.':'Clock control switched to Hybrid.');render();return owner}
function cycleOwner(){const cur=currentOwner(),next=cur==='user'?'gravity':cur==='gravity'?'hybrid':'user';return setOwner(next)}
function execute(result,raw){const s=study();if(!s)return false;if(result.intent==='switch'){if(s.timer?.running)stopCurrent();cycleOwner();return true}if(result.intent==='owner-gravity'){if(s.timer?.running)stopCurrent();setOwner('gravity');return true}if(result.intent==='owner-user'){if(s.timer?.running)stopCurrent();setOwner('user');return true}if(result.intent==='stop'){if(!s.timer?.running){speak('No timer is running.');return true}stopCurrent();setTimeout(()=>{const x=study(),last=(x?.observations||[]).slice(-1)[0];speak(`${result.label||'Recorded'}. ${last?.seconds?Number(last.seconds).toFixed(1)+' seconds.':'Recorded.'}`)},40);return true}if(result.intent==='start'){if(currentOwner()==='user'){speak('You have the clock. Use the timer button, or say switch clock.');return true}if(startCategory(result.category)){speak(`${result.label||result.category} started.`);return true}return false}if(result.intent==='event'){const b=button('[data-action="mark-event"]');if(b){b.click();return true}}return false}
function handle(raw){const r=classify(raw);if(r.confidence<.75){speak("I didn't understand that. Please say it again.");return{...r,handled:false}}const handled=execute(r,raw);if(!handled)speak("I couldn't safely apply that timing command. Please say it again.");return{...r,handled}}
let recognition=null,listening=false;
function recognitionCtor(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
function startListening(){const C=recognitionCtor();if(!C){speak('Voice timing control is not available in this browser. You can still use the timer buttons.');return false}if(recognition&&listening)return true;recognition=new C();recognition.continuous=true;recognition.interimResults=false;recognition.lang='en-US';recognition.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)handle(e.results[i][0].transcript)}};recognition.onerror=e=>{if(e.error==='no-speech'||e.error==='aborted')return;speak("I didn't understand that. Please say it again.")};recognition.onend=()=>{listening=false;if(prefs().listening){try{recognition.start();listening=true}catch{}}};try{recognition.start();listening=true;const p=prefs();p.listening=true;savePrefs(p);speak('Voice clock control on.');render();return true}catch{return false}}
function stopListening(){const p=prefs();p.listening=false;savePrefs(p);try{recognition?.stop()}catch{}listening=false;speak('Voice clock control off.');render()}
function css(){if(document.getElementById('ws32-style'))return;const e=document.createElement('style');e.id='ws32-style';e.textContent='.ws32{margin:0 0 16px;padding:14px;border:1px solid rgba(208,162,91,.7);border-radius:14px;background:#0d222b;color:#f6f1e8}.ws32 h3{margin:.2rem 0 .4rem}.ws32-controls{display:flex;gap:8px;flex-wrap:wrap}.ws32 button{padding:9px 12px;border-radius:999px;border:1px solid #d0a25b;background:transparent;color:#fff;font-weight:800}.ws32 button.active{background:#d0a25b;color:#102832}.ws32 small{color:#d3ddd9;display:block;margin-top:8px}';document.head.appendChild(e)}
function render(){const s=study(),root=document.getElementById('ws2-app');if(!s||!root)return;root.querySelectorAll('[data-ws32]').forEach(n=>n.remove());if(!['observe','facts'].includes(s.screen))return;css();const p=prefs(),owner=currentOwner(),box=document.createElement('section');box.className='ws32';box.dataset.ws32='1';box.innerHTML=`<div class="ws5-k">Gravity Clock Control</div><h3>Who holds the clock?</h3><div class="ws32-controls"><button data-owner="user" class="${owner==='user'?'active':''}">I hold it</button><button data-owner="gravity" class="${owner==='gravity'?'active':''}">Gravity holds it</button><button data-owner="hybrid" class="${owner==='hybrid'?'active':''}">Hybrid</button><button data-listen class="${p.listening?'active':''}">${p.listening?'Voice listening on':'Turn on voice timing'}</button></div><small>Say natural phrases such as “heading to mixer,” “arrived,” “complete,” “waiting,” “looking for the scoop,” or “stop, switch clock.” If Gravity is unsure, it asks you to say it again instead of changing the timer.</small>`;root.querySelector('main')?.insertAdjacentElement('afterbegin',box);box.querySelectorAll('[data-owner]').forEach(b=>b.onclick=()=>{const x=study();if(x?.timer?.running)stopCurrent();setOwner(b.dataset.owner)});box.querySelector('[data-listen]').onclick=()=>p.listening?stopListening():startListening()}
new MutationObserver(()=>render()).observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
window.GravityWorkStudyClockControl={classify,handle,setOwner,currentOwner,startListening,stopListening};
})();