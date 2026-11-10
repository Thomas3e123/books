'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

test('Modern Gravity Guide preserves public health route and declares per-IP platform limit', async () => {
  const module = await import(pathToFileURL(path.resolve('functions/gravity-guide/gravity-guide.mjs')).href);
  const {config} = module;
  assert.equal(typeof module.default, 'function');
  assert.deepEqual(JSON.parse(JSON.stringify(config.rateLimit)), {
    action: 'rate_limit',
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  });
  const res = await module.default(new Request('https://gravityleadershipsystem.com/.netlify/functions/gravity-guide'));
  assert.equal(res.status, 200);
  assert.match(res.headers.get('Cache-Control') || '', /no-store/);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.function, 'gravity-guide');
});

test('Modern Gravity Guide preserves POST answer and normalizes response headers without paid requests', async () => {
  const before = global.fetch, old = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'synthetic-key';
  let providerCalls = 0;
  global.fetch = async () => {
    providerCalls++;
    return new Response(JSON.stringify({output_text: 'Synthetic answer'}), {headers:{'Content-Type':'application/json'}});
  };
  try {
    const module = await import(pathToFileURL(path.resolve('functions/gravity-guide/gravity-guide.mjs')).href);
    const request = (origin, question) => new Request('https://gravityleadershipsystem.com/.netlify/functions/gravity-guide', {
      method:'POST', headers:{origin, 'Content-Type':'application/json'}, body:JSON.stringify({question})
    });
    const denied = await module.default(request('https://untrusted.netlify.app', 'Hello'));
    assert.equal(denied.status, 403);
    assert.equal(providerCalls, 0);
    const good = await module.default(request('https://gravityleadershipsystem.com', 'Where is Gravity Shift Lab?'));
    assert.equal(good.status, 200);
    assert.equal((await good.json()).answer, 'Synthetic answer');
    assert.match(good.headers.get('Cache-Control'), /no-store/);
    assert.equal(providerCalls, 1);
  } finally {
    global.fetch = before;
    if(old === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = old;
  }
});

test('Guide modern wrapper retains safe error behavior', async () => {
  const before = global.fetch, old = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'synthetic-key';
  global.fetch = async () => { throw new Error('synthetic provider outage'); };
  try {
    const module = await import(pathToFileURL(path.resolve('functions/gravity-guide/gravity-guide.mjs')).href);
    const response = await module.default(new Request('https://gravityleadershipsystem.com/.netlify/functions/gravity-guide', {
      method:'POST', headers:{origin:'https://gravityleadershipsystem.com', 'Content-Type':'application/json'}, body:JSON.stringify({question:'Help'})
    }));
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /temporarily unavailable/);
  } finally {
    global.fetch = before;
    if(old === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = old;
  }
});
