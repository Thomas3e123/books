'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');

function fixture() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'gravity-cache-test-'));
  const write=(rel,text)=>{const dest=path.join(root,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);};
  write('scripts/build-gravity-production.cjs',fs.readFileSync(path.resolve(__dirname,'../scripts/build-gravity-production.cjs')));
  write('site/_headers','/*\n  Cache-Control: public, max-age=0, must-revalidate\n');
  write('site/assets/js/site.js','window.testVersion=1;\n');
  write('site/assets/css/styles.css','body{color:black}\n');
  write('site/apps/inventory-center/assets/js/inventory.js','window.inventory=true;\n');
  write('site/index.html','<!doctype html><html><head><meta name="robots" content="noindex,nofollow"><script src="assets/js/site.js?v=old"></script><link rel="stylesheet" href="assets/css/styles.css?theme=dark&v=old"><script src="https://third-party.invalid/external.js"></script><script src="/assets/js/missing.js?v=old"></script></head></html>');
  write('site/apps/inventory-center/index.html','<!doctype html><html><head><script src="assets/js/inventory.js?v=old"></script><script src="/assets/js/site.js?v=old#main"></script></head></html>');
  for(let i=0;i<100;i++)write('site/extra-'+i+'.html','<!doctype html><head></head><body></body>');
  const build=()=>{const p=spawnSync(process.execPath,[path.join(root,'scripts/build-gravity-production.cjs')],{cwd:root,encoding:'utf8'});assert.equal(p.status,0,p.stderr||p.stdout);};
  const output=rel=>fs.readFileSync(path.join(root,'build/gravity-production',rel),'utf8');
  const source=rel=>fs.readFileSync(path.join(root,'site',rel),'utf8');
  const hash=rel=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'site',rel))).digest('hex').slice(0,16);
  return {root,write,build,output,source,hash,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('version URL matches actual asset bytes, preserves other query values, missing assets and source',()=>{
 const f=fixture();try{
   f.build();const html=f.output('index.html');
   assert.ok(html.includes('assets/js/site.js?v='+f.hash('assets/js/site.js')));
   assert.ok(html.includes('assets/css/styles.css?theme=dark&v='+f.hash('assets/css/styles.css')));
   assert.ok(html.includes('https://third-party.invalid/external.js'));
   assert.ok(html.includes('/assets/js/missing.js?v=old'));
   assert.ok(html.includes('name="robots" content="index,follow,max-image-preview:large"'));
   assert.ok(f.source('index.html').includes('site.js?v=old'));
 }finally{f.cleanup();}
});
test('nested page preserves app-local and site-root asset resolution',()=>{
 const f=fixture();try{
   f.build();const html=f.output('apps/inventory-center/index.html');
   assert.ok(html.includes('assets/js/inventory.js?v='+f.hash('apps/inventory-center/assets/js/inventory.js')));
   assert.ok(html.includes('/assets/js/site.js?v='+f.hash('assets/js/site.js')+'#main'));
 }finally{f.cleanup();}
});
test('changing JavaScript content updates its URL without changing unchanged CSS URL',()=>{
 const f=fixture();try{
   f.build();const before=f.output('index.html'),cssHash=f.hash('assets/css/styles.css');
   f.write('site/assets/js/site.js','window.testVersion=2;\n');f.build();
   const after=f.output('index.html');
   assert.notEqual(after,before);
   assert.ok(after.includes('assets/js/site.js?v='+f.hash('assets/js/site.js')));
   assert.ok(after.includes('assets/css/styles.css?theme=dark&v='+cssHash));
 }finally{f.cleanup();}
});
