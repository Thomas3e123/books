'use strict';
/** Inventory SOP Foundry's web dependencies before making a Windows installer.
 * Unlike Shift Lab, Foundry is a multi-page hosted application with employee
 * connection and Netlify functions, so file:// packaging alone is not parity.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const pagesDir=path.join(root,'site/apps/sop-foundry');
const pages=fs.readdirSync(pagesDir).filter(p=>p.endsWith('.html')).sort();
const results=[];
for(const name of pages){
 const full=path.join(pagesDir,name),html=fs.readFileSync(full,'utf8');
 const rootPaths=[...html.matchAll(/(?:src|href)=["'](\/[^"'?#]*)/g)].map(x=>x[1]).filter(x=>!x.startsWith('//'));
 const external=[...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)/g)].map(x=>x[1]);
 const netlify=(html.match(/\.netlify\/functions\/[^"'\s)]+/g)||[]);
 const missing=rootPaths.filter(p=>!fs.existsSync(path.join(root,'site',p.replace(/^\//,''))));
 const sha=crypto.createHash('sha256').update(html).digest('hex');
 results.push({page:name,sha256:sha,rootRelativePaths:[...new Set(rootPaths)].sort(),missingStaticPaths:[...new Set(missing)].sort(),netlifyFunctions:[...new Set(netlify)].sort(),externalURLs:[...new Set(external)].sort()});
}
const report={generatedFrom:'GitHub repository source',product:'Gravity SOP Foundry',appPages:pages.length,windowsProjectAvailable:fs.existsSync(path.join(root,'windows/gravity-sop-foundry/package.json')),status:'UNVERIFIED: need to preserve hosted functions, multi-page navigation, employee authorization, print/binder, import/export, training, QR and manager/employee boundaries',pages:results};
const dest=path.join(root,'windows/sop-foundry-web-readiness-report.json');
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log('SOP Foundry: '+pages.length+' pages checked. Windows source project '+(report.windowsProjectAvailable?'exists':'missing')+'.');
for(const x of results){if(x.missingStaticPaths.length)console.log('CHECK '+x.page+': '+x.missingStaticPaths.join(', '));}
if(!report.windowsProjectAvailable)console.log('Windows Foundry release parity NOT VERIFIED. This audit is not an installer build.');
