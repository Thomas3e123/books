'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../site/apps/inventory-center/assets/js/inventory-center.js'),'utf8');
function method(start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Inventory method boundaries changed: '+start);return source.slice(a,b);}
const saveSource=method('async function saveText(','async function exportItems()');
const persistSource=method('function persist(','function mutate(');
const backupSource=method('async function backup(){','async function restore(){');
function createSaveText(mode='web'){
  const events=[],timers=[];const anchor={click(){events.push('click')},remove(){events.push('remove')}};
  const sandbox={
    window:mode==='desktop'?{GravityDesktop:{saveTextFile:async opts=>({canceled:false,fromDesktop:opts.defaultName})}}:{},
    document:{createElement(){events.push('createAnchor');return anchor},body:{appendChild(){events.push('append')}}},
    URL:{createObjectURL(){events.push('createUrl');return 'blob:inventory-test'},revokeObjectURL(){events.push('revokeUrl')}},
    Blob:class{constructor(chunks,opts){this.parts=chunks;this.type=opts.type}},
    setTimeout(fn,ms){timers.push({fn,ms})}
  };
  vm.runInNewContext(saveSource+';globalThis.testSaveText=saveText;',sandbox);
  return {save:sandbox.testSaveText,events,timers};
}
test('Web inventory backup export starts before blob URL is revoked',async()=>{
  const d=createSaveText(),r=await d.save('backup.json','{"safe":true}',['json']);
  assert.equal(r.canceled,false);assert.deepEqual(d.events,['createAnchor','createUrl','append','click']);
  assert.equal(d.timers.length,1);assert.equal(d.timers[0].ms,15000);
  d.timers[0].fn();assert.deepEqual(d.events.slice(-2),['revokeUrl','remove']);
});
test('Desktop save bridge retains native file-picker workflow',async()=>{
  const d=createSaveText('desktop'),r=await d.save('backup.json','{}',['json']);
  assert.equal(r.fromDesktop,'backup.json');assert.deepEqual(d.events,[]);
});
function makePersist(store){
 const statuses=[],events=[];const sandbox={
  InventoryValidation:{validateState(){}},localStorage:store,
  window:{dispatchEvent(e){events.push(e.type)}},
  Event:class{constructor(type){this.type=type}},console:{error(){}},
  setStatus(msg,error){statuses.push({msg,error})},
  STORAGE_KEY:'gravityInventoryCenter.v1',storageBlocked:false,
  state:{schemaVersion:1}
 };
 vm.runInNewContext(persistSource+';globalThis.testPersist=persist;',sandbox);
 return {persist:sandbox.testPersist,statuses,events};
}
test('Inventory persistence verifies an actual storage write',()=>{
 const records={};
 const store={setItem(k,v){records[k]=v},getItem(k){return records[k]??null}};
 const p=makePersist(store);assert.equal(p.persist({schemaVersion:1}),true);
 assert.equal(JSON.parse(records['gravityInventoryCenter.v1']).schemaVersion,1);assert.deepEqual(p.events,['gravity:local-data-saved']);
});
test('Inventory detects a browser discarding storage writes',()=>{
 const p=makePersist({setItem(){},getItem(){return null}});
 assert.equal(p.persist({schemaVersion:1}),false);
 assert.match(p.statuses.at(-1).msg,/not confirmed saved/);assert.equal(p.events.length,0);
});
function makeBackup(mode){
 const messages=[];
 const sandbox={state:{items:[]},storageBlocked:mode==='blocked',today:()=> '2026-11-07',
  setStatus(msg,error){messages.push({msg,error})},console:{error(){}},
  saveText:async()=>{if(mode==='failure')throw Error('File system failed');return {canceled:mode==='cancel'};}
 };
 vm.runInNewContext(backupSource+';globalThis.testBackup=backup;',sandbox);
 return {backup:sandbox.testBackup,messages};
}
test('Inventory backup says download started, not falsely saved',async()=>{
 const x=makeBackup('success');await x.backup();assert.match(x.messages[0].msg,/export started/);
 assert.match(x.messages[0].msg,/Confirm the JSON file/);
});
test('Inventory backup failure is reported explicitly',async()=>{
 const x=makeBackup('failure');await x.backup();assert.match(x.messages[0].msg,/could not be exported/);
 assert.equal(x.messages[0].error,true);
});
test('Cancelled backup does not claim a file was saved',async()=>{
 const x=makeBackup('cancel');await x.backup();assert.equal(x.messages.length,0);
});
test('Blocked inventory storage does not claim a valid backup',async()=>{
 const x=makeBackup('blocked');await x.backup();assert.match(x.messages[0].msg,/needs recovery/);
});
