'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'source-manifest.json'), 'utf8'));
let checked = 0;
for (const entry of manifest.files) {
  if (entry.path.includes('..') || path.isAbsolute(entry.path)) throw Error('Unsafe manifest path');
  const data = fs.readFileSync(path.join(root, entry.path));
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  if (hash !== entry.sha256) throw Error('Source verification failed: ' + entry.path + '. Review the change and regenerate the manifest before building.');
  checked++;
}
for (const required of ['site/index.html','site/_redirects','site/_headers','functions/foundry-hosted/index.mjs','functions/gravity-guide/gravity-guide.js','functions/gravity-tts/gravity-tts.js']) {
  if (!manifest.files.some(e => e.path === required)) throw Error('Missing required source: ' + required);
}
console.log('Verified ' + checked + ' source files.');
