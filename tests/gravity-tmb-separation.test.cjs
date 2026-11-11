'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const publisherDomain=/https?:\/\/(?:www\.)?thomasmonroebooks\.com/i;
const gravityDomain='https://gravityleadershipsystem.com';
const webRuntime=[
 'site/assets/js/gravity-sop-foundry.js',
 'site/apps/sop-foundry/binder-builder.js',
 'site/assets/js/gravity-shift-lab.js'
];
const windowsRuntime=[
 'windows/gravity-work-study-lab/main.js',
 'windows/gravity-work-study-lab/index.html',
 'windows/gravity-work-study-lab/device-link-main.js',
 'windows/gravity-work-study-lab/sync-expert-stack.cjs',
 'windows/gravity-shift-lab/smoke.cjs',
 'windows/gravity-inventory-center/sync-site.cjs',
 'windows/gravity-sop-foundry/main.js',
 'windows/gravity-inventory-center/main.js'
];
const manuals=['Inventory_Center','SOP_Foundry','Shift_Lab','Work_Study_Lab'].map(x=>`site/assets/downloads/windows/manuals/current/Gravity_${x}_Windows_User_Manual.html`);
test('Gravity web and Windows runtime sources do not send customers to Thomas Monroe Books',()=>{
 for(const file of [...webRuntime,...windowsRuntime]){
  const content=read(file);
  assert.doesNotMatch(content,publisherDomain,`${file} must not route customers to TMB`);
 }
 const foundry=read('site/assets/js/gravity-sop-foundry.js');
 assert.ok(foundry.includes(`const FOUNDRY_URL='${gravityDomain}/gravity-sop-foundry';`),'Printable SOP must point to Gravity');
 assert.ok(foundry.includes('gravityleadershipsystem.com · Gravity SOP Foundry'),'Printed SOP credit must not point customers to TMB');
 const binder=read('site/apps/sop-foundry/binder-builder.js');
 assert.ok(binder.includes('gravityleadershipsystem\\.com\\/e\\/'),'Binder must permit Gravity employee SOP links');
 assert.doesNotMatch(binder,/thomasmonroebooks/);
});
test('All four Windows HTML manuals use absolute Gravity links, including when opened from file://',()=>{
 for(const file of manuals){
  const html=read(file);
  assert.doesNotMatch(html,publisherDomain,file+' cannot link away');
  assert.doesNotMatch(html,/href=['"]\/(?!\/)/,file+' may be opened from file://; root-relative links are broken');
  for(const destination of ['/','/windows-programs','/gravity-assist','/contact']){
   assert.ok(html.includes('href="'+gravityDomain+destination+'"'),`${file} missing ${destination}`);
  }
  assert.ok(html.includes('<h1>Gravity'),'Manual must retain its program name');
 }
});
test('Windows Work Study remote endpoints point to functions hosted by Gravity',()=>{
 const source=read('windows/gravity-work-study-lab/main.js');
 for(const name of ['work-study-process-file','work-study-transcribe','gravity-tts']){
  assert.ok(source.includes(gravityDomain+'/.netlify/functions/'+name),'Work Study missing Gravity '+name);
  assert.ok(fs.existsSync(path.join(root,'functions',name)),'Missing '+name+' server function');
 }
 assert.ok(read('windows/gravity-work-study-lab/device-link-main.js').includes(gravityDomain+'/work-study-link'));
 assert.ok(read('windows/gravity-work-study-lab/index.html').includes(gravityDomain+'/assets/downloads/windows/manuals/current/Gravity_Work_Study_Lab_Windows_User_Manual.html'));
});
test('Published Gravity books no longer point release readers to the TMB website',()=>{
 for(const name of ['bar-inventory','bar-pour-cost','employee-training-sop-tracker','food-cost-waste-inventory']){
  const page=read(`site/assets/reader/${name}.txt`);
  assert.ok(page.includes('gravityleadershipsystem.com/releases'),name+' missing active release URL');
  assert.ok(!page.includes('thomasmonroebooks.com/releases'),name+' still links to old publisher releases');
 }
});
test('New Inventory Windows builds reject publisher-site links in packaged app HTML',()=>{
 const build=read('windows/gravity-inventory-center/sync-site.cjs');
 assert.match(build,/thomasmonroebooks/);
 assert.match(build,/gravityleadershipsystem\.com/);
 const manualGenerator=read('scripts/build-windows-manuals.py');
 assert.doesNotMatch(manualGenerator,/author='Thomas Monroe Books'/);
});

test('Windows downloads disclose that old installers are legacy and direct normal users to Gravity Assist',()=>{
 const html=read('site/windows-programs.html');
 assert.ok(html.includes('Windows download advisory — November 2026'));
 assert.ok(html.includes('not corrected production releases'));
 assert.ok(html.includes('href="/gravity-assist"'));
 assert.ok(html.includes('https://gravityleadershipsystem.com/windows-programs'));
});
