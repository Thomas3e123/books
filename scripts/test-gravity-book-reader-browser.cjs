'use strict';
const { chromium }=require('playwright-core');
const hosts=['https://gravity-migration--gravity-leadership-system.netlify.app','https://gravity-release-review--gravity-leadership-system.netlify.app'];
async function check(browser,host){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
  await page.goto(host+'/book-reader',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1000);
  const unregistered=await page.evaluate(()=>({registered:localStorage.getItem('gravity_founding_year_download_access_v1'),gateHidden:document.querySelector('#reader-gate').hidden,gateDisplay:getComputedStyle(document.querySelector('#reader-gate')).display,readerHidden:document.querySelector('#reader-app').hidden,readerDisplay:getComputedStyle(document.querySelector('#reader-app')).display,options:document.querySelector('#reader-book').options.length}));
  console.log('READER-UNREGISTERED '+JSON.stringify({host,...unregistered}));
  await page.evaluate(()=>localStorage.setItem('gravity_founding_year_download_access_v1','registered'));
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1800);
  const registered=await page.evaluate(()=>({registered:localStorage.getItem('gravity_founding_year_download_access_v1'),gateHidden:document.querySelector('#reader-gate').hidden,gateDisplay:getComputedStyle(document.querySelector('#reader-gate')).display,readerHidden:document.querySelector('#reader-app').hidden,readerDisplay:getComputedStyle(document.querySelector('#reader-app')).display,options:document.querySelector('#reader-book').options.length,selected:document.querySelector('#reader-book').value,selectColor:getComputedStyle(document.querySelector('#reader-book')).color,selectBackground:getComputedStyle(document.querySelector('#reader-book')).backgroundColor,selectBounds:document.querySelector('#reader-book').getBoundingClientRect().toJSON(),readerStatus:document.querySelector('#reader-status').textContent,bookTitles:[...document.querySelector('#reader-book').options].slice(0,5).map(x=>x.text)}));
  console.log('READER-REGISTERED '+JSON.stringify({host,...registered}));
  await page.locator('#reader-book').selectOption('quiet-gravity');
  try{await page.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('Ready.'),{timeout:15000})}catch{}
  const loaded=await page.evaluate(()=>({title:document.querySelector('#reader-book-title').textContent,excerpt:document.querySelector('#reader-text').textContent.slice(0,120),status:document.querySelector('#reader-status').textContent,nextDisabled:document.querySelector('#reader-next').disabled}));
  console.log('READER-LOADED '+JSON.stringify({host,...loaded,errors}));
  if(registered.options<15||registered.readerHidden||registered.readerDisplay==='none'||loaded.excerpt.length<40)throw Error('Reader broken on '+host);
  await context.close();
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const host of hosts)await check(browser,host)}finally{await browser.close()}
})().catch(e=>{console.error('READER BROWSER QA FAILED',e);process.exitCode=1});
