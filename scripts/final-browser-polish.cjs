'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let changed=0;
for(const f of walk(site).filter(f=>f.endsWith('.html'))){
  let s=fs.readFileSync(f,'utf8'),o=s;
  // Let the brand link derive its accessible name from the complete visible brand text.
  s=s.replace(/<a\s+aria-label=["']The Gravity System home["']\s+class=["']brand["']/gi,'<a class="brand"');
  s=s.replace(/<a\s+class=["']brand["']\s+aria-label=["']The Gravity System home["']/gi,'<a class="brand"');
  // The logo is decorative because the adjacent visible text names the brand.
  s=s.replace(/(<a\s+class=["']brand["'][^>]*>[\s\n]*<img)\s+alt=["']The Gravity System["']/gi,'$1 alt=""');
  // Explicit SVG favicon prevents the browser fallback request to missing /favicon.ico.
  if(!/<link[^>]+rel=["'](?:shortcut\s+)?icon["']/i.test(s)){
    const icon='<link rel="icon" href="/assets/images/gravity-system-mark.svg" type="image/svg+xml">';
    if(/<meta[^>]+name=["']viewport["'][^>]*>/i.test(s)) s=s.replace(/(<meta[^>]+name=["']viewport["'][^>]*>)/i,'$1\n'+icon);
    else s=s.replace(/<head>/i,'<head>\n'+icon);
  }
  if(s!==o){fs.writeFileSync(f,s,'utf8');changed++;}
}
console.log('Browser-quality polished HTML files:',changed);
