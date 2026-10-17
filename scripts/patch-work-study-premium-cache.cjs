'use strict';
const fs=require('node:fs');
const paths=['scripts/upgrade-work-study-lab-v2.cjs','site/gravity-work-study-lab.html'];
const from='gravity-work-study-v2.css?v=20261016-rich-guided';
const to='gravity-work-study-v2.css?v=20261017-premium-gold-v1';
let changed=0;
for(const p of paths){
  let s=fs.readFileSync(p,'utf8');
  if(s.includes(from)){s=s.split(from).join(to);fs.writeFileSync(p,s);changed++;}
  if(!s.includes(to))throw Error(`${p}: premium Work Study CSS cache tag missing`);
}
console.log(`Premium Work Study CSS cache tag verified in ${changed||paths.length} controlled files.`);
