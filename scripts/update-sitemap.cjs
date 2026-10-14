'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const site=path.join(root,'site');
const base='https://thomasmonroebooks.com';
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const files=fs.readdirSync(site).filter(n=>n.endsWith('.html')).sort();
const urls=[];
for(const name of files){
  const full=path.join(site,name); const html=fs.readFileSync(full,'utf8');
  if(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html)) continue;
  if(/testing-room-manager/i.test(name)) continue;
  let loc='';
  const canon=html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)||html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if(canon) loc=canon[1].trim();
  else loc=name==='index.html'?base+'/':base+'/'+name.replace(/\.html$/,'');
  if(!loc.startsWith(base)) continue;
  let lastmod='';
  try{lastmod=cp.execFileSync('git',['log','-1','--format=%cs','--','site/'+name],{cwd:root,encoding:'utf8'}).trim()}catch(_){}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) lastmod=new Date().toISOString().slice(0,10);
  urls.push({loc,lastmod});
}
const dedup=new Map(); for(const u of urls){const prior=dedup.get(u.loc); if(!prior||u.lastmod>prior.lastmod) dedup.set(u.loc,u)}
const ordered=[...dedup.values()].sort((a,b)=>a.loc.localeCompare(b.loc));
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ordered.map(u=>`  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(site,'sitemap.xml'),xml);
console.log(`Sitemap updated: ${ordered.length} canonical public URLs.`);
