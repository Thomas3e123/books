// Live browser visitor QA: intercepts every registration POST. Creates NO real registrations.
// Reads only public Gravity pages and a public downloadable PDF. No email is sent.
import {chromium,devices} from 'playwright';
import {statSync} from 'node:fs';
const ORIGIN='https://gravityleadershipsystem.com', REG='gravity_founding_year_download_access_v1';
const results=[];
function log(name,purpose,detail){results.push({name,purpose,...detail});}
function check(value,msg){if(!value)throw Error(msg)}
async function go(page,path){const r=await page.goto(ORIGIN+path,{waitUntil:'domcontentloaded',timeout:25000});check(r&&r.status()===200,'Page did not return 200: '+path+' status '+r?.status());}
async function fillRegistration(page) {
 const form=page.locator('form[name="gravity-registration"]');
 check(await form.count()===1,'Registration form not found');
 const fields=await form.locator('[required]').evaluateAll(nodes=>{
  for(const e of nodes){
   if(e.type==='checkbox'){e.checked=true}
   else if(e.type==='radio'){if(!e.name||!e.form?.querySelector('input[name="'+e.name+'"]:checked'))e.checked=true}
   else if(e.tagName==='SELECT'){e.value=[...e.options].find(o=>!o.disabled&&o.value)?.value||''}
   else if(e.type==='email'){e.value='qa-not-sent@example.invalid'}
   else if(e.tagName==='TEXTAREA'){e.value='No registration will be sent. This is a browser-only audit.'}
   else {e.value='Gravity Visitor Journey QA'}
   e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
  }
  return [...nodes].map(e=>({name:e.name,type:e.type,valid:e.validity.valid,checked:e.checked??undefined}));
 });
 check(await form.evaluate(el=>el.checkValidity()),'Registration form is not valid: '+JSON.stringify(fields));
 return fields;
}
async function checkViewport(page,label){
 const metrics=await page.evaluate(()=>({
  viewport:innerWidth,
  scrollWidth:document.documentElement.scrollWidth,
  bodyScrollWidth:document.body.scrollWidth,
  title:document.title,
  canonical:document.querySelector('link[rel="canonical"]')?.href||null,
  h1:document.querySelector('h1')?.textContent?.trim()?.slice(0,120)||null
 }));
 log(label,'Live mobile/desktop document usability and metadata',{...metrics,overflow:Math.max(metrics.scrollWidth,metrics.bodyScrollWidth)-metrics.viewport});
 return metrics;
}
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [label,device] of [['desktop',devices['Desktop Chrome']],['mobile Pixel 7',devices['Pixel 7']]]){
  const context=await browser.newContext({...device,acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(12000);
  const failures=[];
  page.on('pageerror',e=>failures.push(e.message.slice(0,180)));
  // Direct access to success page cannot mark visitors registered.
  await go(page,'/registration-thanks');
  await page.waitForFunction(()=>document.body.textContent?.includes('Complete registration to unlock downloads.'),{timeout:10000});
  check(await page.evaluate(key=>localStorage.getItem(key),REG)!=='registered','Direct confirmation URL incorrectly grants access');
  const first=await checkViewport(page,label+' / unregistered confirmation');
  log(label+' / direct confirmation gate','Unregistered browser does not receive download access from a direct thank-you link',{passed:true});

  // First-book download is supposed to lead to registration, preserving the exact file.
  await go(page,'/books');
  const download=page.locator('a[download][href$=".pdf"]').first();
  check(await download.count()===1,'No published book download link on /books');
  const target=await download.getAttribute('href');
  check(target?.startsWith('assets/downloads/'),'Unexpected first-book PDF href: '+target);
  await checkViewport(page,label+' / Books');
  await download.scrollIntoViewIfNeeded();
  await download.click({timeout:12000});
  await page.waitForURL(/\/register\?download=1$/, {timeout:12000});
  const pending=await page.evaluate(()=>localStorage.getItem('gravity_pending_download_v1'));
  check(new URL(pending).pathname==='/'+target,'Selected PDF destination was not preserved');
  log(label+' / registration handoff','Book download is gated and saved for return',{passed:true,downloadPath:target});
  const regMeta=await checkViewport(page,label+' / Registration');
  const form=page.locator('form[name="gravity-registration"]');
  const consent=page.locator('#reg-consent');
  if(await consent.count())check(!await consent.isChecked(),'Email marketing consent is preselected');
  check(await page.locator('input[type="password"][required]').count()===0,'Founding Year registration unnecessarily requires password');
  const formFields=await fillRegistration(page);
  let postCount=0;
  await page.route(ORIGIN+'/',async route=>{
   if(route.request().method()==='POST'){
    postCount++;
    const payload=new URLSearchParams(route.request().postData()||'');
    check(payload.get('form-name')==='gravity-registration','Unexpected form name on intercepted registration');
    await route.fulfill({status:200,contentType:'text/plain',body:'Synthetic simulated Netlify acceptance. Not a real submission.'});
   } else await route.continue();
  });
  await form.locator('[type="submit"]').click();
  await page.waitForURL(/\/registration-thanks$/, {timeout:13000});
  check(postCount===1,'Synthetic registration did not intercept exactly one POST');
  check(await page.evaluate(key=>localStorage.getItem(key),REG)==='registered','Successful mocked confirmation did not unlock same-browser access');
  const cta=page.locator('[data-gravity-continue-download]');
  const ctaHref=await cta.getAttribute('href');
  check(new URL(ctaHref,ORIGIN).pathname==='/'+target,'After registration customer lost the selected file');
  check((await cta.textContent()).includes('Continue to My Download'),'Registered visitor lacks continue-download CTA');
  log(label+' / simulated registration','Form is accepted only by a mocked network response; no live submission',{passed:true,fieldCount:formFields.length,postsIntercepted:postCount,marketingConsentOptional:true,downloadPreserved:true});

  const [dl]=await Promise.all([page.waitForEvent('download',{timeout:18000}),cta.click()]);
  const path=await dl.path(),size=statSync(path).size;
  check(size>1000,'Downloaded PDF is empty');
  check(await page.evaluate(()=>localStorage.getItem('gravity_pending_download_v1'))===null,'Pending handoff not cleared after download');
  log(label+' / real PDF delivery','Authorized browser continued to selected public PDF',{passed:true,file:dl.suggestedFilename(),bytes:size});
  await go(page,'/book-reader');
  await page.waitForFunction(()=>document.querySelectorAll('#reader-book optgroup[label="Gravity Books"] option').length>=15,{timeout:14000});
  check(await page.locator('#reader-gate').isHidden(),'Previously registered browser still shown reader gate');
  await checkViewport(page,label+' / Unlocked Reader');
  log(label+' / Reader after registration','Same-browser access reveals 15 book titles',{passed:true,count:await page.locator('#reader-book optgroup[label="Gravity Books"] option').count()});
  log(label+' / browser errors','Uncaught JavaScript errors observed while visiting',{count:failures.length,sample:failures.slice(0,8)});
  await context.close();

  // Failed form response must not grant access or discard answers.
  const badContext=await browser.newContext({...device,serviceWorkers:'block'});
  const bad=await badContext.newPage();await go(bad,'/register');
  let failedPosts=0;
  await bad.route(ORIGIN+'/',async route=>{
   if(route.request().method()==='POST'){failedPosts++;await route.fulfill({status:503,contentType:'text/plain',body:'Synthetic failed network response'})}
   else await route.continue();
  });
  await fillRegistration(bad);
  await bad.locator('form[name="gravity-registration"] [type="submit"]').click();
  await bad.locator('[data-registration-feedback]').waitFor({state:'visible',timeout:12000});
  const message=await bad.locator('[data-registration-feedback]').textContent();
  check(message.includes('could not be confirmed'),'Missing registration failure warning');
  check(await bad.evaluate(key=>localStorage.getItem(key),REG)!=='registered','Rejected registration incorrectly unlocked access');
  check(await bad.locator('form[name="gravity-registration"] [name="email"]').inputValue()==='qa-not-sent@example.invalid','Rejected registration erased entered email');
  log(label+' / failed registration','Mocked HTTP 503 retains details, warns user and does not unlock',{passed:true,postsIntercepted:failedPosts});
  await badContext.close();
 }
 const failed=results.filter(x=>x.passed===false);
 console.log('GRAVITY_FIRST_VISITOR_LIVE_BROWSER_QA '+JSON.stringify({runAt:new Date().toISOString(),modes:2,total:results.length,failed:failed.length,allTestsPassed:failed.length===0,noRealFormPosts:true,noCustomerRecords:true,details:results}));
}catch(e){console.error('GRAVITY_FIRST_VISITOR_LIVE_BROWSER_QA_ERROR '+JSON.stringify({error:String(e.message||e),recent:results.slice(-8)}));process.exitCode=1;
}finally{if(browser)await browser.close()}
