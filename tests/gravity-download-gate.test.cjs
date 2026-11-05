const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('site/assets/js/site.js','utf8');
const code=source.slice(source.indexOf('  function isGravityDownloadLink(a) {'),source.indexOf('  // Make the Founding Year promise'));
const ctx={};vm.createContext(ctx);vm.runInContext(code,ctx);
const link=(href,download=false)=>({getAttribute:()=>href,hasAttribute:n=>n==='download'&&download});
test('Generated work stays in its original document for download',()=>{
 assert.equal(ctx.isGravityDownloadLink(link('blob:https://gravityleadershipsystem.com/test',true)),false);
 assert.equal(ctx.isGravityDownloadLink(link('data:text/plain,audit',true)),false);
});
test('Published digital resources still require registration',()=>{
 for(const href of ['/assets/book.pdf','/assets/program.zip','/assets/form.docx','/assets/data.csv'])assert.equal(ctx.isGravityDownloadLink(link(href)),true);
 assert.equal(ctx.isGravityDownloadLink(link('/books')),false);
});
