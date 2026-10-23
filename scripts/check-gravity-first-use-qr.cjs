'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const homepage='https://gravityleadershipsystem.com';
const preview='https://gravity-leadership-system.netlify.app';
const site=read('site/qr-code-generator.html');
const script=read('site/assets/js/gravity-qr.js');
const winMain=read('windows/gravity-sop-foundry/main.js');
const winSync=read('windows/gravity-sop-foundry/sync-site.cjs');
const staff=read('site/apps/sop-foundry/employee-connection.js');
const routes=read('site/_redirects');
const paths=['/','/start-here','/books','/gravity-fulfillment-center','/review'];
let tests=0;
for(const suffix of paths){
  assert.ok(site.includes('data-qr-preset="'+suffix+'"'),'Missing site-relative QR preset '+suffix);
  tests++;
  for(const base of [homepage,preview]){
    const actual=new URL(suffix,base).href;
    assert.ok(actual.startsWith(base+'/'),'Wrong QR preset origin for '+suffix);
    tests++;
  }
}
assert.ok(!site.includes('data-qr-preset="https://gravity-leadership-system.netlify.app/'),'QR presets should not be pinned to a preview site');tests++;
assert.ok(script.includes("new URL(value,window.location.origin).href"),'QR generator must turn relative presets into full scannable addresses');tests++;
assert.ok(winMain.includes("HOSTED='https://gravityleadershipsystem.com'"),'Windows hosted traffic must use the new Gravity domain');tests++;
assert.ok(!winMain.includes('https://thomasmonroebooks.com'),'Windows candidate still points to TMB');tests++;
assert.ok(!winSync.includes('https://thomasmonroebooks.com'),'Windows packaging still creates legacy QR links');tests++;
assert.ok(winSync.includes('https://gravityleadershipsystem.com/e/'),'Windows QR links missing Gravity employee origin');tests++;
assert.ok(staff.includes("location.origin+'/e/'"),'Web employee QR links should use live origin');tests++;
assert.ok(routes.includes('/e/*'),'Employee QR route not mapped to access page');tests++;
console.log('GRAVITY_QR_NEW_SITE_CHECK_PASS '+JSON.stringify({tests,presets:paths.length,sites:[preview,homepage],windowsHostedOrigin:homepage,employeePath:'/e/CODE',netlifyDeploys:0}));
