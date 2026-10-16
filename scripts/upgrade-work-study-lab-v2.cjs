'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'site','gravity-work-study-lab.html');
let html=fs.readFileSync(file,'utf8');
const css='<link href="/assets/css/gravity-work-study-v2.css?v=20261015-code-v2" rel="stylesheet"/>';
if(!html.includes('gravity-work-study-v2.css')) html=html.replace('</head>',css+'</head>');
const start=html.indexOf('<section class="ws-hero">');
const handoff=html.indexOf('<section aria-label="Use this work in another Gravity Assist tool"');
if(start<0||handoff<0||handoff<=start) throw new Error('Could not locate Work Study Lab content boundary.');
const app='<section class="section" id="work-study"><div id="ws2-app"></div></section>';
html=html.slice(0,start)+app+html.slice(handoff);
html=html.replace(/<script src="\/assets\/js\/gravity-work-study\.js\?v=[^"]+"><\/script>/,'<script src="/assets/js/gravity-work-study-v2.js?v=20261015-code-v2"></script>');
if(!html.includes('gravity-work-study-v2.js')){
  html=html.replace('</body>','<script src="/assets/js/gravity-work-study-v2.js?v=20261015-code-v2"></script></body>');
}
const guided='<script src="/assets/js/gravity-work-study-guided-v3.js?v=20261016-guided-development"></script>';
if(!html.includes('gravity-work-study-guided-v3.js')) html=html.replace('</body>',guided+'</body>');
html=html.replace('Time restaurant work, study motion and bottlenecks, establish standard minutes, compare methods, and verify productivity.','Conduct restaurant work studies with guided or independent modes, demand verification, live observation, evidence-based results, SOP contributions, and continuous improvement memory.');
fs.writeFileSync(file,html);
console.log('Upgraded Gravity Work Study Lab with Code-driven v2 and Guided Development layer.');
