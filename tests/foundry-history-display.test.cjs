const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('history displays and searches both stored archive formats without grouping unrelated documents',async()=>{
 const root={innerHTML:''},search={value:''};
 const history=[
  {kind:'sop',item:{id:'a',title:'Alpha SOP',revision:'1.0',steps:['Original <step>']},note:'Edited',archivedAt:'2026-11-05'},
  {kind:'sop',item:{id:'b',title:'Beta SOP',revision:'2.0',steps:['Different step']},archivedAt:'2026-11-05'},
  {kind:'poster',documentId:'c',title:'Legacy poster',revision:'3.0',reason:'Replaced',snapshot:{title:'Legacy poster',lines:'Original poster'}}
 ];
 vm.runInNewContext(fs.readFileSync('site/apps/sop-foundry/history.js','utf8'),{document:{getElementById:id=>id==='content'?root:search},fetch:async()=>({ok:true,json:async()=>({history})})});
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(root.innerHTML,/Alpha SOP/);assert.match(root.innerHTML,/Beta SOP/);
 assert.match(root.innerHTML,/Revision 1.0/);assert.match(root.innerHTML,/Original &lt;step&gt;/);
 assert.match(root.innerHTML,/Legacy poster/);assert.match(root.innerHTML,/Original poster/);
 assert.equal((root.innerHTML.match(/1 archived version\(s\)/g)||[]).length,3);
 search.value='alpha';search.oninput();assert.match(root.innerHTML,/Alpha SOP/);assert.doesNotMatch(root.innerHTML,/Beta SOP|Legacy poster/);
});
