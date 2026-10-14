'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);

// 1) Rebuild the searchable AI prompt index directly from the controlled 250-prompt reader text.
const src=read('site/assets/reader/ai-prompts.txt').replace(/\r/g,'');
const lines=src.split('\n');let category='',items=[];
for(let i=0;i<lines.length;i++){
  const raw=lines[i],t=raw.trim();
  if(t && t.length<=90 && t===t.toUpperCase() && /^[A-Z0-9 &/()\-–—]+$/.test(t) && !/^PROMPT\b/.test(t) && !/^(GRAVITY|THE RESTAURANT LEADERSHIP SYSTEM|THOMAS BUTLER|UPDATED DIGITAL EDITION|START HERE|FASTEST WAY TO USE THIS GUIDE|BEFORE YOU PASTE ANYTHING INTO AI|GRAVITY AI|FORMULA|CONTEXT|EVIDENCE|GOAL|LIMITS|OUTPUT)$/.test(t)) category=t;
  const m=t.match(/^PROMPT\s+(\d+)\s+•\s+(.+)$/);
  if(!m) continue;
  const num=Number(m[1]),title=m[2].trim(),body=[];let check='';
  for(i=i+1;i<lines.length;i++){
    const x=lines[i].trim();
    if(/^Manager check:/i.test(x)){check=x.replace(/^Manager check:\s*/i,'').trim();break;}
    body.push(lines[i].trimEnd());
  }
  const prompt=body.join('\n').replace(/^\s+|\s+$/g,'').replace(/\n{3,}/g,'\n\n');
  items.push({number:num,id:'GRV-AI-'+String(num).padStart(3,'0'),title,category,prompt,manager_check:check});
}
if(items.length!==250||items[0]?.number!==1||items[249]?.number!==250) throw new Error('AI prompt parser did not produce 250 controlled prompts.');
write('site/assets/data/restaurant-ai-prompts-250.json',JSON.stringify(items,null,2)+'\n');
let ps=read('site/assets/js/ai-prompt-search.js').replace(/restaurant-ai-prompts-215\.json/g,'restaurant-ai-prompts-250.json');write('site/assets/js/ai-prompt-search.js',ps);

// 2) Correct current prompt-search wording and the embedded Gravity Guide CTA everywhere it was stamped.
for(const f of walk(site).filter(f=>/\.(?:html|js|json)$/i.test(f))){
  let s=fs.readFileSync(f,'utf8'),o=s;
  s=s.replace(/Search 215 Prompts/g,'Search 250 Prompts');
  if(path.basename(f)==='restaurant-ai-prompt-search.html'){
    s=s.replace(/Search 215 Restaurant AI Prompts/g,'Search 250 Restaurant AI Prompts')
       .replace(/all 215 Gravity restaurant AI prompts/g,'all 250 Gravity restaurant AI prompts')
       .replace(/complete 215-prompt Gravity digital workbook/g,'complete 250-prompt Gravity digital workbook')
       .replace(/215-prompt Restaurant AI Prompts & Systems Workbook/g,'250-prompt Restaurant AI Prompts & Systems Workbook')
       .replace(/Workbook • 215 prompts/g,'Workbook • 250 prompts')
       .replace(/Search all 215/g,'Search all 250')
       .replace(/<strong>215<\/strong><span>controlled prompts/g,'<strong>250</strong><span>controlled prompts')
       .replace(/GRV-AI-215/g,'GRV-AI-250')
       .replace(/Loading the 215-prompt index/g,'Loading the 250-prompt index');
    // The old downloadable Word/PDF files are retained as archived editions but are no longer presented as current.
    s=s.replace(/<a class="btn btn-primary" download="" href="assets\/free-resources\/ai\/RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_215_PROMPTS_2026-09-16\.docx">Download Word Book<\/a>\s*<a class="btn btn-outline" download="" href="assets\/free-resources\/ai\/RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_215_PROMPTS_2026-09-16\.pdf">Download PDF<\/a>/,
      '<a class="btn btn-primary" href="/book-reader">Open Current 250-Prompt Digital Edition</a>');
  }
  if(s!==o)fs.writeFileSync(f,s,'utf8');
}

