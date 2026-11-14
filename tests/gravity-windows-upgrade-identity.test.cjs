'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {compareVersions,auditOne,auditAll}=require('../scripts/audit-windows-upgrade-identity.cjs');
const baseline={name:'Synthetic Inventory',version:'0.1.0-beta.1',appId:'com.publisher.inventory.candidate',productName:'Inventory Candidate'};
const good={version:'0.1.0-beta.2',build:{appId:baseline.appId,productName:baseline.productName,win:{target:[{target:'nsis'},{target:'zip'}]},nsis:{oneClick:false}}};
test('Published October Windows preview metadata matches all four current sources',()=>{
 const report=auditAll();
 assert.equal(report.products.length,4);
 assert.equal(report.sourceIdentityPassed,true,JSON.stringify(report.products.filter(p=>p.sourceBlockers.length)));
 assert.equal(report.newerVersionReady,false,'Do not misclassify October-identical versions as replacement releases');
 for(const product of report.products)assert.ok(product.releaseHolds.some(s=>s.includes('version greater')),product.name);
});
test('Release identity passes with stable appId, productName and strictly newer version',()=>{
 const report=auditOne(baseline,good);assert.deepEqual(report.sourceBlockers,[]);assert.deepEqual(report.releaseHolds,[]);
});
test('Changing application ID or productName blocks a release even with a newer version',()=>{
 for(const field of ['appId','productName']){
  const copy=structuredClone(good);copy.build[field]+='-new';
  assert.ok(auditOne(baseline,copy).sourceBlockers.length>0,field);
 }
});
test('Reject destructive uninstall setting and missing installer package targets',()=>{
 let p=structuredClone(good);p.build.nsis.deleteAppDataOnUninstall=true;
 assert.ok(auditOne(baseline,p).sourceBlockers.some(s=>s.includes('deleteAppData')));
 p=structuredClone(good);p.build.win.target=[{target:'nsis'}];
 assert.ok(auditOne(baseline,p).sourceBlockers.some(s=>s.includes('portable ZIP')));
});
test('Reject republishing identical or older versions',()=>{
 for(const v of ['0.1.0-beta.1','0.1.0-beta.0','0.0.9','nonsense']){
  const copy={...good,version:v};
  assert.ok(auditOne(baseline,copy).releaseHolds.length,v);
 }
});
test('Version comparison handles prerelease sequence and stable release',()=>{
 assert.equal(compareVersions('0.1.0-beta.2','0.1.0-beta.1'),1);
 assert.equal(compareVersions('0.1.0','0.1.0-beta.9'),1);
 assert.equal(compareVersions('0.1.0-beta.9','0.1.0'),-1);
 assert.equal(compareVersions('0.3.0-beta.1','0.3.0-beta.1'),0);
});
