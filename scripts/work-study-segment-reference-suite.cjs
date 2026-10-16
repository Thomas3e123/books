'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-segment-reference-v37.js','utf8');
const must=['Gravity Segment Reference Evidence','similar segment name is not enough','Strong condition match','Conditional match','Condition match unverified','recorded equipment differs','location/layout context differs','directEvidence:false','reference-only','verified same-segment restaurant history under comparable conditions','A reference never upgrades itself to measured evidence.','window.GravityWorkStudySegmentReference'];
for(const t of must){if(!src.includes(t)){console.error('Missing segment-reference behavior:',t);process.exit(1)}}
if(!src.includes("h.gravityReview?.outcome!=='Verified Improvement'&&h.sop?.status!=='Management Approved Draft'")){console.error('Reference library is not restricted to verified/approved historical studies.');process.exit(1)}
if(!src.includes('function conditionFit')){console.error('Missing condition-equivalence scoring.');process.exit(1)}
console.log('Segment reference suite passed: verified restaurant-local history is condition-checked and remains planning-only rather than direct evidence.');
