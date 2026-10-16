'use strict';
const fs=require('node:fs'),path=require('node:path');
const interview=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-guided-interview-v13.js'),'utf8');
const first=fs.readFileSync(path.join(__dirname,'..','site','assets','js','gravity-work-study-first-timer-v16.js'),'utf8');
const required=[
 ['hello','Hello. I’m Gravity. I’ll take you through this.'],
 ['ordinary language','ordinary restaurant language'],
 ['facts first','Here are the facts we measured. Do not explain them yet.'],
 ['uncertain interpretation','It is completely acceptable to say you are not sure'],
 ['no guessing','Do not guess'],
 ['unknown button','I don’t know yet'],
 ['demand help','POS/ticket history'],
 ['observation help','do not coach the employee'],
 ['continue study','choose Continue study'],
 ['standard gate','repeatability check supports it']
];
for(const [name,text] of required){if(!(interview+first).includes(text))throw new Error(`Missing first-timer safeguard: ${name}`)}
for(const screen of ['problem','demand','people','method','elements','guardrails','observe','facts','interpret','review','sop']){if(!first.includes(`${screen}:`))throw new Error(`Missing first-timer help for ${screen}`)}
if(!interview.includes('Tell Gravity'))throw new Error('Guided interview no longer captures answers directly');
if(!interview.includes('Show me the facts'))throw new Error('Observation-to-facts handoff missing');
console.log('First-time Work Study suite passed complete beginner guidance, uncertainty, observation, and standardization safeguards.');
