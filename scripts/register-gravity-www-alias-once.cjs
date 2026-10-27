'use strict';
/**
 * One-site, one-alias Netlify repair. Does not touch DNS, SSL, deploys, original site,
 * canonical primary domain, emails, access controls, branch, or search indexing.
 */
const {execFileSync}=require('node:child_process');
const SITE='fa5d39a0-bef9-4ff1-9c28-57d585d741d7';
const APEX='gravityleadershipsystem.com';
const WWW='www.gravityleadershipsystem.com';
const SITE_NAME='gravity-leadership-system';
const TOKEN=process.env.NETLIFY_AUTH_TOKEN||process.env.NETLIFY_TOKEN||process.env.NETLIFY_ACCESS_TOKEN;
const BASE='https://api.netlify.com/api/v1/sites/'+SITE;
if(!TOKEN)throw Error('NO_NETLIFY_TOKEN: cannot change aliases');
function dig(name,type){
  return execFileSync('dig',['+short',name,type],{encoding:'utf8',timeout:12000}).trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
}
function validateDNS(){
 const a=dig(APEX,'A');
 const c=dig(WWW,'CNAME').map(s=>s.replace(/\.$/,''));
 const mx=dig(APEX,'MX').map(s=>s.toLowerCase());
 if(a.length!==1||a[0]!=='75.2.60.5')throw Error('APEX_DNS_CHANGED: manual review; no change');
 if(c.length!==1||c[0]!==SITE_NAME+'.netlify.app')throw Error('WWW_CNAME_CHANGED: no change');
 if(!mx.some(s=>/\bsmtp\.google\.com\.?$/.test(s)))throw Error('WORKSPACE_MX_CHANGED: no change');
 console.log('DNS_PREFLIGHT_PASS apex_A=75.2.60.5 www_CNAME='+SITE_NAME+'.netlify.app workspace_MX_present=true');
}
async function api(path,method='GET',body){
 const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),24000);
 try{
  const resp=await fetch(BASE+path,{method,signal:ctrl.signal,
   headers:{Authorization:'Bearer '+TOKEN,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},
   ...(body?{body:JSON.stringify(body)}:{})});
  if(!resp.ok)throw Error('NETLIFY_HTTP_'+resp.status+'_'+method+'_'+(path||'/site')+' (response body intentionally hidden)');
  return await resp.json();
 }finally{clearTimeout(tm)}
}
(async()=>{
 validateDNS();
 const site=await api('');
 if(site.id!==SITE||site.name!==SITE_NAME||site.custom_domain!==APEX)throw Error('WRONG_SITE_OR_PRIMARY_DOMAIN: abort');
 if(!Array.isArray(site.domain_aliases))throw Error('ALIASES_NOT_ARRAY: abort instead of replacing unknown data');
 if(site.domain_aliases.some(x=>typeof x!=='string'))throw Error('UNKNOWN_ALIASES: abort');
 const cert=await api('/ssl');
 if(cert.state!=='issued'||!Array.isArray(cert.domains)||!cert.domains.includes(APEX))throw Error('APEX_CERT_NOT_HEALTHY: abort');
 console.log('NETLIFY_PREFLIGHT_PASS '+JSON.stringify({site:site.name,primary:site.custom_domain,
   currentAliases:site.domain_aliases,issuedDomains:cert.domains}));
 const oldAliases=[...site.domain_aliases];
 if(!oldAliases.includes(WWW)){
   // Preserve any unrelated aliases. PATCH contains ONLY domain_aliases.
   const patched=await api('','PATCH',{domain_aliases:[...oldAliases,WWW]});
   if(patched.custom_domain!==APEX)throw Error('PRIMARY_CHANGED_AFTER_PATCH: urgent review');
   console.log('WWW_ALIAS_PATCH_ACCEPTED');
 }else console.log('WWW_ALIAS_ALREADY_PRESENT_NO_PATCH');
 const after=await api('');
 if(after.id!==SITE||after.custom_domain!==APEX||!after.domain_aliases.includes(WWW)
    ||!oldAliases.every(x=>after.domain_aliases.includes(x)))throw Error('ALIAS_POSTCHECK_FAILED: inspect domain management');
 console.log('WWW_ALIAS_CONFIRMED '+JSON.stringify({site:after.name,primary:after.custom_domain,aliases:after.domain_aliases}));
 validateDNS();
 const certNow=await api('/ssl');
 console.log('CERT_POSTCHECK '+JSON.stringify({state:certNow.state,domains:certNow.domains,expires_at:certNow.expires_at}));
 console.log('NEXT: Allow Netlify automatic HTTPS provisioning; verify SNI at www, valid HTTPS response, canonical redirect. No certificate renew or DNS changes performed.');
})().catch(err=>{console.error('GRAVITY_WWW_ALIAS_RESULT_FAILED: '+err.message);process.exitCode=1;});
