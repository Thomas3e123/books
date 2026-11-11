'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {ensureMenus,auditMenus}=require('../scripts/gravity-navigation-consistency.cjs');

function fixture(run){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gravity-editorial-menu-'));
 try{return run(dir);}finally{fs.rmSync(dir,{recursive:true,force:true});}
}
const reportSource=fs.readFileSync(path.resolve(__dirname,'../site/gravity-report.html'),'utf8');

test('approved Gravity Report has a working dedicated magazine menu, not a System menu',()=>fixture(dir=>{
 const page=path.join(dir,'gravity-report.html');
 fs.writeFileSync(page,reportSource);
 assert.deepEqual(auditMenus(dir),{total:1,allNavigable:true});
 const result=ensureMenus(dir);
 assert.equal(result.inserted,0,'Do not insert the Gravity System utility menu into Report identity');
 assert.equal(fs.readFileSync(page,'utf8'),reportSource,'Editorial publication source must be unchanged');
}));
test('missing magazine section navigation is blocked, not covered with a generic fallback',()=>fixture(dir=>{
 const page=path.join(dir,'gravity-report.html');
 const broken=reportSource.replace('class="report-section-nav"','class="report-sections-missing"');
 assert.notEqual(broken,reportSource);
 fs.writeFileSync(page,broken);
 assert.throws(()=>auditMenus(dir),/navigation incomplete/);
 assert.throws(()=>ensureMenus(dir),/editorial navigation incomplete/);
 assert.equal(fs.readFileSync(page,'utf8'),broken,'Audit must never mutate malformed Report pages');
}));
test('missing link back to Gravity is blocked',()=>fixture(dir=>{
 const page=path.join(dir,'gravity-report.html');
 const broken=reportSource.replace('>The Gravity System ↗</a>','>External Systems ↗</a>');
 assert.notEqual(broken,reportSource);
 fs.writeFileSync(page,broken);
 assert.throws(()=>auditMenus(dir),/navigation incomplete/);
}));
test('plain app pages still receive a navigable Gravity fallback menu',()=>fixture(dir=>{
 const page=path.join(dir,'simple-app.html');
 fs.writeFileSync(page,'<!doctype html><html><head></head><body><main><p>App</p></main></body></html>');
 const result=ensureMenus(dir);
 assert.equal(result.inserted,1);
 assert.match(fs.readFileSync(page,'utf8'),/id="gravity-site-menu-access"/);
 assert.deepEqual(auditMenus(dir),{total:1,allNavigable:true});
}));
