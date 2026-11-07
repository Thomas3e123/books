'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const script=fs.readFileSync(path.resolve(__dirname,'../site/assets/js/gravity-shift-lab.js'),'utf8');
function segment(start,end){const a=script.indexOf(start),b=script.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Shift Lab source function changed: '+start);return script.slice(a,b);}
const saveJS=segment('function saveJSON(','function payLockConfigured(');
const verifyJS=segment('function verifyCriticalStorage(){','if(!verifyCriticalStorage()){');
const constants={PROFILE_KEY:'gravityShiftLabProfileV3',SCHEDULE_KEY:'gravityShiftLabSchedulesV3',LEGACY_PROFILE_KEY:'gravityShiftLabProfileV2',LEGACY_SCHEDULE_KEY:'gravityShiftLabSchedulesV2'};
function fixture(initial={},options={}){
 const entries={...initial},warnings=[],dispatches=[];
 const storage={
  getItem(key){if(options.readDenied)throw Error('Storage read denied');return Object.hasOwn(entries,key)?entries[key]:null},
  setItem(key,value){if(options.writeDenied)throw Error('Storage write denied');if(!options.silentWrite)entries[key]=value;}
 };
 const sandbox={...constants,localStorage:storage,window:{dispatchEvent(e){dispatches.push(e.type)}},
  Event:class{constructor(type){this.type=type}},console:{warn(){},error(){}},
  $(id){return id==='lab-status'?{set textContent(value){warnings.push(value)}}:null;}
 };
 vm.runInNewContext(saveJS+verifyJS+';globalThis.methods={saveJSON,verifyCriticalStorage};',sandbox,{timeout:2000});
 return {entries,dispatches,warnings,...sandbox.methods};
}
test('Shift Lab blocks unreadable current profile before migration',()=>{
 const broken='{bad json',f=fixture({[constants.PROFILE_KEY]:broken});
 assert.equal(f.verifyCriticalStorage(),false);assert.equal(f.entries[constants.PROFILE_KEY],broken);
 assert.ok(script.indexOf('if(!verifyCriticalStorage())')<script.indexOf('var migrated=migrateData();'));
});
test('Shift Lab blocks unreadable prior schedule without clearing it',()=>{
 const old='[{"not":"schedule"}]',f=fixture({[constants.LEGACY_SCHEDULE_KEY]:old});
 assert.equal(f.verifyCriticalStorage(),false);assert.equal(f.entries[constants.LEGACY_SCHEDULE_KEY],old);
});
test('Shift Lab blocks denied read of critical browser storage',()=>{
 const f=fixture({},{readDenied:true});assert.equal(f.verifyCriticalStorage(),false);
});
test('Shift Lab accepts valid existing schedule JSON',()=>{
 const s=JSON.stringify({'2026-11-09':{shifts:{}}}),f=fixture({[constants.SCHEDULE_KEY]:s});
 assert.equal(f.verifyCriticalStorage(),true);assert.equal(f.entries[constants.SCHEDULE_KEY],s);
});
test('Shift Lab verifies successful save using read-back',()=>{
 const f=fixture();assert.equal(f.saveJSON(constants.PROFILE_KEY,{employees:[]}),true);
 assert.equal(JSON.parse(f.entries[constants.PROFILE_KEY]).employees.length,0);
 assert.deepEqual(f.dispatches,['gravity:local-data-saved']);
});
test('Shift Lab rejects silently discarded browser writes',()=>{
 const f=fixture({},{silentWrite:true});assert.equal(f.saveJSON(constants.SCHEDULE_KEY,{}),false);
 assert.deepEqual(f.dispatches,[]);assert.match(f.warnings.at(-1),/not confirmed saved/);
});
test('Shift Lab rejects write denied by browser quota or permissions',()=>{
 const f=fixture({},{writeDenied:true});assert.equal(f.saveJSON(constants.PROFILE_KEY,{}),false);
 assert.deepEqual(f.dispatches,[]);assert.match(f.warnings.at(-1),/not confirmed saved/);
});
