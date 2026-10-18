'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const checks=[];
function check(name,ok,evidence){checks.push({name,status:ok?'PASS':'FAIL',evidence})}
const page=read('site/gravity-work-study-lab.html'),windows=read('site/windows-programs.html');
const required=[
['Guided study','site/assets/js/gravity-work-study-guided-entry-v63.js','gravity-work-study-guided-entry-v63.js'],
['Cedar spoken guidance','site/assets/js/gravity-work-study-earbud-mode-v18.js','gravity-work-study-earbud-mode-v18.js'],
['Recorded observations','site/assets/js/gravity-work-study-recorded-observation-v1.js','gravity-work-study-recorded-observation-v1.js'],
['Recording review','site/assets/js/gravity-work-study-recording-review-v1.js','gravity-work-study-recording-review-v1.js'],
['Portable study connection','site/assets/js/gravity-work-study-device-link-v1.js','gravity-work-study-device-link-v1.js'],
['Work Study transcription function','functions/work-study-transcribe/work-study-transcribe.js',null],
['Windows candidate configuration','windows/gravity-work-study-lab/sync-expert-stack.cjs',null]];
for(const [name,file,script] of required)check(name,exists(file)&&(!script||page.includes(script)),file+(script?' linked on study page':' present in source'));
check('Work Study listed on Windows page',windows.includes('Gravity Work Study Lab')&&windows.includes('391')===false,'site/windows-programs.html');
check('Windows public release distinction',windows.includes('Windows Preview')&&windows.includes('not yet released'),'Preview must not imply public installer');
check('Audio review not called proven',read('site/assets/js/gravity-work-study-recording-review-v1.js').includes('unverified'),'Review retains uncertainty');
for(const [name,f] of [['color','site/assets/downloads/windows/manuals/Gravity_Work_Study_Lab_User_Manual_COLOR.pdf'],['black-and-white','site/assets/downloads/windows/manuals/Gravity_Work_Study_Lab_User_Manual_BLACK_AND_WHITE.pdf']])check('Work Study '+name+' manual published',exists(f),f);
const counts={PASS:checks.filter(c=>c.status==='PASS').length,FAIL:checks.filter(c=>c.status==='FAIL').length};
const lines=['# Gravity Deployment Verification — Source Gate','',`Generated UTC: ${new Date().toISOString()}`,'','## Meaning','This is a **read-only GitHub source check**, NOT a live customer acceptance test. PASS confirms presence or consistency, not real-world functionality. Netlify production commit must be compared separately.','','| Feature check | Result | Evidence |','|---|---|---|',...checks.map(c=>`| ${c.name} | **${c.status}** | ${c.evidence} |`),'','## Required release gates','- [ ] GitHub main SHA equals the published production Netlify commit SHA.','- [ ] Existing functional regression and real browser smoke tests pass.','- [ ] Recording and transcription tested on a real tablet with authorized test audio.','- [ ] Manager review and export/reimport checked without data loss.','- [ ] Windows installer and microphone tested on a physical Windows device.','- [ ] Cedar voice and Guide instructions reviewed by a person.','- [ ] All customer manuals visually checked.','- [ ] Explicit approval for ONE production deployment.','','## Summary',`Static presence checks: ${counts.PASS} passed; ${counts.FAIL} require attention.`,''];
const target=path.join(root,'gravity-deployment-verification.md');fs.writeFileSync(target,lines.join('\n'));console.log(lines.join('\n'));if(counts.FAIL)process.exitCode=0;
