import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

// This tests customer-facing flow logic with a sandbox Identity mock.
// It cannot prove a real email confirmation until Identity is enabled.
const root=path.resolve('site'),origin='http://127.0.0.1:42936';
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,origin).pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  if(!path.extname(file))file+='.html';
  if(!fs.existsSync(file)){res.writeHead(404).end();return}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'text/plain'});
  fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(500).end()}
});
const fakeIdentity=`window.GravityIdentityTest={calls:[]};
window.GravityCustomerIdentity={
 signup:async(email,password)=>{window.GravityIdentityTest.calls.push(['signup',email,password.length]);return {id:'fake-registration'}},
 login:async(email,password)=>{window.GravityIdentityTest.calls.push(['login',email,password.length]);return {id:'fake-login'}},
 logout:async()=>{window.GravityIdentityTest.calls.push(['logout'])},
 getUser:async()=>null,
 handleAuthCallback:async()=>{
  const h=location.hash||'';
  window.GravityIdentityTest.calls.push(['callback',h.split('=')[0]]);
  if(h.startsWith('#recovery_token='))return {type:'recovery',user:{email:'mock@example.test'}};
  if(h.startsWith('#invite_token='))return {type:'invite',token:'sandbox-invite-token'};
  if(h.startsWith('#confirmation_token='))return {type:'confirmation',user:{email:'mock@example.test'}};
  if(h.startsWith('#email_change_token='))return {type:'email_change',user:{email:'mock@example.test'}};
  return null;
 },
 requestPasswordRecovery:async(email)=>{window.GravityIdentityTest.calls.push(['requestPasswordRecovery',email])},
 updateUser:async(input)=>{window.GravityIdentityTest.calls.push(['updateUser',String(input.password||'').length])},
 acceptInvite:async(token,password)=>{window.GravityIdentityTest.calls.push(['acceptInvite',token,password.length]);return {email:'mock@example.test'}}
};`;
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']});
const results=[];
async function context(signedIn=false){
 const c=await browser.newContext({viewport:{width:1180,height:840}});
 await c.route('**/*',async route=>{
  const req=route.request(),url=req.url();
  if(!url.startsWith(origin))return route.abort();
  const path=new URL(url).pathname;
  if(path==='/assets/js/gravity-identity-client.js')return route.fulfill({status:200,contentType:'application/javascript',body:fakeIdentity});
  if(path==='/gravity-cloud-backup/status'){
   return route.fulfill({status:signedIn?200:401,contentType:'application/json',body:JSON.stringify(signedIn?{ok:true,account:{email:'mock@example.test',id:'sandbox'},tools:[]}:{ok:false,error:'Unauthorized'})});
  }
  return route.continue();
 });
 return c;
}
async function check(name,fn){
 let c;
 try{
  c=await context(name.includes('verified'));
  const p=await c.newPage();
  await fn(p);
  results.push({name,status:'PASS'});console.log('PASS',name);
 }catch(e){results.push({name,status:'FAIL',error:e.message});console.error('FAIL',name,String(e.stack||e).slice(0,1800))}
 finally{if(c)await c.close()}
}
await new Promise(resolve=>server.listen(42936,'127.0.0.1',resolve));
await check('Forgot password sends the email request without exposing another account',async p=>{
 await p.goto(origin+'/gravity-cloud-vault',{waitUntil:'domcontentloaded'});
 await p.locator('#login-card').waitFor({state:'visible'});
 await p.locator('#gravity-cloud-forgot-toggle').click();
 await p.locator('#gravity-cloud-recovery-request input[type=email]').fill('test@example.test');
 await p.locator('#gravity-cloud-recovery-request button').click();
 await p.waitForFunction(()=>document.querySelector('#account-status')?.textContent.includes('If the email belongs'));
 const calls=await p.evaluate(()=>window.GravityIdentityTest.calls);
 assert.deepEqual(calls.at(-1),['requestPasswordRecovery','test@example.test']);
});
await check('Recovery callback prompts for new password and hides callback token',async p=>{
 await p.goto(origin+'/gravity-cloud-vault#recovery_token=sandbox-token',{waitUntil:'domcontentloaded'});
 await p.locator('#gravity-cloud-reset-panel').waitFor({state:'visible',timeout:7500});
 assert.equal(await p.locator('#login-card').isVisible(),false);
 assert.equal(new URL(p.url()).hash,'');
 await p.locator('#gravity-cloud-reset-form input[name=password]').fill('A-safe-test-password-1234');
 await p.locator('#gravity-cloud-reset-form input[name=confirm]').fill('A-safe-test-password-1234');
 await p.locator('#gravity-cloud-reset-form button').click();
 await p.waitForFunction(()=>window.GravityIdentityTest.calls.some(x=>x[0]==='updateUser'));
 const calls=await p.evaluate(()=>window.GravityIdentityTest.calls);
 assert.ok(calls.some(x=>x[0]==='updateUser'&&x[1]>12));
});
await check('Invitation callback requires password and accepts only SDK token',async p=>{
 await p.goto(origin+'/gravity-cloud-vault#invite_token=sandbox-token',{waitUntil:'domcontentloaded'});
 await p.locator('#gravity-cloud-invite-panel').waitFor({state:'visible',timeout:7500});
 assert.equal(new URL(p.url()).hash,'');
 await p.locator('#gravity-cloud-invite-form input[name=password]').fill('An-invite-password-1234');
 await p.locator('#gravity-cloud-invite-form button').click();
 await p.waitForFunction(()=>window.GravityIdentityTest.calls.some(x=>x[0]==='acceptInvite'));
 const calls=await p.evaluate(()=>window.GravityIdentityTest.calls);
 assert.ok(calls.some(x=>x[0]==='acceptInvite'&&x[1]==='sandbox-invite-token'));
});
await check('Existing sign-in does not wrongly enforce new signup length',async p=>{
 await p.goto(origin+'/gravity-cloud-vault',{waitUntil:'domcontentloaded'});
 await p.locator('#gravity-cloud-login input[name=email]').fill('test@example.test');
 await p.locator('#gravity-cloud-login input[name=password]').fill('LegacyPass');
 await p.locator('#gravity-cloud-login button').click();
 await p.waitForFunction(()=>window.GravityIdentityTest.calls.some(x=>x[0]==='login'));
 assert.ok((await p.evaluate(()=>window.GravityIdentityTest.calls)).some(x=>x[0]==='login'&&x[2]===10));
});
await check('Unverified visitor cannot see cloud-delete actions',async p=>{
 await p.goto(origin+'/gravity-cloud-vault',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.querySelector('#account-status')?.textContent.includes('Not signed in'));
 assert.equal(await p.locator('#account-panel').isVisible(),false);
 assert.equal(await p.locator('#gravity-cloud-delete-shift').isVisible(),false);
});
await check('Previously verified account can see scoped cloud deletion controls',async p=>{
 await p.goto(origin+'/gravity-cloud-vault',{waitUntil:'domcontentloaded'});
 await p.locator('#account-panel').waitFor({state:'visible'});
 assert.equal(await p.locator('#gravity-cloud-delete-inventory').isVisible(),true);
});
await browser.close();await new Promise(resolve=>server.close(resolve));
const failure=results.filter(x=>x.status==='FAIL');
console.log('GRAVITY_IDENTITY_ONBOARDING_BROWSER_QA',JSON.stringify({passed:results.length-failure.length,failed:failure.length,results}));
if(failure.length)process.exitCode=1;
