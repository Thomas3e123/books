const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.join(__dirname,'../site');
const person=(id,name)=>({id,name,email:id+'@example.invalid',role:'Owner',issueArea:'Shift communication and handoffs',status:'enrolled'});
const people=[person('a','Synthetic Alpha'),person('b','Synthetic Bravo')];
const writes=[];
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');const p=url.pathname;
 if(p.startsWith('/pilot-room/api/')){
  let body='';for await(const chunk of req)body+=chunk;
  const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data))};
  if(p.endsWith('/manager/participants'))return send({participants:people.map(x=>({id:x.id,display_name:x.name,email:x.email,status:x.status,issue_area:x.issueArea}))});
  if(p.includes('/manager/participant/')){const id=p.split('/').pop();if(id==='a')await new Promise(r=>setTimeout(r,400));return send({participant:people.find(x=>x.id===id),plan:null,entries:[],messages:[]})}
  if(req.method==='POST'){writes.push({path:p,body:JSON.parse(body)});if(p.endsWith('/join'))return send({participant:people[0],token:'synthetic-local-token'},201);return send({ok:true},201)}
  if(p.endsWith('/me'))return send({participant:people[0],plan:null,entries:[],messages:[]});
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
 await page.locator('#reply').fill('Synthetic response');await page.locator('#send-reply').click();
 await page.waitForFunction(()=>document.querySelector('#reply-status').textContent==='Reply sent.');
 assert.equal(writes.find(x=>x.path.endsWith('/manager/reply')).body.participantId,'b');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log('Manager selection race, reply record association, mobile layout: PASS');
 await page.goto(origin+'/pilot-room');const decline=page.getByRole('button',{name:'Decline analytics'});if(await decline.isVisible())await decline.click();
 await page.locator('#join-btn').click();await page.getByText('Choose whether you want to test a tool or try a restaurant improvement.').waitFor();assert.equal(writes.filter(x=>x.path.endsWith('/join')).length,0);
 await page.locator('#join-track').selectOption('tool');await page.locator('#join-name').fill('Synthetic Alpha');await page.locator('#join-email').fill('a@example.invalid');
 await page.locator('#join-btn').click();await page.getByText('Choose your role.').waitFor();assert.equal(writes.filter(x=>x.path.endsWith('/join')).length,0);
 await page.locator('#join-role').selectOption({label:'Owner'});await page.locator('#join-btn').click();await page.getByText('Please accept the pilot follow-up and data storage notice.').waitFor();assert.equal(writes.filter(x=>x.path.endsWith('/join')).length,0);
 await page.locator('#join-consent').check();await page.locator('#join-btn').click();
 await page.locator('#welcome-title').filter({hasText:'Synthetic Alpha'}).waitFor();
 await page.locator('#tab-protocol').click();await page.locator('#protocol-suite').selectOption('inventory');assert.equal(await page.locator('#protocol-video video').getAttribute('src'),'/assets/video/pilot/inventory.mp4');await page.locator('.protocol-result').first().selectOption({label:'Pass'});await page.locator('#save-protocol').click();
 await page.getByText('Test report saved to your private pilot record.',{exact:false}).waitFor();assert.ok(writes.some(x=>x.path.endsWith('/feedback')));
 console.log('Synthetic enrollment and tool report browser path: PASS');
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
