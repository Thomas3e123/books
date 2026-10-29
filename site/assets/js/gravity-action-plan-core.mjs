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
const plainPlans={
 closing:[
 ['Check the work before the closing crew leaves.','The closing manager walks through each station and checks the actual work against your restaurant’s closing list.'],
 ['If something is unfinished, find out why.','Ask the employee to show you what happened. Check whether they understood the task, had enough time, and had working equipment.'],
 ['Show anyone who needs help how to do the task.','Then have them do it while the manager watches. Make sure they can do it before expecting them to handle it alone.'],
 ['Write down anything that must wait until tomorrow.','State what is unfinished, why, who will finish it, and when. Make sure the opening manager receives that information.'],
 ['Keep a simple record for the next week.','Each morning, record which closing tasks were left unfinished. Look for problems that keep happening.'],
 ['After one week, review what happened.','If unfinished work is decreasing, continue checking. If it isn’t, use those records to decide what needs changing.']
 ],
 handoff:[
 ['Write down what the next manager needs to know.','Include unfinished work, equipment problems, and changes that affect the next shift. Use your restaurant’s approved records.'],
 ['Give each unfinished task a person and a deadline.','Write who will finish it and when. Explain what the team should do in the meantime using your approved procedures.'],
 ['Talk through the notes with the next manager.','Ask them to explain what needs doing and raise anything that is unclear.'],
 ['Check whether the work was finished.','The manager responsible checks the actual result before marking the task done. Carry unfinished tasks forward.'],
 ['After one week, check what is still being missed.','Read the shift notes together. Change unclear instructions and follow up on tasks that keep getting missed.']
 ],
 training:[
 ['Choose the task the employee needs help with.','Use the current instructions approved by your restaurant. Check that managers are teaching the same method.'],
 ['Show the employee how to do it.','Explain each step and what finished work should look like. Give them time to ask questions.'],
 ['Let the employee practice while you watch.','Help where needed. Check unclear instructions, equipment, and workload before deciding why something went wrong.'],
 ['Check that they can do the task on their own.','Watch the actual work. Signing a training sheet only confirms receipt; it does not show they can do the job.'],
 ['Check again during the next week.','Write down what they can do and where they still need help. Give more practice where needed.']
 ],
 inventory:[
 ['Count the items again.','Keep the earlier count and system balance. Check that both counts use the same units and include the same storage areas.'],
 ['Check the records for anything missing.','Look at deliveries, waste, transfers, duplicate entries, and items entered under the wrong unit. A difference does not prove theft.'],
 ['Write down what explains the difference.','Separate what you have confirmed from what you still need to check. Ask the manager to review unresolved differences.'],
 ['Save a backup before making major changes.','Use the restaurant’s approved process. Keep the original records and explain each correction.'],
 ['Check the same items at the next count.','See whether the difference happens again. Correct the counting or recording instructions if the same mistakes continue.']
 ],
 labor:[
 ['Check when the restaurant needs help.','Look at expected business, work to finish, and the skills needed at each station.'],
 ['Compare the schedule with what actually happened.','Check hours worked, labor cost, overtime, call-outs, and service problems. Use your restaurant’s agreed cost figures.'],
 ['Find out why coverage did not match the work.','Talk with the shift manager. Consider training, equipment problems, unusual business, and the mix of skills on the shift.'],
 ['Have the manager adjust the next schedule.','Keep the skills and coverage needed to serve guests. Write down what changed and why.'],
 ['After the next week, check the results.','Compare hours and cost with service and workload. Keep changes that help, and correct changes that leave the team unable to do the work.']
 ]
};
const plainTitles={closing:'Stop closing tasks from being marked done when they aren’t finished',handoff:'Make sure the next manager knows what needs doing',training:'Help employees learn the task and do it correctly',inventory:'Find out why inventory counts do not match',labor:'Match staffing to the work that needs doing'};
export function createTemplate(input){const t=topics[input.topic],guided=input.pace==='60';return {
 title:plainTitles[input.topic],objective:input.goal||'Define the restaurant-specific result before the pilot; do not invent a numerical target.',
 assumptions:['This is a draft adapted from public Gravity guidance; the restaurant’s approved procedures still control.',...(input.baseline?[]:['A verified baseline has not been supplied. Measure it before claiming improvement.'])],
 questions:['Which approved procedure or standard governs this task?','What evidence will show the correction held under a busy shift?'],
 steps:plainPlans[input.topic].map(([timing,action])=>({timing,action,evidence:'Check the actual work and keep a short record of what happened.'})),
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
