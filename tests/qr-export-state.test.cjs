const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('QR output is invalidated on edits, invalid input, reset, and stale PNG callbacks',()=>{
 const nodes={},callbacks=[],revoked=[];let counter=0;
 function el(id){return nodes[id]??={value:id==='qr-size'?'1024':'M',dataset:{},hidden:false,handlers:{},addEventListener(k,f){this.handlers[k]=f},removeAttribute(k){delete this[k]},focus(){}}}
 el('qr-canvas').toBlob=cb=>callbacks.push(cb);
 const src=fs.readFileSync('site/assets/js/gravity-qr.js','utf8');
 vm.runInNewContext(src.slice(src.indexOf('function setup(){'),src.indexOf("if(document.readyState==='loading')"))+'setup();',{
 document:{getElementById:el,querySelectorAll:()=>[]},window:{location:{search:''}},URLSearchParams,URL:{createObjectURL:()=>`blob:${++counter}`,revokeObjectURL:u=>revoked.push(u)},Blob,console,
 renderCanvas:()=>({moduleCount:33,pixels:984}),renderSvg:()=>'<svg/>',safeName:()=> 'audit.png',setTimeout:()=>1,clearTimeout(){}});
 const submit=()=>el('qr-form').handlers.submit({preventDefault(){}});
 el('qr-text').value='first';submit();callbacks.shift()(new Blob(['png']));assert.equal(el('qr-download').hidden,false);assert.match(el('qr-download').href,/^blob:/);
 el('qr-text').value='x'.repeat(1801);submit();assert.equal(el('qr-download').hidden,true);assert.equal(el('qr-canvas').hidden,true);assert.equal(el('qr-download').href,undefined);assert.ok(revoked.length);
 el('qr-text').value='second';submit();const stale=callbacks.shift();el('qr-text').handlers.input();stale(new Blob(['png']));assert.equal(el('qr-download').hidden,true);
 el('qr-reset').handlers.click();assert.equal(el('qr-text').value,'');assert.equal(el('qr-download-svg').hidden,true);
});
