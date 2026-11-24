const {test} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const {execFile} = require('node:child_process');
const exec = require('node:util').promisify(execFile);
for (const name of ['test-gravity-cloud-vault-browser.mjs','test-gravity-recipe-storage-guard.mjs','test-gravity-reader-transport-browser.cjs','test-gravity-reader-continuity-browser.cjs']) {
  test(name, async ({}, info) => {
    test.skip(info.project.name !== 'desktop-chromium');
    test.setTimeout(180000);
    let script = path.resolve('scripts',name);
    if (name.includes('reader-')) {
      const source = fs.readFileSync(script,'utf8').replace(/^const hosts=.*;$/m,"const hosts=['http://127.0.0.1:8765'];");
      script = path.resolve('scripts','.qa-nov19-'+name);
      fs.writeFileSync(script,source);
    }
    try {
      const {stdout} = await exec(process.execPath,[script],{timeout:150000});
      console.log(stdout);
    } catch (err) { console.log(err.stdout); throw err; }
    finally { if (name.includes('reader-')) fs.unlinkSync(script); }
  });
}