const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('site/apps/sop-foundry/import-export.js','utf8');

async function setup(sops=[]) {
  const nodes = new Map(), writes = [];
  const get = id => {
    if (!nodes.has(id)) nodes.set(id,{addEventListener(event,fn) {this[event]=fn}, value:''});
    return nodes.get(id);
  };
  const env = {TextEncoder,TextDecoder,crypto:require('node:crypto').webcrypto,structuredClone,window:{},
    document:{getElementById:get,addEventListener(){},querySelectorAll:()=>[]},
    fetch:async(_,options)=>{
      if(options.method==='PUT'){
        if(writes.length===0){writes.push(null);throw Error('offline')}
        writes.push(JSON.parse(options.body));
      }
      return {ok:true,json:async()=>({data:{sops}})};
    }};
  vm.runInNewContext(source,env);
  await new Promise(resolve=>setImmediate(resolve));
  return {get,writes,api:env.window.GravityFoundryImportTest};
}

test('Text and exported column names preserve training requirements and responsible role',async()=>{
  const {api}=await setup();
  assert.equal(api.parseText('Title: Close\nTraining: Competency\nSteps: Clean station').trainingRequirement,'competency');
  const [sop]=api.fromJson([{title:'Close',role:'Lead',trainingRequirement:'review',steps:['Clean station']}],'CSV columns');
  assert.equal(sop.role,'Lead');
  assert.equal(sop.trainingRequirement,'review');
});

test('An unconfirmed save keeps the pasted SOP available for retry',async()=>{
  const {get,writes}=await setup();
  get('pasteText').value='Title: Close\nSteps: Clean station\nTraining: Competency';
  get('parsePaste').onclick();
  await get('saveSelected').onclick();
  assert.match(get('status').textContent,/could not be confirmed/);
  assert.match(get('queue').innerHTML,/Close/);
  await get('saveSelected').onclick();
  assert.equal(writes[1].sops.length,1);
  assert.equal(writes[1].sops[0].trainingRequirement,'competency');
  assert.equal(writes[1].sops[0].status,'Draft');
  assert.match(get('status').textContent,/1 working draft\(s\) saved/);
  assert.match(get('queue').innerHTML,/No SOPs are waiting/);
});

test('Skip survives a queue redraw and sends no workroom update for skipped duplicates',async()=>{
  const {get,writes}=await setup([{id:'original',title:'Close',station:'Kitchen',steps:['Original step']}]);
  const queue=get('queue');
  get('pasteText').value='Title: Close\nStation: Kitchen\nSteps: New step';
  get('parsePaste').onclick();
  const card={dataset:{id:queue.innerHTML.match(/data-id="([^"]+)"/)[1]},
    querySelector(selector){
      return {checked:true,value:{title:'Close',station:'Kitchen',text:'',duplicate:'skip'}[selector.slice(12,-1)]};
    }};
  queue.change({target:{closest:()=>card}});
  // Adding another candidate forces the existing card to be rendered again.
  get('pasteText').value='Title: Close\nStation: Kitchen\nSteps: Another step';
  get('parsePaste').onclick();
  assert.match(queue.innerHTML,/<option value="skip" selected>/);
  card.dataset.id=[...queue.innerHTML.matchAll(/data-id="([^"]+)"/g)][1][1];
  queue.change({target:{closest:()=>card}});
  await get('saveSelected').onclick();
  assert.equal(writes.length,0);
  assert.match(get('status').textContent,/0 working draft\(s\) saved. 2 matching SOP\(s\) skipped/);
});
