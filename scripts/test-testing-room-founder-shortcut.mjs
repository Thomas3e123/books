import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const SITE=path.resolve('site');
const html=fs.readFileSync(path.join(SITE,'testing-room.html'),'utf8');
const manager=fs.readFileSync(path.join(SITE,'testing-room-manager.html'),'utf8');
const backend=fs.readFileSync('functions/testing-room/index.mjs','utf8');
assert(html.includes('id="gravity-founder-shortcut"'),'Founder gesture missing');
assert(html.includes('location.assign(\'/testing-room-manager\')'),'Private manager destination missing');
assert(manager.includes('type="password"'),'Manager key form missing');
assert(manager.includes("sessionStorage.getItem('gravity_testing_manager_key')"),'Manager session gate missing');
assert(backend.includes('GRAVITY_TESTING_MANAGER_KEY')&&backend.includes('timingSafeEqual'),'Manager server-side key verification missing');
assert(backend.includes('if(!managerOK(request))'),'Manager API not protected');

const port=42373;
const server=http.createServer((req,res)=>{
 let rel=decodeURIComponent(new URL(req.url,'http://127.0.0.1:'+port).pathname).replace(/^\/+/, '');
 if(!rel)rel='index.html';
 const abs=path.resolve(SITE,rel);
 if(!abs.startsWith(SITE+path.sep)){res.writeHead(403);res.end();return;}
 if(!fs.existsSync(abs)&&!path.extname(rel))return serve(path.resolve(SITE,rel+'.html'),res);
 serve(abs,res);
});
function serve(file,res){
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8'});
 fs.createReadStream(file).pipe(res);
}
await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+port;
const failures=[];
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
async function test(mobile){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:900},hasTouch:mobile,isMobile:mobile});
 await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 const page=await context.newPage();
 try{
  await page.goto(origin+'/testing-room',{waitUntil:'domcontentloaded'});
  const logo=page.locator('header.site-header a.brand');
  await logo.waitFor();
  const gesture=async()=>mobile?logo.tap():logo.click();
  // A single press still provides conventional Home navigation.
  await gesture();
  await page.waitForTimeout(95);
  assert.equal(new URL(page.url()).pathname,'/testing-room','First tap navigated away before second could happen');
  await page.waitForURL('**/',{timeout:2200});
  // Open the room again and use two clicks within the gesture interval.
  await page.goto(origin+'/testing-room',{waitUntil:'domcontentloaded'});
  await gesture();
  await page.waitForTimeout(55);
  assert.equal(new URL(page.url()).pathname,'/testing-room','First press navigated away prematurely');
  await gesture();
  await page.waitForURL('**/testing-room-manager',{timeout:2800});
  assert.equal(await page.locator('#login').isVisible(),true,'Manager login not displayed');
  assert.equal(await page.locator('#app').isVisible(),false,'Manager inbox visible without authentication');
  assert.equal(await page.locator('#key').getAttribute('type'),'password','Manager key not masked');
  return {viewport:mobile?'390px mobile':'1366px desktop',singleClick:'Home',doubleClick:'Manager key page',keyRequired:true};
 }finally{await context.close()}
}
let results=[];
try{results=await Promise.all([test(false),test(true)]);}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log('GRAVITY_TESTING_FOUNDER_ENTRY_QA_PASS '+JSON.stringify(results));
