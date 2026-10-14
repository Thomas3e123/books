'use strict';
const BASE='https://thomasmonroebooks.com';
const errors=[],warnings=[];const log=(a,m)=>a.push(m);
async function get(url,opt={}){const c=new AbortController();const t=setTimeout(()=>c.abort(),15000);try{return await fetch(url,{redirect:'follow',signal:c.signal,...opt});}finally{clearTimeout(t)}}
(async()=>{
  const home=await get(BASE+'/');if(!home.ok)log(errors,`Homepage returned ${home.status}`);const h=home.headers;
  for(const k of ['content-security-policy','permissions-policy','referrer-policy','x-content-type-options','x-frame-options'])if(!h.get(k))log(errors,`Homepage missing security header ${k}`);
  const robots=await get(BASE+'/robots.txt');if(!robots.ok)log(errors,`robots.txt returned ${robots.status}`);const robotsText=await robots.text();if(!/Sitemap:\s*https:\/\/thomasmonroebooks\.com\/sitemap\.xml/i.test(robotsText))log(errors,'robots.txt does not advertise canonical sitemap');
  const sm=await get(BASE+'/sitemap.xml');if(!sm.ok)log(errors,`sitemap.xml returned ${sm.status}`);const txt=await sm.text();const urls=[...txt.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);if(urls.length<80)log(warnings,`Sitemap contains only ${urls.length} URLs`);if(urls.some(u=>/testing-room-manager/i.test(u)))log(errors,'Private manager URL appears in sitemap');
  let checked=0;for(const u of urls){try{const r=await get(u);checked++;if(!r.ok)log(errors,`${u} returned ${r.status}`);else if((r.headers.get('content-type')||'').includes('text/html')){const b=await r.text();if(!/<title>[^<]+<\/title>/i.test(b))log(errors,`${u} live HTML missing title`);}}catch(e){log(errors,`${u} request failed: ${e.name||e.message}`)}}
  const mgr=await get(BASE+'/testing-room-manager');if(!mgr.ok)log(errors,`Testing Room manager page returned ${mgr.status}`);else{const b=await mgr.text();if(!/noindex/i.test(b))log(errors,'Testing Room manager live page lacks noindex');}
  const unauth=await get(BASE+'/testing-room/manager/testers',{headers:{Origin:BASE}});if(unauth.status!==401)log(errors,`Unauthenticated manager API expected 401, got ${unauth.status}`);
  const evil=await get(BASE+'/testing-room/manager/testers',{headers:{Origin:'https://example.invalid'}});if(evil.status!==403)log(errors,`Cross-origin manager API expected 403, got ${evil.status}`);
  const missingTester=await get(BASE+'/testing-room/me',{headers:{Origin:BASE}});if(missingTester.status!==404)log(warnings,`Tokenless tester lookup expected 404, got ${missingTester.status}`);
  const assets=[
'Gravity_SOP_Foundry_Windows_Beta_2026-10-12_x64_HELP_GLOSSARY_READY.zip',
'Gravity_Shift_Lab_Windows_Beta_2026-10-12_x64_HELP_GLOSSARY_READY.zip',
'Gravity_Inventory_Center_Windows_Beta_2026-10-12_x64_HELP_GLOSSARY_READY.zip'];
  for(const a of assets){const u='https://github.com/Thomas3e123/books/releases/download/windows-beta-2026-10-13/'+a;try{const r=await get(u,{method:'HEAD'});if(!r.ok)log(errors,`Windows release asset unavailable: ${a} (${r.status})`);}catch(e){log(errors,`Windows release asset request failed: ${a}`)}}
  const notFound=await get(BASE+'/this-route-should-not-exist-gravity-audit-20261014');if(notFound.status!==404)log(warnings,`Unknown route expected 404, got ${notFound.status}`);
  console.log(`LIVE_URLS_CHECKED=${checked}`);console.log(`ERRORS=${errors.length}`);errors.forEach(x=>console.log('ERROR '+x));console.log(`WARNINGS=${warnings.length}`);warnings.forEach(x=>console.log('WARN '+x));process.exitCode=errors.length?2:0;
})().catch(e=>{console.error(e);process.exit(2)});
