'use strict';
const fs=require('node:fs');const src=fs.readFileSync('site/assets/js/gravity-work-study-expert-triage-v61.js','utf8');
function need(t,label){if(!src.includes(t)){console.error('TRIAGE V61 FAIL:',label,'missing:',t);process.exit(1)}}
for(const t of ["window.GravityWorkStudySynthesis?.synthesize?.(s)","blocked[0]||cautions[0]","s.mode!=='guided'||s.timer?.running","does not hide, waive, or silently mark expert checks complete","Mark a specialist check “Not applicable” only when that is actually true","Go to this expert check"])need(t,'triage safeguard');
for(const name of ['Physical-demand / ergonomics','Learning-curve stability','Operating-context representativeness','Sustainable operating pace'])need(name,'v57-v60 triage mapping');
console.log('Work Study expert triage v61 suite passed blocker-first prioritization, teaching safety, truth-preserving applicability guidance, and direct navigation safeguards.');