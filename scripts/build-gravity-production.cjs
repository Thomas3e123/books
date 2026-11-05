'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'site'),out=path.join(root,'build/gravity-production');
const origin='https://gravityleadershipsystem.com';
const privatePage=/^(apps\/|handbook-creator\/|testing-room-manager\.html$|register\.html$|registration-thanks\.html$|gravity-report-thanks\.html$|review-thanks\.html$)/;
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.cpSync(source,out,{recursive:true});
let pages=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,e.name);if(e.isDirectory()){walk(p);continue;}
 if(!/\.(html|xml|txt)$/.test(e.name))continue;
 let s=fs.readFileSync(p,'utf8').replaceAll('https://gravity-leadership-system.netlify.app',origin).replaceAll('https://gravity-migration--gravity-leadership-system.netlify.app',origin);
 if(e.name.endsWith('.html')){
  const rel=path.relative(out,p).split(path.sep).join('/');
  s=s.replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi,'');
  s=s.replace(/<head\b[^>]*>/i,m=>m+'\n<meta name="robots" content="'+(privatePage.test(rel)?'noindex,nofollow':'index,follow,max-image-preview:large')+'">');pages++;
 }
 fs.writeFileSync(p,s);
}}
walk(out);
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
const hp=path.join(out,'_headers');fs.writeFileSync(hp,fs.readFileSync(hp,'utf8').replace(/^\s*X-Robots-Tag: noindex, nofollow\r?\n/gm,''));
if(pages<100)throw Error('Incomplete production output');
console.log(JSON.stringify({output:out,pages,productionPublished:false}));
