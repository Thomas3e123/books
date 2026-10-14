'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let changed=0;
for(const f of walk(site).filter(f=>f.endsWith('.html'))){let s=fs.readFileSync(f,'utf8'),o=s;
  s=s.replace(/(<button\s+aria-label=["']Close Gravity Guide["'][^>]*>)×(<\/button>)/gi,'$1<span aria-hidden="true">×</span>$2');
  s=s.replace(/(<button\s+aria-label=["']Clear search["'][^>]*>)×(<\/button>)/gi,'$1<span aria-hidden="true">×</span>$2');
  if(s!==o){fs.writeFileSync(f,s,'utf8');changed++;}
}
console.log('Accessibility-polished HTML files:',changed);
