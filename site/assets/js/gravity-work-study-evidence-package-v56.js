(()=>{'use strict';
const STUDY='gravityWorkStudyV2',HISTORY='gravityWorkStudyV2History',PREFIX='gravityWorkStudy';
function parse(raw,f=null){try{return JSON.parse(raw)??f}catch{return f}}
function study(){return parse(localStorage.getItem(STUDY),null)}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function extractForStudy(key,value,id){if(key===STUDY||key===HISTORY)return null;if(value==null)return null;if(Array.isArray(value)){const rows=value.filter(x=>x&&typeof x==='object'&&(x.studyId===id||x.id===id));return rows.length?{mode:'array-records',value:rows}:null}if(typeof value!=='object')return null;if(value.studyId===id||value.id===id)return{mode:'direct-record',value};if(Object.prototype.hasOwnProperty.call(value,id))return{mode:'keyed-by-study',value:value[id]};return null}
function collectSidecars(id){const out={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key||!key.startsWith(PREFIX)||key===STUDY||key===HISTORY)continue;const value=parse(localStorage.getItem(key),null),hit=extractForStudy(key,value,id);if(hit)out[key]=hit}return out}
function historyRecord(id){const h=parse(localStorage.getItem(HISTORY),'[]');return Array.isArray(h)?h.find(x=>x?.id===id)||null:null}
function makePackage(s){if(!s?.id)throw Error('No active Work Study is available to export.');const sidecars=collectSidecars(s.id);return{packageType:'gravity-work-study-evidence-package',packageVersion:1,studyId:s.id,exportedAt:new Date().toISOString(),source:'Gravity Work Study Lab',study:JSON.parse(JSON.stringify(s)),historyRecord:historyRecord(s.id),sidecars,sidecarCount:Object.keys(sidecars).length,integrityNote:'This package preserves the base study and discovered study-specific Gravity Work Study sidecar evidence. Raw observations are not rewritten during export.'}}
function download(pkg){const blob=new Blob([JSON.stringify(pkg,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${pkg.studyId||'gravity-work-study'}.gravity-study.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},15000)}
function mergeHistory(studyRecord){if(!studyRecord?.id)return;const h=parse(localStorage.getItem(HISTORY),'[]'),list=Array.isArray(h)?h:[],copy=JSON.parse(JSON.stringify(studyRecord)),i=list.findIndex(x=>x?.id===copy.id);if(i>=0)list[i]=copy;else list.push(copy);localStorage.setItem(HISTORY,JSON.stringify(list.slice(-100)))}
function restoreSidecar(key,item,id){if(!item||!item.mode)return;if(item.mode==='keyed-by-study'){const cur=parse(localStorage.getItem(key),'{}'),obj=cur&&typeof cur==='object'&&!Array.isArray(cur)?cur:{};obj[id]=item.value;localStorage.setItem(key,JSON.stringify(obj));return}if(item.mode==='direct-record'){localStorage.setItem(key,JSON.stringify(item.value));return}if(item.mode==='array-records'){const cur=parse(localStorage.getItem(key),'[]'),list=Array.isArray(cur)?cur:[];const incoming=Array.isArray(item.value)?item.value:[];for(const rec of incoming){const rid=rec?.studyId||rec?.id;if(!rid)continue;const idx=list.findIndex(x=>(x?.studyId||x?.id)===rid);if(idx>=0)list[idx]=rec;else list.push(rec)}localStorage.setItem(key,JSON.stringify(list));}}
function validatePackage(pkg){
  const errors=[],isRecord=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  if(!isRecord(pkg)||pkg.packageType!=='gravity-work-study-evidence-package')errors.push('This is not a Gravity Work Study evidence package.');
  if(pkg?.packageVersion!==1)errors.push('This package version is not supported.');
  if(!isRecord(pkg?.study)||typeof pkg?.study?.id!=='string'||!pkg.study.id||pkg.study.id!==pkg.studyId)errors.push('Study identifier is missing or inconsistent.');
  if(!Number.isInteger(pkg?.study?.version)||pkg.study.version<1)errors.push('Base study version is missing or invalid.');
  if(pkg?.historyRecord!==undefined&&pkg.historyRecord!==null&&(!isRecord(pkg.historyRecord)||pkg.historyRecord.id!==pkg.studyId))errors.push('Saved history record does not match this study.');
  if(pkg?.sidecars!==undefined&&!isRecord(pkg.sidecars))errors.push('Expert evidence section must be an object.');
  if(isRecord(pkg?.sidecars))for(const [key,entry] of Object.entries(pkg.sidecars)){
    if(!key.startsWith(PREFIX)||key===STUDY||key===HISTORY||key==='__proto__'||key==='constructor'||key==='prototype')errors.push('Invalid evidence storage key.');
    if(!isRecord(entry)||!['keyed-by-study','direct-record','array-records'].includes(entry.mode)){
      errors.push('Invalid evidence record type.');continue;
    }
    if(entry.mode==='direct-record'&&(!isRecord(entry.value)||!(entry.value.studyId===pkg.studyId||entry.value.id===pkg.studyId)))errors.push('Evidence does not belong to this study.');
    if(entry.mode==='array-records'&&(!Array.isArray(entry.value)||entry.value.some(x=>!isRecord(x)||!(x.studyId===pkg.studyId||x.id===pkg.studyId))))errors.push('Evidence array contains unrelated records.');
  }
  return errors;
}
function importPackage(pkg){
  const errors=validatePackage(pkg);if(errors.length)throw Error(errors.join(' '));
  const id=pkg.studyId;
  const updates=new Map([[STUDY,JSON.stringify(pkg.study)]]);
  const historyText=localStorage.getItem(HISTORY);
  let currentHistory;
  try{currentHistory=historyText===null?[]:JSON.parse(historyText)}catch(e){throw Error('Current history is unreadable; import stopped.')}
  if(!Array.isArray(currentHistory))throw Error('Current history is unreadable; import stopped.');
  const activeText=localStorage.getItem(STUDY);
  let previousActive;
  try{previousActive=activeText===null?null:JSON.parse(activeText)}catch(e){throw Error('Current study is unreadable; import stopped.')}
  if(previousActive?.id&&previousActive.id!==id){
    const archived={...previousActive,savedAt:new Date().toISOString()};
    const oldIndex=currentHistory.findIndex(x=>x?.id===previousActive.id);
    if(oldIndex>=0)currentHistory[oldIndex]=archived;else currentHistory.push(archived);
  }
  const historyRecord=JSON.parse(JSON.stringify(pkg.historyRecord||pkg.study));
  const i=currentHistory.findIndex(x=>x?.id===id);
  if(i>=0)currentHistory.splice(i,1);
  currentHistory.push(historyRecord);
  updates.set(HISTORY,JSON.stringify(currentHistory.slice(-100)));
  for(const [key,item] of Object.entries(pkg.sidecars||{})){
    const raw=localStorage.getItem(key);
    let current;
    try{current=raw===null?null:JSON.parse(raw)}catch(e){throw Error('Existing evidence is unreadable; import stopped for '+key)}
    if(item.mode==='keyed-by-study'){
      if(current!==null&&(typeof current!=='object'||Array.isArray(current)))throw Error('Existing evidence format is incompatible for '+key);
      const copy=current?JSON.parse(JSON.stringify(current)):{};
      Object.defineProperty(copy,id,{value:item.value,writable:true,enumerable:true,configurable:true});
      updates.set(key,JSON.stringify(copy));
    }else if(item.mode==='direct-record'){
      if(current!==null&&(!current||typeof current!=='object'||!(current.studyId===id||current.id===id)))
        throw Error('Existing evidence belongs to another study; import stopped for '+key);
      updates.set(key,JSON.stringify(item.value));
    }else if(item.mode==='array-records'){
      if(current!==null&&!Array.isArray(current))throw Error('Existing evidence array is incompatible for '+key);
      const list=current?JSON.parse(JSON.stringify(current)):[];
      const matchingIndexes=list.map((x,i)=>(x?.studyId===id||x?.id===id)?i:-1).filter(i=>i>=0);
      const first=matchingIndexes.length?matchingIndexes[0]:list.length;
      const kept=list.filter(x=>!(x?.studyId===id||x?.id===id));
      kept.splice(Math.min(first,kept.length),0,...item.value);
      updates.set(key,JSON.stringify(kept));
    }
  }
  const originals=new Map();
  for(const key of updates.keys())originals.set(key,localStorage.getItem(key));
  if(!confirm('Import study '+id+'? This will replace the currently open study, change saved history and supporting evidence for that study, and may discard unsaved screen edits. Keep an external backup first.'))
    return {cancelled:true,studyId:id,sidecarCount:0};
  try{
    for(const [key,value] of updates){
      localStorage.setItem(key,value);
      if(localStorage.getItem(key)!==value)throw Error('Could not verify saved study information');
    }
  }catch(error){
    let rollbackVerified=true;
    for(const [key,value] of originals){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch(_){rollbackVerified=false}}
    for(const [key,value] of originals){try{if(localStorage.getItem(key)!==value)rollbackVerified=false}catch(_){rollbackVerified=false}}
    if(!rollbackVerified)throw Error('URGENT: Import failed and previous work could not be fully restored. Do not reload; preserve external backups and stop using this browser for new studies until recovery.');
    throw Error('Import failed. Previous study data was verified and restored. No imported changes were retained.');
  }
  return {studyId:id,sidecarCount:Object.keys(pkg.sidecars||{}).length};
}
function chooseImport(){
  const input=document.createElement('input');input.type='file';input.accept='.json,.gravity-study.json,application/json';
  input.addEventListener('change',()=>{
    const f=input.files?.[0];if(!f)return;
    const r=new FileReader();
    r.onerror=()=>alert('Gravity could not read the selected file. Existing work was not changed.');
    r.onload=()=>{try{
      const pkg=JSON.parse(String(r.result||'')),result=importPackage(pkg);
      if(result.cancelled)return;
      alert('Study '+result.studyId+' restored and verified with '+result.sidecarCount+' expert evidence records. The page will reload now.');
      location.reload();
    }catch(e){alert('Gravity could not import this study package. '+(e.message||e))}};
    r.readAsText(f);
  });
  input.click();
}
function render(){
  const s=study(),root=document.getElementById('ws2-app');
  if(!root)return;
  const existing=root.querySelector('[data-ws56-box]'),mount=root.querySelector('main');
  if(!s||!['start','history','review','sop'].includes(s.screen)||!mount){
    existing?.remove();
    return;
  }
  const sidecarCount=Object.keys(collectSidecars(s.id)).length;
  const fingerprint=JSON.stringify([s.id,s.screen,sidecarCount]);
  // Ignore mutation notifications caused by our own render. Otherwise the
  // MutationObserver removes and recreates this panel indefinitely.
  if(existing&&existing.parentElement===mount&&existing.dataset.ws56Key===fingerprint)return;
  existing?.remove();
  const box=document.createElement('section');
  box.dataset.ws56Box='1';
  box.dataset.ws56Key=fingerprint;box.style.cssText='margin:0 0 16px;padding:16px;border:1px solid rgba(127,180,158,.72);border-radius:16px;background:#0d222b;color:#f6f1e8';box.innerHTML=`<div style="font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#7fb49e">Gravity Complete Evidence Package</div><h3 style="color:#fff;margin:.25rem 0 .45rem">Keep the whole study together</h3><p>Exporting this package carries the base study plus the study-specific expert evidence Gravity can discover on this device. It does not export unrelated Work Studies.</p><div style="padding:10px;border-left:4px solid #7fb49e;background:rgba(255,255,255,.06);border-radius:8px"><strong>${esc(s.id)}</strong><br>${sidecarCount} expert sidecar record${sidecarCount===1?'':'s'} currently discovered for this study.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" data-ws56-export style="border:1px solid #7fb49e;border-radius:999px;background:#7fb49e;color:#102832;padding:9px 13px;font-weight:850">Export complete study package</button><button type="button" data-ws56-import style="border:1px solid #d0a25b;border-radius:999px;background:transparent;color:#fff;padding:9px 13px;font-weight:850">Import complete study package</button></div><small style="display:block;margin-top:9px;color:#cbd8d8">Local-first rule: export/import is a manual portability and backup path. It is not hosted cross-device sync, and Gravity does not claim that sync exists yet.</small>`;mount.appendChild(box);box.querySelector('[data-ws56-export]')?.addEventListener('click',()=>{try{download(makePackage(study()))}catch(e){alert(e.message||e)}});box.querySelector('[data-ws56-import]')?.addEventListener('click',chooseImport)}
new MutationObserver(render).observe(document.documentElement,{subtree:true,childList:true});render();window.GravityWorkStudyEvidencePackage={makePackage,importPackage,validatePackage,collectSidecars,extractForStudy};
})();