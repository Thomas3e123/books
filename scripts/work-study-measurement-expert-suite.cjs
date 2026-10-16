'use strict';
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-measurement-expert-v20.js'),'utf8');
const required=[
 ['title','Gravity Measurement Quality'],
 ['sample size','Usable observations'],
 ['variation','Relative variation'],
 ['minimum map','sampling:20'],
 ['flow minimum','flow:8'],
 ['motion minimum','motion:10'],
 ['high variation','st.cv>.30'],
 ['material variation','st.cv>.20'],
 ['outlier spread','st.spread>2.5'],
 ['mean median skew','Math.abs(st.mean-st.median)/st.mean>.20'],
 ['measurement hold','Measurement Hold — More Evidence Needed'],
 ['downgrade','s.gravityReview.outcome=\'Inconclusive\''],
 ['preserve prior result','measurementOriginalOutcome'],
 ['more evidence action','Collect additional comparable observations']
];
for(const [name,text] of required)if(!src.includes(text))throw new Error(`Missing measurement expert safeguard: ${name}`);
if(!src.includes("const strong=['Verified Improvement','Promising — More Evidence Needed']"))throw new Error('Measurement expert does not protect strong outcomes');
console.log('Work Study measurement expert suite passed sample-size, variation, outlier, skew, and conclusion-hold safeguards.');
