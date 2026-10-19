'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'app/site');
const app=path.join(root,'apps/sop-foundry');
const m=JSON.parse(fs.readFileSync(path.join(root,'SOURCE_PARITY_MANIFEST.json'),'utf8'));
if(m.sourceCount<60)throw Error('Incomplete Foundry source sync: '+m.sourceCount+' files');
const pages=fs.readdirSync(app).filter(x=>x.endsWith('.html'));
if(pages.length<20)throw Error('Expected all SOP Foundry pages, saw '+pages.length);
let links=0;const missing=[];
for(const page of pages){
 const html=fs.readFileSync(path.join(app,page),'utf8');
 for(const match of html.matchAll(/(?:src|href)=["'](\/[^"'?#]*)/g)){
  let p=match[1];
  if(p.startsWith('//')||p.startsWith('/e/')||p.startsWith('/foundry-hosted/')||p.startsWith('/api/'))continue;
  if(!path.posix.extname(p))p+='.html';
  const full=path.resolve(root,'.'+p),rel=path.relative(root,full);
  links++;
  if(rel.startsWith('..')||path.isAbsolute(rel)||!fs.existsSync(full))missing.push(page+' → '+match[1]);
 }
}
for(const x of m.siteFiles){
 const original=path.resolve(__dirname,'../..',x.source);
 const digest=crypto.createHash('sha256').update(fs.readFileSync(original)).digest('hex');
 if(digest!==x.sha256)throw Error('Source changed since Windows sync: '+x.source);
}
if(missing.length)throw Error('Unresolved static dependencies:\n'+missing.join('\n'));
for(const must of ['access.html','workroom.html','employee-app.html','import-export.html','employee-connection.html','training.html','staff-sops.html','staff-recipes.html','poster-studio.html','history.html'])if(!fs.existsSync(path.join(app,must)))throw Error('Missing '+must);
if(fs.readFileSync(path.join(app,'employee-connection.js'),'utf8').includes("location.origin+'/e/'"))throw Error('Phone employee QR must use hosted HTTPS domain');
if(fs.readFileSync(path.join(app,'web-api-shim.js'),'utf8').includes("Browser-local storage for this website"))throw Error('Windows data-location wording not corrected');
console.log('SOP Foundry Windows packaged parity verified:',pages.length,'pages,',m.sourceCount,'source files,',links,'static references, 0 broken.');
