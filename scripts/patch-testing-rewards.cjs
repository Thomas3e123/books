'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','site','testing-room.html');
let html=fs.readFileSync(file,'utf8');
const replacements=[
  ['If you materially help improve a Gravity Windows beta, you may receive the final version of that program at no charge after the Founding Year ends.','If you materially help improve a Gravity Windows beta, you receive the final version of that program at no charge after the Founding Year ends.'],
  ["The 10 people whose testing contributes the most may receive lifetime access to Gravity's standard digital library at no charge.","The 10 people whose testing contributes the most receive lifetime access to Gravity's standard digital library at no charge."]
];
for(const [from,to] of replacements){
  if(html.includes(from)) html=html.replace(from,to);
  else if(!html.includes(to)) throw new Error('Could not locate expected Testing Room reward wording: '+from);
}
if(/materially help improve a Gravity Windows beta[^<]*\bmay\b/i.test(html)||/10 people whose testing contributes the most[^<]*\bmay\b/i.test(html)) throw new Error('Reward wording still contains may.');
fs.writeFileSync(file,html);
console.log('Testing Room rewards are definitive; both reward may statements are removed.');
