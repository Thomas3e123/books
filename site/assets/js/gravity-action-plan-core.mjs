// Shared browser/server rules. These are draft working aids, not approved SOPs.
export const topics = {
 closing:{name:'Closing work left unfinished',system:'Daily Operations & Shift Control',source:'restaurant-closing-checklist',workspace:'/gravity-sop-foundry',workspaceName:'Gravity SOP Foundry',tools:['Closing verification checklist','Manager Log','Open-item handoff record'],checks:['List the closing results required by the current approved restaurant procedure.','Walk the relevant stations and inspect results before marking work complete.','Record unfinished work, the reason, temporary control, next owner, and deadline.','Have the incoming manager read and acknowledge the handoff.'],measure:'Count unfinished closing items and whether each has an owner, deadline, and verified closure.'},
 handoff:{name:'Handoffs losing important information',system:'Daily Operations & Shift Control',source:'restaurant-shift-handoff-checklist',workspace:'/gravity-document-studio',workspaceName:'Gravity Document Studio',tools:['Manager Log','Owner-and-deadline handoff record','Weekly exception review'],checks:['Record what changed from the normal standard.','For each open issue, record the decision, temporary control, owner, deadline, and closure evidence.','Have the incoming manager read, ask questions, and acknowledge receipt.','Carry unresolved items forward until verified closed.'],measure:'Count open items without ownership or deadlines, repeated issues, and verified closures.'},
 training:{name:'Training is not showing up in performance',system:'SOP and training control — manager to confirm owning system',source:'restaurant-sop-training-retraining-guide',workspace:'/gravity-sop-foundry',workspaceName:'Gravity SOP Foundry',tools:['Current-revision training plan','Observed-practice checklist','Retraining and verification record'],checks:['Identify the current approved SOP revision and the task employees need to perform.','Demonstrate the work, allow practice, and observe the result.','Record acknowledgment, training completion, and qualification separately.','Investigate unclear standards, equipment, and conflicting instructions before drawing conclusions about people.'],measure:'Record observed performance against the approved procedure and the support or retraining still needed.'},
 inventory:{name:'Inventory counts do not match',system:'Food Cost, Waste & Inventory Control — manager to confirm owning system',source:'restaurant-inventory-count-variance-backup-guide',workspace:'/gravity-inventory-center',workspaceName:'Gravity Inventory Center',tools:['Physical-count verification record','Variance investigation log','Backup and recovery check'],checks:['Preserve the prior system balance and record the physical count.','Check units, receiving, transfers, waste, duplicates, skipped areas, and entry errors.','Record the correction reason without erasing transaction history.','Back up before major changes and verify the recovery path.'],measure:'Track repeated item/location variances, verified causes, correction records, and recovery readiness.'},
 labor:{name:'Labor coverage and cost need attention',system:'Labor & Workforce Control',source:'restaurant-labor-cost-control',workspace:'/gravity-shift-lab',workspaceName:'Gravity Shift Lab',tools:['Workload and skill-coverage plan','Scheduled-versus-actual review','Labor and service checkpoint record'],checks:['Review forecasted demand, workload, and required skill coverage.','Compare scheduled and actual hours and defined labor dollars.','Review overtime, training, call-outs, service outcomes, and unusual conditions together.','Document the reason for material staffing changes; the manager makes the decision.'],measure:'Review hours, defined labor dollars, service results, and coverage together; set restaurant-specific targets.'}
};
export function validateInput(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Enter a restaurant problem.');
 const out={};
 for(const [key,max] of Object.entries({problem:1800,owner:100,restaurant:120,baseline:600,goal:600,context:1200})){
  if(raw[key]!==undefined&&typeof raw[key]!=='string')throw Error('Invalid '+key+'.');
  out[key]=(raw[key]||'').trim();if(out[key].length>max)throw Error(key+' is too long.');
 }
 if(out.problem.length<15)throw Error('Describe the repeated problem in at least 15 characters.');
 if(!out.owner)throw Error('Assign an accountable owner or role.');
 if(!topics[raw.topic])throw Error('Choose a supported problem area.');out.topic=raw.topic;
 if(!['30','60'].includes(raw.pace))throw Error('Choose the 30-day or 60-day path.');out.pace=raw.pace;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw.start||''))throw Error('Choose a valid start date.');
 const date=new Date(raw.start+'T12:00:00Z');if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==raw.start)throw Error('Choose a valid start date.');out.start=raw.start;
 return out;
}
export function dateAt(start,day){const d=new Date(start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+day-1);return d.toISOString().slice(0,10)}
export function reviews(input){const guided=input.pace==='60';return [
 {day:7,label:'First-week review',purpose:'Check whether the tools are usable and records reflect what happened.'},
 {day:30,label:guided?'Day 30 midpoint correction':'Day 30 final installation decision',purpose:guided?'Correct the method and training before broader execution.':'Review evidence and choose keep, change, retire, or expand.'},
 ...(guided?[{day:60,label:'Day 60 final installation decision',purpose:'Review evidence and choose keep, change, retire, or expand.'}]:[])
 ].map(r=>({...r,date:dateAt(input.start,r.day)}));}
