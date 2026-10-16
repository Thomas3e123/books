'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const base=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-v2.js'),'utf8');
const guided=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-guided-v3.js'),'utf8');
const expert=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-expert-v5.js'),'utf8');

function extractBody(src,start,end){const a=src.indexOf(start);if(a<0)throw new Error('Missing '+start);const b=src.indexOf(end,a);if(b<0)throw new Error('Missing '+end);return src.slice(a+start.length,b)}
function runBase(problem,desired=''){
  const body=extractBody(base,'function recommendMethod(){','}\nfunction screenMethod');
  return Function('s',body)({problem,desired});
}
function runGuided(problem,desired=''){
  const body=extractBody(guided,'function recommendMethod(s){','}\nfunction demandMatters');
  return Function('s',body)({problem,desired});
}
const scenarios=[
  ['Pizza tickets back up Friday nights and throughput cannot keep up with rush volume','flow'],
  ['The dish machine is always buried in racks and clean wares pile up before return','dish'],
  ['Prep batches of diced onions take too long and yield varies by batch','prep'],
  ['Cook walks across the line repeatedly for cheese and tools because the layout is poor','motion'],
  ['Opening setup is late because the station is not ready when service starts','setup'],
  ['We changed the line layout and need a before and after comparison','beforeafter'],
  ['Guests wait too long from order entry through expo and table delivery','service'],
  ['The fryer appears to be the bottleneck and may be the limiting point','bottleneck'],
  ['I need a work sampling study of productive work, walking, waiting, and interruptions','sampling'],
  ['How long does it take to make one burger repeatedly under normal conditions','cycle']
];
let failures=[];
for(const [problem,expected] of scenarios){
  const a=runBase(problem),b=runGuided(problem);
  if(a!==expected)failures.push(`Base recommender: expected ${expected}, got ${a} for: ${problem}`);
  if(b!==expected)failures.push(`Guided recommender: expected ${expected}, got ${b} for: ${problem}`);
}
for(const method of ['flow','cycle','motion','bottleneck','sampling','prep','dish','service','setup','beforeafter','custom']){
  if(!expert.includes(method+':{')) failures.push('Expert path missing for '+method);
}
for(const token of ['alternative','cause']){if(!expert.includes(token))failures.push('Expert layer missing reasoning token: '+token)}
if(!base.includes("guardrails:{quality:'',safety:''}")) failures.push('Core study engine is missing quality/safety guardrails.');
if(failures.length){console.error('Work Study scenario suite FAILED');for(const f of failures)console.error('- '+f);process.exit(1)}
console.log(`Work Study scenario suite passed ${scenarios.length} classification scenarios, expert-path coverage, cause testing, and core quality/safety checks.`);
