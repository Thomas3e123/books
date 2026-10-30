#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../site');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.html')?[path.join(d,e.name)]:[])}
const files=walk(ROOT),changed=[],found=[];
for(const file of files){
 const old=fs.readFileSync(file,'utf8');
 const a=old.indexOf('id="gravity-site-menu-access"');
 if(a<0)continue;
 const navEnd=old.indexOf('</nav>',a);
 assert(navEnd>a,'Unclosed compact Site Menu: '+file);
 let body=old.slice(a,navEnd);
 assert(body.includes('<a href="/operating-systems">'),'Missing operating-systems link: '+file);
 const home='<a href="/">Home</a>';
 if(!body.includes('<a href="/gravity-report">Gravity Report</a>')){
  assert(body.includes(home),'Missing Home in Site Menu: '+file);
  body=body.replace(home,home+'<a href="/gravity-report">Gravity Report</a>');
 }
 body=body.replace('<a href="/operating-systems">15 Systems</a>','<a href="/operating-systems">Operating Systems</a>');
 assert(body.includes('<a href="/operating-systems">Operating Systems</a>'),'Systems label outdated: '+file);
 const next=old.slice(0,a)+body+old.slice(navEnd);
 found.push(path.relative(ROOT,file));
 if(next!==old){fs.writeFileSync(file,next);changed.push(path.relative(ROOT,file))}
}
assert(found.length>=25,'Expected compact site menus across focused programs and app rooms; found '+found.length);
console.log(JSON.stringify({compactMenusAudited:found.length,changedFiles:changed.length,changed},null,2));
