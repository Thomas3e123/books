'use strict';
const fs=require('node:fs');
function read(p){return fs.readFileSync(p,'utf8')}
function need(src,t,label){if(!src.includes(t)){console.error('HUMAN FACTOR FAIL:',label,'missing:',t);process.exit(1)}}
const files={
 erg:read('site/assets/js/gravity-work-study-ergonomics-v57.js'),
 learn:read('site/assets/js/gravity-work-study-learning-curve-v58.js'),
 ctx:read('site/assets/js/gravity-work-study-context-conditions-v59.js'),
 pace:read('site/assets/js/gravity-work-study-sustainable-pace-v60.js')
};
for(const [k,s] of Object.entries(files)){need(s,"s.mode!=='guided'||s.timer?.running",k+' teaching must stay quiet during active timing');need(s,'blockStandard',k+' must be able to block standardization');need(s,'bestNext',k+' must identify best next evidence')}
for(const t of ['awkward posture','meaningful force','high repetition','manual lifting/carrying','Operational screening only'])need(files.erg,t,'ergonomic safeguard');
for(const t of ['method changed','not yet trained','learning rather than process change','stable performance state'])need(files.learn,t,'learning-curve safeguard');
for(const t of ['temperature/heat/cold','equipment condition/setup','traffic/crowding','product/input condition','condition changed during observation'])need(files.ctx,t,'context safeguard');
for(const t of ['best/fast cycles','quality/service did not remain','Safety conditions did not remain','100% continuous utilization','fastest observed cycle'])need(files.pace,t,'sustainable-pace safeguard');
console.log('Work Study human-factor v57-v60 suite passed ergonomic, learning-curve, context-representativeness, sustainable-pace, teaching-safety, and standard-hold safeguards.');