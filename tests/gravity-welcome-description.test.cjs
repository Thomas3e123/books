const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('old guide bookmarks redirect to the homepage and retain campaign parameters', async () => {
  const html = fs.readFileSync(path.join(__dirname, '../site/index.html'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, '../netlify/edge-functions/home-welcome-description.js'), 'utf8');
  const { default: handle } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const home = 'https://gravityleadershipsystem.com/';
  const next = () => new Response(html, {headers: {'Content-Type': 'text/html', 'ETag': 'home'}});
  for (const query of ['', '?welcome=0', '?utm_source=test']) {
    assert.equal(await handle(new Request(home + query), {next}), undefined);
  }
  const response = await handle(new Request(home + '?utm_source=test&welcome=1'), {next});
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), home + '?utm_source=test#welcome');
});
