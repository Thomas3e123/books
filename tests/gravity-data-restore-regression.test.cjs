'use strict';
// Offline, exact-source browser mocks for Shift Lab and Work Study restoration.
// No live browser profile, customer information, hosted database, or deployment.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const shift=fs.readFileSync('site/assets/js/gravity-shift-lab.js','utf8');
const work=fs.readFileSync('site/assets/js/gravity-work-study-evidence-package-v56.js','utf8');
function sliceBetween(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i+1);if(i<0||j<=i)throw Error('Missing data recovery source markers: '+a);return s.slice(i,j)}
const shiftCode=sliceBetween(shift,'function restoreBackup(file){','function spreadsheetCell(');
const workCode=sliceBetween(work,'function validatePackage(pkg){','function render(){');
function storage(initial={},failKey=''){
  const map=new Map(Object.entries(initial));let thrown=false;
  return{getItem:k=>map.has(k)?map.get(k):null,
    setItem(k,v){if(k===failKey&&!thrown){thrown=true;throw Error('Simulated storage write error')}map.set(k,String(v))},
    removeItem:k=>map.delete(k),key:i=>[...map.keys()][i]||null,get length(){return map.size}};
}
function shiftFixture({accept=true,failKey=''}={}){
  const pKey='gravityShiftLabProfileV3',sKey='gravityShiftLabSchedulesV3';
  const p={restaurant:'Previous',employees:[{id:'employee-1'}],sections:['Line'],payLockHash:''};
  const w={'2026-11-01':{sales:'200',shifts:{},sections:{}}};
  const box=storage({[pKey]:JSON.stringify(p),[sKey]:JSON.stringify(w)},failKey);
  const status={textContent:''};
  const ctx={profile:p,schedules:w,payUnlocked:true,PROFILE_KEY:pKey,SCHEDULE_KEY:sKey,localStorage:box,
    $:()=>status,payIsLocked:()=>false,openPayLockDialog(){},
    FileReader:class{readAsText(f){this.result=f.text;this.onload()}},
    uniqueNames:x=>x,defaultSections:()=>['Line'],normalizeEmployee:x=>x,
    confirm:()=>accept,applyProfile(){},renderWeek(){},setManagerOnlyControls(){},
    window:{dispatchEvent(){}},Event:class{}};
  vm.runInNewContext(shiftCode,ctx);
  const importData={profile:{restaurant:'New',employees:[{id:'employee-2'}],sections:['Pizza'],payLockHash:'secret-hash'},
    schedules:{'2026-11-08':{sales:'500',shifts:{'employee-2':['9a-5p']},sections:{'employee-2':['Pizza']}}}};
  return{ctx,box,status,pKey,sKey,importData,run:t=>ctx.restoreBackup({text:t})};
}
function workFixture({accept=true,failKey=''}={}){
  const STUDY='gravityWorkStudyV2',HISTORY='gravityWorkStudyV2History',PREFIX='gravityWorkStudy';
  const active={id:'old-study',version:2,purpose:'Preserve me'};
  const box=storage({[STUDY]:JSON.stringify(active),[HISTORY]:'[]'},failKey);
  const ctx={STUDY,HISTORY,PREFIX,localStorage:box,confirm:()=>accept,document:{},FileReader:class{}};
  vm.runInNewContext(workCode,ctx);
  const incoming={packageType:'gravity-work-study-evidence-package',packageVersion:1,studyId:'new-study',
    study:{id:'new-study',version:2,purpose:'New evidence'},
    sidecars:{gravityWorkStudyExpertEvidence:{mode:'keyed-by-study',value:{score:42}}}};
  return{ctx,box,STUDY,HISTORY,incoming};
}
test('Shift Lab rejects invalid JSON before any changes',()=>{
  const x=shiftFixture();x.run('{broken');
  assert.equal(JSON.parse(x.box.getItem(x.pKey)).restaurant,'Previous');
  assert.match(x.status.textContent,/Backup rejected/);
});
test('Shift Lab cancels without changing employee profiles or schedules',()=>{
  const x=shiftFixture({accept:false});x.run(JSON.stringify(x.importData));
  assert.equal(JSON.parse(x.box.getItem(x.pKey)).restaurant,'Previous');
  assert.equal(JSON.parse(x.box.getItem(x.sKey))['2026-11-01'].sales,'200');
  assert.match(x.status.textContent,/canceled/);
});
test('Shift Lab restores validated information and locks wage access',()=>{
  const x=shiftFixture();x.run(JSON.stringify(x.importData));
  assert.equal(JSON.parse(x.box.getItem(x.pKey)).restaurant,'New');
  assert.equal(JSON.parse(x.box.getItem(x.sKey))['2026-11-08'].sales,'500');
  assert.equal(x.ctx.payUnlocked,false);
  assert.match(x.status.textContent,/verified/);
});
test('Shift Lab rolls back both records if second write fails',()=>{
  const x=shiftFixture({failKey:'gravityShiftLabSchedulesV3'});x.run(JSON.stringify(x.importData));
  assert.equal(JSON.parse(x.box.getItem(x.pKey)).restaurant,'Previous');
  assert.equal(JSON.parse(x.box.getItem(x.sKey))['2026-11-01'].sales,'200');
  assert.match(x.status.textContent,/Restore failed/);
});
test('Shift Lab rejects corrupt employee arrays and unexpected schedule shape',()=>{
  const x=shiftFixture();
  x.run(JSON.stringify({profile:{employees:'invalid'},schedules:{}}));
  assert.match(x.status.textContent,/Backup rejected/);
  const y=shiftFixture();y.run(JSON.stringify({profile:{employees:[]},schedules:{week:{shifts:'wrong'}}}));
  assert.match(y.status.textContent,/Backup rejected/);
});
test('Work Study rejects mismatched package identity without changing study',()=>{
  const x=workFixture();const p={...x.incoming,studyId:'wrong'};
  assert.throws(()=>x.ctx.importPackage(p));
  assert.equal(JSON.parse(x.box.getItem(x.STUDY)).id,'old-study');
});
test('Work Study cancellation leaves all source records unchanged',()=>{
  const x=workFixture({accept:false});
  assert.equal(x.ctx.importPackage(x.incoming).cancelled,true);
  assert.equal(JSON.parse(x.box.getItem(x.STUDY)).id,'old-study');
  assert.equal(x.box.getItem('gravityWorkStudyExpertEvidence'),null);
});
test('Work Study restores sidecar and archives previously active study',()=>{
  const x=workFixture();x.ctx.importPackage(x.incoming);
  assert.equal(JSON.parse(x.box.getItem(x.STUDY)).id,'new-study');
  const history=JSON.parse(x.box.getItem(x.HISTORY));
  assert.equal(history.length,2);
  assert.deepEqual(history.map(x=>x.id).sort(),['new-study','old-study']);
  assert.equal(JSON.parse(x.box.getItem('gravityWorkStudyExpertEvidence'))['new-study'].score,42);
});
test('Work Study rolls back base study and sidecars after history storage failure',()=>{
  const x=workFixture({failKey:'gravityWorkStudyV2History'});
  assert.throws(()=>x.ctx.importPackage(x.incoming),/Import failed/);
  assert.equal(JSON.parse(x.box.getItem(x.STUDY)).id,'old-study');
  assert.equal(x.box.getItem(x.HISTORY),'[]');
  assert.equal(x.box.getItem('gravityWorkStudyExpertEvidence'),null);
});
test('Work Study rejects sidecar records belonging to a different study',()=>{
  const x=workFixture();const pkg={...x.incoming,sidecars:{
    gravityWorkStudyExpertEvidence:{mode:'direct-record',value:{id:'unrelated',value:1}}
  }};
  assert.throws(()=>x.ctx.importPackage(pkg),/Evidence does not belong/);
  assert.equal(JSON.parse(x.box.getItem(x.STUDY)).id,'old-study');
});
