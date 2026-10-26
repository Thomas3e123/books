'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const hosts=['https://gravity-migration--gravity-leadership-system.netlify.app','https://gravity-release-review--gravity-leadership-system.netlify.app'];
function wav(seconds=1.6){
 const rate=16000,n=Math.floor(rate*seconds),buf=Buffer.alloc(44+2*n);
 buf.write('RIFF',0);buf.writeUInt32LE(36+2*n,4);buf.write('WAVEfmt ',8);
 buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);
 buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);
 buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);
 buf.write('data',36);buf.writeUInt32LE(n*2,40);
 for(let i=0;i<n;i++)buf.writeInt16LE(Math.round(Math.sin(2*Math.PI*220*i/rate)*420),44+i*2);
 return buf;
}
async function contextWithAccess(browser){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{
   try{localStorage.setItem('gravity_founding_year_download_access_v1','registered')}catch(_){}
 });
 return ctx;
}
async function checkCatalog(browser,host){
 const ctx=await contextWithAccess(browser),page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(host+'/book-reader',{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForSelector('#reader-book-buttons button[data-book-id]',{timeout:20000});
 const books=await page.locator('#reader-book option').evaluateAll(opts=>opts.filter(o=>o.value).map(o=>({id:o.value,title:o.textContent})));
 const results=[];
 for(const book of books){
  await page.locator('#reader-book').selectOption(book.id);
  try{await page.waitForFunction(id=>document.getElementById('reader-book').value===id&&/Press Play|no readable text|could not be loaded|no separate/i.test(document.getElementById('reader-status').textContent),book.id,{timeout:16000});}catch(_){}
  results.push(await page.evaluate(id=>({
    id,part:document.getElementById('reader-part').textContent,
    first:document.getElementById('reader-text').textContent.slice(0,110),
    status:document.getElementById('reader-status').textContent
  }),book.id));
 }
 assert.deepEqual(errors,[],'Reader page errors');
 console.log('READER ALL BOOK OPENING RESULTS '+JSON.stringify({host,count:books.length,results}));
 await ctx.close();
}
async function checkContinuity(browser,host,continuous){
 const ctx=await contextWithAccess(browser),page=await ctx.newPage();
 let calls=0;
 const prose1='Gravity leadership standards begin with clear expectations. '.repeat(27);
 const prose2='Managers lead by coaching and verifying the standard. '.repeat(27);
 await page.route('**/assets/reader/quiet-gravity.txt*',route=>route.fulfill({status:200,contentType:'text/plain',body:prose1+'\n\n'+prose2}));
 await page.route('**/.netlify/functions/gravity-tts',route=>{calls++;return route.fulfill({status:200,contentType:'audio/mpeg',body:wav()})});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(host+'/book-reader',{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForSelector('#reader-book-buttons button[data-book-id="quiet-gravity"]');
 await page.locator('#reader-continuous').setChecked(continuous);
 await page.locator('#reader-book').selectOption('quiet-gravity');
 await page.waitForFunction(()=>/Ready|Front matter skipped/.test(document.getElementById('reader-status').textContent),{timeout:12000});
 const parts=await page.locator('#reader-part').innerText();
 assert.match(parts,/of 2$/,'Synthetic two-part book did not split');
 await page.locator('#reader-play').click();
 await page.waitForFunction(c=>/End of book|Part completed|Neural voice is unavailable/.test(document.getElementById('reader-status').textContent),null,{timeout:20000});
 const result=await page.evaluate(()=>({
   part:document.getElementById('reader-part').textContent,
   status:document.getElementById('reader-status').textContent,
   play:document.getElementById('reader-play').textContent,
   pauseDisabled:document.getElementById('reader-pause').disabled,
   saved:JSON.parse(localStorage.getItem('gravity_reader_checkpoint_v2_quiet-gravity'))
 }));
 assert.equal(result.part,'Part 2 of 2','Did not advance to second part');
 assert.equal(result.play,'Play','Player must return to Play state');
 assert.equal(result.pauseDisabled,true,'Pause must be disabled after natural stop');
 assert.equal(calls,continuous?2:1,'Expected '+(continuous?2:1)+' narrated part(s)');
 assert.match(result.status,continuous?/End of book/:/Part completed/);
 assert.deepEqual(pageErrors,[]);
 console.log('READER CONTINUITY PASS '+JSON.stringify({host,continuous,calls,parts,result}));
 await ctx.close();
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 try{
   await checkCatalog(browser,hosts[0]);
   for(const host of hosts)for(const continuous of [true,false])await checkContinuity(browser,host,continuous);
 }finally{await browser.close()}
})().catch(error=>{console.error('READER CONTINUITY QA FAILED:',error);process.exitCode=1});
