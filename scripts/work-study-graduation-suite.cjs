'use strict';
const fs=require('node:fs');
const path=require('node:path');
function read(p){return fs.readFileSync(p,'utf8')}
function need(src,token,label){if(!src.includes(token)){console.error('GRADUATION FAIL:',label,'missing:',token);process.exit(1)}}
const base=read('site/assets/js/gravity-work-study-v2.js');
const clock=read('site/assets/js/gravity-work-study-clock-control-v32.js');
const synth=read('site/assets/js/gravity-work-study-synthesis-v24.js');
const installer=read('scripts/upgrade-work-study-lab-v2.cjs');
const pkg=read('site/assets/js/gravity-work-study-evidence-package-v56.js');
if(base.includes('stopTimer(false)')){console.error('GRADUATION FAIL: active timing can still be silently discarded on navigation.');process.exit(1)}
need(clock,'Clock control switched to','clock-control ownership switching');
need(clock,"I didn't understand that. Please say it again.",'uncertain speech protection');
need(clock,"if(result.intent==='switch'){if(s.timer?.running)stopCurrent();cycleOwner();return true}",'stop-before-switch safeguard');
for(const phrase of ['arrived','complete','waiting','found it'])need(clock,phrase,'natural-language clock intent '+phrase);
const modules=[
 ['gravity-work-study-scaling-expert-v39.js','fixed/variable scaling'],
 ['gravity-work-study-baseline-provenance-v40.js','verified baseline provenance'],
 ['gravity-work-study-allowance-expert-v41.js','allowance control'],
 ['gravity-work-study-observer-agreement-v42.js','observer calibration'],
 ['gravity-work-study-proficiency-v43.js','proficiency representativeness'],
 ['gravity-work-study-observation-effect-v44.js','observation effect'],
 ['gravity-work-study-precision-v45.js','precision'],
 ['gravity-work-study-demand-coverage-v46.js','demand coverage'],
 ['gravity-work-study-shared-setup-v47.js','shared setup'],
 ['gravity-work-study-crew-labor-v48.js','crew labor'],
 ['gravity-work-study-yield-quality-v49.js','yield/waste'],
 ['gravity-work-study-work-sampling-v50.js','work sampling'],
 ['gravity-work-study-queue-recovery-v51.js','queue/recovery'],
 ['gravity-work-study-incomplete-cycle-v52.js','incomplete-cycle protection'],
 ['gravity-work-study-short-element-v53.js','short-element adequacy'],
 ['gravity-work-study-shift-position-v54.js','shift-position representativeness'],
 ['gravity-work-study-changeover-sequence-v55.js','directional changeover'],
 ['gravity-work-study-evidence-package-v56.js','complete evidence package']
];
for(const [file,label] of modules){const p=path.join('site/assets/js',file);if(!fs.existsSync(p)){console.error('GRADUATION FAIL: missing expert module',label,file);process.exit(1)};need(installer,file,'installer '+label)}
const synthChecks=['Measurement precision','Short-element measurement','Work Sampling validity','Demand coverage','Queue & recovery','Shift-position representativeness','Shared setup & cleanup allocation','Sequence-dependent changeover','Crew labor accounting','Yield & waste protection','Incomplete-cycle protection','Verified-baseline control','Observer & boundary calibration','Proficiency representativeness','Observation effect'];
for(const x of synthChecks)need(synth,x,'synthesis check '+x);
need(pkg,'gravity-study.json','portable study package extension');
need(pkg,'sidecars','expert sidecar evidence packaging');
need(pkg,'studyId','study-scoped evidence packaging');
const safetyFiles=['gravity-work-study-yield-quality-v49.js','gravity-work-study-changeover-sequence-v55.js','gravity-work-study-action-expert-v21.js'];
for(const file of safetyFiles){const src=read(path.join('site/assets/js',file));if(!/safety|quality|clean|sanit|allergen/i.test(src)){console.error('GRADUATION FAIL: safety/quality boundary absent in',file);process.exit(1)}}
const teachFiles=modules.slice(0,-1).map(x=>x[0]);
for(const file of teachFiles){const src=read(path.join('site/assets/js',file));if(src.includes('speechSynthesis')&&!/timer\?\.running|timer\.running/.test(src)){console.error('GRADUATION FAIL: expert speech may occur during timing in',file);process.exit(1)}}
console.log('WORK STUDY GRADUATION PASS: timer integrity, natural-language clock control, expert layers v39-v56, synthesis participation, safety/quality boundaries, and portable evidence packaging are all present in the controlled source.');