'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../tmb-site');
const pages=['index','books','about','publishing','contact','privacy','terms','404'];
const required=['assets/css/publisher.css','assets/images/tmb-mark.svg','assets/images/quiet-gravity.webp','assets/images/owners-chair.jpg','assets/images/systems-of-service.webp','assets/images/employee-training.webp','assets/images/labor-control.webp','assets/images/sop-builder.webp','assets/images/food-cost.webp','assets/images/author-thomas-butler.webp','_redirects','_headers','robots.txt','sitemap.xml'];
const fail=msg=>{console.error('TMB publisher check failed: '+msg);process.exitCode=1};
for(const f of required){if(!fs.existsSync(path.join(root,f)))fail('Missing asset: '+f)}
for(const slug of pages){const f=path.join(root,slug+'.html');if(!fs.existsSync(f)){fail('Missing page '+slug);continue;}const html=fs.readFileSync(f,'utf8');for(const key of ['Thomas Monroe Books','/assets/css/publisher.css','class="wordmark"','rel="canonical"','<main id="main">']){if(!html.includes(key))fail(slug+' is missing '+key)}if(/class="gravity-welcome|gravity-system-mark\.svg|class="gravity-top|gravity-site-header/.test(html))fail(slug+' is still Gravity styled');if(!html.includes('href="https://gravityleadershipsystem.com"'))fail(slug+' lacks clear external link to the separate Gravity platform');}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');if(!home.includes('Good books')||!home.includes('hero-portrait'))fail('Publisher homepage is not the editorial design');
const books=fs.readFileSync(path.join(root,'books.html'),'utf8');for(const title of ['Quiet Gravity','The Owner','Systems of Service','Employee Training'])if(!books.includes(title))fail('Catalog missing '+title);
const rules=fs.readFileSync(path.join(root,'_redirects'),'utf8');for(const route of ['/gravity-assist ','/gravity-shift-lab ','/book-reader ','/apps/* '])if(!rules.includes(route))fail('Legacy Gravity redirect missing '+route);if(!rules.includes('/* /404.html 404'))fail('Missing branded 404');
if(!process.exitCode)console.log('TMB publishing build verified: '+pages.length+' editorial pages, assets, Gravity redirects and separate branding.');
