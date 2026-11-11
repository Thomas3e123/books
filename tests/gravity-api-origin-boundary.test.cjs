'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sources=[
  ['functions/gravity-guide/guide-core.mjs','allowedOrigins'],
  ['functions/gravity-tts/core.cjs','allowedOrigins'],
  ['functions/testing-room/index.mjs','allowedOrigins'],
  ['functions/work-study-transcribe/core.cjs','allowed']
];
test('Gravity-only API origins do not expose the legacy publishing domain',()=>{
 for(const [file,variable] of sources){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  const line=text.split('\n').find(s=>s.startsWith('const '+variable+'=new Set('));
  assert.ok(line,file+' must retain a reviewed origin allowlist');
  const match=line.match(/new Set\((\[[^;]+\])\)/);
  assert.ok(match,file+' allowed origin array changed structure');
  const values=vm.runInNewContext(match[1]);
  assert.ok(Array.isArray(values));
  const origins=new Set(values);
  assert.ok(origins.has('https://gravityleadershipsystem.com'),file+' must keep primary Gravity');
  assert.ok(origins.has('https://www.gravityleadershipsystem.com'),file+' must keep www Gravity');
  assert.ok(!origins.has('https://thomasmonroebooks.com'),file+' must not allow TMB');
  assert.ok(!origins.has('https://www.thomasmonroebooks.com'),file+' must not allow www TMB');
  assert.ok([...origins].every(o=>o.startsWith('https://')),file+' cannot allow insecure HTTP');
 }
});
test('Testing Room rejects arbitrary third-party Netlify origins',()=>{
 const source=fs.readFileSync(path.join(root,'functions/testing-room/index.mjs'),'utf8');
 assert.match(source,/function cors\(req\)\{const o=req\.headers\.get\('origin'\)\|\|'';return !o\|\|allowedOrigins\.has\(o\)\}/);
 assert.doesNotMatch(source,/endsWith\(['"]\.netlify\.app['"]\)/);
 assert.doesNotMatch(source,/Access-Control-Allow-Origin[^\n]*thomasmonroebooks/i);
});
test('Other Gravity APIs retain actual origin enforcement',()=>{
 for(const file of ['functions/gravity-guide/guide-core.mjs','functions/gravity-tts/core.cjs','functions/work-study-transcribe/core.cjs']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(source,/Origin not allowed/,file+' must deny unknown origins');
 }
});
