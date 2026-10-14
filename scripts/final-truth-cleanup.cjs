'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let changed=0;
for(const f of walk(site).filter(f=>/\.(?:html|js|json)$/i.test(f))){let s=fs.readFileSync(f,'utf8'),o=s;
  s=s.replace(/The Restaurant AI Prompts & Systems Workbook currently contains 215 prompts\./g,'The Restaurant AI Prompts & Systems Workbook currently contains 250 prompts.');
  if(path.basename(f)==='releases.html'){
    s=s.replace('The current edition has since advanced to 215 prompts.','At that point, the workbook had advanced to 215 prompts. The current controlled edition now contains 250 prompts.');
    s=s.replace('The living Restaurant AI Prompts & Systems Workbook now adds 26 de-duplicated prompts: eight built from connected Gravity tool workflows and eighteen built from specialty/advanced operating areas in the current Gravity SOP library. The previous prompt set remains intact; the new material extends the current controlled edition to 215 prompts.',
      'At this September 16 milestone, the Restaurant AI Prompts & Systems Workbook added 26 de-duplicated prompts: eight built from connected Gravity tool workflows and eighteen built from specialty/advanced operating areas in the Gravity SOP library. The previous prompt set remained intact; that release extended the then-current controlled edition to 215 prompts. The current controlled edition now contains 250 prompts.');
    s=s.replace('The current controlled edition is 215 prompts.','At that milestone, the controlled edition contained 215 prompts. The current controlled edition now contains 250 prompts.');
    s=s.replace('That release added a Guest Service, Complaints &amp; Recovery expansion. The current controlled edition is 215 prompts.',
      'That release added a Guest Service, Complaints &amp; Recovery expansion. At that milestone, the controlled edition contained 215 prompts. The current controlled edition now contains 250 prompts.');
    s=s.replace('Download Current 215-Prompt Word Book','Archived 215-Prompt Word Edition').replace('Download Current PDF','Archived 215-Prompt PDF');
    s=s.replace('<h3>Restaurant AI Prompts &amp; Systems Workbook — 215 Prompts</h3>\n<p>The living digital edition now contains 215 prompts. The current 215-prompt edition includes Guest Service, Complaints &amp; Recovery, connected Gravity tool workflows, and specialty/advanced operations prompts drawn from the current Gravity SOP library.</p>',
      '<h3>Restaurant AI Prompts &amp; Systems Workbook — September 2026 215-Prompt Milestone</h3>\n<p>At this September milestone, the living digital edition reached 215 prompts, including Guest Service, Complaints &amp; Recovery, connected Gravity tool workflows, and specialty/advanced operations prompts. The current controlled edition now contains 250 prompts.</p>');
  }
  if(s!==o){fs.writeFileSync(f,s,'utf8');changed++;}
}
console.log('Files updated:',changed);
