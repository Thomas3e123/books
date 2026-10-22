'use strict';
/**
 * Controlled migration preview only. Never run this against the TMB production
 * branch: it intentionally changes URLs and inserts an unmistakable test banner.
 * Source data, employee records and function credentials are not touched.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const oldOrigin = 'https://thomasmonroebooks.com';
const newOrigin = 'https://gravityleadershipsystem.com';
const email = 'thomas.butler@gravityleadershipsystem.com';
const banner = '<div id="gravity-migration-preview-notice" role="note" style="position:relative;z-index:9999;background:#611818;color:#fff;text-align:center;padding:13px 18px;font:600 14px/1.5 Arial,sans-serif">GRAVITY MIGRATION PREVIEW — THIS IS NOT THE LIVE CUSTOMER SITE. Use <a style="color:#fff;text-decoration:underline" href="https://thomasmonroebooks.com/">the current Gravity website</a> for registrations, downloads and employee access.</div>';
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
    html = html.split(oldOrigin).join(newOrigin);
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
    // Never permit a staging copy to appear as another live customer destination.
    if (!html.includes('gravity-migration-preview-notice')) {
      const updated = html.replace(/(<body\b[^>]*>)/i, '$1' + banner);
      if (updated === html) throw new Error('No <body> in ' + file);
      html = updated;
    }
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
