'use strict';
// Read-only, live HTTP smoke test for Gravity Book Reader.
// This does not register users, modify book progress, download PDFs, or incur TTS usage.
const assert=require('node:assert/strict');
const URLS=[
  'https://gravity-migration--gravity-leadership-system.netlify.app',
  'https://gravity-release-review--gravity-leadership-system.netlify.app'
];
const timeout=20000;
async function get(base,path,method='GET'){
  const url=base+path;
  const r=await fetch(url,{method,signal:AbortSignal.timeout(timeout),headers:{'Cache-Control':'no-cache'}});
  assert.equal(r.status,200,'HTTP '+r.status+': '+url);
  return r;
}
async function audit(base){
  const html=await (await get(base,'/book-reader')).text();
  assert.match(html,/<title>Gravity Book Reader/i,'Reader title missing');
  for(const el of ['reader-gate','reader-app','reader-book','reader-voice','reader-speed','reader-play','reader-stop','reader-prev','reader-next','reader-text','reader-status','site-nav'])
    assert.ok(html.includes('id="'+el+'"'),'Reader control missing: '+el);
  assert.match(html,/assets\/js\/book-reader\.js\?v=/,'Reader script not loaded');
  assert.match(html,/name="viewport"[^>]+width=device-width/,'Mobile viewport missing');
  const js=await (await get(base,'/assets/js/book-reader.js')).text();
  for(const feature of ['chunkText(','cleanReaderText(','gravity_reader_progress_','reader-play','reader-stop','reader-prev','reader-next','gravity-tts','pause()','resume()'])
    assert.ok(js.includes(feature),'Reader logic missing: '+feature);
  const catalog=await (await get(base,'/assets/reader/catalog.json')).json();
  assert.ok(Array.isArray(catalog.books)&&catalog.books.length>=15,'Book catalog has fewer than 15 published items');
  const ids=new Set(catalog.books.map(b=>b.id));
  assert.equal(ids.size,catalog.books.length,'Duplicate book ids in catalog');
  let totalChars=0;
  // A complete GET verifies the actual text can be read, unlike HEAD only.
  const work=[...catalog.books];
  const issues=[];
  await Promise.all(Array.from({length:4},async()=>{
    while(work.length){
      const b=work.shift();
      try{
        assert.match(b.text,/^\/assets\/reader\/[a-z0-9-]+\.txt$/);
        const r=await get(base,b.text);
        const body=await r.text();
        assert.ok(!/^\s*<!doctype html/i.test(body),'Book URL returned HTML');
        assert.ok(body.length>=Math.min(5000,(b.characters||6000)*.5),'Text appears incomplete: '+b.id);
        totalChars+=body.length;
      }catch(e){issues.push(b.id+': '+e.message)}
    }
  }));
  assert.deepEqual(issues,[],'Missing or incomplete book text files');
  const voice=await (await get(base,'/.netlify/functions/gravity-tts')).json();
  assert.equal(voice.ok,true,'Voice endpoint health failed');
  assert.equal(voice.configured,true,'TTS API key not configured');
  assert.ok(voice.voices.includes('cedar'),'Cedar unavailable');
  const robots=(await get(base,'/robots.txt')).text();
  assert.match(await robots,/Disallow:\s*\//,'Review/staging must remain noindex');
  console.log(JSON.stringify({base,readerHtml:'PASS',mobileControls:'PASS',catalogCount:catalog.books.length,allBookTexts:'PASS',totalBookCharacters:totalChars,cedarService:'CONFIGURED',noindex:'PASS'}));
}
(async()=>{
  for(const base of URLS)await audit(base);
  console.log('GRAVITY BOOK READER LIVE READ-ONLY QA PASS');
})().catch(e=>{console.error('GRAVITY BOOK READER LIVE QA FAIL:',e);process.exitCode=1});
