'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const base=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-v2.js'),'utf8');
const guided=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-guided-v3.js'),'utf8');
const expert=fs.readFileSync(path.join(root,'site','assets','js','gravity-work-study-expert-v5.js'),'utf8');

function extractBody(src,start,end){const a=src.indexOf(start);if(a<0)throw new Error('Missing '+start);const b=src.indexOf(end,a);if(b<0)throw new Error('Missing '+end);return src.slice(a+start.length,b)}
function runBase(problem,desired=''){
  const body=extractBody(base,'function recommendMethod(){','}\nfunction screenMethod');
  return Function('s',body)({problem,desired});
}
function runGuided(problem,desired=''){
  const body=extractBody(guided,'function recommendMethod(s){','}\nfunction demandMatters');
  return Function('s',body)({problem,desired});
}

const scenarios=[
  // Flow / capacity
  ['Pizza tickets back up Friday nights and throughput cannot keep up with rush volume','flow'],
  ['Orders arrive in bursts and the oven cannot keep up even though the make line is ready','flow'],
  ['Lunch tickets queue at the grill and completed sides wait for entrees','flow'],
  ['Drive-thru orders are stacking faster than the kitchen can produce them','flow'],

  // Dish room
  ['The dish machine is always buried in racks and clean wares pile up before return','dish'],
  ['Bus tubs hit the dish room in bursts and racks wait to enter the machine','dish'],
  ['Clean plates are ready but sit in sorting because nobody returns them to the line','dish'],

  // Prep
  ['Prep batches of diced onions take too long and yield varies by batch','prep'],
  ['We portion sauce in batches and interruptions make the prep run late','prep'],
  ['Chicken prep has too much setup cleanup and label time for each batch','prep'],

  // Motion / layout
  ['Cook walks across the line repeatedly for cheese and tools because the layout is poor','motion'],
  ['The server makes repeated trips for silverware and condiments during every table setup','motion'],
  ['The fry cook keeps turning and reaching behind the station for high-use supplies','motion'],

  // Setup / changeover
  ['Opening setup is late because the station is not ready when service starts','setup'],
  ['Shift change takes too long because the incoming cook waits for tools and stocked pans','setup'],
  ['Closing setup for the next morning is inconsistent and key items are left unfinished','setup'],

  // Before / after verification — must beat incidental layout/motion words
  ['We changed the line layout and need a before and after comparison','beforeafter'],
  ['After moving the cheese closer we want to compare the old and new method fairly','beforeafter'],
  ['We added a second fryer and need to verify whether throughput actually improved','beforeafter'],
  ['Compare performance before and after changing the dish return route','beforeafter'],

  // Service cycle
  ['Guests wait too long from order entry through expo and table delivery','service'],
  ['Table turns are slow from seating through payment even when the kitchen is on time','service'],
  ['Orders stall between expo and server pickup before reaching the guest','service'],
  ['Payment and checkout are extending the guest service cycle at dinner','service'],

  // Bottleneck
  ['The fryer appears to be the bottleneck and may be the limiting point','bottleneck'],
  ['The pizza oven is continuously loaded while finished pizzas wait for box and cut','bottleneck'],
  ['The grill is the suspected constraint but I need to prove whether it actually limits the system','bottleneck'],
  ['A single register looks like the limiting point during the lunch rush','bottleneck'],

  // Work sampling — explicit study intent must beat words like walking/waiting
  ['I need a work sampling study of productive work, walking, waiting, and interruptions','sampling'],
  ['What percentage of the shift is spent cooking waiting replenishing and cleaning','sampling'],
  ['Use activity sampling to see how often the prep cook is producing versus waiting or searching','sampling'],

  // Repeated cycles / individual-task complaints
  ['How long does it take to make one burger repeatedly under normal conditions','cycle'],
  ['A manager says this employee is too slow at wrapping sandwiches; measure repeated sandwich wrap cycles before blaming the employee','cycle'],
  ['Measure repeated ticket-entry cycles at the register under comparable orders','cycle'],
  ['Time repeated dough stretching cycles and compare normal variation','cycle']
];

let failures=[];
for(const [problem,expected] of scenarios){
  const a=runBase(problem),b=runGuided(problem);
  if(a!==expected)failures.push(`Base recommender: expected ${expected}, got ${a} for: ${problem}`);
  if(b!==expected)failures.push(`Guided recommender: expected ${expected}, got ${b} for: ${problem}`);
}

for(const method of ['flow','cycle','motion','bottleneck','sampling','prep','dish','service','setup','beforeafter','custom']){
  if(!expert.includes(method+':{')) failures.push('Expert path missing for '+method);
}
for(const token of ['alternative','cause']){if(!expert.includes(token))failures.push('Expert layer missing reasoning token: '+token)}
if(!base.includes("guardrails:{quality:'',safety:''}")) failures.push('Core study engine is missing quality/safety guardrails.');

// Expert-questioning coverage should explicitly protect against common restaurant-study mistakes.
const requiredExpertIdeas=[
  ['dish','arrival'],['dish','machine'],['dish','return'],
  ['prep','yield'],['prep','downstream'],
  ['motion','travel'],['motion','location'],
  ['bottleneck','starved'],['bottleneck','blocked'],
  ['service','handoff'],['service','waitpoint'],
  ['beforeafter','comparable'],['beforeafter','tradeoff'],
  ['sampling','representative']
];
for(const [method,token] of requiredExpertIdeas){
  const start=expert.indexOf(method+':{');
  const next=expert.indexOf('\n',start);
  if(start<0 || !expert.slice(start,next>start?next:expert.length).includes(token)) failures.push(`Expert path ${method} is missing ${token} coverage.`);
}

// The system must preserve safety/quality and evidence discipline regardless of method.
for(const phrase of ['study work before blaming worker','quality','safety','Inconclusive','Standard Not Supported']){
  if(!base.toLowerCase().includes(phrase.toLowerCase()) && !guided.toLowerCase().includes(phrase.toLowerCase())) failures.push(`Work Study engine is missing safeguard concept: ${phrase}`);
}

if(failures.length){console.error('Work Study restaurant stress suite FAILED');for(const f of failures)console.error('- '+f);process.exit(1)}
console.log(`Work Study restaurant stress suite passed ${scenarios.length} scenario classifications plus expert-path, evidence, quality, safety, and anti-blame safeguards.`);
