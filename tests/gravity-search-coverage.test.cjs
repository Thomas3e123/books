const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('public site search finds each primary workspace and quick utility',()=>{
 const source=fs.readFileSync('site/assets/js/site.js','utf8');
 const start=source.indexOf('  var pages=');
 const end=source.indexOf('  var box=',start);
 const ctx={};vm.runInNewContext(source.slice(start,end)+';this.catalog=pages;',ctx);
 for(const [query,url] of [['numbers','/gravity-numbers-lab'],['calculator','/gravity-numbers-lab'],['personalizer','/gravity-forms-personalizer'],['document studio','/gravity-document-studio'],['quick tools','/gravity-quick-tools'],['qr','/qr-code-generator'],['prompt','/restaurant-ai-prompt-search']]){
  const matches=ctx.catalog.filter(p=>(p[0]+' '+p[2]).toLowerCase().includes(query)).slice(0,10);
  assert(matches.some(p=>p[1]===url),query+' must find '+url);
 }
 for(const [,url] of ctx.catalog){
  const {pathname,hash}=new URL(url,'https://gravityleadershipsystem.com');
  const file='site'+(pathname==='/'?'/index':pathname)+'.html';
  assert(fs.existsSync(file),url+' destination page exists');
  if(hash) assert(fs.readFileSync(file,'utf8').includes('id="'+decodeURIComponent(hash.slice(1))+'"'),url+' destination section exists');
 }
});
