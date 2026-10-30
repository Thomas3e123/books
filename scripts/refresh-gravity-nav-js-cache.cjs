#!/usr/bin/env node
'use strict';
/* One-time cache-bust for shared Gravity public nav script. Isolated Gravity
   branch only; never touches Thomas Monroe Books deployment/source. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const version='20261030-unified-top-menu-v1';
const pages=fs.readdirSync(site).filter(name=>name.endsWith('.html'));
let changed=0,total=0;
function replaceVersion(s){
 const re=/(\bsrc\s*=\s*["'])(\/?assets\/js\/site\.js)(?:\?[^"']*)?(["'])/g;
 let matches=0;
 const out=s.replace(re,(_,a,b,c)=>{matches++;return a+b+'?v='+version+c;});
 return {out,matches};
}
for(const name of pages){
 const file=path.join(site,name),source=fs.readFileSync(file,'utf8');
 if(!/<header\b[^>]*class\s*=\s*["'][^"']*\bsite-header\b/i.test(source))continue;
 const next=replaceVersion(source);total++;
 assert.equal(next.matches,1,'Expected exactly one shared site.js tag in '+name+'; got '+next.matches);
 if(next.out!==source){fs.writeFileSync(file,next.out);changed++}
}
const fn=path.join(root,'functions/gravity-report/index.mjs');
let content=fs.readFileSync(fn,'utf8');
const next=replaceVersion(content);
assert.equal(next.matches,1,'Gravity Report dynamic article reader has unexpected site.js reference count');
if(next.out!==content){fs.writeFileSync(fn,next.out);changed++}
assert(total>=120&&total<=200,'Unexpected number of public page headers');
console.log(JSON.stringify({publicRootHTML:total,updatedFiles:changed,dynamicArticleFunctionUpdated:next.out!==content,version},null,2));
