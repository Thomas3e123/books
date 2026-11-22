const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('welcome metadata changes only for the explicit guide request', async () => {
  const html = fs.readFileSync(path.join(__dirname, '../site/index.html'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, '../netlify/edge-functions/home-welcome-description.js'), 'utf8');
  const { default: handle } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const home = 'https://gravityleadershipsystem.com/';
  const next = () => new Response(html, {headers: {'Content-Type': 'text/html', 'ETag': 'home'}});
  for (const query of ['', '?welcome=0', '?utm_source=test']) {
    assert.equal(await handle(new Request(home + query), {next}), undefined);
  }
  const response = await handle(new Request(home + '?utm_source=test&welcome=1'), {next});
  const guide = await response.text();
  const descriptions = page => [...page.matchAll(/<meta content="([^"]*)" (?:name|property)="(?:description|og:description|twitter:description)"/g)].map(match => match[1]);
  assert.equal(descriptions(html).length, 3);
  assert.equal(descriptions(guide).length, 3);
  assert.equal(new Set(descriptions(guide)).size, 1);
  assert.match(descriptions(guide)[0], /welcome guide/);
  assert.equal(guide.replaceAll(descriptions(guide)[0], descriptions(html)[0]), html);
  assert.equal(response.headers.get('etag'), null);
});