export function createTemplate(input){const t=topics[input.topic],guided=input.pace==='60';return {
 title:t.name+' — action plan',objective:input.goal||'Define the restaurant-specific result before the pilot; do not invent a numerical target.',
 assumptions:['This is a draft adapted from public Gravity guidance; the restaurant’s approved procedures still control.',...(input.baseline?[]:['A verified baseline has not been supplied. Measure it before claiming improvement.'])],
 questions:['Which approved procedure or standard governs this task?','What evidence will show the correction held under a busy shift?'],
 steps:[{timing:guided?'Days 1–10':'Days 1–5',action:'Measure and define: '+input.problem,evidence:input.baseline||'Record actual conditions and a baseline; separate facts from assumptions.'},
 {timing:guided?'Days 11–30':'Days 6–10',action:'Prepare the three working aids, confirm the standard, demonstrate the work, and pilot it with the team.',evidence:'Record training, observed practice, questions, and corrections.'},
 {timing:guided?'Days 31–46':'Days 11–20',action:'Use the aids on live shifts. '+t.checks[1],evidence:'The owner reviews completed records and follows open items to closure.'},
 {timing:guided?'Days 47–54':'Days 21–27',action:'Test the method during representative busy conditions; correct repeated problems with the team.',evidence:'Record what held, what failed, the cause supported by evidence, and the correction.'},
 {timing:guided?'Days 55–60':'Days 28–30',action:'Compare with the baseline and make the final keep/change/retire/expand decision.',evidence:t.measure}],
 checklist:t.checks,training:['Explain the approved standard and show the current procedure.','Demonstrate, let the employee practice, and observe the actual work.','Record what was demonstrated and what still needs support; receipt is not proof of competence.'],
 measure:input.baseline?'Compare the supplied baseline with later observations: '+t.measure:t.measure
 };}
export const planSchema={type:'object',additionalProperties:false,required:['title','objective','assumptions','questions','steps','checklist','training','measure'],properties:{
 title:{type:'string'},objective:{type:'string'},measure:{type:'string'},
 ...Object.fromEntries(['assumptions','questions','checklist','training'].map(k=>[k,{type:'array',items:{type:'string'}}])),
 steps:{type:'array',items:{type:'object',additionalProperties:false,required:['timing','action','evidence'],properties:{timing:{type:'string'},action:{type:'string'},evidence:{type:'string'}}}}
}};
export function validatePlan(plan){
 if(!plan||typeof plan!=='object')throw Error('Invalid plan.');
 for(const k of ['title','objective','measure'])if(typeof plan[k]!=='string'||!plan[k].trim()||plan[k].length>2400)throw Error('Invalid '+k+'.');
 for(const k of ['assumptions','questions','checklist','training'])if(!Array.isArray(plan[k])||plan[k].length<1||plan[k].length>10||plan[k].some(x=>typeof x!=='string'||!x.trim()||x.length>1600))throw Error('Invalid '+k+'.');
 if(!Array.isArray(plan.steps)||plan.steps.length<3||plan.steps.length>8)throw Error('Invalid steps.');
 for(const s of plan.steps)for(const k of ['timing','action','evidence'])if(typeof s[k]!=='string'||!s[k].trim()||s[k].length>1800)throw Error('Invalid step.');
 return plan;
}
