'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'build/gravity-production');
function read(page){return fs.readFileSync(path.join(site,page),'utf8')}
test('production descriptions match the published 350-prompt workbook',()=>{
 const index=JSON.parse(read('assets/data/restaurant-ai-prompts-350.json'));
 assert.equal(index.length,350);
 for(const page of ['index.html','about.html','knowledge-center.html','free-resources.html','releases.html','gravity-document-studio.html']){
  const html=read(page);
  assert.doesNotMatch(html,/(?:currently contains|current controlled edition now contains)\s+(?:250|325)\s+prompts/i,page);
  assert.doesNotMatch(html,/Search (?:250|325) Prompts/i,page);
 }
 assert.match(read('knowledge-center.html'),/350 prompts connect the systems/);
 assert.match(read('free-resources.html'),/350 practical copy-and-paste prompts/);
 assert.match(read('releases.html'),/current controlled edition now contains 350 prompts/);
 assert.match(read('releases.html'),/215 prompts/,'historical release milestone must remain unchanged');
 assert.match(read('index.html'),/Search 350 Prompts/);
});
test('Gravity production canonical domain remains correct and page access unchanged',()=>{
 assert.match(read('index.html'),/https:\/\/gravityleadershipsystem\.com\//);
 assert.doesNotMatch(read('index.html'),/https:\/\/gravity-leadership-system\.netlify\.app/);
 assert.match(read('handbook-creator/index.html'),/name="robots" content="noindex,nofollow"/);
});
