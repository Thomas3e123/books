// Post-release production smoke test. Four public GET requests, no private data.
const base='https://gravityleadershipsystem.com';
const checks=[
 {path:'/help-center',name:'Help Center printing FAQ',require:['How do I print a Gravity PDF, Word file, or form?','For printing Gravity files']},
 {path:'/assets/js/page-search.js',name:'Search relevance and FAQ titles',require:['relevance(entry)','matches.sort','el.matches(\'details\')']},
 {path:'/apps/sop-foundry/staff-sops.js',name:'Employee SOP detail follows search selection',require:['keepSelectionInResults','keepSelectionInResults(matching)','renderList();detail();']},
 {path:'/apps/inventory-center/assets/js/inventory-center.js',name:'Inventory history searches item category and vendor',require:['itemById(x.itemId)?.category','itemById(x.itemId)?.vendor','labelType(x.type)']}
];
const results=[];
for(const c of checks){
 try{
  const r=await fetch(base+c.path,{cache:'no-store',signal:AbortSignal.timeout(14000)});
  const body=await r.text();
  const missing=c.require.filter(x=>!body.includes(x));
  results.push({name:c.name,path:c.path,status:r.status,passed:r.status===200&&!missing.length,missingMarkers:missing,bodyBytes:body.length});
 }catch(e){results.push({name:c.name,path:c.path,passed:false,error:String(e.name||e)})}
}
console.log('GRAVITY_DEPLOYED_SEARCH_FIXES '+JSON.stringify({runAt:new Date().toISOString(),checks:results.length,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results}));
if(results.some(x=>!x.passed))process.exitCode=1;
