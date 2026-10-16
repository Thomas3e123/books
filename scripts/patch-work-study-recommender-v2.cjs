'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const files=[
  path.join(root,'site','assets','js','gravity-work-study-v2.js'),
  path.join(root,'site','assets','js','gravity-work-study-guided-v3.js')
];
const replacements=[
  {
    file:files[0],
    re:/function recommendMethod\(\)\{const t=\(s\.problem\+' '\+s\.desired\)\.toLowerCase\(\);.*?return'cycle'\}/,
    out:"function recommendMethod(){const t=(s.problem+' '+s.desired).toLowerCase();if(/dish|rack|wash|wares|bus tub|dish machine/.test(t))return'dish';if(/prep|batch|yield|portion|label|mise en place/.test(t))return'prep';if(/walk|motion|reach|travel|layout|bend|searching/.test(t))return'motion';if(/setup|opening|changeover|ready|closing setup/.test(t))return'setup';if(/before|after|change|improv|compare/.test(t))return'beforeafter';if(/guest|table turn|service cycle|order to table|payment|expo|server handoff/.test(t))return'service';if(/bottleneck|constraint|limiting point|starved|blocked/.test(t))return'bottleneck';if(/sampling|activity mix|percentage of time|work sampling/.test(t))return'sampling';if(/backup|queue|behind|capacity|throughput|rush|tickets|orders|volume/.test(t))return'flow';return'cycle'}"
  },
  {
    file:files[1],
    re:/function recommendMethod\(s\)\{const t=\(\(s\?\.problem\|\|''\)\+' '\+\(s\?\.desired\|\|''\)\)\.toLowerCase\(\);.*?return'cycle'\}/,
    out:"function recommendMethod(s){const t=((s?.problem||'')+' '+(s?.desired||'')).toLowerCase();if(/dish|rack|wash|wares|bus tub|dish machine/.test(t))return'dish';if(/prep|batch|yield|portion|label|mise en place/.test(t))return'prep';if(/walk|motion|reach|travel|layout|bend|searching/.test(t))return'motion';if(/setup|opening|changeover|ready|closing setup/.test(t))return'setup';if(/before|after|change|improv|compare/.test(t))return'beforeafter';if(/guest|table turn|service cycle|order to table|payment|expo|server handoff/.test(t))return'service';if(/bottleneck|constraint|limiting point|starved|blocked/.test(t))return'bottleneck';if(/sampling|activity mix|percentage of time|work sampling/.test(t))return'sampling';if(/backup|queue|behind|capacity|throughput|rush|tickets|orders|volume/.test(t))return'flow';return'cycle'}"
  }
];
for(const x of replacements){
  let js=fs.readFileSync(x.file,'utf8');
  if(js.includes(x.out)){console.log(path.basename(x.file)+' recommender already current.');continue;}
  if(!x.re.test(js)) throw new Error('Could not locate recommender in '+x.file);
  js=js.replace(x.re,x.out);
  fs.writeFileSync(x.file,js);
  console.log('Updated restaurant method classification in '+path.basename(x.file));
}
