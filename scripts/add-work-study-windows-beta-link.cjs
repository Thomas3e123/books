'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'..','site','gravity-work-study-lab.html');let html=fs.readFileSync(file,'utf8');
const marker='<section aria-label="Use this work in another Gravity Assist tool"';
if(!html.includes(marker))throw new Error('Work Study handoff section marker not found.');
if(!html.includes('work-study-windows-beta')){
 const card=`<section class="section" id="work-study-windows-beta"><div style="max-width:1180px;margin:0 auto;padding:0 20px 24px"><div style="border:1px solid #d7b56d;border-radius:18px;padding:20px;background:linear-gradient(135deg,#0c2027,#19251f 55%,#352313);color:#f8f3e8;box-shadow:0 14px 36px rgba(0,0,0,.18)"><div style="font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#efd18d">Windows Beta</div><h2 style="margin:.3rem 0 .5rem;color:#fff;font-family:Georgia,serif">Gravity Work Study Lab for Windows</h2><p style="margin:0 0 14px;color:#ddd3c0;max-width:820px">The Windows beta now packages the same controlled Gravity Work Study expert source as this page through Expert Triage v61, including the complete evidence package and premium interface.</p><a href="https://github.com/Thomas3e123/books/releases/tag/work-study-windows-beta" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;min-height:44px;padding:10px 16px;border-radius:999px;border:1px solid #f0d38f;background:linear-gradient(#e7c77c,#b88737);color:#16120c;text-decoration:none;font-weight:900">Open Windows Beta Download</a><p style="margin:10px 0 0;font-size:.82rem;color:#bfb5a4">Unsigned beta. Windows SmartScreen may warn during installation. DOCX process-map extraction requires internet access; the rest of the expert engine is packaged locally.</p></div></div></section>`;
 html=html.replace(marker,card+marker);
}
fs.writeFileSync(file,html);console.log('Work Study Windows beta release link is present.');
