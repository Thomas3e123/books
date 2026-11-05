const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');

function workspace(){
 const state={workroom:{sops:[],recipes:[]},history:[],publishedRecipes:{}};
 const window={fetch:()=>{throw Error('Unexpected network access');}};
 const source=fs.readFileSync('site/apps/sop-foundry/web-api-shim.js','utf8');
 const context={window,URL,Response,Request,Blob,crypto,structuredClone,location:{origin:'https://audit.test',href:'https://audit.test/apps/sop-foundry/workroom.html'},sessionStorage:{getItem:()=> 'build'},localStorage:{getItem:()=>null},testState:state};
 // Replace persistence only; exercise the real workroom and publish handlers.
 vm.runInNewContext(source.replace(/\}\)\(\);\s*$/, 'statePromise=Promise.resolve(testState);save=async s=>s;})();'),context);
 const request=async(path,method,data)=>{const r=await window.fetch(path,{method,body:JSON.stringify(data)});return {status:r.status,body:await r.json()}};
 return {state,request};
}

test('recipe approval preserves revision and allows deliberate publication; content edits invalidate approval',async()=>{
 const {state,request}=workspace();
 const original={id:'audit-recipe',title:'Audit mixture',type:'food',ingredients:['Water 200 mL'],steps:['Measure water.'],yield:'1 portion',isSample:false,status:'Draft',approvedBy:'',effectiveDate:'',changeSummary:'Initial release'};
 const put=r=>request('/api/workroom','PUT',{sops:[],recipes:[r]});
 await put(original);
 const approved={...structuredClone(state.workroom.recipes[0]),status:'Approved',approvedBy:'Test Manager',effectiveDate:new Date().toISOString().slice(0,10)};
 await put(approved);
 assert.equal(state.workroom.recipes[0].status,'Approved');
 assert.equal(state.workroom.recipes[0].revision,'1.0');
 const published=await request('/api/staff-recipes','POST',{mode:'publish-working',recipes:[state.workroom.recipes[0]]});
 assert.equal(published.status,200);
 await put({...structuredClone(state.workroom.recipes[0]),ingredients:['Water 300 mL']});
 assert.equal(state.workroom.recipes[0].status,'Draft');
 assert.equal(state.workroom.recipes[0].revision,'1.1');
 assert.equal(state.workroom.recipes[0].approvedBy,'');
 assert.equal(state.workroom.recipes[0].effectiveDate,'');
 assert.deepEqual(Array.from(state.publishedRecipes['audit-recipe'].ingredients),['Water 200 mL']);
 assert.equal(state.history[0].item.status,'Approved');
});
