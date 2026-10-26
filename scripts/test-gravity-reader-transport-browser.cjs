'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const hosts=['https://gravity-migration--gravity-leadership-system.netlify.app','https://gravity-release-review--gravity-leadership-system.netlify.app'];
function wav(seconds=18){
 const rate=16000,samples=Math.round(rate*seconds),size=samples*2,buffer=Buffer.alloc(44+size);
 buffer.write('RIFF',0,'ascii');buffer.writeUInt32LE(36+size,4);buffer.write('WAVE',8,'ascii');
 buffer.write('fmt ',12,'ascii');buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);
 buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);
 buffer.write('data',36,'ascii');buffer.writeUInt32LE(size,40);
 for(let i=0;i<samples;i++)buffer.writeInt16LE(Math.round(450*Math.sin(2*Math.PI*i*220/rate)),44+i*2);
 return buffer;
}
async function check(browser,host){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 let calls=0;
 await page.addInitScript(()=>{
   window.__wake={requests:0,releases:0,held:false};
   Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async kind=>{
     if(kind!=='screen')throw Error('Only screen supported');
     window.__wake.requests++;window.__wake.held=true;
     const handlers=[];
     return {released:false,addEventListener:(name,cb)=>{if(name==='release')handlers.push(cb)},
       release:async function(){if(!this.released){this.released=true;window.__wake.releases++;window.__wake.held=false;handlers.forEach(cb=>cb())}}
     };
   }}});
 });
 await page.route('**/.netlify/functions/gravity-tts',route=>{calls++;return route.fulfill({status:200,contentType:'audio/mpeg',body:wav()})});
 await page.goto(host+'/book-reader',{waitUntil:'domcontentloaded',timeout:30000});
 await page.evaluate(()=>localStorage.setItem('gravity_founding_year_download_access_v1','registered'));
 await page.reload({waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#reader-book-buttons button[data-book-id="quiet-gravity"]');
 for(const id of ['reader-play','reader-pause','reader-stop','reader-back','reader-forward','reader-seek','reader-start-over','reader-skip-now','reader-skip-front','reader-continuous','reader-sleep','reader-volume','reader-bass','reader-treble','reader-eq-reset','reader-time','reader-keep-awake','reader-awake-status'])
   assert.equal(await page.locator('#'+id).count(),1,'Missing '+id);
 await page.locator('#reader-book-buttons button[data-book-id="quiet-gravity"]').click();
 await page.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('Press Play'),{timeout:18000});
 const beginning=await page.evaluate(()=>({part:document.getElementById('reader-part').textContent,first:document.getElementById('reader-text').textContent.slice(0,110),status:document.getElementById('reader-status').textContent}));
 assert.match(beginning.first,/^Introduction\b/i,'Skip front matter must begin at narrative Introduction, not an index of chapter titles');
 await page.locator('#reader-volume').fill('25');
 await page.locator('#reader-bass').fill('6');
 await page.locator('#reader-treble').fill('-5');
 let prefs=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravity_reader_preferences_v2')));
 assert.deepEqual([prefs.volume,prefs.bass,prefs.treble],[25,6,-5]);
 await page.locator('#reader-eq-reset').click();
 prefs=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravity_reader_preferences_v2')));
 assert.deepEqual([prefs.volume,prefs.bass,prefs.treble],[25,0,0],'EQ reset must not affect independent volume');
 await page.locator('#reader-play').click();
 await page.waitForFunction(()=>!document.getElementById('reader-seek').disabled,{timeout:15000});
 assert.equal(await page.locator('#reader-play').innerText(),'Playing…','Play must not transform into a second Pause button');
 assert.equal(await page.locator('#reader-play').isDisabled(),true,'Play is inactive during playback; dedicated Pause is used');
 assert.equal(await page.locator('#reader-pause').isEnabled(),true,'Dedicated Pause must be enabled during playback');
 await page.waitForTimeout(1200);
 let awake=await page.evaluate(()=>window.__wake);assert.ok(awake.requests>=1,'Wake lock never requested');
 await page.locator('#reader-pause').click();
 assert.equal(await page.locator('#reader-play').innerText(),'Resume','Play becomes Resume, never Pause, after pausing');
 assert.equal(await page.locator('#reader-pause').isDisabled(),true,'Pause must disable when paused');
 let checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravity_reader_checkpoint_v2_quiet-gravity')));
 assert.ok(checkpoint.seconds>=.2,'Checkpoint missing precise seconds');
 awake=await page.evaluate(()=>window.__wake);assert.ok(awake.releases>=1,'Wake lock not released on Pause');
 await page.locator('#reader-play').click();
 assert.equal(await page.locator('#reader-play').innerText(),'Playing…');
 await page.waitForTimeout(800);
 awake=await page.evaluate(()=>window.__wake);assert.ok(awake.requests>=2,'Wake lock not re-requested on Resume');
 await page.locator('#reader-forward').click();
 await page.waitForTimeout(300);
 await page.locator('#reader-pause').click();
 checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravity_reader_checkpoint_v2_quiet-gravity')));
 assert.ok(checkpoint.seconds>1,'Forward button did not seek');
 await page.locator('#reader-sleep').selectOption('15');
 assert.match(await page.locator('#reader-status').innerText(),/15 minutes/);
 await page.locator('#reader-keep-awake').uncheck();
 prefs=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravity_reader_preferences_v2')));
 assert.equal(prefs.keepAwake,false);
 await page.reload({waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.getElementById('reader-book').value==='quiet-gravity'&&document.getElementById('reader-status').textContent.includes('Resumed at'),{timeout:18000});
 const restored=await page.evaluate(()=>({selected:document.getElementById('reader-book').value,status:document.getElementById('reader-status').textContent,display:document.getElementById('reader-time').textContent,skip:document.getElementById('reader-skip-front').checked,awake:document.getElementById('reader-keep-awake').checked,volume:document.getElementById('reader-volume').value}));
 assert.equal(restored.volume,'25');assert.equal(restored.awake,false);
 assert.ok(errors.length===0,'Page errors: '+errors.join('|'));
 console.log('READER TRANSPORT PASS '+JSON.stringify({host,beginning,checkpoint,restored,wakeRequests:awake.requests,wakeReleases:awake.releases,mockedTTSCalls:calls,errors}));
 await ctx.close();
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 try{for(const host of hosts)await check(browser,host)}finally{await browser.close()}})().catch(e=>{console.error('READER TRANSPORT FAILURE:',e);process.exitCode=1});
