const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('site/apps/sop-foundry/access.js','utf8');
const fn=source.slice(source.indexOf('function destination()'),source.indexOf("$('entry').onsubmit"));
function destination(next,room='staff'){
 const context={URL,params:new URLSearchParams({next}),room,location:{origin:'https://example.test'}};
 return vm.runInNewContext(fn+';destination()',context);
}
test('unlock retains room-relative SOP, poster and training deep links',()=>{
 for(const next of ['staff-sops.html#test-sop','staff-posters.html?from=qr#poster','training.html?id=test-sop'])
  assert.equal(destination(next),'/apps/sop-foundry/'+next);
 assert.equal(destination('/apps/sop-foundry/staff-sops.html#test'),'/apps/sop-foundry/staff-sops.html#test');
});
test('manager destinations require the manager room',()=>{
 for(const page of ['workroom.html','import-export.html','employee-connection.html','training-records.html','assistant.html?room=build']){
  assert.equal(destination(page),'/apps/sop-foundry/employee-app.html');
  assert.equal(destination(page,'build'),'/apps/sop-foundry/'+page);
 }
});
test('unlock rejects external and unlisted return destinations',()=>{
 for(const next of ['https://other.test/apps/sop-foundry/staff-sops.html','//other.test/staff-sops.html','javascript:alert(1)','../../admin.html'])
  assert.equal(destination(next),'/apps/sop-foundry/employee-app.html');
});
