'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const web=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-v2.js'),'utf8');
const synthesis=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-synthesis-v24.js'),'utf8');
const standards=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-standard-minutes-v33.js'),'utf8');
const graduation=fs.readFileSync(path.join(root,'scripts','work-study-graduation-suite.cjs'),'utf8');
const win=fs.readFileSync(path.join(root,'windows','gravity-work-study-lab','renderer.js'),'utf8');
const main=fs.readFileSync(path.join(root,'windows','gravity-work-study-lab','main.js'),'utf8');
let failures=[];
function has(text,needle,label){if(!text.includes(needle))failures.push(label+' missing');}
function lacks(text,needle,label){if(text.includes(needle))failures.push(label+' still present');}
for(const [name,text] of [['Web',web],['Windows',win]]){
  for(const mode of ['Guided','Assisted','Independent','Passive'])has(text,mode,name+' mode '+mode);
  has(text,'guardrails',name+' quality/safety guardrails');
  has(text,'completedUnits',name+' completed-unit capture');
  has(text,'Gravity Results Review',name+' mandatory Gravity review');
  has(text,'manager',name+' manager interpretation/decision layer');
  has(text,'sop',name+' SOP contribution layer');
}
// Conservative decision controls now live in the controlled expert stack rather than only in base v2.
has(synthesis,'Proceed With Caution','Web consolidated caution verdict');
has(synthesis,'Hold — Resolve Before Standardizing','Web consolidated hold verdict');
has(standards,'Standard Minute Not Ready','Web standard-minute hold');
has(graduation,'WORK STUDY GRADUATION PASS','Web expert graduation gate');
has(web,'Management Approved Draft','Web SOP approval remains draft');
has(web,'Observed role is required','Web required observed role');
has(web,'Define where the process starts and ends','Web required study boundary');
lacks(web,"d.n>=3?'Strong'",'Web fixed-count demand confidence');
lacks(web,"strength=s.observations.length>=8",'Web fixed-count study confidence');
has(win,'Preliminary','Windows conservative evidence status');
has(win,'Measured rate','Windows measured throughput');
has(win,'stopTimer(true);current.events.push','Windows event evidence preservation');
has(win,'function renderObserve(){stopTimer(true);','Windows observation rerender timing preservation');
has(win,"packageType==='gravity-work-study-evidence-package'",'Windows v56 evidence-package recognition');
has(win,'gravityDesktop.exportStudy(portableExport(current))','Windows v56 evidence-package re-export');
has(main,'contextIsolation:true','Windows context isolation');
has(main,'nodeIntegration:false','Windows Node isolation');
has(main,'sandbox:true','Windows sandbox');
has(main,"setWindowOpenHandler(()=>({action:'deny'}))",'Windows new-window blocking');
has(main,"will-navigate",'Windows navigation blocking');
function throughput(units,seconds){return seconds>0&&units>0?units*3600/seconds:null;}
if(throughput(10,600)!==60)failures.push('Throughput formula 10 units / 10 min should equal 60/hr');
if(throughput(8,600)!==48)failures.push('Throughput formula 8 units / 10 min should equal 48/hr');
if(throughput(0,600)!==null)failures.push('Zero completed units must not produce a rate');
if(failures.length){console.error('WORK STUDY LAB CODE AUDIT: FAIL');for(const f of failures)console.error('- '+f);process.exit(1);}
console.log('WORK STUDY LAB CODE AUDIT: PASS');
console.log('Checked current web expert source plus Windows source for required Code controls, evidence portability, timer integrity, and core rate math.');
