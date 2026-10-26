'use strict';
// Read-only verification of newly published pre-cutover Gravity production.
// No forms posted, database writes, TTS charges, DNS changes, or deployments.
const assert=require('node:assert/strict');
const inventory=require('../functions/gravity-report/articles.json');
const ORIGIN='https://gravity-leadership-system.netlify.app';
async function get(url,method='GET'){
 const resp=await fetch(url,{method,signal:AbortSignal.timeout(22000),headers:{'User-Agent':'GravityPrecutoverReadonlyQA/1.0'}});
 return resp;
}
async function run(){
 const catalog=await get(ORIGIN+'/assets/reader/catalog.json');assert.equal(catalog.status,200);
 const books=(await catalog.json()).books;
 assert.equal(books.length,15);
 const queue=[...books],fail=[],totals={books:0,chars:0};
 await Promise.all(Array.from({length:4},async()=>{
  while(queue.length){
   const book=queue.shift();
   try{
    const r=await get(ORIGIN+book.text);
    assert.equal(r.status,200,book.id);
    const body=await r.text();
    assert(body.length>4000,'Book text too short '+book.id);
    assert(!body.trimStart().startsWith('<!doctype html'),'Not text '+book.id);
    totals.books++;totals.chars+=body.length;
   }catch(e){fail.push(book.id+': '+e.message)}
  }
 }));
 assert.deepEqual(fail,[],'Book reader completeness');
 const html=await (await get(ORIGIN+'/book-reader')).text();
 for(const id of ['reader-play','reader-pause','reader-volume','reader-bass','reader-treble','reader-sleep','reader-keep-awake','reader-book-buttons'])assert(html.includes('id="'+id+'"'),'Missing reader control '+id);
 const voice=await get(ORIGIN+'/.netlify/functions/gravity-tts');
 assert.equal(voice.status,200);
 const vd=await voice.json();assert.equal(vd.configured,true);assert(vd.voices.includes('cedar'));
 const health=await get(ORIGIN+'/foundry-hosted/health');
 assert.equal(health.status,200);assert.equal((await health.json()).ok,true);
 let checked=0;
 for(const issue of inventory.articles.slice(0,5)){
  const u=ORIGIN+'/gravity-report/'+issue.slug;
  const r=await get(u);
  assert.equal(r.status,200,'Published article missing '+u);
  assert.match(r.headers.get('x-robots-tag')||'',/noindex/i,'Non-indexed production preview must protect editorial function');
  const b=await r.text();
  assert(b.includes(issue.article_html),'Original article body changed '+issue.slug);
  assert(b.includes('https://gravityleadershipsystem.com/gravity-report/'+issue.slug),'Production canonical incorrect');
  checked++;
 }
 let r=await get(ORIGIN+'/gravity-report/feed.xml');assert.equal(r.status,200);
 const rss=await r.text();assert.equal((rss.match(/<item>/g)||[]).length,5);
 r=await get(ORIGIN+'/gravity-report/'+inventory.articles[5].slug);assert.equal(r.status,404);
 for(const route of ['/', '/books','/register','/book-reader','/gravity-report','/windows-programs']){
  r=await get(ORIGIN+route);assert.equal(r.status,200);
  assert.match(r.headers.get('x-robots-tag')||'',/noindex/i,route+' missing precutover noindex');
 }
 r=await get(ORIGIN+'/robots.txt');assert.match(await r.text(),/Disallow:\s*\//);
 r=await get('https://thomasmonroebooks.com/');assert.equal(r.status,200,'TMB homepage affected');
 console.log('GRAVITY PRE-CUTOVER PRODUCTION DEEP READONLY QA PASS '+JSON.stringify({production:ORIGIN,books:totals.books,bookCharacters:totals.chars,originalArticles:checked,rssItems:5,futureArticleEmbargo:'PASS',cedar:'CONFIGURED',foundry:'HEALTHY',publicSearchIndexing:'BLOCKED UNTIL CUTOVER',originalTMB:'HEALTHY'}));
}
run().catch(e=>{console.error('GRAVITY PRE-CUTOVER PRODUCTION DEEP READONLY QA FAILED:',e);process.exitCode=1});
