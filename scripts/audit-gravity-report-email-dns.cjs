#!/usr/bin/env node
'use strict';
// Read-only email DNS authentication checklist. NEVER print TXT keys or verification secrets.
const dns=require('node:dns').promises;
const domain='gravityleadershipsystem.com';
async function resolveTxt(name){
  try{return (await dns.resolveTxt(name)).map(parts=>parts.join(''));}
  catch(e){return [];}
}
async function resolveMx(name){
  try{return await dns.resolveMx(name);}
  catch(e){return [];}
}
(async()=>{
 const [mx,root,dmarc,googleDkim]=await Promise.all([
  resolveMx(domain),resolveTxt(domain),resolveTxt('_dmarc.'+domain),resolveTxt('google._domainkey.'+domain)
 ]);
 const spf=root.filter(v=>/^v=spf1\b/i.test(v));
 const dmarcs=dmarc.filter(v=>/^v=DMARC1\s*;/i.test(v));
 const result={
  domain,readOnly:true,
  googleWorkspaceMx:mx.some(x=>x.exchange.replace(/\.$/,'').toLowerCase()==='smtp.google.com'),
  mxCount:mx.length,
  spfRecordCount:spf.length,
  spfAuthorizesWorkspace:spf.length===1&&spf[0].includes('include:_spf.google.com'),
  googleDkimSelectorPublished:googleDkim.some(v=>/v=DKIM1\b/i.test(v)||/\bp=\S+/i.test(v)),
  dmarcPublished:dmarcs.length===1,
  dmarcPolicy:dmarcs.length===1?(/(?:^|;)\s*p=([^;\s]+)/i.exec(dmarcs[0])||[])[1]||'unknown':null,
  externalSenderAuthenticationNeeded:true
 };
 console.log('GRAVITY_REPORT_SENDER_DNS '+JSON.stringify(result));
 if(!result.googleWorkspaceMx)process.exitCode=1;
 if(result.spfRecordCount>1)process.exitCode=1;
 if(result.spfRecordCount===0)console.warn('SENDER_WARNING: No SPF record found. Do not launch newsletter yet.');
 if(!result.googleDkimSelectorPublished)console.warn('SENDER_WARNING: google._domainkey DKIM record missing or another selector used; verify Google Admin Gmail DKIM');
 if(!result.dmarcPublished)console.warn('SENDER_WARNING: no _dmarc TXT record found; add valid DMARC before bulk marketing');
})().catch(e=>{console.error('DNS_READONLY_AUDIT_FAILED '+e.message);process.exitCode=1;});
