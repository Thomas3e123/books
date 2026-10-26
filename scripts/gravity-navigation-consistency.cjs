'use strict';
/**
 * Give every Gravity HTML page access to the public site navigation, including
 * embedded programs that intentionally hide their full-size website header.
 * An unobtrusive, in-flow <details> menu avoids fixed overlays on phones.
 * Run only on isolated Gravity staging/candidate builds, never TMB main.
 */
const fs=require('node:fs');
const path=require('node:path');
const LINKS=[
  ['Home','/'],['Start Here','/start-here'],['Gravity Assist','/gravity-assist'],
  ['15 Systems','/operating-systems'],['Books','/books'],
  ['Windows Programs','/windows-programs'],['Testing Room','/testing-room'],
  ['Employee Access','/e'],['Knowledge Center','/knowledge-center'],['Contact','/contact']
];
const css=`<style id="gravity-site-menu-access-css">
#gravity-site-menu-access{display:flex;justify-content:flex-end;align-items:center;padding:7px 13px;background:#102832;color:#fff;border-bottom:2px solid #bd9643;box-sizing:border-box;position:relative;isolation:isolate;z-index:50;min-height:48px;width:100%;font:600 14px/1.35 system-ui,sans-serif}
#gravity-site-menu-access *{box-sizing:border-box}
#gravity-site-menu-access details{margin:0;position:relative;display:block;max-width:100%}
#gravity-site-menu-access summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:37px;padding:7px 14px;border:1px solid #dfc58c;border-radius:8px;color:#fff;background:#233e4d;font:700 14px/1.3 system-ui,sans-serif}
#gravity-site-menu-access summary::-webkit-details-marker{display:none}
#gravity-site-menu-access summary::before{content:"☰";font-size:19px;line-height:1}
#gravity-site-menu-access details[open] summary{background:#bd9643;color:#102832}
#gravity-site-menu-access nav{position:absolute;top:calc(100% + 6px);right:0;width:min(306px,calc(100vw - 24px));max-height:min(70vh,560px);overflow-y:auto;display:grid;gap:2px;padding:9px;background:#102832;border:1px solid #dfc58c;border-radius:10px;box-shadow:0 14px 28px #0005;z-index:500}
#gravity-site-menu-access nav a{display:block;color:#fff;text-decoration:none;font:600 15px/1.4 system-ui,sans-serif;padding:11px 12px;border-radius:6px;min-height:42px}
#gravity-site-menu-access nav a:hover,#gravity-site-menu-access nav a:focus-visible{background:#bd9643;color:#102832;outline:2px solid #fff;outline-offset:-2px}
@media print{#gravity-site-menu-access{display:none!important}}
</style>`;
const menu='<div id="gravity-site-menu-access"><details><summary>Site Menu</summary><nav aria-label="Gravity website navigation">'+LINKS.map(([title,url])=>'<a href="'+url+'">'+title+'</a>').join('')+'</nav></details></div>';
const nativeMenu=html=>
 /<nav\b[^>]*\bid=["']site-nav["']/i.test(html)&&
 /<button\b[^>]*data-menu-toggle/i.test(html)&&
 !/body\s+\.site-header\s+#site-nav\s*,\s*body\s+\.site-header\s+\.menu-toggle[^}]*display\s*:\s*none\s*!important/i.test(html);
function ensureMenus(dir){
 let total=0,native=0,inserted=0,existing=0,missing=[];
 function visit(folder){
  for(const item of fs.readdirSync(folder,{withFileTypes:true})){
   const full=path.join(folder,item.name);
   if(item.isDirectory()){visit(full);continue}
   if(!item.name.endsWith('.html'))continue;
   let html=fs.readFileSync(full,'utf8');
   if(!/<body\b/i.test(html)){missing.push(path.relative(dir,full));continue}
   total++;
   if(html.includes('id="gravity-site-menu-access"')){existing++;continue}
   if(nativeMenu(html)){native++;continue}
   if(/<\/head>/i.test(html))html=html.replace(/<\/head>/i,css+'</head>');
   else throw Error('Cannot insert menu styling: '+full);
   // Insert after an existing header on full-size pages; inside main for bare
   // employee login cards, to avoid disturbing their body grid layout.
   if(/<\/header\s*>/i.test(html))html=html.replace(/<\/header\s*>/i,m=>m+menu);
   else if(/<main\b[^>]*>/i.test(html))html=html.replace(/<main\b[^>]*>/i,m=>m+menu);
   else html=html.replace(/<body\b[^>]*>/i,m=>m+menu);
   fs.writeFileSync(full,html);inserted++;
  }
 }
 visit(dir);
 if(missing.length)throw Error('HTML pages missing body: '+missing.slice(0,10).join(', '));
 return {total,native,inserted,existing};
}
function auditMenus(dir){
 const noMenu=[],hiddenWithoutFallback=[];let total=0;
 function visit(folder){for(const item of fs.readdirSync(folder,{withFileTypes:true})){
   const full=path.join(folder,item.name);
   if(item.isDirectory()){visit(full);continue}
   if(!item.name.endsWith('.html'))continue;
   total++;const html=fs.readFileSync(full,'utf8');
   const hasFallback=html.includes('id="gravity-site-menu-access"');
   if(!hasFallback&&!nativeMenu(html))noMenu.push(path.relative(dir,full));
   if(/body\s+\.site-header\s+#site-nav\s*,\s*body\s+\.site-header\s+\.menu-toggle[^}]*display\s*:\s*none\s*!important/i.test(html)&&!hasFallback)hiddenWithoutFallback.push(path.relative(dir,full));
 }}
 visit(dir);
 if(noMenu.length||hiddenWithoutFallback.length)throw Error('Gravity navigation incomplete. Missing: '+noMenu.slice(0,15).join(', ')+'; hidden: '+hiddenWithoutFallback.slice(0,15).join(', '));
 return {total,allNavigable:true};
}
module.exports={ensureMenus,auditMenus};
if(require.main===module){const root=path.resolve(__dirname,'..','site');console.log(JSON.stringify(ensureMenus(root)));console.log(JSON.stringify(auditMenus(root)))}
