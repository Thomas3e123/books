'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'site','gravity-work-study-lab.html');
let html=fs.readFileSync(file,'utf8');

const css='<link href="/assets/css/gravity-work-study-v2.css?v=20261016-rich-guided" rel="stylesheet"/>';
if(!html.includes('gravity-work-study-v2.css')) html=html.replace('</head>',css+'</head>');
else html=html.replace(/\/assets\/css\/gravity-work-study-v2\.css\?v=[^"]+/,'/assets/css/gravity-work-study-v2.css?v=20261016-rich-guided');

// Upgrade the legacy Work Study body only when it is still present. The script is
// intentionally safe to rerun after the v2 shell has already been installed.
if(!html.includes('id="ws2-app"')){
  const start=html.indexOf('<section class="ws-hero">');
  const handoff=html.indexOf('<section aria-label="Use this work in another Gravity Assist tool"');
  if(start<0||handoff<0||handoff<=start) throw new Error('Could not locate either the current Work Study shell or the legacy content boundary.');
  const app='<section class="section" id="work-study"><div id="ws2-app"></div></section>';
  html=html.slice(0,start)+app+html.slice(handoff);
}

html=html.replace(/<script src="\/assets\/js\/gravity-work-study\.js\?v=[^"]+"><\/script>/,'<script src="/assets/js/gravity-work-study-v2.js?v=20261015-code-v2"></script>');
if(!html.includes('gravity-work-study-v2.js')) html=html.replace('</body>','<script src="/assets/js/gravity-work-study-v2.js?v=20261015-code-v2"></script></body>');

const guided='<script src="/assets/js/gravity-work-study-guided-v3.js?v=20261016-fully-guided-v4"></script>';
if(!html.includes('gravity-work-study-guided-v3.js')) html=html.replace('</body>',guided+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-guided-v3\.js\?v=[^"]+/,'/assets/js/gravity-work-study-guided-v3.js?v=20261016-fully-guided-v4');

html=html.replace('Time restaurant work, study motion and bottlenecks, establish standard minutes, compare methods, and verify productivity.','Conduct restaurant work studies with fully guided, assisted, independent, or passive modes, evidence checks, live observation, Gravity Results Review, development coaching, SOP contributions, and continuous improvement memory.');
fs.writeFileSync(file,html);
console.log('Work Study Lab fully guided development and rich theme are installed and current.');
