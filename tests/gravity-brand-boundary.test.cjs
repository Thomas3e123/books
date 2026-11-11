'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Printed Foundry binders accept only current Gravity employee publication URLs',()=>{
 const source=fs.readFileSync('site/apps/sop-foundry/binder-builder.js','utf8');
 assert.doesNotMatch(source,/thomasmonroebooks/i);
 const line=source.split('\n').find(s=>s.includes('const safeLink='));
 assert.ok(line,'SOP binder must restrict published employee links');
 const m=line.match(/\&\&\/(\^https:.*)\/i\.test\(link\)/);
 assert.ok(m,'Missing published SOP URL validation regexp');
 const matcher=new RegExp(m[1],'i');
 assert.equal(matcher.test('https://gravityleadershipsystem.com/e/AB12CD'),true);
 assert.equal(matcher.test('https://gravityleadershipsystem.com/e/AB12CD?next=%2Fapps%2Fsop-foundry%2Fstaff-sops.html'),true);
 assert.equal(matcher.test('https://thomasmonroebooks.com/e/AB12CD'),false);
 assert.equal(matcher.test('https://gravityleadershipsystem.com.evil.invalid/e/AB12CD'),false);
 assert.equal(matcher.test('https://gravityleadershipsystem.com/evil/e/AB12CD'),false);
});

test('Inventory Center Windows manual no longer presents the publisher as an app destination',()=>{
 const html=fs.readFileSync('site/assets/downloads/windows/manuals/current/Gravity_Inventory_Center_Windows_User_Manual.html','utf8');
 assert.match(html,/<title>Gravity Inventory Center.*Gravity Restaurant Leadership System<\/title>/);
 assert.doesNotMatch(html,/(?:href|src)\s*=\s*['\"](?:https?:\/\/)?(?:www\.)?thomasmonroebooks\.com/i);
 assert.match(html,/GRAVITY RESTAURANT LEADERSHIP SYSTEM · WINDOWS MANUAL/);
});
