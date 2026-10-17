'use strict';
const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const PRODUCT='Gravity Work Study Lab';
const PROCESS_FILE_URL='https://thomasmonroebooks.com/.netlify/functions/work-study-process-file';
const TTS_URL='https://thomasmonroebooks.com/.netlify/functions/gravity-tts';
const GUIDED_SMOKE=process.env.GRAVITY_GUIDED_SMOKE==='1';
const SMOKE_TIMEOUT_MS=30000;
function dataDir(){return path.join(app.getPath('userData'),'data');}
function studiesDir(){return path.join(dataDir(),'studies');}
function evidenceDir(){return path.join(dataDir(),'evidence-packages');}
function ensureDirs(){fs.mkdirSync(studiesDir(),{recursive:true});fs.mkdirSync(evidenceDir(),{recursive:true});fs.mkdirSync(path.join(dataDir(),'exports'),{recursive:true});}
function safeId(id){return String(id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);}
function jsonRead(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return fallback;}}
function jsonWrite(file,value){
 const tmp=file+'.tmp',bak=file+'.bak';
 fs.writeFileSync(tmp,JSON.stringify(value,null,2),'utf8');
 const fd=fs.openSync(tmp,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
 try{
  if(fs.existsSync(file)){if(fs.existsSync(bak))fs.unlinkSync(bak);fs.renameSync(file,bak);}
  fs.renameSync(tmp,file);
  if(fs.existsSync(bak))fs.unlinkSync(bak);
 }catch(err){
  try{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch{}
  try{if(!fs.existsSync(file)&&fs.existsSync(bak))fs.renameSync(bak,file)}catch{}
  throw err;
 }
}
function studyPath(id){return path.join(studiesDir(),safeId(id)+'.json');}
function evidencePath(id){return path.join(evidenceDir(),safeId(id)+'.gravity-study.json');}
function validEvidence(pkg){return !!(pkg&&pkg.packageType==='gravity-work-study-evidence-package'&&pkg.packageVersion===1&&pkg.studyId&&pkg.study?.id===pkg.studyId);}
function withTimeout(promise,label,ms=SMOKE_TIMEOUT_MS){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timed out after ${ms} ms.`)),ms))]);}

async function runGuidedSmoke(win){
 const ui=await withTimeout(win.webContents.executeJavaScript(`(async()=>{
  const waitFor=(test,ms=18000)=>new Promise((resolve,reject)=>{const started=Date.now();const tick=()=>{let value=null;try{value=test()}catch{}if(value)return resolve(value);if(Date.now()-started>ms)return reject(new Error('Timed out waiting for Guided UI.'));setTimeout(tick,50)};tick()});
  const button=await waitFor(()=>document.querySelector('[data-start="guided"]'));
  const note=await waitFor(()=>document.querySelector('[data-ws63-note]'));
  const exactInstruction='Click Guided once, then wait for Gravity to join you before clicking anything else.';
  if(!note.textContent.includes(exactInstruction))throw new Error('Exact Guided click-once instruction is missing.');
  if(document.documentElement.dataset.gravityGuidedMutationGuard!=='v62-global-cohort')throw new Error('Global mutation-loop guard is not active before Guided startup.');
  let ticks=0;const heartbeat=setInterval(()=>ticks++,25);
  button.click();
  await new Promise(resolve=>setTimeout(resolve,2500));
  clearInterval(heartbeat);
  const state=JSON.parse(localStorage.getItem('gravityWorkStudyV2')||'null');
  if(state?.mode!=='guided')throw new Error('Guided click did not enter Guided mode.');
  if(ticks<40)throw new Error('Renderer heartbeat stalled after Guided click: '+ticks+' ticks.');
  return{ticks,mode:state.mode,screen:state.screen||'',guard:document.documentElement.dataset.gravityGuidedMutationGuard};
 })()`,true),'Guided renderer responsiveness');
 console.log('GUIDED_RUNTIME_OK',JSON.stringify(ui));

 const durable=await withTimeout(win.webContents.executeJavaScript(`(async()=>{
  if(!window.gravityDesktop?.saveEvidencePackage||!window.gravityDesktop?.loadEvidencePackage)throw new Error('Evidence bridge is unavailable.');
  const id='ci-guided-'+Date.now();
  const pkg={packageType:'gravity-work-study-evidence-package',packageVersion:1,studyId:id,study:{id,title:'Guided CI durability smoke',problem:'Verify durable evidence save and restore',status:'Draft',createdAt:new Date().toISOString()}};
  const saved=await window.gravityDesktop.saveEvidencePackage(pkg);
  const loaded=await window.gravityDesktop.loadEvidencePackage(id);
  if(!saved?.path||loaded?.studyId!==id||loaded?.study?.id!==id)throw new Error('Evidence package did not survive Windows-local save/reload.');
  return{id,savedAt:saved.savedAt,restored:loaded.studyId===id};
 })()`,true),'Windows evidence save/reload');
 console.log('DURABLE_EVIDENCE_OK',JSON.stringify(durable));

 const voice=await withTimeout(win.webContents.executeJavaScript(`(async()=>{
  if(!window.gravityDesktop?.requestTts)throw new Error('Desktop Cedar bridge is unavailable.');
  const result=await window.gravityDesktop.requestTts({text:'Gravity is ready to guide your work study.',voice:'cedar',speed:0.98});
  if(!result?.base64||result.base64.length<100||!String(result.contentType||'').toLowerCase().includes('audio'))throw new Error('Cedar bridge did not return usable audio.');
  return{contentType:result.contentType,bytes:Math.floor(result.base64.length*0.75)};
 })()`,true),'Cedar main-process TTS',45000);
 console.log('CEDAR_TTS_OK',JSON.stringify(voice));
}

function createWindow(){
 const win=new BrowserWindow({width:1440,height:930,minWidth:1020,minHeight:700,backgroundColor:'#061116',show:false,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.removeMenu();
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//i.test(url))shell.openExternal(url);return{action:'deny'}});
 win.webContents.on('will-navigate',(event,url)=>{if(url!==win.webContents.getURL())event.preventDefault();});
 if(GUIDED_SMOKE){
  win.webContents.once('did-finish-load',()=>{setTimeout(()=>runGuidedSmoke(win).then(()=>{console.log('WORK_STUDY_WINDOWS_SMOKE_PASS');app.exit(0)}).catch(err=>{console.error('WORK_STUDY_WINDOWS_SMOKE_FAIL',err);app.exit(1)}),150)});
 }
 win.loadFile('index.html');
 if(!GUIDED_SMOKE)win.once('ready-to-show',()=>win.show());
 return win;
}
app.whenReady().then(()=>{ensureDirs();createWindow();app.on('activate',()=>{if(!GUIDED_SMOKE&&BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});

ipcMain.handle('app:info',()=>({product:PRODUCT,version:app.getVersion(),dataPath:dataDir()}));
ipcMain.handle('study:list',()=>{ensureDirs();return fs.readdirSync(studiesDir()).filter(n=>n.endsWith('.json')).map(n=>jsonRead(path.join(studiesDir(),n),null)).filter(Boolean).map(s=>({id:s.id,title:s.title||s.problem||'Untitled study',status:s.status||'Draft',updatedAt:s.updatedAt||s.createdAt||'',location:s.location||''})).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));});
ipcMain.handle('study:load',(_e,id)=>jsonRead(studyPath(id),null));
ipcMain.handle('study:save',(_e,study)=>{ensureDirs();if(!study||typeof study!=='object')throw new Error('Invalid study data.');const now=new Date().toISOString();const clean={...study,id:safeId(study.id)||crypto.randomUUID(),createdAt:study.createdAt||now,updatedAt:now};jsonWrite(studyPath(clean.id),clean);return clean;});
ipcMain.handle('study:delete',(_e,id)=>{const f=studyPath(id);if(fs.existsSync(f))fs.unlinkSync(f);return true;});
ipcMain.handle('settings:load',()=>jsonRead(path.join(dataDir(),'settings.json'),{}));
ipcMain.handle('settings:save',(_e,value)=>{jsonWrite(path.join(dataDir(),'settings.json'),value||{});return true;});
ipcMain.handle('study:export-json',async(_e,study)=>{const r=await dialog.showSaveDialog({title:'Export Gravity Work Study',defaultPath:(study.title||'gravity-work-study').replace(/[^a-z0-9_-]+/gi,'_')+'.gravity-study.json',filters:[{name:'Gravity Work Study',extensions:['json']}]});if(r.canceled||!r.filePath)return null;fs.writeFileSync(r.filePath,JSON.stringify(study,null,2),'utf8');return r.filePath;});
ipcMain.handle('study:import-json',async()=>{const r=await dialog.showOpenDialog({title:'Import Gravity Work Study',properties:['openFile'],filters:[{name:'Gravity Work Study',extensions:['json']}]});if(r.canceled||!r.filePaths[0])return null;const study=jsonRead(r.filePaths[0],null);if(!study||typeof study!=='object'||Array.isArray(study))throw new Error('This is not a valid Gravity study file.');return study;});

ipcMain.handle('evidence:save',(_e,pkg)=>{ensureDirs();if(!validEvidence(pkg))throw new Error('Invalid Gravity Work Study evidence package.');const savedAt=new Date().toISOString(),clean={...pkg,windowsBackup:{savedAt,appVersion:app.getVersion(),source:'Gravity Work Study Lab Windows'}};jsonWrite(evidencePath(pkg.studyId),clean);return{studyId:pkg.studyId,savedAt,path:evidencePath(pkg.studyId)};});
ipcMain.handle('evidence:list',()=>{ensureDirs();return fs.readdirSync(evidenceDir()).filter(n=>n.endsWith('.gravity-study.json')).map(n=>{const f=path.join(evidenceDir(),n),pkg=jsonRead(f,null);if(!validEvidence(pkg))return null;const st=fs.statSync(f);return{id:pkg.studyId,title:pkg.study?.title||pkg.study?.problem||pkg.studyId,status:pkg.study?.status||'Draft',savedAt:pkg.windowsBackup?.savedAt||st.mtime.toISOString(),file:f};}).filter(Boolean).sort((a,b)=>String(b.savedAt).localeCompare(String(a.savedAt)));});
ipcMain.handle('evidence:load',(_e,id)=>{const pkg=jsonRead(evidencePath(id),null);return validEvidence(pkg)?pkg:null;});
ipcMain.handle('evidence:latest',()=>{ensureDirs();const files=fs.readdirSync(evidenceDir()).filter(n=>n.endsWith('.gravity-study.json')).map(n=>path.join(evidenceDir(),n)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs);for(const f of files){const pkg=jsonRead(f,null);if(validEvidence(pkg))return pkg}return null;});
ipcMain.handle('evidence:delete',(_e,id)=>{const f=evidencePath(id);if(fs.existsSync(f))fs.unlinkSync(f);return true;});
ipcMain.handle('evidence:export',async(_e,pkg)=>{if(!validEvidence(pkg))throw new Error('No complete Gravity Work Study package is available to export.');const base=(pkg.study?.title||pkg.study?.problem||pkg.studyId||'gravity-work-study').replace(/[^a-z0-9_-]+/gi,'_');const r=await dialog.showSaveDialog({title:'Export Complete Gravity Work Study',defaultPath:base+'.gravity-study.json',filters:[{name:'Gravity Work Study package',extensions:['json']}]});if(r.canceled||!r.filePath)return null;fs.writeFileSync(r.filePath,JSON.stringify(pkg,null,2),'utf8');return r.filePath;});
ipcMain.handle('evidence:import',async()=>{const r=await dialog.showOpenDialog({title:'Import Complete Gravity Work Study',properties:['openFile'],filters:[{name:'Gravity Work Study package',extensions:['json']}]});if(r.canceled||!r.filePaths[0])return null;const pkg=jsonRead(r.filePaths[0],null);if(!validEvidence(pkg))throw new Error('This is not a valid complete Gravity Work Study evidence package.');return pkg;});
ipcMain.handle('process-file:extract',async(_e,payload)=>{if(!payload||typeof payload!=='object'||!payload.contentBase64)throw new Error('No process file was supplied.');if(String(payload.contentBase64).length>4.5*1024*1024)throw new Error('Use a DOCX file smaller than 3 MB.');const res=await fetch(PROCESS_FILE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});const text=await res.text();let json={};try{json=JSON.parse(text)}catch{}if(!res.ok)throw new Error(json.error||`Gravity could not read that DOCX (${res.status}).`);return json;});
ipcMain.handle('tts:request',async(_e,payload)=>{const text=String(payload?.text||'').trim().slice(0,2800);if(!text)throw new Error('No Gravity voice text was supplied.');const voice=String(payload?.voice||'cedar').slice(0,40),speed=Number(payload?.speed)||0.98;const res=await fetch(TTS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice,speed}),signal:AbortSignal.timeout(30000)});if(!res.ok)throw new Error(`Gravity voice service returned ${res.status}.`);const contentType=(res.headers.get('content-type')||'').toLowerCase();if(!contentType.includes('audio'))throw new Error('Gravity voice service did not return audio.');const raw=Buffer.from(await res.arrayBuffer());if(raw.length>12*1024*1024)throw new Error('Gravity voice response was unexpectedly large.');return{contentType,base64:raw.toString('base64')};});
ipcMain.handle('report:pdf',async(e,defaultName)=>{const win=BrowserWindow.fromWebContents(e.sender);const r=await dialog.showSaveDialog({title:'Save Study Report',defaultPath:(defaultName||'Gravity_Work_Study_Report')+'.pdf',filters:[{name:'PDF',extensions:['pdf']}]});if(r.canceled||!r.filePath)return null;const pdf=await win.webContents.printToPDF({printBackground:true,pageSize:'Letter',margins:{top:0.4,bottom:0.4,left:0.4,right:0.4}});fs.writeFileSync(r.filePath,pdf);return r.filePath;});
ipcMain.handle('report:print',async(e)=>{const win=BrowserWindow.fromWebContents(e.sender);return new Promise(resolve=>win.webContents.print({printBackground:true},ok=>resolve(ok)));});
ipcMain.handle('system:open-data',()=>shell.openPath(dataDir()));
