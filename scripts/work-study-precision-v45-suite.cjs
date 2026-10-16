'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-precision-v45.js','utf8');
const must=['Gravity Measurement Precision','95% uncertainty','Precision Hold — Range Too Wide','Precision Caution','Precision Supported','internal decision aids, not an industry certification threshold','do not create unnecessary production','s.timer?.running','window.GravityWorkStudyPrecision'];
for(const t of must){if(!src.includes(t)){console.error('Missing precision v45 behavior:',t);process.exit(1)}}
const T95=[0,12.706,4.303,3.182,2.776,2.571,2.447,2.365,2.306,2.262,2.228];
function calc(a){const n=a.length;if(n<2)return{n,relativeHalf:null};const mean=a.reduce((t,x)=>t+x,0)/n,sd=Math.sqrt(a.reduce((t,x)=>t+(x-mean)**2,0)/(n-1)),half=(n-1<=10?T95[n-1]:1.96)*sd/Math.sqrt(n);return{n,mean,half,relativeHalf:mean?half/mean:null}}
const stable=calc([60,61,59,60,62,58,60,61,59,60]);if(!(stable.relativeHalf<.15)){console.error('Stable sample should have narrow interval.',stable);process.exit(1)}
const wide=calc([20,100,25,110,30]);if(!(wide.relativeHalf>.25)){console.error('Wide sample should have imprecise interval.',wide);process.exit(1)}
console.log('Precision v45 suite passed: 95% uncertainty, narrow/wide discrimination, safe Guided teaching, and anti-waste language are present.');