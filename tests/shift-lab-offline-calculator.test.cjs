const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('the Shift Lab worker serves its labor calculator after installation when offline', async () => {
  const site = path.join(__dirname, '../site');
  const worker = fs.readFileSync(path.join(site, 'gravity-shift-lab-sw.js'), 'utf8');
  const enginePath = '/assets/js/gravity-labor-cost-engine.js';
  const engineSource = fs.readFileSync(path.join(site, enginePath), 'utf8');
  const origin = 'https://gravityleadershipsystem.com';
  const callbacks = {};
  const installed = new Map();
  const cache = {
    async addAll(paths) {
      for (const asset of paths) installed.set(asset, asset === enginePath ? engineSource : '');
    },
    async match(request, options) {
      const url = new URL(request.url);
      return installed.get(url.pathname + (options.ignoreSearch ? '' : url.search));
    }
  };
  vm.runInNewContext(worker, {
    self: {
      location: { origin },
      addEventListener(name, callback) { callbacks[name] = callback; },
      skipWaiting() {}
    },
    caches: { open: async () => cache },
    fetch: async () => { throw new Error('offline'); },
    URL, Response
  });
  let installation;
  callbacks.install({ waitUntil(promise) { installation = promise; } });
  await installation;
  let response;
  callbacks.fetch({
    request: { method: 'GET', url: origin + enginePath + '?v=release' },
    respondWith(promise) { response = promise; }
  });
  assert.equal(typeof response?.then, 'function', 'worker must handle the calculator request');
  assert.equal(await response, engineSource);
});
