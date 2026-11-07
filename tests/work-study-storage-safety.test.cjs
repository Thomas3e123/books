'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.resolve(__dirname,'../site/assets/js/gravity-work-study-v2.js');
const source=fs.readFileSync(file,'utf8');
const ending='render();\n})();';
assert.ok(source.endsWith(ending),'Work Study closure changed: update the storage test instrumentation');
const instrumented=source.slice(0,-ending.length)+
  'globalThis.__workStudyProbe={load,save,history,saveHistory,flags:()=>({activeStorageBlocked,historyStorageBlocked})};\n'+ending;
function boot(initial={},opts={}){
  const records={...initial};
  const status={textContent:''},root={innerHTML:''};
  const storage={
    getItem(key){if(opts.readFailure)throw Error('Storage unavailable');return Object.hasOwn(records,key)?records[key]:null;},
    setItem(key,value){if(opts.writeFailure)throw Error('Quota exceeded');if(!opts.noopWrites)records[key]=value;},
    removeItem(key){delete records[key];}
  };
  const document={
    querySelector(q){return q==='#ws2-status'?status:(q==='#ws2-app'&&opts.showBlockedRoot?root:null);},
    querySelectorAll(){return [];}
  };
  const sandbox={document,localStorage:storage,console:{error(){}}};
  vm.runInNewContext(instrumented,sandbox,{filename:file,timeout:2000});
  return {probe:sandbox.__workStudyProbe,records,status,root};
}
test('corrupt current study is preserved instead of overwritten with a blank one',()=>{
 const old='{damaged JSON',b=boot({gravityWorkStudyV2:old},{showBlockedRoot:true});
 assert.equal(b.probe.flags().activeStorageBlocked,true);
 assert.match(b.root.innerHTML,/Existing study needs recovery/);
 assert.throws(()=>b.probe.save('Saved'));
 assert.equal(b.records.gravityWorkStudyV2,old);
 assert.match(b.status.textContent,/saving is blocked/);
});
test('storage read denial is treated as unsafe and never replaced',()=>{
 const b=boot({},{readFailure:true});
 assert.equal(b.probe.flags().activeStorageBlocked,true);
 assert.throws(()=>b.probe.save('Saved'));
 assert.equal(b.records.gravityWorkStudyV2,undefined);
});
test('corrupt saved history is not replaced by an empty history',()=>{
 const old='broken history',b=boot({gravityWorkStudyV2History:old});
 assert.deepEqual(Array.from(b.probe.history()),[]);
 assert.equal(b.probe.flags().historyStorageBlocked,true);
 assert.throws(()=>b.probe.saveHistory());
 assert.equal(b.records.gravityWorkStudyV2History,old);
});
test('quota errors explain that the work is NOT saved',()=>{
 const b=boot({},{writeFailure:true});
 assert.throws(()=>b.probe.save('Saved'));
 assert.match(b.status.textContent,/could not save your changes/);
 assert.equal(b.records.gravityWorkStudyV2,undefined);
});
test('browser silently refusing to persist is detected by read-back',()=>{
 const b=boot({},{noopWrites:true});
 assert.throws(()=>b.probe.save('Saved'));
 assert.match(b.status.textContent,/could not save your changes/);
});
test('successful active study save stores a valid study and reports success',()=>{
 const b=boot();
 assert.doesNotThrow(()=>b.probe.save('Saved'));
 const saved=JSON.parse(b.records.gravityWorkStudyV2);
 assert.ok(saved.id.startsWith('WS_'));
 assert.ok(Array.isArray(saved.people));
 assert.equal(b.status.textContent,'Saved');
});
test('history archival verifies write and preserves the current study',()=>{
 const b=boot();
 assert.doesNotThrow(()=>b.probe.saveHistory());
 const records=JSON.parse(b.records.gravityWorkStudyV2History);
 assert.equal(records.length,1);
 assert.ok(records[0].id.startsWith('WS_'));
});
test('history quota errors prevent a false archival-success message',()=>{
 const b=boot({},{writeFailure:true});
 assert.throws(()=>b.probe.saveHistory());
 assert.match(b.status.textContent,/Study history could not be saved/);
});
