'use strict';
/**
 * Update the Thomas Monroe Books publisher credit on the independent Gravity
 * site. This script touches only site/*.html (including nested public tools).
 * It does not edit the original publisher's source or deployment.
 */
const fs = require('node:fs');
const path = require('node:path');
const site = path.resolve(__dirname, '..', 'site');
const desired = '© 2026 Thomas Monroe Books. Publisher of The Gravity System and publisher and editor of The Gravity Report. All rights reserved.';
const oldFooter = /(?:©|&copy;|&#169;|&#x[aA]9;)\s*2026\s+Thomas Monroe Books\.\s*(?:Publisher of The Gravity System\.\s*)?All\s+rights reserved\./g;
let scanned = 0, filesChanged = 0, creditsUpdated = 0;
function walk(dir) {
  for(const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir,entry.name);
    if(entry.isDirectory()) {walk(full);continue;}
    if(!entry.name.endsWith('.html')) continue;
    scanned++;
    const input = fs.readFileSync(full,'utf8');
    let matches = 0;
    const updated = input.replace(oldFooter, () => {matches++; return desired;});
    if(matches) {
      fs.writeFileSync(full,updated);
      filesChanged++;
      creditsUpdated+=matches;
    }
  }
}
walk(site);
if(scanned<100) throw Error('Unexpectedly small Gravity site: '+scanned+' HTML pages');
if(creditsUpdated===0) {
  // A rerun after successful installation is allowed, but only if the new
  // credit is already present on the homepage.
  const home=fs.readFileSync(path.join(site,'index.html'),'utf8');
  if(!home.includes(desired))throw Error('Original footer not found; no change made');
}
const home=fs.readFileSync(path.join(site,'index.html'),'utf8');
if(!home.includes(desired))throw Error('Homepage missing expected copyright and editorial credit');
console.log('GRAVITY_FOOTER_CREDIT',{scanned,filesChanged,creditsUpdated,desired});
