// Local audit only. No production credentials, database, email, or payments.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handle as handbook} from '../functions/handbook-creator/index.mjs';
import report from '../functions/gravity-report/index.mjs';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.pdf':'application/pdf','.zip':'application/zip'};
const rules=fs.readFileSync(path.join(root,'_redirects'),'utf8').split(/\r?\n/).filter(x=>x.trim()&&!x.trim().startsWith('#')).map(x=>x.trim().split(/\s+/));
http.createServer(async(req,res)=>{
 res.setHeader('Content-Security-Policy',"connect-src 'self'; form-action 'self'; frame-src 'self';");
 res.setHeader('X-Robots-Tag','noindex, nofollow');
 try{
  const url=new URL(req.url,'http://'+req.headers.host);let p=decodeURIComponent(url.pathname);
  // Explicit synthetic form transport: accepts only the reserved invalid domain.
  // It stores nothing and does not contact Netlify Forms or any email service.
  if(p==='/'&&req.method==='POST'){
   const chunks=[];for await(const c of req)chunks.push(c);
   const form=new URLSearchParams(Buffer.concat(chunks).toString());
   if(form.get('form-name')==='gravity-registration'&&[...form.values()].some(v=>v.endsWith('@example.invalid'))){res.writeHead(200,{'Content-Type':'text/plain'}).end('SIMULATED AUDIT ACCEPTANCE; NOT A NETLIFY SUBMISSION');return;}
   res.writeHead(503).end('Only synthetic audit registrations are supported');return;
  }
  if(p==='/.netlify/functions/handbook-creator'||p.startsWith('/gravity-report/')){
   const action=url.searchParams.get('action')||'status';
   if(p.includes('handbook-creator')&&!['status','preview','export'].includes(action)){res.writeHead(503).end('Payments disabled in isolated audit');return;}
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
   const response=p.includes('handbook-creator')?await handbook(request,{env:{},payments:{licensed:async()=>false}}):await report(request);
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)||p.startsWith('/.netlify/')||/^\/(foundry-hosted|testing-room\/|gravity-cloud-backup|work-study-link)/.test(p)){
   res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({error:'External service disabled in isolated audit; no information submitted.'}));return;
  }
  const rule=rules.find(x=>x[0]===p);
  if(rule){if(!rule[1].startsWith('/')){res.writeHead(503).end('External redirect disabled in isolated audit');return;}if(rule[2].startsWith('3')){res.writeHead(parseInt(rule[2]),{Location:rule[1]}).end();return;}p=rule[1];}
  let f=path.resolve(root,'.'+p);
  if(!f.startsWith(root)){res.writeHead(403).end();return;}
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  else if(!fs.existsSync(f)&&!path.extname(f))f+='.html';
  if(!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(f).pipe(res);
 }catch(e){res.writeHead(500).end('Audit server error: '+e.message);}
}).listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('Isolated Gravity audit server ready'));
