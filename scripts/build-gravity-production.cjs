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
const privatePage=/^(apps\/|handbook-creator\/|404\.html$|(?:testing-room|pilot-room)(?:-manager)?\.html$|gravity-report-confirmed\.html$|register\.html$|registration-thanks\.html$|gravity-report-thanks\.html$|review-thanks\.html$)/;
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
function attr(tag,name){
 const match=tag&&tag.match(new RegExp("\\b"+name+"\\s*=\\s*([\"'])(.*?)\\1","i"));
 return match?match[2].replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'"):'';
}
function plainText(value){
 return String(value||'').replace(/<[^>]*>/g,'').replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp|rsquo|lsquo|rdquo|ldquo|ndash|mdash);/gi,(_,entity)=>{
  if(entity[0]==='#'){
   const code=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
   return Number.isFinite(code)?String.fromCodePoint(code):'';
  }
  return ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',ndash:'–',mdash:'—'})[entity.toLowerCase()]||'';
 }).replace(/\s+/g,' ').trim();
}
function normalizedWords(value){
 return plainText(value).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
}
function validateArticleMetadata(html,rel){
 const canonicalTag=html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i);
 const canonical=attr(canonicalTag&&canonicalTag[0],'href');
 const ogUrlTag=html.match(/<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i);
 const ogUrl=attr(ogUrlTag&&ogUrlTag[0],'content');
 if(ogUrl&&(!canonical||ogUrl!==canonical))throw Error('Open Graph URL must match canonical URL in '+rel);
 const descriptionTag=html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i);
 const description=attr(descriptionTag&&descriptionTag[0],'content');
 const h1Tag=html.match(/<h1\b[^>]*>(.*?)<\/h1>/is);
 const h1=normalizedWords(h1Tag&&h1Tag[1]);
 const scripts=html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>(.*?)<\/script>/gis);
 for(const script of scripts){
  let data;try{data=JSON.parse(script[1]);}catch{continue;}
  const objects=Array.isArray(data)?data:(Array.isArray(data['@graph'])?data['@graph']:[data]);
  for(const item of objects){
   if(!item||typeof item!=='object'||item['@type']!=='Article')continue;
   const articleUrl=typeof item.mainEntityOfPage==='string'?item.mainEntityOfPage:item.mainEntityOfPage&&item.mainEntityOfPage['@id'];
   const headline=normalizedWords(item.headline);
   if(!canonical||articleUrl!==canonical)throw Error('Article schema URL must match canonical URL in '+rel);
   if(!description||item.description!==description)throw Error('Article schema description must match page description in '+rel);
   if(!h1||!headline||!(headline===h1||headline.startsWith(h1+' ')||h1.startsWith(headline+' ')))throw Error('Article schema headline must match the page heading in '+rel);
  }
 }
}
const publicUrls = new Set();
function recordPublicPage(html, file) {
 if (file === 'gravity-report.html' || privatePage.test(file) || file.includes('/')) return;
 const route = file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, '');
 const tag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i);
 const canonical = attr(tag && tag[0], 'href');
 if (canonical === origin + route) publicUrls.add(canonical);
}
function writeProductionSitemaps() {
 const header = '<?xml version="1.0" encoding="UTF-8"?>\n';
 const namespace = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
 const pages = [...publicUrls].sort().map(url => '  <url><loc>' + url + '</loc></url>');
 fs.writeFileSync(path.join(out, 'site-pages.xml'), header + '<urlset ' + namespace + '>\n' + pages.join('\n') + '\n</urlset>\n');
 // The Report generates its sitemap at request time using its publication schedule.
 const maps = ['/site-pages.xml', '/gravity-report/sitemap.xml'].map(route =>
  '  <sitemap><loc>' + origin + route + '</loc></sitemap>');
 fs.writeFileSync(path.join(out, 'sitemap.xml'), header + '<sitemapindex ' + namespace + '>\n' + maps.join('\n') + '\n</sitemapindex>\n');
}
let pages=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,e.name);if(e.isDirectory()){walk(p);continue;}
 if(!/\.(html|xml|txt)$/.test(e.name))continue;
 let s=fs.readFileSync(p,'utf8').replaceAll('https://gravity-leadership-system.netlify.app',origin).replaceAll('https://gravity-migration--gravity-leadership-system.netlify.app',origin);
 if(e.name.endsWith('.html')){
  const rel=path.relative(out,p).split(path.sep).join('/');
  s=normalizeCurrentCopy(s);
  validateArticleMetadata(s,rel);
  recordPublicPage(s,rel);
  // Rewrite every *local* HTML JavaScript or stylesheet URL to its content hash.
  // Leave unrelated, missing, dynamic and third-party assets untouched.
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
writeProductionSitemaps();
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
const hp=path.join(out,'_headers');fs.writeFileSync(hp,fs.readFileSync(hp,'utf8').replace(/^\s*X-Robots-Tag: noindex, nofollow\r?\n/gm,''));
if(pages<100)throw Error('Incomplete production output');
console.log(JSON.stringify({output:out,pages,productionPublished:false}));
