const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('Guide routes specific resources before broad categories',()=>{
 const s=fs.readFileSync('site/assets/js/gravity-guide-ai.js','utf8');
 const ctx={};vm.runInNewContext(s.slice(s.indexOf('const direct='),s.indexOf('function navIntent'))+';this.routes=direct;',ctx);
 for(const [q,url] of [['Open SOP Library','/gravity-sop-library-set'],['Create a handbook','/gravity-handbook-creator'],['Open AI prompts','/restaurant-ai-prompt-search'],['Build an SOP','/gravity-sop-foundry'],['Open inventory','/gravity-inventory-center']]) assert.equal(ctx.routes.find(([re])=>re.test(q))[2],url,q);
});
test('Guide prompt count matches active search dataset',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('site/assets/js/gravity-guide-registry.js','utf8'),ctx);
 assert.equal(ctx.window.__GRAVITY_GUIDE_REGISTRY__.facts.ai_prompt_count,JSON.parse(fs.readFileSync('site/assets/data/restaurant-ai-prompts-350.json')).length);
});
test('Production indexing changes do not remove preview safeguards',()=>{
 assert.match(fs.readFileSync('site/robots.txt','utf8'),/Disallow: \/\s/);
 assert.match(fs.readFileSync('build/gravity-production/robots.txt','utf8'),/Allow: \/\s/);
 const publicPage=fs.readFileSync('build/gravity-production/index.html','utf8');
 assert.match(publicPage,/name="robots" content="index,follow/);
 assert.doesNotMatch(publicPage,/gravity-leadership-system\.netlify\.app|noindex/);
 assert.match(fs.readFileSync('build/gravity-production/testing-room-manager.html','utf8'),/name="robots" content="noindex,nofollow"/);
});

test('Production Guide URL changes with the actual script content',()=>{
 const hash=require('node:crypto').createHash('sha256').update(fs.readFileSync('site/assets/js/gravity-guide-ai.js')).digest('hex').slice(0,16);
 assert(fs.readFileSync('build/gravity-production/index.html','utf8').includes('gravity-guide-ai.js?v='+hash));
});
