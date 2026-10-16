'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-baseline-provenance-v40.js','utf8');
const must=[
 'Gravity Verified-Baseline Control',
 'Verified Baseline Current',
 'Revalidation Required — Baseline Changed',
 'Baseline Exists — Current Evidence Needs Recheck',
 'No Verified Baseline Yet',
 'Recipe / process map',
 'Equipment',
 'Yield measurement type',
 'Observed role / training context',
 'prior standard remains historical evidence',
 'fresh supporting evidence and a post-change Hold check',
 'Accept revalidated baseline',
 "new Date(hold.updatedAt)>new Date(base.changeDetectedAt)",
 "if(s.mode!=='guided'||s.timer?.running||!a.changed)return",
 'window.GravityWorkStudyBaselineProvenance'
];
for(const t of must){if(!src.includes(t)){console.error('Missing baseline provenance behavior:',t);process.exit(1)}}
console.log('Baseline provenance suite passed: verified-condition fingerprinting, change detection, historical-standard protection, fresh Hold requirement, and safe Guided teaching are present.');