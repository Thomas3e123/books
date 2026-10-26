'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const directory=path.resolve(root,process.env.GRAVITY_AUDIT_DIR||'build/gravity-production-candidate');
const known=new Map();
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
  const relFolder=path.relative(directory,path.dirname(file)).replaceAll(path.sep,'/');
  const base='https://gravityleadershipsystem.com/'+(relFolder?relFolder+'/':'');
  for(const match of source.matchAll(/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/gi)){
   const raw=match[1].trim();
   if(!raw||raw.startsWith('#')||raw.startsWith('data:')||raw.includes('{{'))continue;
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
console.log(JSON.stringify({pages:pages.length,distinctReferences:checked.size,brokenPaths:missing.length,brokenInstances:broken.length,missing:missing.slice(0,100),examples:broken.slice(0,40)},null,2));
if(process.argv.includes('--strict')&&broken.length)process.exitCode=1;
