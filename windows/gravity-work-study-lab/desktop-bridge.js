(()=>{'use strict';
const STUDY='gravityWorkStudyV2',PREFIX='gravityWorkStudy';
const hadStudyOnBoot=!!localStorage.getItem(STUDY);
let saveTimer=null,restored=false,lastSavedAt='';
const parse=(raw,f=null)=>{try{return JSON.parse(raw)??f}catch{return f}};
function status(text,good=true){const el=document.getElementById('windows-native-status');if(!el)return;el.textContent=text;el.dataset.state=good?'good':'warn'}
function study(){return parse(localStorage.getItem(STUDY),null)}
function packageNow(){const api=window.GravityWorkStudyEvidencePackage,s=study();if(!api?.makePackage||!s?.id)return null;return api.makePackage(s)}
async function saveNative(reason='autosave'){try{const pkg=packageNow();if(!pkg||!window.gravityDesktop?.saveEvidencePackage)return null;const out=await window.gravityDesktop.saveEvidencePackage(pkg);lastSavedAt=out?.savedAt||new Date().toISOString();status(`Backed up locally ${new Date(lastSavedAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`);return out}catch(e){status('Local backup needs attention',false);console.error('Gravity Windows backup failed',e);return null}}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveNative('change'),650)}
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,nativeClear=Storage.prototype.clear;
Storage.prototype.setItem=function(key,value){const out=nativeSet.call(this,key,value);if(this===localStorage&&String(key).startsWith(PREFIX))scheduleSave();return out};
Storage.prototype.removeItem=function(key){const out=nativeRemove.call(this,key);if(this===localStorage&&String(key).startsWith(PREFIX))scheduleSave();return out};
Storage.prototype.clear=function(){const out=nativeClear.call(this);if(this===localStorage)scheduleSave();return out};
async function restoreLatestIfNeeded(){if(restored||hadStudyOnBoot||!window.gravityDesktop?.loadLatestEvidencePackage||!window.GravityWorkStudyEvidencePackage)return false;restored=true;const pkg=await window.gravityDesktop.loadLatestEvidencePackage();if(!pkg)return false;try{window.GravityWorkStudyEvidencePackage.importPackage(pkg);status('Restored latest local Windows backup');location.reload();return true}catch(e){status('Backup restore needs attention',false);console.error('Gravity Windows restore failed',e);return false}}
async function exportPackage(){try{const pkg=packageNow();if(!pkg)return alert('Start or open a Work Study before exporting.');await window.gravityDesktop.exportEvidencePackage(pkg);status('Complete study package exported')}catch(e){alert(e.message||e)}}
async function importPackage(){try{const pkg=await window.gravityDesktop.importEvidencePackage();if(!pkg)return;const result=window.GravityWorkStudyEvidencePackage.importPackage(pkg);await saveNative('import');alert(`Gravity restored study ${result.studyId} with ${result.sidecarCount} expert evidence record${result.sidecarCount===1?'':'s'}.`);location.reload()}catch(e){alert(`Gravity could not import this study package. ${e.message||e}`)}}
async function savePdf(){const s=study();await window.gravityDesktop.savePdf((s?.title||s?.problem||s?.id||'Gravity_Work_Study').replace(/[^a-z0-9_-]+/gi,'_'));}
function button(label,action,title){const b=document.createElement('button');b.type='button';b.className='windows-native-btn';b.textContent=label;b.title=title||label;b.addEventListener('click',action);return b}
function mountToolbar(){const host=document.getElementById('windows-native-actions');if(!host||host.dataset.ready)return;host.dataset.ready='1';host.append(button('Backup now',()=>saveNative('manual'),'Save the complete study and expert evidence to the Windows data folder'));host.append(button('Import',importPackage,'Import a complete .gravity-study.json package'));host.append(button('Export',exportPackage,'Export the complete study and expert evidence'));host.append(button('PDF',savePdf,'Save the current view as PDF'));host.append(button('Print',()=>window.gravityDesktop.print(),'Print the current study view'));host.append(button('Data folder',()=>window.gravityDesktop.openDataFolder(),'Open the local Gravity Work Study data folder'))}
window.addEventListener('gravity-work-study-windows-ready',async()=>{mountToolbar();if(await restoreLatestIfNeeded())return;await saveNative('ready')});
document.addEventListener('DOMContentLoaded',()=>{mountToolbar();status('Local backup ready')});
window.addEventListener('beforeunload',()=>{try{const pkg=packageNow();if(pkg)window.gravityDesktop?.saveEvidencePackage(pkg)}catch{}});
window.GravityWorkStudyDesktopBridge={saveNative,exportPackage,importPackage,restoreLatestIfNeeded,get lastSavedAt(){return lastSavedAt}};
})();
