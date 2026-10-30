/* Gravity same-browser recovery snapshots v1.
 * Secondary IndexedDB snapshots complement, NEVER replace, downloaded file backups.
 * They do not survive "clear site data", device loss, or cross-device moves.
 * No records are sent to a server. Shift Lab snapshots contain private wages.
 */
(function(){
'use strict';
const mode=document.getElementById('lab-backup')?'shift':document.getElementById('backup-json')?'inventory':null;
if(!mode||!window.indexedDB)return;
const keys=mode==='shift'?['gravityShiftLabProfileV3','gravityShiftLabSchedulesV3']:['gravityInventoryCenter.v1'];
const slot=mode==='shift'?'gravity-shift-lab':'gravity-inventory-center';
let dbPromise=null,lastSignature='',timer=0,busy=false,queued=false,enabled=true;
let button=null,status=null;
function json(s){try{return JSON.parse(s||'null')}catch{return null}}
function valid(value){
 if(mode==='shift'){
  const p=json(value[0]),s=json(value[1]);
  return !!(p&&typeof p==='object'&&!Array.isArray(p)&&Array.isArray(p.employees)&&s&&typeof s==='object'&&!Array.isArray(s)&&
   (String(p.restaurant||'').trim()||p.employees.some(e=>String(e.name||'').trim())||Object.values(s).some(w=>
     String(w&&w.sales||'').trim()||Object.values(w&&w.shifts||{}).some(a=>Array.isArray(a)&&a.some(x=>String(x||'').trim())))));
 }
 const inv=json(value[0]);
 if(!inv||typeof inv!=='object')return false;
 try{if(window.InventoryValidation)window.InventoryValidation.validateState(inv)}catch{return false}
 return !!(inv.profile&&String(inv.profile.restaurant||'').trim()||inv.items?.length||inv.locations?.length||inv.movements?.length);
}
function openDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open('GravitySameBrowserRecoveryV1',1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('snapshots'))request.result.createObjectStore('snapshots')};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('Local recovery storage is unavailable'));
  request.onblocked=()=>reject(new Error('A separate tab is preventing local recovery storage access'));
 }).catch(e=>{dbPromise=null;throw e});
 return dbPromise;
}
async function read(){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('snapshots','readonly');
  const r=tx.objectStore('snapshots').get(slot);
  r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);
  r.onerror=()=>reject(r.error);
 });
}
async function write(items){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('snapshots','readwrite');
  tx.objectStore('snapshots').put(items,slot);
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error||new Error('Snapshot could not be written'));
  tx.onabort=()=>reject(tx.error||new Error('Snapshot write was interrupted'));
 });
}
function show(msg,problem=false){
 if(!status)return;
 status.textContent=msg;
 status.style.color=problem?'#f2b4b4':'inherit';
 status.setAttribute('role',problem?'alert':'status');
}
function data(){return keys.map(k=>localStorage.getItem(k))}
function queue(){clearTimeout(timer);timer=setTimeout(()=>{capture().catch(e=>show('Local snapshot failed: '+e.message+'. Download a manual backup before leaving this page.',true))},300)}
async function capture(){
 if(!enabled)return;
 if(busy){queued=true;return}
 busy=true;
 try{
  const value=data();
  if(!valid(value))return;
  const signature=JSON.stringify(value);
  if(signature===lastSignature)return;
  const existing=await read();
  if(existing[0]&&existing[0].signature===signature){lastSignature=signature;return}
  const next=[{at:new Date().toISOString(),signature,value},...existing].slice(0,5);
  await write(next);
  lastSignature=signature;
  if(button)button.disabled=false;
  show('Automatic same-browser recovery snapshot saved ('+new Date(next[0].at).toLocaleString()+'). Download a separate backup file to protect against device loss.');
 }finally{
  busy=false;
  if(queued){queued=false;queue()}
 }
}
async function secretMatches(profile){
 if(!profile.payLockHash)return true;
 const secret=prompt('Manager Pay Lock is required to recover a Shift Lab snapshot. Enter the manager password/PIN (Cancel to stop).');
 if(secret===null)return false;
 const str='GravityShiftLab|'+String(secret);
 let hashed='';
 if(window.crypto&&window.crypto.subtle&&window.TextEncoder){
  const out=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  hashed=Array.from(new Uint8Array(out)).map(b=>b.toString(16).padStart(2,'0')).join('');
 }else{
  let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}
  hashed='fallback-'+(h>>>0).toString(16);
 }
 return hashed===profile.payLockHash;
}
async function restore(){
 const items=await read();
 const snapshot=items[0];
 if(!snapshot||!Array.isArray(snapshot.value)||!valid(snapshot.value)){show('No valid local recovery snapshot was found. Use Restore Backup with your downloaded file.',true);return}
 if(mode==='shift'&&!(await secretMatches(json(snapshot.value[0])))){show('Manager credentials were not verified. Nothing was restored.',true);return}
 const warning='Restore the saved same-browser snapshot from '+new Date(snapshot.at).toLocaleString()+'? This will replace the current '+(mode==='shift'?'schedule and pay-protected manager profile':'inventory records')+' in this browser. Download a backup of current data first. Continue?';
 if(!confirm(warning))return;
 const before=data();
 try{
  // Validate all new contents before touching the stored workspace.
  if(!valid(snapshot.value))throw Error('Stored snapshot is invalid.');
  for(let i=0;i<keys.length;i++){
   if(snapshot.value[i]===null)localStorage.removeItem(keys[i]);
   else localStorage.setItem(keys[i],snapshot.value[i]);
  }
  show('Snapshot restored. Reloading the workspace.');
  location.reload();
 }catch(e){
  for(let i=0;i<keys.length;i++)try{if(before[i]===null)localStorage.removeItem(keys[i]);else localStorage.setItem(keys[i],before[i])}catch{}
  show('Recovery could not be completed. The browser reported: '+e.message+'. Do not clear site data.',true);
 }
}
function initUI(){
 const anchor=document.getElementById(mode==='shift'?'lab-restore':'restore-json');
 if(!anchor||!anchor.parentElement)return;
 button=document.createElement('button');
 button.type='button';
 button.id='gravity-local-recovery';
 button.textContent='Recover Same-Browser Snapshot';
 button.disabled=true;
 button.className=anchor.className||'';
 button.style.cssText='margin:6px 8px;min-height:40px;border:1px solid #82c2bf;border-radius:8px;padding:8px 12px;cursor:pointer;font-weight:700';
 anchor.insertAdjacentElement('afterend',button);
 status=document.createElement('p');
 status.id='gravity-local-recovery-status';
 status.style.cssText='font-size:13px;line-height:1.5;margin:8px 0;padding:6px 0';
 button.insertAdjacentElement('afterend',status);
 show('Same-browser recovery only; this is NOT cloud backup or cross-device synchronization. Keep downloaded backups separately.');
 button.addEventListener('click',()=>restore().catch(e=>show('Local recovery could not be opened: '+e.message,true)));
 read().then(items=>{if(items.length){button.disabled=false;show('Same-browser snapshot available from '+new Date(items[0].at).toLocaleString()+'. Download backups for protection from device loss.')}})
 .catch(e=>{enabled=false;show('Same-browser recovery unavailable: '+e.message+'. Use manual backup downloads.',true)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initUI,{once:true});else initUI();
window.addEventListener('gravity:local-data-saved',queue);
window.addEventListener('storage',e=>{if(keys.includes(e.key))queue()});
window.addEventListener('pagehide',()=>{clearTimeout(timer);capture().catch(()=>{})});
setInterval(()=>{if(document.visibilityState==='visible')queue()},6000);
queue();
})();
