'use strict';
/**
 * Controlled migration preview only. Never run this against the TMB production
 * branch: it changes staging URLs and enforces noindex without an obstructive banner.
 * Source data, employee records and function credentials are not touched.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const oldOrigin = 'https://thomasmonroebooks.com';
// While the custom domain is NOT connected, all staging links must stay on the working preview host.
// Do not route customers or metadata at the unavailable future domain.
const newOrigin = 'https://gravity-leadership-system.netlify.app';
const email = 'thomas.butler@gravityleadershipsystem.com';
let htmlCount = 0;
let replacedIdentities = 0;
let modifiedCount = 0;
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { visit(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = fs.readFileSync(file, 'utf8');
    const before = html;
    htmlCount++;
    // Every page uses the same current Ask Gravity implementation and cache-busting version.
    // Updating only index.html left secondary pages loading the old voice experience.
    html = html.replace(/(gravity-guide-ai\.js\?v=)[^"'\\s<>]+/g, '$1' + '20261025-cedar-prereply-3');
    html = html.replace(/(<script\b[^>]*id=["']gravity-business-identity["'][^>]*>)([\s\S]*?)(<\/script>)/g, (_, open, body, close) => {
      const data = JSON.parse(body);
      if (!Array.isArray(data['@graph'])) throw new Error('Missing identity graph in ' + file);
      for (const node of data['@graph']) {
        if (node['@type'] === 'Organization') {
          node.name = 'The Gravity Restaurant Leadership System';
          node.url = newOrigin + '/';
          node.email = email;
          if (node.contactPoint) node.contactPoint.email = email;
        }
        if (node['@type'] === 'WebSite') node.name = 'Gravity | The Restaurant Leadership System';
        if (node['@type'] === 'Person' && node.name === 'Thomas Butler')
          node.description = 'Founder of The Gravity Restaurant Leadership System and author whose books are published through Thomas Monroe Books. More than three decades of restaurant-industry experience.';
      }
      replacedIdentities++;
      return open + JSON.stringify(data) + close;
    });
    // Normalize URLs written by an earlier staging pass as well as untouched TMB URLs.
    // This keeps repeat runs idempotent and avoids broken links to the not-yet-connected permanent domain.
    html = html.split('https://gravityleadershipsystem.com').join(newOrigin).split(oldOrigin).join(newOrigin);
    html = html.replace(/<small>Published by Thomas Monroe Books<\/small>/g, '<small>Restaurant Leadership &amp; Operations</small>');
    html = html.replace(/<strong>Published by Thomas Monroe Books<\/strong>/g, '<strong>Books published by Thomas Monroe Books</strong>');
    html = html.replace(/<div class="eyebrow">Published by Thomas Monroe Books<\/div>/g, '<div class="eyebrow">The Gravity Restaurant Leadership System</div>');
    html = html.replace(/Thomas Monroe Books is the publisher; The Gravity System is the/g, 'Thomas Monroe Books publishes the books; The Gravity System is the');
    if (entry.name === 'contact.html') {
      html = html.replace(/Contact Thomas Monroe Books/g, 'Contact Gravity');
      html = html.replace(/Email Thomas Monroe Books/g, 'Email Gravity');
      html = html.replace(/Thomas%20Monroe%20Books%20Inquiry/g, 'Gravity%20Business%20Inquiry');
      html = html.replace(/thomas3e@gmail\.com/g, email);
    }
    if (entry.name === 'gravity-report.html')
      html = html.replace(/Thomas Monroe Books · Written by Thomas Butler/g, 'The Gravity System · Written by Thomas Butler');
    // Remove obsolete fixed red preview banner; staging remains noindex via meta, headers and robots.txt.
    html = html.replace(/<div id="gravity-migration-preview-notice"[\s\S]*?<\/div>/g, '');
    // Legacy Work Room preview had a second CSS/script banner repair block.
    html = html.replace(/<style id="gravity-preview-banner-repair">[\s\S]*?<\/style>\s*<script>document\.addEventListener\('DOMContentLoaded',[\s\S]*?<\/script>/g, '');
    if (!html.includes('name="robots" content="noindex,nofollow"')) {
      html = html.replace(/(<head\b[^>]*>)/i, '$1\n<meta name="robots" content="noindex,nofollow"/>\n');
    }
    if (html !== before) {
      fs.writeFileSync(file, html);
      modifiedCount++;
    }
  }
}
visit(site);
const {ensureMenus,auditMenus}=require('./gravity-navigation-consistency.cjs');
const menuReport=ensureMenus(site);
auditMenus(site);
console.log('Gravity menu coverage: '+JSON.stringify(menuReport));
const headersPath = path.join(site, '_headers');
let headers = fs.readFileSync(headersPath, 'utf8');
if (!headers.includes('X-Robots-Tag: noindex, nofollow')) {
  headers = headers.replace(/^\/\*\s*$/m, '/*\n  X-Robots-Tag: noindex, nofollow');
  fs.writeFileSync(headersPath, headers);
}
fs.writeFileSync(path.join(site, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
const sitemap = path.join(site, 'sitemap.xml');
if (fs.existsSync(sitemap))
  fs.writeFileSync(sitemap, fs.readFileSync(sitemap, 'utf8').split(oldOrigin).join(newOrigin));
console.log(JSON.stringify({mode:'STAGING-ONLY, NO CUSTOMER OR DNS CHANGES',pages:htmlCount,changedPages:modifiedCount,structuredIdentities:replacedIdentities,host:newOrigin},null,2));
if (htmlCount < 100 || replacedIdentities < 70) throw new Error('Unexpectedly incomplete source; preview rejected.');
