(()=>{'use strict';
// Guided Work Study uses the same canonical Gravity neural voice as Gravity Guide.
// Cedar is the default Gravity voice; do not fall back to a device/browser voice.
const KEY='gravityWorkStudyV2',VOICE='cedar',SPEED=.98;let lastSpoken='',lastMode='',entryStartedAt=0;
const GREETING='Hello. I’m Gravity. I’ll take you through this.';
let audioCtx=null,sourceNode=null,speechToken=0;
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function unlockNeuralAudio(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;try{if(!audioCtx)audioCtx=new C();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return true}catch(_){return false}}
function stopVoice(){speechToken++;if(sourceNode){try{sourceNode.onended=null;sourceNode.stop(0)}catch(_){}try{sourceNode.disconnect()}catch(_){}sourceNode=null}}
async function utter(text){if(!text)return;stopVoice();const token=speechToken;lastSpoken=text;if(!unlockNeuralAudio())return;try{const r=await fetch('/.netlify/functions/gravity-tts',{method:'POST',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json'},body:JSON.stringify({text:String(text).slice(0,2800),voice:VOICE,speed:SPEED})});if(!r.ok)throw new Error('TTS HTTP '+r.status);const ct=(r.headers.get('content-type')||'').toLowerCase();if(!ct.includes('audio'))throw new Error('TTS did not return audio');const raw=await (await r.blob()).arrayBuffer();if(token!==speechToken)return;if(audioCtx.state==='suspended')await audioCtx.resume();const buffer=await audioCtx.decodeAudioData(raw.slice(0));if(token!==speechToken)return;const s=audioCtx.createBufferSource();sourceNode=s;s.buffer=buffer;s.connect(audioCtx.destination);s.onended=()=>{if(sourceNode===s)sourceNode=null};s.start(0)}catch(e){if(token===speechToken)console.warn('Gravity Work Study Cedar neural voice unavailable:',e)}}
function currentText(){const s=state();if(!s||s.mode!=='guided')return'';const expert=document.querySelector('[data-ws26] .ws26-q')?.textContent?.trim()||'';if(expert)return `Gravity. ${expert}`;const q=document.querySelector('[data-ws13] .ws13-q')?.textContent?.trim()||'';const obs=document.querySelector('[data-ws17] li')?.textContent?.trim()||'';if(s.screen==='observe'&&obs)return `Observation cue. ${obs}`;return q?`Gravity. ${q}`:''}
function speak(text,force=false){if(!text)return;const s=state();if(s?.timer?.running&&!force)return;if(!force&&text===lastSpoken)return;utter(text)}
function startNow(){const now=Date.now();if(now-entryStartedAt<700)return;entryStartedAt=now;lastMode='guided';unlockNeuralAudio();utter(GREETING)}
function sync(){const s=state();if(!s)return;if(s.mode!=='guided'){lastMode=s.mode||'';lastSpoken='';stopVoice();return}if(s.timer?.running){stopVoice();return}const entered=lastMode!=='guided';lastMode='guided';if(entered&&Date.now()-entryStartedAt>900)startNow();const text=currentText();if(text&&text!==lastSpoken){if(lastSpoken===GREETING){setTimeout(()=>{const next=currentText(),st=state();if(next&&next!==GREETING&&!st?.timer?.running)speak(next)},250)}else speak(text)}}
function guidedTarget(e){return e.target.closest?.('[data-mode="guided"],[data-start="guided"],[data-action="guided"]')}
document.addEventListener('pointerdown',e=>{if(guidedTarget(e)){unlockNeuralAudio();startNow()}},true);
document.addEventListener('click',e=>{if(guidedTarget(e)){unlockNeuralAudio();startNow();setTimeout(sync,0)}},true);
window.addEventListener('gravity-work-study-teaching',e=>{const s=state(),text=String(e.detail?.text||'').trim();if(!text||!s||s.mode!=='guided'||s.timer?.running)return;speak(text)});
new MutationObserver(()=>sync()).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
window.GravityWorkStudyGuidedVoice={speak,currentText,sync,startNow,GREETING,voice:VOICE};
})();
