'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'site','gravity-work-study-lab.html');
let html=fs.readFileSync(file,'utf8');

const css='<link href="/assets/css/gravity-work-study-v2.css?v=20261016-rich-guided" rel="stylesheet"/>';
if(!html.includes('gravity-work-study-v2.css')) html=html.replace('</head>',css+'</head>');
else html=html.replace(/\/assets\/css\/gravity-work-study-v2\.css\?v=[^"]+/,'/assets/css/gravity-work-study-v2.css?v=20261016-rich-guided');

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

const expert='<script src="/assets/js/gravity-work-study-expert-v5.js?v=20261016-restaurant-expert-v1"></script>';
if(!html.includes('gravity-work-study-expert-v5.js')) html=html.replace('</body>',expert+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-expert-v5\.js\?v=[^"]+/,'/assets/js/gravity-work-study-expert-v5.js?v=20261016-restaurant-expert-v1');

const reasoner='<script src="/assets/js/gravity-work-study-expert-reasoning-v7.js?v=20261016-expert-reasoning-v1"></script>';
if(!html.includes('gravity-work-study-expert-reasoning-v7.js')) html=html.replace('</body>',reasoner+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-expert-reasoning-v7\.js\?v=[^"]+/,'/assets/js/gravity-work-study-expert-reasoning-v7.js?v=20261016-expert-reasoning-v1');

const systems='<script src="/assets/js/gravity-work-study-systems-expert-v10.js?v=20261016-systems-expert-v1"></script>';
if(!html.includes('gravity-work-study-systems-expert-v10.js')) html=html.replace('</body>',systems+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-systems-expert-v10\.js\?v=[^"]+/,'/assets/js/gravity-work-study-systems-expert-v10.js?v=20261016-systems-expert-v1');

const sequence='<script src="/assets/js/gravity-work-study-sequence-expert-v11.js?v=20261016-sequence-expert-v1"></script>';
if(!html.includes('gravity-work-study-sequence-expert-v11.js')) html=html.replace('</body>',sequence+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-sequence-expert-v11\.js\?v=[^"]+/,'/assets/js/gravity-work-study-sequence-expert-v11.js?v=20261016-sequence-expert-v1');

const welcome='<script src="/assets/js/gravity-work-study-guided-welcome-v9.js?v=20261016-guided-takeover-v1"></script>';
if(!html.includes('gravity-work-study-guided-welcome-v9.js')) html=html.replace('</body>',welcome+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-guided-welcome-v9\.js\?v=[^"]+/,'/assets/js/gravity-work-study-guided-welcome-v9.js?v=20261016-guided-takeover-v1');

const interview='<script src="/assets/js/gravity-work-study-guided-interview-v13.js?v=20261016-guided-interview-v1"></script>';
if(!html.includes('gravity-work-study-guided-interview-v13.js')) html=html.replace('</body>',interview+'</body>');
else html=html.replace(/\/assets\/js\/gravity-work-study-guided-interview-v13\.js\?v=[^"]+/,'/assets/js/gravity-work-study-guided-interview-v13.js?v=20261016-guided-interview-v1');

html=html.replace(/Conduct restaurant work studies with[^\"]+continuous improvement memory\./,'Conduct restaurant work studies with a one-question-at-a-time fully guided Gravity interview, assisted, independent, or passive modes, restaurant-specific expert questions, method-specific cause testing, systems-context checks, constraint-sequence reasoning, evidence checks, live observation, Gravity Results Review, knowledge maturity controls, development coaching, SOP contributions, and continuous improvement memory.');
fs.writeFileSync(file,html);
console.log('Work Study Lab Guided interview, expert reasoning, systems-context reasoning, constraint-sequence reasoning, knowledge maturity, and rich theme are installed and current.');
