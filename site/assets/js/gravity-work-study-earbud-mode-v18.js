(()=>{'use strict';
// Guided voice begins from the user's Guided-mode press; do not wait for the interview card to render.
const KEY='gravityWorkStudyV2';let lastSpoken='',lastMode='',entryStartedAt=0;
const GREETING='Hello. I’m Gravity. I’ll take you through this.';
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function canSpeak(){return 'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window}
function utter(text){if(!canSpeak()||!text)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.98;u.pitch=1;u.volume=1;lastSpoken=text;window.speechSynthesis.speak(u)}
function currentText(){const s=state();if(!s||s.mode!=='guided')return'';const expert=document.querySelector('[data-ws26] .ws26-q')?.textContent?.trim()||'';if(expert)return `Gravity. ${expert}`;const q=document.querySelector('[data-ws13] .ws13-q')?.textContent?.trim()||'';const obs=document.querySelector('[data-ws17] li')?.textContent?.trim()||'';if(s.screen==='observe'&&obs)return `Observation cue. ${obs}`;return q?`Gravity. ${q}`:''}
function speak(text,force=false){if(!text)return;const s=state();if(s?.timer?.running&&!force)return;if(!force&&text===lastSpoken)return;utter(text)}
function startNow(){const now=Date.now();if(now-entryStartedAt<700)return;entryStartedAt=now;lastMode='guided';utter(GREETING)}
function sync(){const s=state();if(!s)return;if(s.mode!=='guided'){lastMode=s.mode||'';lastSpoken='';window.speechSynthesis?.cancel?.();return}if(s.timer?.running){window.speechSynthesis?.cancel?.();return}const entered=lastMode!=='guided';lastMode='guided';if(entered&&Date.now()-entryStartedAt>900)startNow();const text=currentText();if(text&&text!==lastSpoken){if(lastSpoken===GREETING){setTimeout(()=>{const next=currentText(),st=state();if(next&&next!==GREETING&&!st?.timer?.running)speak(next)},250)}else speak(text)}}
function guidedTarget(e){return e.target.closest?.('[data-mode="guided"],[data-start="guided"],[data-action="guided"]')}
document.addEventListener('pointerdown',e=>{if(guidedTarget(e))startNow()},true);
document.addEventListener('click',e=>{if(guidedTarget(e)){startNow();setTimeout(sync,0)}},true);
window.addEventListener('gravity-work-study-teaching',e=>{const s=state(),text=String(e.detail?.text||'').trim();if(!text||!s||s.mode!=='guided'||s.timer?.running)return;speak(text)});
new MutationObserver(()=>sync()).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
window.GravityWorkStudyGuidedVoice={speak,currentText,sync,startNow,GREETING};
})();
