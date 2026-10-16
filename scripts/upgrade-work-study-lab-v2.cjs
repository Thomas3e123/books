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

const scripts=[
 ['gravity-work-study-guided-v3.js','20261016-fully-guided-v4'],
 ['gravity-work-study-expert-v5.js','20261016-restaurant-expert-v1'],
 ['gravity-work-study-expert-reasoning-v7.js','20261016-expert-reasoning-v1'],
 ['gravity-work-study-systems-expert-v10.js','20261016-systems-expert-v1'],
 ['gravity-work-study-sequence-expert-v11.js','20261016-sequence-expert-v1'],
 ['gravity-work-study-guided-welcome-v9.js','20261016-guided-takeover-v1'],
 ['gravity-work-study-guided-interview-v13.js','20261016-guided-interview-v1'],
 ['gravity-work-study-repeatability-expert-v14.js','20261016-repeatability-expert-v2'],
 ['gravity-work-study-hold-expert-v15.js','20261016-hold-expert-v1'],
 ['gravity-work-study-first-timer-v16.js','20261016-first-timer-v1'],
 ['gravity-work-study-observation-coach-v17.js','20261016-observation-coach-v1'],
 ['gravity-work-study-earbud-mode-v18.js','20261016-earbud-mode-v1']
];
for(const [name,ver] of scripts){const tag=`<script src="/assets/js/${name}?v=${ver}"></script>`;if(!html.includes(name))html=html.replace('</body>',tag+'</body>');else html=html.replace(new RegExp('/assets/js/'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\?v=[^\"]+'),`/assets/js/${name}?v=${ver}`)}

html=html.replace(/Conduct restaurant work studies with[^\"]+continuous improvement memory\./,'Conduct restaurant work studies with a one-question-at-a-time fully guided Gravity interview for first-time or experienced managers, discreet Earbud Mode, method-specific observation coaching, restaurant-specific expert questions, cause testing, systems-context checks, constraint-sequence reasoning, repeatability and standardization checks, hold and drift revalidation, evidence checks, live observation, Gravity Results Review, knowledge maturity controls, development coaching, SOP contributions, and continuous improvement memory.');
fs.writeFileSync(file,html);
console.log('Work Study Lab first-timer Guided interview, Earbud Mode, observation coach, expert reasoning, repeatability, hold/drift revalidation, knowledge maturity, and rich theme are installed and current.');
