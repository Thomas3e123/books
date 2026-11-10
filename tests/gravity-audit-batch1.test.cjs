'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
test('Gravity Guide registries match the current 350-prompt search data',()=>{
  const context={window:{}};
  vm.runInNewContext(read('site/assets/js/gravity-guide-registry.js'),context);
  const embedded=JSON.parse(JSON.stringify(context.window.__GRAVITY_GUIDE_REGISTRY__));
  const json=JSON.parse(read('site/gravity-guide-registry-v2.json'));
  const prompts=JSON.parse(read('site/assets/data/restaurant-ai-prompts-350.json'));
  assert.deepEqual(embedded,json,'JavaScript and JSON registry copies must stay aligned');
  assert.equal(prompts.length,350);
  assert.equal(embedded.facts.ai_prompt_count,prompts.length);
  for(const id of ['intelligence-ai','restaurant-ai-prompt-search']){
    const resource=embedded.resources.find(r=>r.id===id);
    assert(resource,'Missing '+id);
    assert.equal(resource.facts.current_prompt_count,prompts.length);
  }
  const search=embedded.resources.find(r=>r.id==='restaurant-ai-prompt-search');
  assert.match(search.name,/350/);
  assert.match(search.purpose,/350/);
  assert.equal(embedded.intents.find(i=>i.id==='ai_prompts').action,'Search 350 AI Prompts');
});
test('Testing Room installs only one automatic 15-second conversation refresh',()=>{
  const html=read('site/testing-room.html');
  const timer='setInterval(()=>{if(token){loadMessages();if(activeGroup)loadGroupThread()}},15000);';
  assert.equal(html.split(timer).length-1,1);
});
