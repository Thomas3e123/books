'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-v2.js');
let js=fs.readFileSync(file,'utf8');
const old="const verdict=evaluateReviewEvidence(f,ctx),recs=[...(verdict.next||[])];";
const next="let verdict=evaluateReviewEvidence(f,ctx);let methodAssessment=null;try{methodAssessment=window.GravityWorkStudyExpertReasoner?.assess?.(s.method,s.id,f)||null}catch{}if(verdict.outcome==='Verified Improvement'&&methodAssessment?.blockVerified){verdict={outcome:'Inconclusive',conclusion:methodAssessment.finding+' Gravity will not verify the improvement until the cause/attribution check is resolved.',strength:'Preliminary',next:['Resolve the method-specific expert reasoning checkpoint and repeat or extend the comparison if needed.']}}const recs=[...(methodAssessment?.recs||[]),...(verdict.next||[])];";
if(!js.includes(next)){
  if(!js.includes(old))throw new Error('Could not locate Work Study verdict integration point');
  js=js.replace(old,next);
}
const oldReturn="return{outcome:verdict.outcome,conclusion:verdict.conclusion,strength:verdict.strength,recs:[...new Set(recs)],generatedAt:now(),facts:f,evidenceContext:ctx}";
const newReturn="return{outcome:verdict.outcome,conclusion:verdict.conclusion,strength:verdict.strength,recs:[...new Set(recs)],generatedAt:now(),facts:f,evidenceContext:ctx,methodFinding:methodAssessment?.finding||'',methodStage:methodAssessment?.stage||'Raw Evidence'}";
if(!js.includes(newReturn)){
  if(!js.includes(oldReturn))throw new Error('Could not locate Work Study review return');
  js=js.replace(oldReturn,newReturn);
}
fs.writeFileSync(file,js);
console.log('Integrated method-specific expert reasoning with Gravity Results Review.');
