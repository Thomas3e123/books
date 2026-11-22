const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

test('404 page assets resolve from nested missing URLs', () => {
  const root = resolve(__dirname, '../site');
  const html = readFileSync(resolve(root, '404.html'), 'utf8');
  const nestedUrl = 'https://gravityleadershipsystem.com/missing/another/page/';
  const references = html.matchAll(/\b(?:src|href)="([^"]*assets\/[^"]+)"/g);
  let count = 0;
  for (const [, reference] of references) {
    const asset = new URL(reference, nestedUrl);
    assert.ok(asset.pathname.startsWith('/assets/'), reference);
    assert.ok(existsSync(resolve(root, '.' + asset.pathname)), reference);
    count++;
  }
  assert.ok(count > 0, 'Expected recovery-page assets');
});
