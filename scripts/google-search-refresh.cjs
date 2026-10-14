'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const targets=['site/index.html','site/system.html','site/knowledge-center.html','site/gravity-assist.html','site/intelligence-ai.html','site/start-here.html','site/books.html','site/free-resources.html','site/gravity-system-field-guide.html'];
const swaps=[
  [/215 copy-and-paste AI prompts/g,'250 copy-and-paste AI prompts'],
  [/215 copy-and-paste prompts/g,'250 copy-and-paste prompts'],
  [/215 practical prompts/g,'250 practical prompts'],
  [/215 prompts/g,'250 prompts'],
  [/215-prompt/g,'250-prompt'],
  [/189 copy-and-paste AI prompts/g,'250 copy-and-paste AI prompts'],
  [/189 copy-and-paste prompts/g,'250 copy-and-paste prompts'],
  [/189 prompts/g,'250 prompts'],
  [/350-SOP library/g,'525-SOP library'],
  [/350 SOPs/g,'525 SOPs'],
  [/The five Gravity Assist workspaces/g,'The eight Gravity Assist workspaces'],
  [/the five Gravity Assist workspaces/g,'the eight Gravity Assist workspaces'],
  [/five Gravity Assist workspaces/g,'eight Gravity Assist workspaces']
];
let changed=0;
for(const rel of targets){const full=path.join(root,rel);if(!fs.existsSync(full))continue;let s=fs.readFileSync(full,'utf8'),before=s;for(const [a,b] of swaps)s=s.replace(a,b);if(s!==before){fs.writeFileSync(full,s);changed++;console.log('Updated '+rel)}}
console.log('Search truth refresh changed '+changed+' hub pages.');
