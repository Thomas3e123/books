// Run with: node --test tests/gravity-quick-tools.test.cjs
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../site');
const js=fs.readFileSync(path.join(root,'assets/js/gravity-quick-tools.js'),'utf8');
const aware=fs.readFileSync(path.join(root,'gravity-aware.html'),'utf8');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('Four Gravity tools and buttons exist',()=>{for(const id of ['systems','food','sop','plan']){assert.match(js,new RegExp('\\b'+id+':\\{'));assert.ok(aware.includes('data-gravity-tool="'+id+'"'));}});
test('Homepage directs visitors to native Gravity Aware',()=>{assert.ok(home.includes('/gravity-aware#gravity-quick-tools'));assert.ok(aware.includes('id="gravity-quick-tools"'));assert.ok(aware.includes('/assets/js/gravity-quick-tools.js'));});
test('Muse references absent from affected pages',()=>{assert.ok(!home.includes('muse.ai'));assert.ok(!aware.includes('muse.ai'));assert.ok(!js.includes('muse.ai'));});
test('Existing 20-question assessment preserved',()=>{assert.equal((aware.match(/class="aware-question"/g)||[]).length,20);assert.ok(aware.includes('id="aware-form"'));assert.ok(aware.includes('id="gravity-quick-form"'));});
test('Unknown and needs-review states are handled distinctly',()=>{assert.ok(js.includes('pick.score===2'));assert.ok(js.includes('pick.score===0'));assert.ok(js.includes('b.score===1?2'));});
test('No answer submission or persistence in native tool',()=>{assert.ok(!/\\bfetch\\s*\\(|XMLHttpRequest|localStorage|sessionStorage/.test(js));});
test('Results contain owner, deadline, proof, and internal resource links',()=>{assert.ok(js.includes('Owner: ____ Deadline: ____ Proof: ____'));assert.ok(js.includes('Open relevant Gravity resources'));});
test('30-day plan is explicitly not validated',()=>{assert.ok(js.includes('not yet validated against your operation'));});
