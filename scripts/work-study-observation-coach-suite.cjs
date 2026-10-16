'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-observation-coach-v17.js');
const src=fs.readFileSync(file,'utf8');
const document={getElementById:()=>null,documentElement:{},addEventListener:()=>{}};class MO{observe(){}};
const ctx={window:{},document,localStorage:{getItem:()=>null},MutationObserver:MO};ctx.window=ctx;vm.runInNewContext(src,ctx);
const guides=ctx.GravityWorkStudyObservationCoach.guides;
const methods=['flow','cycle','motion','bottleneck','sampling','prep','dish','service','setup','beforeafter','custom'];
for(const m of methods){const g=guides[m];if(!g||!g.title||!Array.isArray(g.watch)||g.watch.length<3||!g.enough)throw new Error(`Incomplete observation guide: ${m}`)}
const must=[
 ['flow','starved'],['flow','blocked'],['cycle','complete comparable cycles'],['motion','Do not ask the employee'],['bottleneck','suspected constraint'],['sampling','Spread observations'],['prep','finished yield'],['dish','rack building'],['service','handoffs'],['setup','truly ready for service'],['beforeafter','at least three comparable observations']
];
for(const [m,text] of must){const body=[guides[m].title,...guides[m].watch,guides[m].enough].join(' ');if(!body.includes(text))throw new Error(`Missing ${m} novice observation safeguard: ${text}`)}
console.log(`Work Study observation coach suite passed ${methods.length} method-specific first-time observation guides.`);
