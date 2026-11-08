'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const target=path.resolve(__dirname,'../scripts/netlify-ignore-preview.cjs');
function run(context,branch,override){
 const env={...process.env,CONTEXT:context,BRANCH:branch,GRAVITY_ENABLE_PREVIEW_BUILD:override||''};
 const result=spawnSync(process.execPath,[target],{env,encoding:'utf8'});
 assert.equal(result.signal,null,result.stderr);
 return result;
}
test('Normal PR preview is skipped before invoking expensive build',()=>{
 const r=run('deploy-preview','audit/repair-branch');
 assert.equal(r.status,0);assert.match(r.stdout,/skipping automatic/);
});
test('Non-audit PR preview is also skipped by default',()=>{
 assert.equal(run('deploy-preview','feature/new-tool').status,0);
});
test('Audit branch deploy is skipped',()=>{
 assert.equal(run('branch-deploy','audit/repair-branch').status,0);
});
test('Explicit preview opt in is available for acceptance testing',()=>{
 const r=run('deploy-preview','audit/repair-branch','1');assert.equal(r.status,1);assert.match(r.stdout,/continuing/);
});
test('Production build always continues on the existing Gravity branch',()=>{
 assert.equal(run('production','feature/gravity-migration-phase1-2026-10-22').status,1);
});
test('Missing context and normal non-audit branch deploy do not prevent builds',()=>{
 assert.equal(run('','').status,1);
 assert.equal(run('branch-deploy','release/review').status,1);
});
