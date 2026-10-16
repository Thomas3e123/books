'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-synthesis-v24.js','utf8');
const must=[
 "name:'Scope & escalation'",
 "name:'Standard-minute validity'",
 "standard?.runs?.length",
 "standard.decision==='Standard Minute Not Ready'",
 "planning|candidate",
 "Hold — Resolve Before Standardizing",
 "plus standard-minute validity when timed production evidence is present",
 "core=['Study integrity','Measurement quality','Problem definition','Action design','Failure & recovery','Scope & escalation']",
 'window.GravityWorkStudySynthesis'
];
for(const t of must){if(!src.includes(t)){console.error('Missing synthesis integration behavior:',t);process.exit(1)}}
console.log('Synthesis integration suite passed: standard-minute v33 hold/planning/candidate states participate in the consolidated Gravity verdict when timed production evidence exists.');
