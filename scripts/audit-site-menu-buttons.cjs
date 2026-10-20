'use strict';
/* Inventory of every HTML route in the deployed site. Documents, embedded
   apps, and private manager endpoints are reported separately rather than
   silently treated as ordinary public pages. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../site');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
const html=walk(root).filter(x=>x.endsWith('.html')).sort(), issues=[],internal=[],publicPages=[],special=[];
for(const file of html){
 const rel=path.relative(root,file).replace(/\\/g,'/'),s=fs.readFileSync(file,'utf8');
 const hasButton=/<button\b[^>]*\bdata-menu-toggle\b/i.test(s)||/<button\b[^>]*\bid=["']manual-menu-button["']/i.test(s);
 const hasNav=/<nav\b[^>]*\bdata-menu\b/i.test(s)||/<nav\b[^>]*\bid=["']manual-menu-links["']/i.test(s);
 const hasScript=/(?:src=["'][^"']*site\.js|addEventListener\(['"]click['"]|onclick=)/i.test(s);
 const isInternal=/^(apps\/|assets\/)/.test(rel);
 const rec={file:rel,menu:hasButton,nav:hasNav,script:hasScript};
 if(isInternal)internal.push(rec);
 else if(/^(404|testing-room-manager|registration-thanks|review-thanks)\.html$/.test(rel))special.push(rec);
 else{publicPages.push(rec);if(!hasButton||!hasNav||!hasScript)issues.push({file:rel,button:hasButton,nav:hasNav,script:hasScript});}
}
const audit={timestamp:new Date().toISOString(),total:html.length,publicPageCount:publicPages.length,internalCount:internal.length,specialCount:special.length,missing:issues,publicPages,internal,special};
fs.writeFileSync('site-menu-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('ALL_HTML='+html.length+' PUBLIC_PAGES='+publicPages.length+' INTERNAL='+internal.length+' SPECIAL='+special.length+' MISSING='+issues.length);
for(const issue of issues)console.log('MISSING_MENU '+JSON.stringify(issue));
for(const rec of special.filter(r=>!r.menu))console.log('SPECIAL_NO_MENU '+rec.file);
for(const rec of internal.filter(r=>!r.menu))console.log('INTERNAL_NO_MENU '+rec.file);
if(issues.length)process.exitCode=2;
