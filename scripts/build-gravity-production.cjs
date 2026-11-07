'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'site'),out=path.join(root,'build/gravity-production');
const origin='https://gravityleadershipsystem.com';
const crypto=require('node:crypto');
// A long-lived immutable cache is safe only when HTML references change with file content.
const assetVersions=new Map();
function assetVersion(rel){
  if(!/^[a-z0-9_./-]+$/i.test(rel)||rel.split('/').includes('..')||!/(?:^|\/)assets\/(?:js|css)\//.test(rel))return null;
  if(assetVersions.has(rel))return assetVersions.get(rel);
  const file=path.join(source,rel);
  const version=fs.existsSync(file)&&fs.statSync(file).isFile()
    ?crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,16):null;
  assetVersions.set(rel,version);
  return version;
}
const privatePage=/^(apps\/|handbook-creator\/|testing-room-manager\.html$|register\.html$|registration-thanks\.html$|gravity-report-thanks\.html$|review-thanks\.html$)/;
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.cpSync(source,out,{recursive:true});
let pages=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,e.name);if(e.isDirectory()){walk(p);continue;}
 if(!/\.(html|xml|txt)$/.test(e.name))continue;
 let s=fs.readFileSync(p,'utf8').replaceAll('https://gravity-leadership-system.netlify.app',origin).replaceAll('https://gravity-migration--gravity-leadership-system.netlify.app',origin);
 if(e.name.endsWith('.html')){
  // Rewrite every *local* HTML JavaScript or stylesheet URL to its content hash.
  // Leave unrelated, missing, dynamic and third-party assets untouched.
  const rel=path.relative(out,p).split(path.sep).join('/');
  s=s.replace(/(\b(?:src|href)=["'])(\/?assets\/((?:js|css)\/[^"'?#]+))(\?[^"'#]*)?(#[^"']*)?(["'])/gi,
    (whole,prefix,url,assetPath,query,fragment,quote)=>{
      // Root-relative /assets loads shared files; relative assets/ loads in the page's directory.
      const target=url.startsWith('/')?url.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(rel),url));
      const version=assetVersion(target);
      if(!version)return whole;
      const other=(query||'').slice(1).split('&').filter(part=>part&&!/^v=/i.test(part));
      other.push('v='+version);
      return prefix+url+'?'+other.join('&')+(fragment||'')+quote;
    });
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
