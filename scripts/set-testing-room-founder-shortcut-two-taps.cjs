'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'..','site','testing-room.html');
let html=fs.readFileSync(file,'utf8');
const old="if(c>=3){e.preventDefault();c=0;location.href='/testing-room-manager';}";
const next="if(c>=2){e.preventDefault();c=0;location.href='/testing-room-manager';}";
if(html.includes(next)){
  console.log('Founder shortcut already uses two taps.');
  process.exit(0);
}
if(!html.includes(old)) throw new Error('Expected three-tap founder shortcut was not found.');
html=html.replace(old,next);
fs.writeFileSync(file,html);
console.log('Founder shortcut changed from three taps to two taps within the existing 1.8-second window.');
