const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('site/apps/sop-foundry/staff-recipes.js','utf8').replace(/^import .*\n/,'').split('async function load()')[0];
function read(search,hash='',legacy=false){
 const nodes={};const get=id=>nodes[id]??={value:'',innerHTML:'',setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]}};
 const records=[{id:'food',type:'food',title:'First food',ingredients:[],steps:[]},{id:'bar',type:'bar',title:'Selected drink',ingredients:['150 mL soda'],steps:['Stir'],[legacy?'glassware':'serviceware']:'250 mL <glass>'}];
 vm.runInNewContext(source+'\nrecipes=records;render();',{document:{getElementById:get},location:{search,hash},URLSearchParams,window:{},records});return nodes;
}
test('legacy query selects the actual bar recipe and renders Build Room glassware safely',()=>{const n=read('?open=bar');assert.match(n.detail.innerHTML,/Selected drink/);assert.doesNotMatch(n.detail.innerHTML,/First food/);assert.match(n.detail.innerHTML,/250 mL &lt;glass&gt;/);assert.equal(n.barLink['aria-current'],'page');assert.equal(n.foodLink['aria-current'],undefined)});
test('hash selection takes precedence, legacy glassware works, and missing recipes never show another recipe',()=>{assert.match(read('?open=food','#bar',true).detail.innerHTML,/Selected drink/);assert.match(read('?open=missing').detail.innerHTML,/Recipe unavailable/);assert.doesNotMatch(read('?open=missing').detail.innerHTML,/First food/);assert.match(read('').detail.innerHTML,/First food/)});
