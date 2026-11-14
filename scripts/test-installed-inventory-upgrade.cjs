'use strict';
// Old October 19 Inventory installer -> new candidate using the SAME isolated
// Windows profile. Synthetic records only. GitHub Windows runner only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const http=require('node:http'),cp=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
if(process.platform!=='win32'||process.env.GITHUB_ACTIONS!=='true')
 throw Error('This test is permitted only on an ephemeral Windows GitHub Actions runner');
const phase=process.argv[2],exe=process.argv[3];
if(!['seed','verify'].includes(phase)||!exe||!fs.existsSync(exe))
 throw Error('Usage: node test-installed-inventory-upgrade.cjs seed|verify installed-exe');
const runner=path.resolve(process.env.RUNNER_TEMP||'C:/not-a-runner');
const root=path.resolve(process.env.UPGRADE_TEST_ROOT||'C:/missing-upgrade-root');
if(!root.toLowerCase().startsWith(runner.toLowerCase()+path.sep))throw Error('Test profile must be under RUNNER_TEMP');
const roaming=path.join(root,'Roaming'),local=path.join(root,'Local');
fs.mkdirSync(roaming,{recursive:true});fs.mkdirSync(local,{recursive:true});
const SNAPSHOT=path.join(root,'inventory-synthetic-snapshot.json'),PORT=phase==='seed'?19351:19352;
const browserProfile=path.join(root,'ChromiumProfile');
let child,client;
function getJson(url){return new Promise((resolve,reject)=>{
 const req=http.get(url,{timeout:1800},res=>{let body='';res.setEncoding('utf8');res.on('data',x=>body+=x);res.on('end',()=>{try{resolve(JSON.parse(body))}catch(e){reject(e)}})});
 req.on('timeout',()=>req.destroy(Error('CDP HTTP timeout')));req.on('error',reject);
})}
async function findPage(){
 for(let i=0;i<100;i++){
  try{
   const pages=await getJson('http://127.0.0.1:'+PORT+'/json/list');
   const p=pages.find(x=>x.type==='page'&&x.webSocketDebuggerUrl&&/index\.html/.test(x.url||''));
   if(p)return p;
  }catch{}await delay(500)
 }throw Error('Could not discover Inventory window on localhost-only DevTools port');
}
async function connect(page){
 const ws=new WebSocket(page.webSocketDebuggerUrl),pending=new Map();let seq=0;
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Local DevTools websocket timeout')),10000);
  ws.addEventListener('open',()=>{clearTimeout(timer);resolve()},{once:true});
  ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Local DevTools websocket connection failed'))},{once:true});
 });
 ws.addEventListener('message',event=>{
  let msg;try{msg=JSON.parse(event.data)}catch{return}
  let p=pending.get(msg.id);if(!p)return;clearTimeout(p.timer);pending.delete(msg.id);
  if(msg.error)p.reject(Error(msg.error.message));else p.resolve(msg.result);
 });
 return {eval:async expression=>{
  const id=++seq;
  let response=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{pending.delete(id);reject(Error('Renderer evaluate timed out'))},30000);
   pending.set(id,{timer,resolve,reject});
   ws.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}))
  });
  if(response.exceptionDetails)throw Error('Renderer exception: '+JSON.stringify(response.exceptionDetails));
  return response.result?.value;
 },close:()=>ws.close()};
}
function project(x){return {profile:x.profile,locations:x.locations,items:x.items,movements:x.movements||[],counts:x.counts||[]}}
const makeFixture=`(async()=>{
 const g=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
 if(!g('profile-dialog').open)g('edit-profile').click();
 g('profile-restaurant').value='Gravity Upgrade Safety Test';
 g('profile-store').value='SYNTHETIC-001';
 g('profile-form').requestSubmit(g('save-profile'));await sleep(200);
 if(g('profile-dialog').open)throw Error('Profile not saved');
 g('loc-name').value='Test Walk-in Cooler';g('location-form').requestSubmit();await sleep(200);
 let s=JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null');
 if(s?.locations?.length!==1)throw Error('Published app did not save location');
 g('add-item').click();if(!g('item-dialog').open)throw Error('Add Item dialog not open');
 const set=(id,v)=>g(id).value=String(v);
 set('item-name','Test Roma Tomatoes');set('item-category','Produce');set('item-vendor','Synthetic Supplier');
 set('item-sku','UPGRADE-QA-001');set('item-barcode','UPGRADE-TEST-BARCODE');set('item-unit','lb');
 set('item-cost','2.5');set('item-case-pack','1');set('item-par','20');set('item-reorder','7');
 set('item-onhand','12');set('item-location',s.locations[0].id);
 g('item-form').requestSubmit(g('save-item'));await sleep(350);
 s=JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null');
 if(s?.profile?.restaurant!=='Gravity Upgrade Safety Test'||s.locations.length!==1||
  s.items.length!==1||s.items[0].name!=='Test Roma Tomatoes'||
  Object.values(s.items[0].balances||{}).reduce((n,v)=>n+Number(v),0)!==12)
  throw Error('Synthetic stock fixture missing after old-app save');
 return {profile:s.profile,locations:s.locations,items:s.items,movements:s.movements||[],counts:s.counts||[]};
})()`;
const readFixture=`(async()=>{
 const s=JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null');
 if(!s)throw Error('No inventory saved from old application');
 return {profile:s.profile,locations:s.locations,items:s.items,
  movements:s.movements||[],counts:s.counts||[],renderedItems:document.getElementById('metric-items')?.textContent||''}
})()`;
async function run(){
 try{
  const env={...process.env,APPDATA:roaming,LOCALAPPDATA:local,GRAVITY_INVENTORY_SMOKE:''};
  delete env.ELECTRON_RUN_AS_NODE;
  child=cp.spawn(exe,['--user-data-dir='+browserProfile,'--remote-debugging-address=127.0.0.1','--remote-debugging-port='+PORT],
   {cwd:path.dirname(exe),env,windowsHide:false,stdio:'ignore'});
  child.on('error',e=>console.error('Inventory spawn error: '+e.message));
  const page=await findPage();client=await connect(page);
  const loaded=await client.eval(`(async()=>{for(let i=0;i<100;i++){
   if(document.getElementById('edit-profile')&&document.getElementById('metric-items')&&window.InventoryValidation)return true;
   await new Promise(r=>setTimeout(r,100))
  }throw Error('Inventory app never initialized')})()`);
  assert.equal(loaded,true);
  if(phase==='seed'){
   const before=await client.eval(makeFixture);
   assert.equal(before.items.length,1);fs.writeFileSync(SNAPSHOT,JSON.stringify(project(before),null,2)+'\n');
   console.log('PASS: published October installed version saved synthetic profile, one location and one 12lb item');
  }else{
   assert.ok(fs.existsSync(SNAPSHOT),'Old-version profile snapshot missing');
   const before=JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));
   const after=await client.eval(readFixture);
   assert.deepEqual(project(after),before,'Inventory records changed or disappeared after installing new candidate');
   assert.equal(after.renderedItems.trim(),'1','Updated app did not render inherited item');
   const saved=await client.eval(`(async()=>{
    const g=id=>document.getElementById(id);
    g('loc-name').value='Post-Upgrade Dry Storage';g('location-form').requestSubmit();
    await new Promise(r=>setTimeout(r,400));
    const s=JSON.parse(localStorage.getItem('gravityInventoryCenter.v1')||'null');
    if(s.locations.length!==2||s.items.length!==1)throw Error('New-app save failed after profile inheritance');
    return s.locations.map(x=>x.name)
   })()`);
   assert.equal(saved.length,2);
   console.log('PASS: updated installed version preserved synthetic inventory, rendered one item and wrote a second location');
  }
  await delay(2200);
  const storage=path.join(browserProfile,'Local Storage','leveldb');
  assert.ok(fs.existsSync(storage), 'Old or updated Electron version ignored isolated --user-data-dir; refusing to certify migration');
  assert.ok(fs.readdirSync(storage).length>0,'Expected Chromium localStorage database inside isolated profile');
  console.log('Confirmed Chromium localStorage persisted under the GitHub runner isolated profile');
 }finally{
  if(client){try{await client.eval('window.close()')}catch{}client.close()}
  await delay(900);
  if(child?.pid){
   try{cp.spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{timeout:8000,stdio:'ignore'})}catch{}
  }
 }
}
run().catch(e=>{console.error('FAILED installed inventory upgrade:',e.stack||e);process.exitCode=1});
