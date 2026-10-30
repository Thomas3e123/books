import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve('site');
const port=42587;
const origin='http://127.0.0.1:'+port;
const mime={'.js':'application/javascript','.css':'text/css','.json':'application/json','.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain'};
const server=http.createServer((req,res)=>{
 let parsed;try{parsed=new URL(req.url,origin)}catch{res.writeHead(400);res.end();return}
 let name=decodeURIComponent(parsed.pathname);
 if(name==='/')name='/index.html';
 let dest=path.resolve(root,'.'+name);
 if(!dest.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 if(!fs.existsSync(dest)&&!path.extname(dest))dest+='.html';
 if(!fs.existsSync(dest)||!fs.statSync(dest).isFile()){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});fs.createReadStream(dest).pipe(res)
});
await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const observations=[];
const add=(name,pass,desc)=>{observations.push({name,pass,desc});console.log((pass?'PASS ':'FAIL ')+name+': '+desc)};
async function getPage(blockWrites=false){
 let ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 await ctx.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 if(blockWrites)await ctx.addInitScript(()=>{
 const original=Storage.prototype.setItem;
 Storage.prototype.setItem=function(key,value){
  if(key==='gravityRecipeWorksV1')throw new DOMException('QA blocked storage','QuotaExceededError');
  return original.call(this,key,value);
 };
 });
 const page=await ctx.newPage();
 const res=await page.goto(origin+'/gravity-recipe-works',{waitUntil:'domcontentloaded'});
 assert.equal(res.status(),200);
 return{ctx,page};
}
try{
 const a=await getPage();
 try{
  const page=a.page;
  await page.locator('#rw-new').click();
  await page.locator('#rr-name').fill('QA Test Recipe for Confirmation');
  await page.locator('#rr-save').click();
  const prev=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.[0]?.name);
  assert.equal(prev,'QA Test Recipe for Confirmation');
  await page.locator('[data-tab="storage"]').click();
  let prompts=0;
  page.on('dialog',d=>{prompts++;d.dismiss()});
  await page.locator('#st-restore').setInputFiles({name:'synthetic-empty-backup.json',mimeType:'application/json',buffer:Buffer.from('{"recipes":[]}')});
  await page.waitForTimeout(700);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.[0]?.name);
  add('Destructive backup confirmation with Cancel preserves recipes',prompts===1&&after===prev,'Prompt count '+prompts+', recipe '+after);
  const bad=Buffer.from('{"not-a-recipe-library":true}');
  await page.locator('#st-restore').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:bad});
  await page.waitForTimeout(450);
  const afterBad=await page.evaluate(()=>JSON.parse(localStorage.getItem('gravityRecipeWorksV1')||'{}').recipes?.[0]?.name);
  add('Malformed backup cannot replace existing recipe',afterBad===prev,'Recipe remains '+afterBad);
 }finally{await a.ctx.close()}
 const b=await getPage(true);
 try{
  const errors=[];b.page.on('pageerror',e=>errors.push(e.message));
  await b.page.locator('#rw-new').click();
  await b.page.locator('#rr-name').fill('QA Unsavable Recipe');
  await b.page.locator('#rr-save').click();
  await b.page.waitForTimeout(280);
  const e=await b.page.evaluate(()=>({warning:document.querySelector('#gravity-recipe-storage-warning')?.textContent||'',role:document.querySelector('#gravity-recipe-storage-warning')?.getAttribute('role'),saved:localStorage.getItem('gravityRecipeWorksV1')}));
  add('Quota failure warns user persistently without false save',e.warning.includes('SAVE FAILED')&&e.role==='alert'&&!e.saved,'Warning '+e.warning.slice(0,160)+'; stored '+Boolean(e.saved)+'; page errors '+errors.length);
 }finally{await b.ctx.close()}
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log('GRAVITY_RECIPE_STORAGE_GUARD_QA '+JSON.stringify(observations));
if(observations.some(x=>!x.pass))process.exitCode=1;
