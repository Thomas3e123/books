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
// Correct CURRENT customer-facing claims in production without rewriting historical
// milestone counts (e.g. September's 215-prompt release). The controlled current
// workbook and search index contain 350 entries; see current edition 2026-11-03.
// This is a temporary publication safeguard pending source-page consolidation.
const promptIndex=path.join(source,'assets/data/restaurant-ai-prompts-350.json');
// Tiny synthetic build fixtures intentionally omit the complete product catalog.
if(fs.existsSync(promptIndex)){
 const prompts=JSON.parse(fs.readFileSync(promptIndex,'utf8'));
 if(!Array.isArray(prompts)||prompts.length!==350)throw Error('Current AI workbook index must contain 350 prompts');
}
const CURRENT_COPY_FIXES=[
 ['The Restaurant AI Prompts & Systems Workbook currently contains 250 prompts','The Restaurant AI Prompts & Systems Workbook currently contains 350 prompts'],
 ['The Restaurant AI Prompts & Systems Workbook currently contains 325 prompts','The Restaurant AI Prompts & Systems Workbook currently contains 350 prompts'],
 ['Search 250 Prompts','Search 350 Prompts'],
 ['Search 325 Prompts','Search 350 Prompts'],
 ['325 practical copy-and-paste prompts','350 practical copy-and-paste prompts'],
 ['325 prompts connect the systems','350 prompts connect the systems'],
 ['The current Restaurant AI Prompts &amp; Systems Workbook contains 325 prompts','The current Restaurant AI Prompts &amp; Systems Workbook contains 350 prompts'],
 ['The current Restaurant AI Prompts & Systems Workbook contains 325 prompts','The current Restaurant AI Prompts & Systems Workbook contains 350 prompts'],
 ['Open the 325-prompt AI workbook','Open the 350-prompt AI workbook'],
 ['The current controlled edition now contains 250 prompts','The current controlled edition now contains 350 prompts']
];
function normalizeCurrentCopy(html){
 for(const [oldText,newText] of CURRENT_COPY_FIXES)html=html.replaceAll(oldText,newText);
 if(/(?:currently contains|current controlled edition now contains)\s+(?:250|325)\s+prompts/i.test(html)||
    /Search (?:250|325) Prompts/i.test(html)||
    /(?:250|325) practical copy-and-paste prompts/i.test(html))
   throw Error('Old current AI prompt count remains in built page');
 return html;
}
let pages=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,e.name);if(e.isDirectory()){walk(p);continue;}
 if(!/\.(html|xml|txt)$/.test(e.name))continue;
 let s=fs.readFileSync(p,'utf8').replaceAll('https://gravity-leadership-system.netlify.app',origin).replaceAll('https://gravity-migration--gravity-leadership-system.netlify.app',origin);
 if(e.name.endsWith('.html')){
  s=normalizeCurrentCopy(s);
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
