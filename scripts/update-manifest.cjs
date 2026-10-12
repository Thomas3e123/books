'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const files = [];
function visit(rel) {
  const full = path.join(root, rel);
  if (fs.lstatSync(full).isSymbolicLink()) throw Error('Symlinks are not supported: ' + rel);
  if (fs.statSync(full).isDirectory()) {
    for (const name of fs.readdirSync(full).sort()) visit(rel + '/' + name);
  } else {
    files.push({path:rel,sha256:crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex')});
  }
}
for (const rel of ['site','functions','netlify','netlify.toml','package.json','package-lock.json']) visit(rel);
fs.writeFileSync(path.join(root,'source-manifest.json'),JSON.stringify({files},null,2)+'\n');
console.log('Recorded ' + files.length + ' reviewed source files.');
