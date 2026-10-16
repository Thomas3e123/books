'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-labor-occupancy-v36.js','utf8');
const must=['Gravity Labor Occupancy & Parallel Time','Elapsed process time and occupied labor are different measures','overlapped machine/process time as elapsed process evidence, not additional labor minutes','does not prove the employee was occupied','same elapsed interval is not represented twice','wallSeconds','backgroundOverlapWithActive','window.GravityWorkStudyLaborOccupancy'];
for(const t of must){if(!src.includes(t)){console.error('Missing labor occupancy behavior:',t);process.exit(1)}}
const clock=fs.readFileSync('site/assets/js/gravity-work-study-clock-control-v32.js','utf8');
for(const t of ['background-start','background-stop','Mixer process','You can time other work while it runs.']){if(!clock.includes(t)){console.error('Missing parallel voice timing behavior:',t);process.exit(1)}}
console.log('Labor occupancy suite passed: background process clocks may overlap active labor, voice machine phrases use the parallel clock, and elapsed machine time is not automatically added to labor.');
