'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {scan,verifyProduct}=require('../scripts/verify-windows-brand-links.cjs');
function temp(fn){const d=fs.mkdtempSync(path.join(os.tmpdir(),'gravity-windows-'));try{fn(d)}finally{fs.rmSync(d,{force:true,recursive:true})}}
test('Gravity links and copyright credits pass',()=>temp(d=>{
 fs.writeFileSync(path.join(d,'app.html'),'Copyright Thomas Monroe Books. <a href="https://gravityleadershipsystem.com/help-center">Help</a>');
 assert.deepEqual(scan(d).found,[]);
}));
test('old domain in a nested packaged JS file fails release',()=>temp(d=>{
 const p=path.join(d,'app','assets','js');fs.mkdirSync(p,{recursive:true});
 fs.writeFileSync(path.join(d,'app','index.html'),'<h1>Inventory Center</h1>');
 assert.equal(verifyProduct('inventory',d).product,'inventory');
 fs.writeFileSync(path.join(p,'links.js'),"const help='https://thomasmonroebooks.com/support'");
 assert.throws(()=>verifyProduct('inventory',d),/BLOCK WINDOWS RELEASE/);
}));
test('rejects old domain in manual links and even scheme-less text',()=>temp(d=>{
 fs.writeFileSync(path.join(d,'manual.txt'),'Visit thomasmonroebooks.com or https://www.thomasmonroebooks.com/guide');
 assert.equal(scan(d).found.length,1);
}));
test('refuses missing generated output',()=>temp(d=>{
 assert.throws(()=>verifyProduct('foundry',d),/Missing packaged/);
 assert.throws(()=>verifyProduct('unknown',d),/Unknown Windows product/);
}));
