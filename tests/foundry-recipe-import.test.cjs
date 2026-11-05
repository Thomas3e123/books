const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};vm.runInNewContext(fs.readFileSync('site/apps/sop-foundry/recipe-import.js','utf8').replaceAll('export function','function')+'\nthis.prepare=prepareRecipes;this.csv=parseCSV;',context);
const recipe={title:'Audit drink',type:'bar',ingredients:['Water — 100 mL'],steps:['Stir'],buildType:'Build over ice; stir twice',glassware:'200 mL glass'};
test('JSON and repeated normalization preserve bar method and glassware',()=>{const once=context.prepare({recipes:[recipe]});const twice=context.prepare(once);assert.equal(twice[0].buildType,recipe.buildType);assert.equal(twice[0].glassware,recipe.glassware)});
test('CSV lowercase headers and repeat normalization preserve build method',()=>{const rows=context.csv('title,type,ingredients,steps,buildType\nAudit drink,bar,Water,Stir,Build over ice\n');assert.equal(context.prepare(context.prepare(rows))[0].buildType,'Build over ice')});
test('invalid methods and duplicate records are rejected before import',()=>{assert.throws(()=>context.prepare([{...recipe,buildType:{bad:true}}]),/must be text/);assert.throws(()=>context.prepare([recipe,recipe]),/Duplicate recipe/)});
