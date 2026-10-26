'use strict';
/*
 * Prepare an OFFLINE, REVIEW-ONLY Gravity production candidate from the
 * existing, isolated Gravity migration site source. This script never deploys,
 * changes DNS, touches customer data, or mutates site/ or TMB.
 * Execute: node scripts/prepare-gravity-production-candidate.cjs
 */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'site');
const destination=path.join(root,'build','gravity-production-candidate');
// The proposed public Gravity domain is a build target, NOT evidence that DNS is connected.
const publicOrigin='https://gravityleadershipsystem.com';
const stagingOrigins=['https://gravity-migration--gravity-leadership-system.netlify.app','https://gravity-leadership-system.netlify.app'];
const privatePage=/^(?:apps\/|testing-room-manager\.html$|registration-thanks\.html$|gravity-report-thanks\.html$|review-thanks\.html$)/i;
if(!fs.existsSync(path.join(source,'gravity-shift-lab.html')))throw Error('Gravity staging source missing');
if(destination===source||source.startsWith(destination+path.sep))throw Error('Unsafe output directory');
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.rmSync(destination,{recursive:true,force:true});
fs.cpSync(source,destination,{recursive:true});
let pages=0;
function walk(dir){
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,item.name);
  if(item.isDirectory()){walk(full);continue}
  if(!full.endsWith('.html'))continue;
  let html=fs.readFileSync(full,'utf8');
  html=html.replace(/<div id="gravity-migration-preview-notice"[^>]*>[\s\S]*?<\/div>/g,'');
  // Some embedded workrooms also carry styling and a minimizer script for the preview banner.
  html=html.replace(/<style id="gravity-preview-banner-repair">[\s\S]*?<\/style>/g,'');
  html=html.replace(/<script>(?:(?!<\/script>)[\s\S])*?getElementById\('gravity-migration-preview-notice'\)(?:(?!<\/script>)[\s\S])*?<\/script>/g,'');
  // Remove the blanket preview noindex from public pages, but KEEP private employee,
  // manager and receipt pages out of the public search index after launch.
  html=html.replace(/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']\s*\/?>\s*/gi,'');
  const relative=path.relative(destination,full).split(path.sep).join('/');
  if(privatePage.test(relative)){
    html=html.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/gi,'');
    html=html.replace(/(<head\b[^>]*>)/i,'$1\n<meta name="robots" content="noindex,nofollow"/>');
  }
  // Production metadata must agree with the candidate sitemap, not the preview host.
  for(const previewOrigin of stagingOrigins)html=html.split(previewOrigin).join(publicOrigin);
  // Preserve Gravity publisher attribution and the original TMB website where intentional.
  if(/gravity-migration-preview-notice|GRAVITY MIGRATION PREVIEW — NOT LIVE FOR CUSTOMERS/.test(html))throw Error('Preview warning remained: '+full);
  fs.writeFileSync(full,html);pages++;
 }
}
walk(destination);
const headersFile=path.join(destination,'_headers');
let headers=fs.readFileSync(headersFile,'utf8');
headers=headers.replace(/^  X-Robots-Tag: noindex, nofollow\r?\n/gm,'');
fs.writeFileSync(headersFile,headers);
fs.writeFileSync(path.join(destination,'robots.txt'),'User-agent: *\nAllow: /\n');
if(pages<100)throw Error('Incomplete candidate: '+pages+' HTML files');
if(/Disallow:\s*\//.test(fs.readFileSync(path.join(destination,'robots.txt'),'utf8')))throw Error('Candidate remains blocked from search');
if(headers.includes('X-Robots-Tag: noindex, nofollow'))throw Error('Candidate header remains noindex');
for(const critical of ['index.html','books.html','register.html','gravity-shift-lab.html','gravity-work-study-lab.html','windows-programs.html']){
 if(!fs.existsSync(path.join(destination,critical)))throw Error('Missing candidate page '+critical);
}
console.log(JSON.stringify({status:'LOCAL BUILD ONLY; NOT DEPLOYED',pages,directory:path.relative(root,destination),productionSiteUnchanged:true},null,2));
