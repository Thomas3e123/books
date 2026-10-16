'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const base=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-v2.js'),'utf8');
const expert=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-expert-v5.js'),'utf8');
function bodyBetween(src,start,end){const a=src.indexOf(start);if(a<0)throw new Error('Missing '+start);const b=src.indexOf(end,a);if(b<0)throw new Error('Missing '+end);return src.slice(a+start.length,b)}
const evalBody=bodyBetween(base,'function evaluateReviewEvidence(f,ctx){','}\nfunction buildReview');
const evaluate=(f,ctx)=>Function('f','ctx',evalBody)(f,ctx);
const f=(total=600,gap=10,demand=100)=>({total,gap,demand});
const ctx=(over={})=>({method:'flow',observationCount:6,totalSeconds:600,completedUnits:8,guardrailsReady:true,avoidableShare:.1,expert:{},...over});
const tests=[
 ['no observation',f(0,null,null),ctx({totalSeconds:0,observationCount:0}),'Inconclusive'],
 ['missing guardrails',f(),ctx({guardrailsReady:false}),'Inconclusive'],
 ['tiny favorable sample',f(60,20,100),ctx({totalSeconds:60,observationCount:1,completedUnits:1}),'Inconclusive'],
 ['adequate sample below demand',f(600,-15,100),ctx(),'Standard Not Supported'],
 ['adequate sample meets demand but not controlled comparison',f(600,12,100),ctx(),'Promising — More Evidence Needed'],
 ['large avoidable share',f(600,null,null),ctx({avoidableShare:.4}),'Promising — More Evidence Needed'],
 ['beforeafter missing structured evidence',f(600,10,100),ctx({method:'beforeafter',expert:{}}),'Inconclusive'],
 ['beforeafter too few samples',f(600,10,100),ctx({method:'beforeafter',expert:{beforeRate:'80',afterRate:'110',beforeSampleN:'1',afterSampleN:'1',comparableStructured:'Yes',tradeoffStructured:'No'}}),'Inconclusive'],
 ['beforeafter not comparable',f(600,10,100),ctx({method:'beforeafter',expert:{beforeRate:'80',afterRate:'110',beforeSampleN:'4',afterSampleN:'4',comparableStructured:'No',tradeoffStructured:'No'}}),'Inconclusive'],
 ['beforeafter quality tradeoff',f(600,10,100),ctx({method:'beforeafter',expert:{beforeRate:'80',afterRate:'110',beforeSampleN:'4',afterSampleN:'4',comparableStructured:'Yes',tradeoffStructured:'Yes'}}),'Standard Not Supported'],
 ['beforeafter no improvement',f(600,10,100),ctx({method:'beforeafter',expert:{beforeRate:'100',afterRate:'95',beforeSampleN:'4',afterSampleN:'4',comparableStructured:'Yes',tradeoffStructured:'No'}}),'Standard Not Supported'],
 ['beforeafter improves but misses demand',f(600,10,120),ctx({method:'beforeafter',expert:{beforeRate:'80',afterRate:'110',beforeSampleN:'4',afterSampleN:'4',comparableStructured:'Yes',tradeoffStructured:'No'}}),'Standard Not Supported'],
 ['verified improvement',f(600,20,100),ctx({method:'beforeafter',expert:{beforeRate:'80',afterRate:'120',beforeSampleN:'4',afterSampleN:'4',comparableStructured:'Yes',tradeoffStructured:'No'}}),'Verified Improvement'],
 ['cycle insufficient units',f(240,null,null),ctx({method:'cycle',observationCount:5,totalSeconds:240,completedUnits:2}),'Inconclusive'],
 ['sampling insufficient observations',f(600,null,null),ctx({method:'sampling',observationCount:5,totalSeconds:600,completedUnits:0}),'Inconclusive']
];
const failures=[];
for(const [name,facts,context,expected] of tests){const got=evaluate(facts,context)?.outcome;if(got!==expected)failures.push(`${name}: expected ${expected}, got ${got}`)}
for(const token of ['beforeRate','afterRate','beforeSampleN','afterSampleN','comparableStructured','tradeoffStructured'])if(!expert.includes(token))failures.push('Structured Before / After field missing: '+token);
if(!base.includes("s.gravityReview?.outcome!=='Verified Improvement'"))failures.push('SOP approval is not protected by Verified Improvement.');
for(const label of ['Verified Improvement','Promising — More Evidence Needed','Standard Not Supported','Inconclusive'])if(!base.includes(label))failures.push('Official result label missing: '+label);
if(failures.length){console.error('Work Study conclusion suite FAILED');failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`Work Study conclusion suite passed ${tests.length} evidence/outcome cases plus Before/After structure and SOP approval safeguards.`);
