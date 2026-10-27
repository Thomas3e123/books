'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const directory=path.resolve(root,process.env.GRAVITY_AUDIT_DIR||'build/gravity-production-candidate');
const known=new Map();
// Netlify functions are server-side routes, NOT files in the publish directory.
// Validate against the shipped function declaration and original approved editorial
// inventory rather than classifying 200-function URLs as missing static HTML.
const reportFunction=path.join(root,'functions','gravity-report','index.mjs');
const reportModule=fs.existsSync(reportFunction)?fs.readFileSync(reportFunction,'utf8'):'';
const requiredPatterns=["'/gravity-report/feed.xml'","'/gravity-report/sitemap.xml'","'/gravity-report/articles.json'","'/gravity-report/:slug'"];
const dynamicReportConfigured=requiredPatterns.every(route=>reportModule.includes(route));
const reportInventory=path.join(root,'functions','gravity-report','articles.json');
const editorial=fs.existsSync(reportInventory)?JSON.parse(fs.readFileSync(reportInventory,'utf8')):{articles:[]};
const knownReportSlugs=new Set(editorial.articles.map(a=>a.slug));
// The one-time October 27 move announcement is an unnumbered dynamic article.
// Only admit it when the actual server handler exposes the corresponding slug.
if(reportModule.includes('gravity-has-a-new-home'))knownReportSlugs.add('gravity-has-a-new-home');
for(const chunk of ['issues-11-15.json','issues-16-20.json','issues-21-25.json','issues-26-30.json']){
 const file=path.join(root,'functions','gravity-report',chunk);
 if(!fs.existsSync(file))continue;
 for(const draft of JSON.parse(fs.readFileSync(file,'utf8')))
   knownReportSlugs.add(draft.title.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
}
function managedReportRoute(ref){
 if(!dynamicReportConfigured)return false;
 if(['/gravity-report/feed.xml','/gravity-report/sitemap.xml','/gravity-report/articles.json'].includes(ref))return true;
 if(!ref.startsWith('/gravity-report/'))return false;
 const slug=ref.slice('/gravity-report/'.length);
 return !slug.includes('/')&&knownReportSlugs.has(slug);
}

function normalized(u){
 try{const obj=new URL(u,'https://gravityleadershipsystem.com/');
 if(!['https:','http:'].includes(obj.protocol)||!['gravityleadershipsystem.com','www.gravityleadershipsystem.com','gravity-release-review--gravity-leadership-system.netlify.app','gravity-migration--gravity-leadership-system.netlify.app'].includes(obj.hostname))return null;
 return decodeURIComponent(obj.pathname)}catch{return null}
}
for(const line of fs.readFileSync(path.join(directory,'_redirects'),'utf8').split(/\r?\n/)){
 const t=line.trim().split(/\s+/);
 if(t.length<3||t[0].startsWith('#')||t[0].includes(':')||t[0].includes('*'))continue;
 if(t[0].startsWith('/')&&t[1].startsWith('/')&&/^(200|301|302)!?$/.test(t[2]))known.set(t[0],t[1]);
}
function exists(ref){
 if(managedReportRoute(ref))return true;
 if(ref==='/'||ref==='')return fs.existsSync(path.join(directory,'index.html'));
 let curr=ref;
 for(let attempt=0;attempt<4;attempt++){
  for(const n of [curr,curr.replace(/\/$/,'')+'.html',curr.replace(/\/$/,'')+'/index.html']){
   if(!n.startsWith('/'))return false;
   const full=path.resolve(directory,'.'+n);
   if(!full.startsWith(directory+path.sep))return false;
   if(fs.existsSync(full)&&fs.statSync(full).isFile())return true;
  }
  const mapped=known.get(curr);
  if(!mapped||mapped===curr)return false;
  curr=mapped;
 }
 return false;
}
const broken=[],checked=new Set(),pages=[];
function visit(folder){
 for(const item of fs.readdirSync(folder,{withFileTypes:true})){
  const file=path.join(folder,item.name);
  if(item.isDirectory()){visit(file);continue}
  if(!item.name.endsWith('.html'))continue;
  const relative=path.relative(directory,file);pages.push(relative);
  const source=fs.readFileSync(file,'utf8');
  const siteRelative=path.relative(directory,file).split(path.sep).join('/');
  const base='https://gravityleadershipsystem.com/'+siteRelative;
  for(const match of source.matchAll(/\s(?:href|src|action)\s*=\s*["']([^"']+)["']/gi)){
   const raw=match[1].trim();
   if(!raw||raw.startsWith('#')||raw.startsWith('data:')||raw.includes('{{')||raw.includes('${'))continue;
   const ref=normalized(new URL(raw,base).href);
   if(!ref||ref.startsWith('/.netlify/')||ref.startsWith('/api/')||ref.startsWith('/foundry-hosted/')||/^\/e\/[^./]+/.test(ref))continue;
   const key=relative+':'+ref;
   if(checked.has(key))continue;
   checked.add(key);
   if(!exists(ref))broken.push({source:relative,path:ref});
  }
 }
}
visit(directory);
const missing=[...new Set(broken.map(x=>x.path))].sort();
console.log(JSON.stringify({pages:pages.length,distinctReferences:checked.size,dynamicReportConfigured,knownReportArticleCount:knownReportSlugs.size,brokenPaths:missing.length,brokenInstances:broken.length,missing:missing.slice(0,100),examples:broken.slice(0,40)},null,2));
if(process.argv.includes('--strict')&&broken.length)process.exitCode=1;
