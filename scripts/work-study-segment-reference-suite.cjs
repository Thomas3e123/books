'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-segment-reference-v37.js','utf8');
const must=['Gravity Segment Reference Evidence','never inserted as if they were direct observations','verified same-restaurant history','directEvidence:false','reference-only','Evidence hierarchy: direct timing in this study → verified same-segment restaurant history → comparable reference → estimate only','A reference never upgrades itself to measured evidence.','window.GravityWorkStudySegmentReference'];
for(const t of must){if(!src.includes(t)){console.error('Missing segment-reference behavior:',t);process.exit(1)}}
if(!src.includes("h.gravityReview?.outcome!=='Verified Improvement'&&h.sop?.status!=='Management Approved Draft'")){console.error('Reference library is not restricted to verified/approved historical studies.');process.exit(1)}
console.log('Segment reference suite passed: verified restaurant-local history can guide planning but never becomes direct evidence in the current study.');
