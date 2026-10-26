'use strict';
// Read-only inspection of the Squarespace-hosted DNS cutover and Netlify HTTPS.
// Never change the registrar, DNS, MX or anything in Netlify.
const dns=require('node:dns').promises;
const assert=require('node:assert/strict');
const domain='gravityleadershipsystem.com';
const expectedA='75.2.60.5';
const expectedWww='gravity-leadership-system.netlify.app';
const mode=process.env.GRAVITY_DNS_EXPECT_CUTOVER==='1'?'post-cutover':'pre-cutover';
async function attempt(operation){try{return await operation()}catch(error){return {error:error.code||error.message}}}
const uniq=xs=>Array.isArray(xs)?[...new Set(xs)].sort():xs;
async function run(){
 const [nameservers,apexA,apexAAAA,wwwCname,mail,txt,caas]=await Promise.all([
   attempt(()=>dns.resolveNs(domain)),
   attempt(()=>dns.resolve4(domain)),
   attempt(()=>dns.resolve6(domain)),
   attempt(()=>dns.resolveCname('www.'+domain)),
   attempt(()=>dns.resolveMx(domain)),
   attempt(()=>dns.resolveTxt(domain)),
   attempt(()=>dns.resolveCaa(domain)),
 ]);
 const mx=Array.isArray(mail)?mail.map(x=>({priority:x.priority,exchange:x.exchange.toLowerCase()})).sort((a,b)=>a.priority-b.priority):mail;
 const cname=Array.isArray(wwwCname)?wwwCname.map(x=>x.replace(/\.$/,'').toLowerCase()):wwwCname;
 const mailExists=Array.isArray(mx)&&mx.length>0;
 const apexGood=Array.isArray(apexA)&&apexA.length===1&&apexA[0]===expectedA;
 const wwwGood=Array.isArray(cname)&&cname.some(x=>x===expectedWww);
 const sqspNs=Array.isArray(nameservers)&&nameservers.every(ns=>ns.toLowerCase().includes('squarespacedns.com'));
 // Do NOT print TXT payloads; domain verification and mail auth records may contain identifiers.
 const result={
   mode,domain,readOnly:true,checkAt:new Date().toISOString(),
   nameServers:uniq(nameservers),apexA:uniq(apexA),apexAAAA:uniq(apexAAAA),wwwCname:uniq(cname),
   mx,txtRecordCount:Array.isArray(txt)?txt.length:0,caaRecordCount:Array.isArray(caas)?caas.length:0,
   squarespaceNameServers:sqspNs,emailMxPresent:mailExists,
   netlifyAExpected:expectedA,netlifyWwwExpected:expectedWww,
   websiteDnsMatched:apexGood&&wwwGood,
 };
 console.log('GRAVITY_DOMAIN_DNS_READONLY '+JSON.stringify(result));
 assert(mailExists,'Google Workspace MX records missing — STOP and investigate, do not touch other records');
 if(mode==='post-cutover'){
   assert(apexGood,'Apex A is not exclusively '+expectedA);
   assert(wwwGood,'www CNAME does not point to '+expectedWww);
   assert(sqspNs,'Nameservers changed away from Squarespace; mail safety review required');
   for(const url of ['https://'+domain+'/','https://www.'+domain+'/']){
     const r=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'follow'});
     assert.equal(r.status,200,'Bad HTTPS '+url+' HTTP '+r.status);
     assert(r.url.startsWith('https://'+domain+'/'),'Final redirect is not canonical Gravity URL '+r.url);
     const html=await r.text();
     assert(/Gravity System|Gravity Restaurant Leadership/i.test(html),'Wrong site content at '+url);
     console.log('GRAVITY_DOMAIN_HTTPS_PASS '+JSON.stringify({url,finalUrl:r.url,httpStatus:r.status,redirectCanonical:true}));
   }
   const health=await fetch('https://'+domain+'/foundry-hosted/health',{signal:AbortSignal.timeout(20000)});
   assert.equal(health.status,200,'Foundry backend unavailable on custom domain');
   assert.equal((await health.json()).ok,true);
   console.log('GRAVITY_DOMAIN_CUTOVER_READONLY_PASS; SMTP MX PRESERVED; DO NOT REMOVE NOINDEX WITHOUT APPROVAL');
 }else{
   console.log('GRAVITY_DOMAIN_BASELINE_CAPTURED; web_dns='+ (apexGood&&wwwGood?'NETLIFY':'NOT_CUT_OVER')+'; no changes made');
 }
}
run().catch(err=>{console.error('GRAVITY_DOMAIN_DNS_AUDIT_FAILED',String(err.stack||err));process.exitCode=1});
