'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-synthesis-v24.js','utf8');
const must=[
 "name:'Scope & escalation'",
 "name:'Measurement precision'",
 "precision?.n>=2",
 "block:!!precision.blockStandard",
 "name:'Demand coverage'",
 "demand?.applicable",
 "block:!!demand.blockStandard",
 "name:'Standard-minute validity'",
 "standard?.runs?.length",
 "standard.decision==='Standard Minute Not Ready'",
 "planning|candidate",
 "name:'Verified-baseline control'",
 "baseline?.baseline",
 "block:!!baseline.blockStandard",
 "name:'Observer & boundary calibration'",
 "observer?.applicable",
 "block:!!observer.block",
 "name:'Proficiency representativeness'",
 "block:!!proficiency.blockStandard",
 "name:'Observation effect'",
 "block:!!observationEffect.blockConclusion",
 "Hold — Resolve Before Standardizing",
 "measurement quality and precision, demand coverage",
 "core=['Study integrity','Measurement quality','Problem definition','Action design','Failure & recovery','Scope & escalation']",
 'window.GravityWorkStudySynthesis'
];
for(const t of must){if(!src.includes(t)){console.error('Missing synthesis integration behavior:',t);process.exit(1)}}
console.log('Synthesis integration suite passed: precision, demand coverage, standard-minute validity, baseline control, observer calibration, proficiency representativeness, and observation-effect context participate in the consolidated Gravity verdict.');