// 3) Privacy-safe analytics: never send sensitive query tokens in page_location or captured referrers.
let js=read('site/assets/js/site.js');
if(!js.includes('function analyticsPageLocation()')){
  js=js.replace("function fileExt(name) { var m=(name||'').match(/\\.([a-z0-9]+)$/i); return m ? m[1].toLowerCase() : ''; }",
`function fileExt(name) { var m=(name||'').match(/\\.([a-z0-9]+)$/i); return m ? m[1].toLowerCase() : ''; }
  function analyticsPageLocation() {
    try {
      var u=new URL(location.href), keep=new URLSearchParams();
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){var v=u.searchParams.get(k);if(v)keep.set(k,v);});
      var q=keep.toString(); return u.origin+u.pathname+(q?'?'+q:'');
    } catch (_) { return location.origin+(location.pathname||'/'); }
  }
  function safeReferrer(v) {
    if(!v)return '';
    try { var u=new URL(v); ['t','token','key','access_token','auth'].forEach(function(k){u.searchParams.delete(k);}); return u.origin+u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():''); }
    catch (_) { return ''; }
  }`);
  js=js.replace('send_page_view: true,','send_page_view: true,\n      page_location: analyticsPageLocation(),');
  js=js.replace("referrer: document.referrer || '',","referrer: safeReferrer(document.referrer || ''),");
  js=js.replace("'registration-source-page': document.referrer || '',","'registration-source-page': safeReferrer(document.referrer || ''),");
}
write('site/assets/js/site.js',js);

// 4) Keep the tester bearer token out of the normal address bar and stored message context.
let tr=read('site/testing-room.html');
tr=tr.replace("async function enter(){localStorage.setItem(KEY,token);$('join-card').classList.add('tr-hidden');$('room').classList.remove('tr-hidden');if(!location.search.includes('t='))history.replaceState(null,'','/testing-room?t='+encodeURIComponent(token));await Promise.all([loadMessages(),loadGroups()])}",
"async function enter(){localStorage.setItem(KEY,token);$('join-card').classList.add('tr-hidden');$('room').classList.remove('tr-hidden');history.replaceState(null,'','/testing-room');await Promise.all([loadMessages(),loadGroups()])}");
tr=tr.replace('page:location.href,device:','page:location.origin+location.pathname,device:');
tr=tr.replace("$('copy-link').onclick=async()=>{await navigator.clipboard.writeText(location.href);alert('Private return link copied.');};",
"$('copy-link').onclick=async()=>{await navigator.clipboard.writeText(location.origin+'/testing-room?t='+encodeURIComponent(token));alert('Private return link copied.');};");
if(!/rel="canonical"/.test(tr))tr=tr.replace('</title>','</title><link rel="canonical" href="https://thomasmonroebooks.com/testing-room">');
write('site/testing-room.html',tr);

// 5) Public root pages should have canonicals; internal app utility screens should not compete in Google.
const publicCanon=['book-reader.html','gravity-assist.html','gravity-inventory-center.html','gravity-numbers-lab.html','gravity-quick-tools.html','gravity-recipe-works.html','gravity-work-study-lab.html','restaurant-existing-sop-library-import-guide.html','windows-programs.html'];
for(const name of publicCanon){const p='site/'+name;if(!fs.existsSync(path.join(root,p)))continue;let s=read(p);if(!/rel=["']canonical["']/.test(s)){const slug=name==='index.html'?'':name.replace(/\.html$/,'');s=s.replace('</title>',`</title><link rel="canonical" href="https://thomasmonroebooks.com/${slug}">`);write(p,s);}}
for(const f of walk(path.join(site,'apps')).filter(f=>f.endsWith('.html'))){let s=fs.readFileSync(f,'utf8');if(!/name=["']robots["']/i.test(s))s=s.replace(/<head>/i,'<head><meta name="robots" content="noindex,nofollow">');fs.writeFileSync(f,s,'utf8');}

console.log('Comprehensive audit repairs applied. Generated prompt index:',items.length);
