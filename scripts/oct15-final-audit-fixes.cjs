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
  s=s.replace("if(!hasBaseline)return{label:'Inconclusive — Establish a Baseline',tone:'neutral'};","if(!hasBaseline)return{label:'Inconclusive',tone:'neutral'};");
  s=s.replace("if(confidence==='Low')return{label:'Inconclusive — Low Confidence',tone:'neutral'};","if(confidence==='Low')return{label:'Inconclusive',tone:'neutral'};");
  s=s.replace("if(scoreDelta>0.08)return{label:'Promising — Verify Further',tone:'good'};","if(scoreDelta>0.08&&confidence==='High')return{label:'Verified Improvement',tone:'good'};if(scoreDelta>0.08)return{label:'Promising — More Evidence Needed',tone:'good'};");
  s=s.replace("if(scoreDelta< -0.05)return{label:'Promising — Rethink the Change',tone:'warn'};","if(scoreDelta< -0.05)return{label:'Standard Not Supported',tone:'warn'};");
  s=s.replace("if(scoreDelta<-0.05)return{label:'Promising — Rethink the Change',tone:'warn'};","if(scoreDelta<-0.05)return{label:'Standard Not Supported',tone:'warn'};");
  s=s.replace("return{label:'Inconclusive — No Material Improvement',tone:'neutral'};","return{label:'Inconclusive',tone:'neutral'};");
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
