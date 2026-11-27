const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.join(__dirname,'../site');
const person=(id,name)=>({id,name,email:id+'@example.invalid',role:'Owner',issueArea:'Shift communication and handoffs',status:'enrolled'});
const people=[person('a','Synthetic Alpha'),person('b','Synthetic Bravo')];
const issues={};
const writes=[];
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');const p=url.pathname;
 if(p.startsWith('/pilot-room/api/')){
  let body='';for await(const chunk of req)body+=chunk;
  const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data))};
  if(p.endsWith('/manager/participants'))return send({participants:people.map(x=>({id:x.id,display_name:x.name,email:x.email,status:x.status,issue_area:x.issueArea}))});
  if(p.includes('/manager/participant/')){const id=p.split('/').pop();if(id==='a')await new Promise(r=>setTimeout(r,400));return send({participant:{...people.find(x=>x.id===id),consentVersion:'pilot-room-consent-v1-2026-11-26',consentAcceptedAt:'2026-11-26T12:00:00Z'},plan:null,entries:[],messages:[]})}
  if(req.method==='POST'){const payload=JSON.parse(body);writes.push({path:p,body:payload});if(p.endsWith('/join')){if(payload.consentAccepted!==true)return send({error:'Please accept the pilot follow-up and data storage notice.'},400);const participant=people.find(x=>x.name===payload.name)||people[0];issues[participant.id]=payload.issueArea;return send({participant:{...participant,issueArea:payload.issueArea},token:'synthetic-'+participant.id+'-token'},201)}return send({ok:true},201)}
  if(p.endsWith('/me')){const auth=req.headers['x-gravity-pilot-token']||'';if(auth==='synthetic-invalid-token')return send({error:'Pilot return link not found.'},404);const participant=auth.includes('-b-')?people[1]:people[0];return send({participant:{...participant,issueArea:issues[participant.id]||participant.issueArea},plan:null,entries:[],messages:[]})}
  return send({},404);
 }
 const rel=p==='/'?'index.html':p==='/pilot-room'?'pilot-room.html':p==='/pilot-room-manager'?'pilot-room-manager.html':p.slice(1);
 const f=path.resolve(root,rel);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end()}
 res.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.json')?'application/json':f.endsWith('.css')?'text/css':f.endsWith('.js')?'text/javascript':'application/octet-stream');fs.createReadStream(f).pipe(res);
});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(origin+'/pilot-room-manager');await page.locator('#key').fill('synthetic');await page.locator('#login-btn').click();
 await page.getByRole('button',{name:/Synthetic Alpha/}).click();await page.getByRole('button',{name:/Synthetic Bravo/}).click();
 await page.locator('#person-name').filter({hasText:'Synthetic Bravo'}).waitFor();await page.waitForTimeout(500);
 assert.equal(await page.locator('#person-name').textContent(),'Synthetic Bravo');
 assert.match(await page.locator('#person-meta').textContent(),/Consent: recorded/);
 await page.locator('#reply').fill('Synthetic response');await page.locator('#send-reply').click();
 await page.waitForFunction(()=>document.querySelector('#reply-status').textContent==='Reply sent.');
 assert.equal(writes.find(x=>x.path.endsWith('/manager/reply')).body.participantId,'b');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log('Manager selection race, reply record association, mobile layout: PASS');
 await page.goto(origin+'/pilot-room');const decline=page.getByRole('button',{name:'Decline analytics'});if(await decline.isVisible())await decline.click();
 assert.equal(await page.locator('#resource-links').count(),0);
 await page.locator('#join-btn').click();await page.getByText('Choose whether you want to test a tool or try a restaurant improvement.').waitFor();assert.equal(writes.filter(x=>x.path.endsWith('/join')).length,0);
 await page.locator('#join-track').selectOption('tool');await page.locator('#join-name').fill('Synthetic Alpha');await page.locator('#join-email').fill('a@example.invalid');
 await page.locator('#join-btn').click();await page.getByText('Choose your role.').waitFor();assert.equal(writes.filter(x=>x.path.endsWith('/join')).length,0);
 await page.locator('#join-role').selectOption({label:'Owner'});await page.locator('#join-btn').click();await page.getByText('Please accept the pilot follow-up and data storage notice.').waitFor();assert.equal(writes.filter(x=>x.path.endsWith('/join')).length,0);
 await page.locator('#join-consent').check();await page.locator('#join-btn').click();
 await page.locator('#welcome-title').filter({hasText:'Synthetic Alpha'}).waitFor();assert.equal(writes.find(x=>x.path.endsWith('/join')).body.consentAccepted,true);assert.equal(await page.locator('#start-tool,#start-plan').count(),0);assert.ok(await page.locator('#print-plan').evaluate(x=>x.classList.contains('pr-hidden')));assert.equal(await page.locator('#tab-protocol').getAttribute('aria-selected'),'true');assert.ok(await page.locator('#tab-start').evaluate(x=>x.classList.contains('pr-hidden')));assert.equal(await page.locator('.pr-tab:not(.pr-hidden)').count(),5);assert.ok(await page.locator('#pilot-directions').evaluate(x=>x.classList.contains('pr-hidden')));assert.equal(await page.locator('#resource-links').count(),0);assert.match(await page.locator('#pilot-intro').textContent(),/Your private workspace is below/);
 await page.locator('#protocol-suite').selectOption('inventory');assert.equal(await page.locator('#protocol-video video').getAttribute('src'),'/assets/video/pilot/inventory.mp4');await page.locator('.protocol-result').first().selectOption({label:'Pass'});await page.locator('#save-protocol').click();
 await page.getByText('Test report saved to your private pilot record.',{exact:false}).waitFor();assert.ok(writes.some(x=>x.path.endsWith('/feedback')));
 console.log('Synthetic enrollment and tool report browser path: PASS');
 const improvement=await browser.newPage({viewport:{width:390,height:844}});await improvement.goto(origin+'/pilot-room');const consent=improvement.getByRole('button',{name:'Decline analytics'});if(await consent.isVisible())await consent.click();
 await improvement.locator('#join-track').selectOption('improvement');await improvement.locator('#join-name').fill('Synthetic Bravo');await improvement.locator('#join-email').fill('b@example.invalid');await improvement.locator('#join-role').selectOption({label:'Owner'});await improvement.locator('#join-issue').selectOption({label:'Food cost, waste, or inventory'});await improvement.locator('#join-consent').check();await improvement.locator('#join-btn').click();
 await improvement.locator('#welcome-title').filter({hasText:'Synthetic Bravo'}).waitFor();assert.equal(await improvement.locator('#tab-plan').getAttribute('aria-selected'),'true');assert.ok(await improvement.locator('#tab-start').evaluate(x=>x.classList.contains('pr-hidden')));assert.equal(await improvement.locator('.pr-tab:not(.pr-hidden)').count(),5);assert.equal(await improvement.locator('#start-tool,#start-plan').count(),0);assert.ok(await improvement.locator('#print-plan').evaluate(x=>x.classList.contains('pr-hidden')));assert.ok(await improvement.locator('#pilot-directions').evaluate(x=>x.classList.contains('pr-hidden')));await improvement.locator('#tab-protocol').click();assert.equal(await improvement.locator('#tab-protocol').getAttribute('aria-selected'),'true');await improvement.locator('#tab-checkin').click();assert.equal(await improvement.locator('#tab-checkin').getAttribute('aria-selected'),'true');await improvement.locator('#tab-issue').click();assert.equal(await improvement.locator('#tab-issue').getAttribute('aria-selected'),'true');await improvement.locator('#tab-messages').click();assert.equal(await improvement.locator('#tab-messages').getAttribute('aria-selected'),'true');await improvement.locator('#tab-plan').click();assert.ok(await improvement.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const returned=await browser.newPage({viewport:{width:390,height:844}});await returned.goto(origin+'/pilot-room?t=synthetic-b-token');await returned.locator('#welcome-title').filter({hasText:'Synthetic Bravo'}).waitFor();assert.equal(await returned.locator('#tab-plan').getAttribute('aria-selected'),'true');assert.ok(await returned.locator('#pilot-directions').evaluate(x=>x.classList.contains('pr-hidden')));assert.equal(await returned.locator('#resource-links').count(),0);assert.match(await returned.locator('#pilot-intro').textContent(),/Your private workspace is below/);
 const invalid=await browser.newPage({viewport:{width:390,height:844}});await invalid.goto(origin+'/pilot-room?t=synthetic-invalid-token');await invalid.getByText('That private link did not open.',{exact:false}).waitFor();assert.ok(await invalid.locator('#pilot-directions').isVisible());assert.equal(await invalid.locator('#resource-links').count(),0);
 await Promise.all([improvement.close(),returned.close(),invalid.close()]);console.log('Synthetic improvement enrollment and private return-link recovery; simplified workspace and invalid-link recovery; mobile layout: PASS');
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
