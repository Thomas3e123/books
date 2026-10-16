'use strict';
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-integrity-expert-v19.js'),'utf8');
const required=[
 ['integrity title','Gravity Study Integrity Check'],
 ['observer interference','observer coach, correct, hurry'],
 ['boundary consistency','start point, finish point, or completed-unit definition'],
 ['changed conditions','staffing, demand, equipment, layout, menu/product mix'],
 ['mixed work','materially different job types, order types, products'],
 ['equipment abnormality','equipment malfunctioning'],
 ['training context','trained on the current method'],
 ['abnormal events','unusual interruptions and abnormal events'],
 ['live recording','recorded as they happened'],
 ['question alignment','original problem/question'],
 ['definition consistency','same definitions and counting rules'],
 ['unknown safeguard','Gravity will hold the conclusion rather than guess'],
 ['integrity hold','Integrity Hold — Inconclusive'],
 ['downgrade','s.gravityReview.outcome=\'Inconclusive\''],
 ['preserve original','integrityOriginalOutcome'],
 ['sop block','integrity hold']
];
for(const [name,text] of required)if(!src.includes(text))throw new Error(`Missing Work Study integrity safeguard: ${name}`);
if(!src.includes("['Yes','No','Unknown','Not applicable']"))throw new Error('Integrity answers must support explicit uncertainty');
if(!src.includes("const strong=['Verified Improvement','Promising — More Evidence Needed']"))throw new Error('Integrity gate does not protect strong outcomes');
console.log('Work Study integrity expert suite passed contamination, consistency, changed-condition, uncertainty, downgrade, and SOP safeguards.');
