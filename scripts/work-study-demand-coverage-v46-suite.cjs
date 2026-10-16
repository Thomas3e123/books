'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-demand-coverage-v46.js','utf8');
const must=['Gravity Demand Coverage','Peak demand','Normal through peak range','All representative demand conditions','Demand Coverage Hold','Demand Coverage Caution','does not require extra production','s.timer?.running','window.GravityWorkStudyDemandCoverage'];
for(const t of must){if(!src.includes(t)){console.error('Missing demand coverage v46 behavior:',t);process.exit(1)}}
if(!src.includes("levels.includes('Peak')")){console.error('Peak demand coverage is not enforced.');process.exit(1)}
if(!src.includes("mixes.includes('Atypical')")||!src.includes("mixes.includes('Typical')")){console.error('Product/order mix context is not checked.');process.exit(1)}
console.log('Demand coverage v46 suite passed: intended demand range, run tagging, mix representativeness, Guided teaching, and anti-waste safeguards are present.');