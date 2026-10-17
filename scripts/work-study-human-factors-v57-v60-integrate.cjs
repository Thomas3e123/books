'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function rw(rel,fn){const p=path.join(root,rel);let s=fs.readFileSync(p,'utf8');s=fn(s);fs.writeFileSync(p,s);}
rw('site/assets/js/gravity-work-study-synthesis-v24.js',s=>{
 const anchor=" const observationEffect=safe(window.GravityWorkStudyObservationEffect?.assess,s);if(observationEffect)checks.push({name:'Observation effect',status:observationEffect.decision,block:!!observationEffect.blockConclusion,detail:observationEffect.finding,next:[observationEffect.bestNext].filter(Boolean)});";
 if(!s.includes(anchor))throw Error('Synthesis anchor not found');
 const add=`\n const ergonomics=safe(window.GravityWorkStudyErgonomics?.assess,s);if(ergonomics?.applicable)checks.push({name:'Physical-demand / ergonomics',status:ergonomics.decision,block:!!ergonomics.blockStandard,detail:ergonomics.finding,next:[ergonomics.bestNext].filter(Boolean)});\n const learning=safe(window.GravityWorkStudyLearningCurve?.assess,s);if(learning?.applicable)checks.push({name:'Learning-curve stability',status:learning.decision,block:!!learning.blockStandard,detail:learning.finding,next:[learning.bestNext].filter(Boolean)});\n const context=safe(window.GravityWorkStudyContextConditions?.assess,s);if(context?.applicable)checks.push({name:'Operating-context representativeness',status:context.decision,block:!!context.blockStandard,detail:context.finding,next:[context.bestNext].filter(Boolean)});\n const pace=safe(window.GravityWorkStudySustainablePace?.assess,s);if(pace?.applicable)checks.push({name:'Sustainable operating pace',status:pace.decision,block:!!pace.blockStandard,detail:pace.finding,next:[pace.bestNext].filter(Boolean)});`;
 if(!s.includes("name:'Physical-demand / ergonomics'"))s=s.replace(anchor,anchor+add);
 s=s.replace('observer calibration when paired timing evidence is used.','observer calibration when paired timing evidence is used, physical-demand/ergonomic screening, learning-curve stability, operating-context representativeness, and sustainable-pace validation.');
 return s;
});
rw('scripts/upgrade-work-study-lab-v2.cjs',s=>{
 const anchor="['gravity-work-study-evidence-package-v56.js','20261016-evidence-package-v1']";
 const add="['gravity-work-study-ergonomics-v57.js','20261016-ergonomics-v1'],['gravity-work-study-learning-curve-v58.js','20261016-learning-curve-v1'],['gravity-work-study-context-conditions-v59.js','20261016-context-conditions-v1'],['gravity-work-study-sustainable-pace-v60.js','20261016-sustainable-pace-v1'],";
 if(!s.includes(anchor))throw Error('Installer v56 anchor not found');
 if(!s.includes('gravity-work-study-ergonomics-v57.js'))s=s.replace(anchor,add+anchor);
 s=s.replace('complete evidence package v56.','human-factor and operating-sustainability expert stack v60.');
 s=s.replace('extended-window shift-position representativeness that requires early/middle/later evidence without inferring employee fatigue or intent, a complete local-first','extended-window shift-position representativeness that requires early/middle/later evidence without inferring employee fatigue or intent, observable physical-demand and ergonomic screening that blocks speed standards when job-design risk remains unresolved, trained-state learning-curve controls that separate practice effects from process improvement, operating-context representativeness across equipment/environment/product conditions, sustainable-pace validation that separates fastest cycles from defensible labor expectations, a complete local-first');
 return s;
});
rw('scripts/work-study-graduation-suite.cjs',s=>{
 const anchor=" ['gravity-work-study-evidence-package-v56.js','complete evidence package']";
 const add=" ['gravity-work-study-ergonomics-v57.js','physical-demand and ergonomic screening'],\n ['gravity-work-study-learning-curve-v58.js','learning-curve stability'],\n ['gravity-work-study-context-conditions-v59.js','operating-context representativeness'],\n ['gravity-work-study-sustainable-pace-v60.js','sustainable operating pace'],\n";
 if(!s.includes(anchor))throw Error('Graduation v56 anchor not found');
 if(!s.includes('gravity-work-study-ergonomics-v57.js'))s=s.replace(anchor,add+anchor);
 const synAnchor="'Observation effect'";
 if(!s.includes("'Physical-demand / ergonomics'"))s=s.replace(synAnchor,synAnchor+",'Physical-demand / ergonomics','Learning-curve stability','Operating-context representativeness','Sustainable operating pace'");
 s=s.replace('expert layers v39-v56','expert layers v39-v60');
 return s;
});
console.log('Integrated Work Study expert layers v57-v60 into synthesis, installer, and graduation gate.');