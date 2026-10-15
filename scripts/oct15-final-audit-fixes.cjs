'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
function mustChange(name,before,after){if(before===after)throw new Error(name+' patch made no change');}

// Testing Room: remove duplicate screenshot control and do not advertise Work Study Lab as a Windows beta.
{
  const p='site/testing-room.html'; let s=read(p),o=s;
  const shot='<label class="tr-label" style="margin-top:10px">Screenshot <span class="tr-mini">optional — only if it helps explain what you saw</span><input id="msg-shot" class="tr-input" type="file" accept="image/*"></label>';
  s=s.replace(shot+shot,shot);
  s=s.replace('<div class="tr-tool"><strong>Work Study Lab</strong><a href="/gravity-work-study-lab">Open tool page</a><br><a href="/windows-programs">Windows Beta</a></div>',
    '<div class="tr-tool"><strong>Work Study Lab</strong><a href="/gravity-work-study-lab">Open web lab</a><br><span class="tr-mini">Web version available now</span></div>');
  mustChange('Testing Room',o,s); write(p,s);
}

// Work Study Lab: use the approved four result labels exactly.
{
  const p='site/assets/js/gravity-work-study-v2.js'; let s=read(p),o=s;
  const old="if(f.gap!==null&&f.gap<0)recs.push(`Measured rate remains ${fmt(Math.abs(f.gap),1)} units/hour below the current demand target.`);if(f.gap!==null&&f.gap>=0&&share<.25){outcome='Promising — Verify Further';conclusion='The measured process met the current demand target in this observed sample without a dominant avoidable-delay pattern. Verify with additional representative observations under comparable conditions before establishing a permanent standard.'}";
  const neu="if(f.gap!==null&&f.gap<0){outcome='Standard Not Supported';conclusion='The measured process did not meet the current demand target in this observed sample. The present standard is not supported by this evidence and should not be treated as verified.';recs.push(`Measured rate remains ${fmt(Math.abs(f.gap),1)} units/hour below the current demand target.`)}if(f.gap!==null&&f.gap>=0&&share<.25){if(s.method==='beforeafter'){outcome='Verified Improvement';conclusion='The before/after study met the current demand target without a dominant avoidable-delay pattern, supporting the tested improvement under the recorded conditions.'}else{outcome='Promising — More Evidence Needed';conclusion='The measured process met the current demand target in this observed sample without a dominant avoidable-delay pattern. Add representative observations before establishing a permanent standard.'}}";
  s=s.replace(old,neu);
  mustChange('Work Study result labels',o,s); write(p,s);
}

// AI Workbook/search controlled truth: current public edition is 215 prompts.
{
  const p='site/restaurant-ai-prompt-search.html'; let s=read(p),o=s;
  const pairs=[
    ['Search 250 Restaurant AI Prompts','Search 215 Restaurant AI Prompts'],
    ['all 250 Gravity restaurant AI prompts','all 215 Gravity restaurant AI prompts'],
    ['complete 250-prompt Gravity digital workbook','complete 215-prompt Gravity digital workbook'],
    ['250-prompt Restaurant AI Prompts & Systems Workbook','215-prompt Restaurant AI Prompts & Systems Workbook'],
    ['Workbook • 250 prompts','Workbook • 215 prompts'],
    ['Search all 250','Search all 215'],
    ['<strong>250</strong><span>controlled prompts','<strong>215</strong><span>controlled prompts'],
    ['GRV-AI-250','GRV-AI-215'],
    ['Loading the 250-prompt index','Loading the 215-prompt index'],
    ['Open Current 250-Prompt Digital Edition','Open Current 215-Prompt Digital Edition'],
    ['250-prompt Gravity digital workbook','215-prompt Gravity digital workbook'],
    ['250-prompt Restaurant AI Prompts & Systems Workbook - Digital Edition','215-prompt Restaurant AI Prompts & Systems Workbook - Digital Edition']
  ];
  for(const [a,b] of pairs)s=s.split(a).join(b);
  mustChange('AI prompt search truth',o,s); write(p,s);
  const j='site/assets/js/ai-prompt-search.js'; let js=read(j); js=js.replace(/restaurant-ai-prompts-250\.json/g,'restaurant-ai-prompts-215.json'); write(j,js);
}

console.log('October 15 final audit fixes applied.');
