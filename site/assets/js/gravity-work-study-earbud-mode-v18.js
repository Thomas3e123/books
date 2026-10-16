(()=>{'use strict';
const KEY='gravityWorkStudyV2';let lastSpoken='',lastMode='';
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function canSpeak(){return 'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window}
function currentText(){const s=state();if(!s||s.mode!=='guided')return'';const fresh=s.screen==='problem';const q=document.querySelector('[data-ws13] .ws13-q')?.textContent?.trim()||'';const obs=document.querySelector('[data-ws17] li')?.textContent?.trim()||'';if(fresh&&q)return `Hello. I’m Gravity. I’ll take you through this. ${q}`;if(s.screen==='observe'&&obs)return `Observation cue. ${obs}`;return q?`Gravity. ${q}`:''}
function speak(text,force=false){if(!canSpeak()||!text)return;if(!force&&text===lastSpoken)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.96;u.pitch=1;u.volume=1;lastSpoken=text;window.speechSynthesis.speak(u)}
function sync(){const s=state();if(!s)return;if(s.mode!=='guided'){lastMode=s.mode||'';lastSpoken='';window.speechSynthesis?.cancel?.();return}const entered=lastMode!=='guided';lastMode='guided';const text=currentText();if(text)speak(text,entered)}
new MutationObserver(()=>sync()).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',e=>{const t=e.target.closest?.('[data-mode="guided"],[data-start="guided"],[data-action="guided"]');if(t)setTimeout(()=>sync(),0)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
window.GravityWorkStudyGuidedVoice={speak,currentText,sync};
})();
