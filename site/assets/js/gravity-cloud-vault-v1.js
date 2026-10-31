/* Gravity encrypted customer backups v1.
 * Account verification: Netlify Identity; encryption: browser-only PBKDF2/AES-GCM.
 * The recovery passphrase is never saved to localStorage or transmitted.
 * All uploads are OPT-IN and only occur in an open, unlocked tool tab.
 */
(()=>{'use strict';
const $=x=>document.getElementById(x);
const identityPage=!!$('gravity-cloud-login');
const tool=$('lab-backup')?'shift':$('backup-json')?'inventory':null;
const keys=tool==='shift'?['gravityShiftLabProfileV3','gravityShiftLabSchedulesV3']:tool==='inventory'?['gravityInventoryCenter.v1']:[];
const API='/gravity-cloud-backup/';
const enc=new TextEncoder(),dec=new TextDecoder();
let account=null,passphrase='',revision=0,lastDigest='',auto=false,busy=false,timer=null,connected=false;
let ui=null,verifiedLockHash=null;
const report=(message,error=false)=>{
 const target=ui||$('account-status');if(!target)return;
 target.textContent=message;target.setAttribute('role',error?'alert':'status');
 target.style.color=error?'#8b312d':'inherit';
};
async function fetchJSON(url,opts){
 const res=await fetch(url,{credentials:'same-origin',cache:'no-store',...opts});
 let data;try{data=await res.json()}catch{data={error:'Unexpected response'}}
 if(!res.ok){const e=new Error(data.error||'Request failed');e.status=res.status;throw e}
 return data;
}
const bytesToBase64=b=>{
 const a=new Uint8Array(b);let binary='';
 for(let i=0;i<a.length;i+=32768)binary+=String.fromCharCode(...a.subarray(i,i+32768));
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
};
const base64ToBytes=s=>{
 let b=atob(String(s).replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4));
 const out=new Uint8Array(b.length);for(let i=0;i<b.length;i++)out[i]=b.charCodeAt(i);
 return out;
};
const random=n=>crypto.getRandomValues(new Uint8Array(n));
async function aesKey(phrase,salt,iterations){
 const material=await crypto.subtle.importKey('raw',enc.encode(phrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encrypt(data){
 const salt=random(16),iv=random(12),iterations=310000,key=await aesKey(passphrase,salt,iterations);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(data)));
 return {version:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations,salt:bytesToBase64(salt),iv:bytesToBase64(iv),ciphertext:bytesToBase64(ciphertext)};
}
async function decrypt(payload){
 if(payload?.version!==1||payload.alg!=='AES-256-GCM'||payload.kdf!=='PBKDF2-SHA256'||payload.iterations<310000||payload.iterations>1000000)throw Error('Unsupported encrypted backup');
 const key=await aesKey(passphrase,base64ToBytes(payload.salt),payload.iterations);
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(payload.iv)},key,base64ToBytes(payload.ciphertext));
 return JSON.parse(dec.decode(plain));
}
async function digest(s){
 const hash=await crypto.subtle.digest('SHA-256',enc.encode(s));
 return bytesToBase64(hash);
}
function currentData(){return keys.map(k=>localStorage.getItem(k))}
function valid(v){
 if(!Array.isArray(v)||v.length!==keys.length)return false;
 try{
  if(tool==='shift'){
   const p=JSON.parse(v[0]||'null'),s=JSON.parse(v[1]||'null');
   return !!(p&&typeof p==='object'&&!Array.isArray(p)&&Array.isArray(p.employees)&&s&&typeof s==='object'&&!Array.isArray(s));
  }
  const state=JSON.parse(v[0]||'null');
  if(!state||typeof state!=='object')return false;
  if(window.InventoryValidation){window.InventoryValidation.validateState(state);return true}
  return state.schemaVersion===1&&Array.isArray(state.items)&&Array.isArray(state.locations);
 }catch{return false}
}
function receiptKey(){return 'gravityCloudBackupReceiptV1:'+account.id+':'+tool}
function getReceipt(){try{return JSON.parse(localStorage.getItem(receiptKey())||'null')}catch{return null}}
function saveReceipt(hash,rev){try{localStorage.setItem(receiptKey(),JSON.stringify({digest:hash,revision:rev,savedAt:new Date().toISOString()}));return true}catch{return false}}
function clearTimers(){clearTimeout(timer);timer=null}
function trigger(){
 if(!auto||!passphrase||!connected||busy)return;
 clearTimers();timer=setTimeout(()=>upload(false),35000);
}
async function checkManagerPin(profile){
 if(!profile?.payLockHash)return true;
 if(verifiedLockHash===profile.payLockHash)return true;
 const pin=prompt('Manager Pay Lock is required for cloud backup/recovery. Enter your Shift Lab manager PIN (Cancel to stop).');
 if(pin===null)return false;
 const text='GravityShiftLab|'+pin;
 let hash='';
 if(crypto.subtle){
  const a=await crypto.subtle.digest('SHA-256',enc.encode(text));
  hash=[...new Uint8Array(a)].map(v=>v.toString(16).padStart(2,'0')).join('');
 }else{
  let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}
  hash='fallback-'+(h>>>0).toString(16);
 }
 if(hash===profile.payLockHash){verifiedLockHash=hash;return true}
 return false;
}
async function upload(force){
 if(!connected||!passphrase||busy){return}
 busy=true;clearTimers();
 try{
  let values=currentData();
  if(!valid(values))throw Error('There is no valid saved '+tool+' workspace to back up. Save your work first.');
  const hash=await digest(JSON.stringify(values));
  if(!force&&hash===lastDigest){report('Encrypted cloud copy is current. Your local work has not changed.');return}
  // Never let a new browser overwrite another device's cloud history with an
  // unrelated passphrase. A confirmed account alone is not enough.
  if(force&&revision>0&&!auto){
   const previous=await fetchJSON(API+tool);
   if(previous.revision!==revision)throw Error('The cloud version changed since you signed in. Reload your cloud status before saving.');
   let old;
   try{old=await decrypt(previous.envelope)}
   catch{throw Error('The recovery passphrase does not unlock the existing cloud backup. Nothing was replaced.')}
   if(old?.schema!==1||old.tool!==tool||!valid(old.keys))throw Error('Existing cloud records failed validation. Nothing was replaced.');
  }
  if(tool==='shift'&&!await checkManagerPin(JSON.parse(values[0])))throw Error('Manager PIN was not verified. Cloud backup was not changed.');
  const envelope=await encrypt({schema:1,tool,keys:values,createdAt:new Date().toISOString()});
  if(JSON.stringify(envelope).length>875000)throw Error('Workspace exceeds the safe upload limit. Export a manual backup.');
  const res=await fetchJSON(API+tool,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({baseRevision:revision,envelope})});
  revision=res.revision;lastDigest=hash;const receiptSaved=saveReceipt(hash,revision);auto=receiptSaved;
  report('Encrypted cloud backup saved: version '+revision+' at '+new Date(res.createdAt).toLocaleString()+(receiptSaved?'. Local file backups are still recommended.':'. Your browser could not save the local receipt; future automatic uploads are paused.'),!receiptSaved);
 }catch(e){
  if(e.status===409||e.status===429){auto=false;report('Cloud backup paused: '+e.message+' Check the latest cloud copy before continuing.',true)}
  else report('Cloud backup did not save: '+e.message+' Your local work remains on this computer.',true);
 }finally{busy=false}
}
async function restore(){
 if(!connected||!passphrase||busy)return;
 busy=true;
 try{
  const data=await fetchJSON(API+tool);
  const restored=await decrypt(data.envelope);
  if(restored?.schema!==1||restored.tool!==tool||!valid(restored.keys))throw Error('Backup content does not match this Gravity workspace.');
  if(tool==='shift'&&!await checkManagerPin(JSON.parse(restored.keys[0])))throw Error('Manager PIN was not verified; no data was restored.');
  if(!confirm('Replace the '+tool+' data on this device with encrypted cloud revision '+data.revision+'? Download a local backup of this device first. This cannot be undone without an older copy.'))return;
  const before=currentData();
  try{
   for(let i=0;i<keys.length;i++)localStorage.setItem(keys[i],restored.keys[i]);
   const hash=await digest(JSON.stringify(restored.keys));
   if(!saveReceipt(hash,data.revision))throw Error('Restoration data was written but the local recovery receipt could not be saved. Keep a separate backup and verify the page after reload.');revision=data.revision;lastDigest=hash;
   report('Cloud backup recovered. Reloading '+tool+' to show restored records.');
   location.reload();
  }catch(e){
   for(let i=0;i<keys.length;i++)try{if(before[i]===null)localStorage.removeItem(keys[i]);else localStorage.setItem(keys[i],before[i])}catch{}
   throw Error('Restoration failed and the previous data was reapplied: '+e.message);
  }
 }catch(e){report('Cloud recovery stopped: '+(e.name==='OperationError'?'Incorrect recovery passphrase or damaged backup.':e.message),true)}
 finally{busy=false}
}
async function unlock(){
 const input=$('gravity-cloud-passphrase'),phrase=input?.value||'';
 if(phrase.length<16){report('Use a separate recovery passphrase of at least 16 characters. Do not use your account password.',true);return}
 const user=await fetchJSON(API+'status');
 account=user.account;revision=Number(user.tools.find(x=>x.tool===tool)?.revision||0);
 passphrase=phrase;input.value='';connected=true;
 const values=currentData(),receipt=getReceipt(),hash=valid(values)?await digest(JSON.stringify(values)):'';
 const matches=!!(receipt&&receipt.revision===revision);
 lastDigest=matches?receipt.digest:'';
 auto=!revision||matches;
 $('gravity-cloud-controls').hidden=false;
 if(auto){report('Encrypted cloud backup enabled for this open '+tool+' tab. It starts after a saved change.');if(hash!==lastDigest)trigger()}
 else report('An existing cloud copy was found (revision '+revision+'). Automatic upload is PAUSED to prevent overwriting another device. Recover it, or explicitly replace it with this device.',true);
}
async function refreshStatus(){
 try{
  const data=await fetchJSON(API+'status');account=data.account;revision=Number(data.tools.find(x=>x.tool===tool)?.revision||0);
  report('Signed in as '+account.email+'. Enter a separate recovery passphrase to unlock encrypted backup.');
 }catch(e){account=null;report('Cloud backup unavailable: '+(e.status===401?'sign in to your Gravity customer account first.':e.message)+' Local backups still work.');}
}
function toolUI(){
 const anchor=$('gravity-local-recovery-status')||$('lab-restore')||$('restore-json');
 if(!anchor)return;
 const el=document.createElement('section');el.id='gravity-cloud-backup';el.style.cssText='margin:18px 0;padding:14px;border:2px solid #a1b9b1;border-radius:12px;background:#f6f8f6;color:#1d3437;font:14px/1.5 system-ui,sans-serif';
 el.innerHTML='<h3 style="margin:0 0 8px;color:#164c4a">Encrypted Cloud Backup (Optional)</h3><p>Verified account + private recovery passphrase. Runs only while this tab is open and unlocked. <a href="/gravity-cloud-vault">Account & instructions</a>.</p><label for="gravity-cloud-passphrase">Recovery passphrase (16+ characters; never your login password)</label><input id="gravity-cloud-passphrase" type="password" autocomplete="off" minlength="16" style="width:100%;padding:10px;border-radius:7px;border:1px solid #7e9a93"><button type="button" id="gravity-cloud-unlock">Unlock Cloud Backup</button><div id="gravity-cloud-controls" hidden><button type="button" id="gravity-cloud-now">Save Encrypted Cloud Copy Now</button><button type="button" id="gravity-cloud-restore">Recover Cloud Copy</button><button type="button" id="gravity-cloud-disconnect">Disconnect This Tab</button><p>Cloud versions do not publish schedules or employee SOPs. A manual download is always recommended before replacing data.</p></div><p id="gravity-cloud-message" role="status" style="margin:10px 0"></p>';
 anchor.insertAdjacentElement('afterend',el);ui=$('gravity-cloud-message');
 $('gravity-cloud-unlock').onclick=()=>unlock().catch(e=>report('Cloud authentication failed: '+e.message,true));
 $('gravity-cloud-now').onclick=()=>{
  if(!auto&&!confirm('Your cloud copy may contain newer records from another computer. REPLACE the latest cloud copy with THIS DEVICE instead? Download the cloud copy first if unsure.'))return;
  auto=true;upload(true);
 };
 $('gravity-cloud-restore').onclick=restore;
 $('gravity-cloud-disconnect').onclick=()=>{
  passphrase='';verifiedLockHash=null;auto=false;connected=false;clearTimers();$('gravity-cloud-controls').hidden=true;report('Cloud backup disconnected for this tab. Your local data is unchanged.');
 };
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)trigger()});
 window.addEventListener('gravity:local-data-saved',trigger);
 setInterval(()=>{if(!document.hidden)trigger()},60000);
 refreshStatus();
}
async function accountPage(){
 const auth=window.GravityCustomerIdentity;
 if(!auth){report('Account component is unavailable. No cloud backup can be enabled.',true);return}
 try{
  if(location.hash&&/(confirmation_token|invite_token|recovery_token|access_token)/.test(location.hash)){
   await auth.handleAuthCallback();
   history.replaceState(null,'',location.pathname+location.search);
  }
 }catch(e){report('Account link could not be completed: '+e.message,true)}
 async function redraw(){
  try{
   const x=await fetchJSON(API+'status');
   $('account-panel').hidden=false;$('login-card').hidden=true;$('signup-card').hidden=true;$('account-email').textContent='Signed in: '+x.account.email;
   report('Customer account verified. Open Shift Lab or Inventory Center to enable optional encrypted backups.');
  }catch(e){
   $('account-panel').hidden=true;$('login-card').hidden=false;$('signup-card').hidden=false;
   report(e.status===401?'Not signed in. Account sign-in is required for cloud backups.':'Account service: '+e.message,e.status!==401);
  }
 }
 for(const [id,method] of [['gravity-cloud-login','login'],['gravity-cloud-signup','signup']]){
  $(id).addEventListener('submit',async event=>{
   event.preventDefault();
   const f=event.target,d=new FormData(f),email=String(d.get('email')||''),password=String(d.get('password')||'');
   if(password.length<12){report('Choose a password of at least 12 characters.',true);return}
   const button=f.querySelector('button');button.disabled=true;
   try{
    await auth[method](email,password);
    if(method==='signup')report('Registration submitted. Check your email for the Gravity account confirmation link before signing in.');
    else{f.reset();await redraw()}
   }catch(e){report((method==='signup'?'Registration':'Sign-in')+' failed: '+e.message,true)}
   finally{button.disabled=false}
  });
 }
 $('gravity-cloud-signout').onclick=async()=>{
  try{await auth.logout();await redraw()}catch(e){report('Sign-out failed: '+e.message,true)}
 };
 await redraw();
}
if(identityPage)accountPage();
else if(tool){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',toolUI,{once:true});else toolUI()}
})();
