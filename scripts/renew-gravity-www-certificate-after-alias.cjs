'use strict';
const {execFileSync}=require('node:child_process');
const ID='fa5d39a0-bef9-4ff1-9c28-57d585d741d7';
const APEX='gravityleadershipsystem.com',WWW='www.gravityleadershipsystem.com';
const TOKEN=process.env.NETLIFY_AUTH_TOKEN||process.env.NETLIFY_TOKEN||process.env.NETLIFY_ACCESS_TOKEN;
const BASE='https://api.netlify.com/api/v1/sites/'+ID;
if(!TOKEN)throw Error('NO_NETLIFY_TOKEN');
const dig=(name,type)=>execFileSync('dig',['+short',name,type],{encoding:'utf8',timeout:12000}).trim().split(/\r?\n/).filter(Boolean);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function req(path,method='GET'){
 const response=await fetch(BASE+path,{method,headers:{Authorization:'Bearer '+TOKEN,Accept:'application/json'},signal:AbortSignal.timeout(28000)});
 if(!response.ok)throw Error(method+' '+path+' HTTP '+response.status+' (response body hidden)');
 return await response.json();
}
async function check(){
 const a=dig(APEX,'A'),cn=dig(WWW,'CNAME').map(s=>s.replace(/\.$/,'')),mx=dig(APEX,'MX');
 if(a.length!==1||a[0]!=='75.2.60.5'||cn.length!==1||cn[0]!=='gravity-leadership-system.netlify.app'
   ||!mx.some(s=>s.includes('smtp.google.com')))throw Error('DNS_OR_MX_CHANGED');
 const site=await req('');
 if(site.id!==ID||site.name!=='gravity-leadership-system'||site.custom_domain!==APEX
   ||!Array.isArray(site.domain_aliases)||!site.domain_aliases.includes(WWW))throw Error('WWW_NOT_YET_REGISTERED_AS_NETLIFY_ALIAS');
 const cert=await req('/ssl');
 if(!cert.domains?.includes(APEX))throw Error('APEX_CERT_IS_NOT_HEALTHY');
 return cert;
}
(async()=>{
 const old=await check();
 console.log('PRE_RENEWAL_SAFE '+JSON.stringify({site:ID,alias:WWW,certificateState:old.state,domains:old.domains}));
 if(old.domains.includes(WWW)&&old.state==='issued')console.log('WWW_CERT_ALREADY_COVERED_SKIP_RENEW');
 else if(old.renew_running){console.log('WWW_CERT_ALREADY_RENEWING_SKIP_RENEW');}
 else{
   const updated=await req('/ssl/renew','POST');
   console.log('WWW_CERT_RENEWAL_REQUESTED_ONCE '+JSON.stringify({state:updated.state,domains:updated.domains,renew_running:updated.renew_running,renewal_error_message:updated.renewal_error_message}));
 }
 for(let i=0;i<10;i++){
   await sleep(i?11000:1500);
   const c=await req('/ssl');
   console.log('WWW_CERT_POLL '+JSON.stringify({check:i+1,state:c.state,domains:c.domains,renew_running:c.renew_running,renewal_error_message:c.renewal_error_message}));
   if(c.state==='issued'&&c.domains.includes(WWW)){
     console.log('WWW_CERT_ISSUED_DOMAINS_PASS');
     return;
   }
   if(c.renewal_error_message)throw Error('NETLIFY_CERT_RENEWAL_ERROR: '+String(c.renewal_error_message).slice(0,240));
 }
 throw Error('CERT_ISSUANCE_NOT_YET_CONFIRMED after one renewal request. Continue read-only hourly monitoring; do not retry blindly.');
})().catch(e=>{console.error('WWW_CERT_WORKFLOW_RESULT '+e.message);process.exitCode=1});
