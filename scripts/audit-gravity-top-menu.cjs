#!/usr/bin/env node
/* Read-only inventory of every HTML document in the isolated Gravity site.
   No changes to navigation, app rooms, or Thomas Monroe Books. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../site');
const OUTPUT=path.resolve(__dirname,'../docs/audits/gravity-top-menu-inventory-2026-10-30.md');
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):/\.html?$/i.test(e.name)?[p]:[]});
const all=walk(ROOT).map(file=>({file,relative:path.relative(ROOT,file).replace(/\\/g,'/'),html:fs.readFileSync(file,'utf8')}));
const top=all.filter(x=>!x.relative.includes('/'));
const isApp=x=>x.relative.startsWith('apps/') || x.relative.startsWith('assets/') || x.relative.startsWith('tools/');
const expected=['/','/gravity-assist','/operating-systems','/gravity-aware','/books','/book-reader','/restaurant-management-forms-checklists','/gravity-fulfillment-center','/standards-library','/gravity-sop-foundry','/gravity-report','/knowledge-center','/help-center','/windows-programs','/testing-room','/contact','/start-here'];
const canonicalOrder=expected.map(x=>x.replace(/^\//,'')||'home');
const hrefs=s=>[...s.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
const findings=[],status=[];
for(const p of all){
 const hasHeader=/<header\b[^>]*class\s*=\s*["'][^"']*\bsite-header\b/i.test(p.html);
 const topHeader=p.html.match(/<header\b[^>]*class\s*=\s*["'][^"']*\bsite-header\b[^>]*>[\s\S]*?<\/header>/i)?.[0]||'';
 const nav=topHeader.match(/<nav\b[^>]*\bid=["']site-nav["'][^>]*>[\s\S]*?<\/nav>/i)?.[0]||'';
 const script=/<script\b[^>]*\bsrc\s*=\s*["'][^"']*\bsite\.js(?:\?[^"']*)?["']/i.test(p.html);
 const toggle=topHeader.includes('data-menu-toggle');
 const dataMenu=nav.includes('data-menu');
 const links=hrefs(nav),missing=expected.filter(x=>!links.includes(x));
 const dup=links.filter((x,i)=>links.indexOf(x)!==i);
 const wrongHost=links.filter(x=>/thomasmonroebooks\.com|gravity-leadership-system\.netlify\.app/i.test(x));
 const doc={page:p.relative,kind:isApp(p)?'application or static asset':p.relative.includes('/')?'nested page':'root page',hasHeader,hasNav:!!nav,script,toggle,dataMenu,linkCount:links.length,missing,duplicates:[...new Set(dup)],wrongHost,links};
 status.push(doc);
 if(!hasHeader){findings.push({severity:'REVIEW',page:p.relative,problem:'No standard site-header; determine if custom app/utility intentionally uses its own UI.'});continue}
 if(!nav)findings.push({severity:'ERROR',page:p.relative,problem:'site-header lacks site-nav.'});
 if(!toggle)findings.push({severity:'ERROR',page:p.relative,problem:'No mobile data-menu-toggle in site-header.'});
 if(nav&&!dataMenu)findings.push({severity:'ERROR',page:p.relative,problem:'site-nav is missing data-menu; mobile toggle script cannot open it.'});
 if(nav&&!script)findings.push({severity:'ERROR',page:p.relative,problem:'Navigation present, but site.js not loaded: no standardized supplemental links or working responsive menu.'});
 if(dup.length)findings.push({severity:'ERROR',page:p.relative,problem:'Duplicate nav hrefs: '+[...new Set(dup)].join(', ')});
 if(wrongHost.length)findings.push({severity:'ERROR',page:p.relative,problem:'Top nav points at old host: '+wrongHost.join(', ')});
 if(missing.length&&nav)findings.push({severity:'DIFF',page:p.relative,problem:'Top nav missing source links (site.js may inject): '+missing.join(', ')});
 if(nav&&links.length<4)findings.push({severity:'ERROR',page:p.relative,problem:'Only '+links.length+' source menu links.'});
}
function row(x){return '| '+x.map(t=>String(t).replace(/\|/g,'\\|').replace(/\n/g,' ')).join(' | ')+' |'}
const h=[];
h.push('# Gravity top-menu source inventory — 2026-10-30','', 'Source: isolated `site/` tree on `feature/gravity-migration-phase1-2026-10-22`. No TMB files changed.','','This is a static source audit, not evidence of interactive mobile operation or production HTTP availability. Application rooms and isolated pages may intentionally have a different header.','');
h.push('## Counts','',row(['Measure','Count']),row(['---','---']),row(['HTML files examined',all.length]),row(['Top-level public HTML files',top.length]),row(['Nested HTML files',all.length-top.length]),row(['Pages with site-header',status.filter(x=>x.hasHeader).length]),row(['Pages with site-nav',status.filter(x=>x.hasNav).length]),row(['Pages with no standard header',status.filter(x=>!x.hasHeader).length]),row(['Source pages missing any standard menu entry',status.filter(x=>x.hasNav&&x.missing.length).length]),row(['Hard errors (missing nav/toggle/script/duplicate/legacy host)',findings.filter(x=>x.severity==='ERROR').length]),'');
h.push('## Top-level source pages lacking required menu behavior','',row(['Page','Issues']),row(['---','---']));
const hard=findings.filter(x=>x.severity==='ERROR'&&!x.page.includes('/'));
for(const p of [...new Set(hard.map(x=>x.page))])h.push(row([p,hard.filter(x=>x.page===p).map(x=>x.problem).join('; ')]));
if(!hard.length)h.push('No hard source errors in top-level documents.');h.push('');
h.push('## Source-menu variations — top-level pages','',row(['Page','Menu source links','Missing expected source destinations']),row(['---','---:','---']));
for(const x of status.filter(x=>x.kind==='root page'&&x.hasNav&&x.missing.length))h.push(row([x.page,x.linkCount,x.missing.join(', ')]));
h.push('', '## Missing standard header by type','',row(['Page','Category']),row(['---','---']));
for(const x of status.filter(x=>!x.hasHeader))h.push(row([x.page,x.kind]));
h.push('','## Nested documents with hard menu problems','',row(['Page','Issue']),row(['---','---']));
for(const x of findings.filter(x=>x.severity==='ERROR'&&x.page.includes('/')))h.push(row([x.page,x.problem]));
h.push('','## Expected public menu destination inventory','',canonicalOrder.map((e,i)=>'- '+expected[i]).join('\n'),'');
h.push('## Source audit follow-up','', '1. Review findings and separate intentional app-specific headers from public pages needing global navigation.', '2. Repair public menus through a shared source of truth while preserving existing application room navigation.', '3. Add an automated live desktop/mobile link test and verify published Netlify deployment before marking the audit complete.','');
fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});fs.writeFileSync(OUTPUT,h.join('\n')+'\n');
console.log(JSON.stringify({total:all.length,root:top.length,headers:status.filter(x=>x.hasHeader).length,menus:status.filter(x=>x.hasNav).length,hard:hard.length,totalErrors:findings.filter(x=>x.severity==='ERROR').length,sourceVariations:status.filter(x=>x.hasNav&&x.missing.length).length,report:path.relative(path.resolve(__dirname,'..'),OUTPUT)},null,2));
