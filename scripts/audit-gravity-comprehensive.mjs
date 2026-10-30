import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd(),site=path.join(root,'site');
const out=path.join(root,'docs/audits/gravity-full-site-sweep-2026-10-30.md');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
const files=walk(site);
const set=new Set(files.map(f=>'/'+path.relative(site,f).replaceAll('\\','/')));
const html=files.filter(f=>f.endsWith('.html')),js=files.filter(f=>/\.m?js$/.test(f));
const redirectLines=fs.readFileSync(path.join(site,'_redirects'),'utf8').split(/\r?\n/).filter(x=>x.trim()&&!x.trim().startsWith('#')).map(x=>x.trim().split(/\s+/)).filter(x=>x.length>=3);
const redirects=new Map(redirectLines.filter(x=>x[0][0]==='/'&&!x[0].includes('*')).map(x=>[x[0],x[1]]));
const findings=[],missing=new Map();
const metrics={files:files.length,html:html.length,js:js.length,links:0,assets:0,checkedJS:0,ignoredExternal:0};
const relative=f=>path.relative(site,f).replaceAll('\\','/');
const flag=(level,kind,file,detail)=>findings.push({level,kind,file,detail});
function exists(p){
 if(!p||p[0]!=='/')return false;
 p=p.split('#')[0].split('?')[0];
 if(p.length>1&&p.endsWith('/'))p=p.slice(0,-1);
 if(p==='/'||p==='/index.html')return true;
 if(p.startsWith('/.netlify/')||p.startsWith('/api/')||p.startsWith('/e/'))return true;
 if(p.startsWith('/gravity-report/')&&!p.endsWith('.pdf'))return true;
 if(p.startsWith('/testing-room/')||p.startsWith('/foundry-hosted/')||p.startsWith('/gravity-tts/')||p.startsWith('/gravity-guide/'))return true;
 let seen=new Set(),i=0;
 while(redirects.has(p)&&i++<6&&!seen.has(p)){seen.add(p);p=redirects.get(p).split('#')[0].split('?')[0];if(!p.startsWith('/')||p.includes(':')||p.includes('*'))return true}
 if(set.has(p)||set.has(p+'.html')||set.has(p+'/index.html'))return true;
 return false;
}
function ids(s){return [...s.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1])}
for(const file of html){
 const rel=relative(file),body=fs.readFileSync(file,'utf8');
 if(!/<html\b/i.test(body)||!/<title\b/i.test(body))flag('high','HTML',rel,'Missing <html> or <title>');
 if(!/<meta\b[^>]*name=["']viewport["']/i.test(body))flag('medium','mobile',rel,'Missing viewport meta');
 const allIds=ids(body);
 for(const id of new Set(allIds.filter((x,i)=>allIds.indexOf(x)!==i&&!x.includes('('medium','duplicate-id',rel,id);
 const refs=[...body.matchAll(/\s(href|src|poster|action)\s*=\s*["']([^"']+)["']/gi)];
 for(const v of refs){
  let kind=v[1].toLowerCase(),href=v[2].replaceAll('&amp;','&').trim();
  if(!href||href==='#'||/^(mailto:|tel:|sms:|javascript:|data:|blob:|about:)/i.test(href))continue;
  if(href.startsWith('#')){const id=decodeURIComponent(href.slice(1));if(!allIds.includes(id))flag('low','anchor',rel,'Target not present: #'+id);continue}
  if(href.includes('{')||href.includes('}')||href.startsWith('https://www.google.com'))continue;
  let u;try{u=new URL(href,'https://gravityleadershipsystem.com/'+rel)}catch{flag('low','url',rel,'Unparseable '+href.slice(0,100));continue}
  if(u.origin!=='https://gravityleadershipsystem.com'&&u.origin!=='https://www.gravityleadershipsystem.com'&&u.origin!=='https://gravity-leadership-system.netlify.app'){metrics.ignoredExternal++;continue}
  const pathname=decodeURIComponent(u.pathname);
  if(kind==='src'||kind==='poster')metrics.assets++;else metrics.links++;
  if(!exists(pathname)){
   let label=kind+' '+pathname;
   let group=missing.get(label)||[];group.push(rel);missing.set(label,group);
   flag(kind==='src'||kind==='poster'?'high':'medium','missing-'+kind,rel,label);
  }
 }
 const forms=[...body.matchAll(/<form\b[^>]*>/gi)].map(x=>x[0]);
 for(const form of forms)if(/data-netlify\s*=\s*["']true["']/i.test(form)&&!/name\s*=\s*["']/.test(form))flag('medium','form',rel,'Netlify form lacks name');
 if(/testing-room-manager|employee-app|registration-thanks/.test(rel)&&!/noindex/i.test(body))flag('medium','privacy',rel,'Private-like page lacks noindex in source');
}
for(const file of js){
 if(/\.min\.js$|\/vendor\//.test(file))continue;
 try{execFileSync(process.execPath,['--check',file],{timeout:10000,stdio:'pipe'});metrics.checkedJS++}
 catch(e){flag('high','JS-syntax',relative(file),String(e.stderr||e.message).split('\n').slice(-3).join(' ').slice(0,180))}
}
for(const [from,to,status] of redirectLines){
 if(from==='/*'||to.startsWith('http')||to.includes(':')||to.includes('*'))continue;
 if(to[0]==='/'&&!exists(to))flag('medium','redirect','_redirects',from+' to '+to+' ('+status+')');
}
const hdr=fs.readFileSync(path.join(site,'_headers'),'utf8');
if(!hdr.includes('Content-Security-Policy'))flag('high','security','_headers','CSP missing');
const manager=fs.readFileSync('functions/testing-room/index.mjs','utf8');
if(!manager.includes('timingSafeEqual')||!manager.includes('if(!managerOK(request))'))flag('high','security','functions/testing-room/index.mjs','Missing manager key verification');
const articleSource=JSON.parse(fs.readFileSync('functions/gravity-report/articles.json','utf8'));
const articles=[...(Array.isArray(articleSource.articles)?articleSource.articles:[]),...['issues-11-15.json','issues-16-20.json','issues-21-25.json','issues-26-30.json'].flatMap(name=>JSON.parse(fs.readFileSync(path.join(root,'functions/gravity-report',name),'utf8')))];
if(articles.length!==30)flag('high','editorial','articles.json','Expected original 30 articles; found '+articles.length);
const pdfs=['gravity-field-sheet-01-manager-excuses.pdf','gravity-field-sheet-02-food-cost.pdf','gravity-field-sheet-03-manager-follow-through.pdf','gravity-field-sheet-04-food-waste.pdf','gravity-field-sheet-05-employee-retention.pdf'];
for(const filename of pdfs){const p=path.join(site,'assets/downloads',filename);if(!fs.existsSync(p))flag('high','download',filename,'Expected Field Sheet PDF missing')}
const levels=['high','medium','low'];
const counts=Object.fromEntries(levels.map(k=>[k,findings.filter(x=>x.level===k).length]));
const groups=Object.entries(Object.groupBy(findings,x=>x.kind)).map(([k,v])=>[k,v.length]).sort((a,b)=>b[1]-a[1]);
const lines=[
 '# Gravity comprehensive site-source sweep — 2026-10-30','',
 'Scope: Gravity migration branch only; source inventory of static pages, routes, assets, forms, JS syntax, report integrity and manager gate. This is not evidence that every external service or live customer workflow is functioning.',
 '','## Coverage','',
 '| Measure | Count |','| --- | ---: |',
 ...Object.entries(metrics).map(([k,v])=>'| '+k+' | '+v+' |'),
 '| Gravity Report scheduled issues | '+articles.length+' |',
 '| High findings | '+counts.high+' |','| Medium findings | '+counts.medium+' |','| Low findings | '+counts.low+' |',
 '','## Findings by category','',
 '| Category | Count |','| --- | ---: |',...groups.map(x=>'| '+x[0]+' | '+x[1]+' |'),
 '','## High findings','',
 ...findings.filter(x=>x.level==='high').slice(0,100).map(x=>'- **'+x.file+'** ('+x.kind+'): '+x.detail),
 '','## Medium findings','',
 ...findings.filter(x=>x.level==='medium').slice(0,110).map(x=>'- '+x.file+' ('+x.kind+'): '+x.detail),
 '','## Low findings sample','',
 ...findings.filter(x=>x.level==='low').slice(0,50).map(x=>'- '+x.file+' ('+x.kind+'): '+x.detail),
 '','## Most common missing path references','',
 ...[...missing].sort((a,b)=>b[1].length-a[1].length).slice(0,65).map(([k,v])=>'- '+k+' ('+v.length+' page(s)): '+[...new Set(v)].slice(0,6).join(', ')),
 '','## Caveats','',
 'Dynamic routes, Netlify function paths, embedded client apps, and extensionless routes can generate false positives. Confirm any reported defect before changing public navigation or content.',
 'The site/robots.txt source is intentionally staging noindex; a separate production packaging step must override it. Do not deploy raw staging files.',
 'The site currently permits inline scripts in its CSP; tightening without migrating inline code would break existing application pages.',
 'DO NOT change Thomas Monroe Books production or publish unreleased Report issues.',
];
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,lines.join('\n')+'\n');
console.log(JSON.stringify({metrics,findings:counts,groups,report:path.relative(root,out)}));
+'{'))))flag('medium','duplicate-id',rel,id);
 const refs=[...body.matchAll(/\b(href|src|poster|action)\s*=\s*["']([^"']+)["']/gi)];
 for(const v of refs){
  let kind=v[1].toLowerCase(),href=v[2].replaceAll('&amp;','&').trim();
  if(!href||href==='#'||/^(mailto:|tel:|sms:|javascript:|data:|blob:|about:)/i.test(href))continue;
  if(href.startsWith('#')){const id=decodeURIComponent(href.slice(1));if(!allIds.includes(id))flag('low','anchor',rel,'Target not present: #'+id);continue}
  if(href.includes('{')||href.includes('}')||href.startsWith('https://www.google.com'))continue;
  let u;try{u=new URL(href,'https://gravityleadershipsystem.com/'+rel)}catch{flag('low','url',rel,'Unparseable '+href.slice(0,100));continue}
  if(u.origin!=='https://gravityleadershipsystem.com'&&u.origin!=='https://www.gravityleadershipsystem.com'&&u.origin!=='https://gravity-leadership-system.netlify.app'){metrics.ignoredExternal++;continue}
  const pathname=decodeURIComponent(u.pathname);
  if(kind==='src'||kind==='poster')metrics.assets++;else metrics.links++;
  if(!exists(pathname)){
   let label=kind+' '+pathname;
   let group=missing.get(label)||[];group.push(rel);missing.set(label,group);
   flag(kind==='src'||kind==='poster'?'high':'medium','missing-'+kind,rel,label);
  }
 }
 const forms=[...body.matchAll(/<form\b[^>]*>/gi)].map(x=>x[0]);
 for(const form of forms)if(/data-netlify\s*=\s*["']true["']/i.test(form)&&!/name\s*=\s*["']/.test(form))flag('medium','form',rel,'Netlify form lacks name');
 if(/testing-room-manager|employee-app|registration-thanks/.test(rel)&&!/noindex/i.test(body))flag('medium','privacy',rel,'Private-like page lacks noindex in source');
}
for(const file of js){
 if(/\.min\.js$|\/vendor\//.test(file))continue;
 try{execFileSync(process.execPath,['--check',file],{timeout:10000,stdio:'pipe'});metrics.checkedJS++}
 catch(e){flag('high','JS-syntax',relative(file),String(e.stderr||e.message).split('\n').slice(-3).join(' ').slice(0,180))}
}
for(const [from,to,status] of redirectLines){
 if(from==='/*'||to.startsWith('http')||to.includes(':')||to.includes('*'))continue;
 if(to[0]==='/'&&!exists(to))flag('medium','redirect','_redirects',from+' to '+to+' ('+status+')');
}
const hdr=fs.readFileSync(path.join(site,'_headers'),'utf8');
if(!hdr.includes('Content-Security-Policy'))flag('high','security','_headers','CSP missing');
const manager=fs.readFileSync('functions/testing-room/index.mjs','utf8');
if(!manager.includes('timingSafeEqual')||!manager.includes('if(!managerOK(request))'))flag('high','security','functions/testing-room/index.mjs','Missing manager key verification');
const articleSource=JSON.parse(fs.readFileSync('functions/gravity-report/articles.json','utf8'));
const articles=Array.isArray(articleSource.articles)?articleSource.articles:[];
if(articles.length!==30)flag('high','editorial','articles.json','Expected original 30 articles; found '+articles.length);
const pdfs=['gravity-field-sheet-01-manager-excuses.pdf','gravity-field-sheet-02-food-cost.pdf','gravity-field-sheet-03-manager-follow-through.pdf','gravity-field-sheet-04-food-waste.pdf','gravity-field-sheet-05-employee-retention.pdf'];
for(const filename of pdfs){const p=path.join(site,'assets/downloads',filename);if(!fs.existsSync(p))flag('high','download',filename,'Expected Field Sheet PDF missing')}
const levels=['high','medium','low'];
const counts=Object.fromEntries(levels.map(k=>[k,findings.filter(x=>x.level===k).length]));
const groups=Object.entries(Object.groupBy(findings,x=>x.kind)).map(([k,v])=>[k,v.length]).sort((a,b)=>b[1]-a[1]);
const lines=[
 '# Gravity comprehensive site-source sweep — 2026-10-30','',
 'Scope: Gravity migration branch only; source inventory of static pages, routes, assets, forms, JS syntax, report integrity and manager gate. This is not evidence that every external service or live customer workflow is functioning.',
 '','## Coverage','',
 '| Measure | Count |','| --- | ---: |',
 ...Object.entries(metrics).map(([k,v])=>'| '+k+' | '+v+' |'),
 '| Gravity Report scheduled issues | '+articles.length+' |',
 '| High findings | '+counts.high+' |','| Medium findings | '+counts.medium+' |','| Low findings | '+counts.low+' |',
 '','## Findings by category','',
 '| Category | Count |','| --- | ---: |',...groups.map(x=>'| '+x[0]+' | '+x[1]+' |'),
 '','## High findings','',
 ...findings.filter(x=>x.level==='high').slice(0,100).map(x=>'- **'+x.file+'** ('+x.kind+'): '+x.detail),
 '','## Medium findings','',
 ...findings.filter(x=>x.level==='medium').slice(0,110).map(x=>'- '+x.file+' ('+x.kind+'): '+x.detail),
 '','## Low findings sample','',
 ...findings.filter(x=>x.level==='low').slice(0,50).map(x=>'- '+x.file+' ('+x.kind+'): '+x.detail),
 '','## Most common missing path references','',
 ...[...missing].sort((a,b)=>b[1].length-a[1].length).slice(0,65).map(([k,v])=>'- '+k+' ('+v.length+' page(s)): '+[...new Set(v)].slice(0,6).join(', ')),
 '','## Caveats','',
 'Dynamic routes, Netlify function paths, embedded client apps, and extensionless routes can generate false positives. Confirm any reported defect before changing public navigation or content.',
 'The site/robots.txt source is intentionally staging noindex; a separate production packaging step must override it. Do not deploy raw staging files.',
 'The site currently permits inline scripts in its CSP; tightening without migrating inline code would break existing application pages.',
 'DO NOT change Thomas Monroe Books production or publish unreleased Report issues.',
];
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,lines.join('\n')+'\n');
console.log(JSON.stringify({metrics,findings:counts,groups,report:path.relative(root,out)}));
