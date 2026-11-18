'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const {TextEncoder,TextDecoder}=require('node:util');
const source=fs.readFileSync('site/assets/js/gravity-cloud-vault-v1.js','utf8');
const begin=source.indexOf('const bytesToBase64=b=>');
const end=source.indexOf('function currentData()',begin);
if(begin<0||end<=begin)throw Error('Cloud backup encryption functions not found');
const cryptoSource=source.slice(begin,end);
function browser(phrase){
 const ctx={passphrase:phrase,enc:new TextEncoder(),dec:new TextDecoder(),crypto:webcrypto,TextEncoder,TextDecoder,btoa,atob,Uint8Array,JSON,Error};
 vm.runInNewContext(cryptoSource,ctx,{timeout:1000});
 return ctx;
}

test('Actual browser encryption performs AES-GCM/PBKDF2 round-trip without sending plaintext',async()=>{
 const ctx=browser('SYNTHETIC-RECOVERY-PASSPHRASE-1234');
 const original={schema:1,tool:'inventory',keys:['{"schemaVersion":1,"items":[{"id":"synthetic"}],"locations":[]}']};
 const envelope=await ctx.encrypt(original);
 assert.equal(envelope.alg,'AES-256-GCM');
 assert.equal(envelope.kdf,'PBKDF2-SHA256');
 assert.equal(envelope.iterations,310000);
 assert.equal(envelope.version,1);
 assert.equal(Object.keys(envelope).sort().join(','),'alg,ciphertext,iterations,iv,kdf,salt,version');
 assert.doesNotMatch(JSON.stringify(envelope),/synthetic|SYNTHETIC-RECOVERY/i);
 const decrypted=await ctx.decrypt(envelope);
 assert.deepEqual(JSON.parse(JSON.stringify(decrypted)),original);
});

test('Incorrect recovery passphrase and modified ciphertext cannot decrypt',async()=>{
 const ctx=browser('SYNTHETIC-VALID-PASSPHRASE-12345');
 const envelope=await ctx.encrypt({schema:1,tool:'shift',keys:['synthetic-profile','synthetic-schedule']});
 ctx.passphrase='A-DIFFERENT-SYNTHETIC-PASSPHRASE';
 await assert.rejects(ctx.decrypt(envelope));
 ctx.passphrase='SYNTHETIC-VALID-PASSPHRASE-12345';
 const changed={...envelope,ciphertext:(envelope.ciphertext.startsWith('A')?'B':'A')+envelope.ciphertext.slice(1)};
 await assert.rejects(ctx.decrypt(changed));
 assert.equal((await ctx.decrypt(envelope)).tool,'shift');
});

test('Unknown backup envelope version and insufficient encryption work factor are rejected',async()=>{
 const ctx=browser('SYNTHETIC-VALID-PASSPHRASE-12345');
 const envelope=await ctx.encrypt({schema:1,tool:'inventory',keys:['safe']});
 await assert.rejects(ctx.decrypt({...envelope,version:99}),/Unsupported encrypted backup/);
 await assert.rejects(ctx.decrypt({...envelope,iterations:1000}),/Unsupported encrypted backup/);
});
