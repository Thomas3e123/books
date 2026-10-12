#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const factsPath=path.join(root,'assets/data/gravity-current-facts.json');
const fail=[]; const pass=[];
function ok(name,cond,detail=''){(cond?pass:fail).push(name+(detail?' — '+detail:''));}
function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())out.push(...walk(p)); else out.push(p);
  }
  return out;
}
const facts=JSON.parse(fs.readFileSync(factsPath,'utf8'));
ok('Current SOP total',facts.current_sop_count===525,String(facts.current_sop_count));
ok('Current AI prompt total',facts.current_ai_prompt_count===215,String(facts.current_ai_prompt_count));
ok('Overview booklet exception',facts.registration_public_download_exception==='Gravity System Customer Overview Booklet only');

const required=[
  'book-reader.html','assets/js/book-reader.js','assets/js/gravity-guide-ai.js',
  'netlify/functions/gravity-guide.mjs','netlify/functions/gravity-tts.mjs',
  'assets/reader/catalog.json','gravity-shift-lab.html','assets/js/gravity-shift-lab.js'
];
for(const rel of required)ok('Required file '+rel,fs.existsSync(path.join(root,rel)));

const bad=[
  /\b350\s*(?:sops?|standard operating procedures?)\b/i,
  /\b175\s*(?:sops?|standard operating procedures?)\b/i,
  /\b189\s*(?:ai\s*)?prompts?\b/i,
  /\bfour[- ]machines?\b/i,
  /\bcustomer machines\b/i,
  /\bweekly scheduling machine\b/i,
  /\bright machine\b/i,
  /\bsimple personalization machine\b/i
];
const textExt=new Set(['.html','.js','.mjs','.json','.txt','.xml','.md','.css','.toml','.csv']);
for(const f of walk(root)){
  if(!textExt.has(path.extname(f).toLowerCase()))continue;
  const txt=fs.readFileSync(f,'utf8');
  for(const rx of bad)if(rx.test(txt))fail.push('Retired term/count: '+path.relative(root,f)+' matches '+rx);
}

const html=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
let menuMiss=0,guideMiss=0,exceptions=[];
for(const name of html){
  const txt=fs.readFileSync(path.join(root,name),'utf8');
  if(!/href=["'][^"']*book-reader/i.test(txt))menuMiss++;
  if(!txt.includes('gravity-guide-ai.js')||!txt.includes('gravity-guide-root'))guideMiss++;
  const rx=/<a\b[^>]*href=["']([^"']+\.(?:pdf|zip|docx|xlsx|pptx|txt|csv)(?:\?[^"']*)?)["'][^>]*data-no-registration-gate[^>]*>|<a\b[^>]*data-no-registration-gate[^>]*href=["']([^"']+\.(?:pdf|zip|docx|xlsx|pptx|txt|csv)(?:\?[^"']*)?)["'][^>]*>/gi;
  let m; while((m=rx.exec(txt)))exceptions.push(m[1]||m[2]);
}
ok('Book Reader menu coverage',menuMiss===0,html.length+' HTML pages');
ok('Gravity Guide coverage',guideMiss===0,html.length+' HTML pages');
const uniqueExceptions=[...new Set(exceptions)];
ok('Registration exception target',uniqueExceptions.length===1 && /The_Gravity_System_Customer_Overview_Booklet_v1\.7_2026-09-23\.pdf$/i.test(uniqueExceptions[0]||''),uniqueExceptions.join(', ')||'none');

const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/reader/catalog.json'),'utf8'));
ok('Reader catalog',Array.isArray(catalog.books)&&catalog.books.length===13,String(catalog.books?.length||0)+' books');
for(const b of catalog.books||[])ok('Reader text '+b.id,fs.existsSync(path.join(root,String(b.text||'').replace(/^\//,''))));

const shift=fs.readFileSync(path.join(root,'assets/js/gravity-shift-lab.js'),'utf8');
ok('Shift Lab OFF support',/function isOffShift/.test(shift)&&/return 'OFF'/.test(shift));
ok('Shift Lab OPEN support',/function isOpenMarker/.test(shift)&&/openStart/.test(shift));
ok('Shift Lab CLOSE support',/function isCloseMarker/.test(shift)&&/closeEnd/.test(shift));

console.log('GRAVITY RELEASE VALIDATOR');
console.log('PASS: '+pass.length);
for(const x of pass)console.log('  PASS '+x);
if(fail.length){
  console.error('FAIL: '+fail.length);
  for(const x of fail)console.error('  FAIL '+x);
  process.exit(1);
}
console.log('FAIL: 0');
