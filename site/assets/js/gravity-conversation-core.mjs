// Shared limits and record rules. No automatic decisions or external writes.
export const VERSION=1;
export const MAX_MESSAGES=40;
const str=(v,max,label)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid '+label+'.');return v.trim()};
export function validateInput(raw){
 if(!raw||!Array.isArray(raw.messages)||raw.messages.length<1||raw.messages.length>MAX_MESSAGES)throw Error('Keep this test to 40 messages. Download the history before starting another investigation.');
 const ids=new Set();const messages=raw.messages.map(m=>{if(!m||!['user','assistant'].includes(m.role))throw Error('Invalid message.');const id=str(m.id,80,'message ID');if(!id||ids.has(id))throw Error('Invalid message ID.');ids.add(id);const text=str(m.text,6000,'message');if(!text)throw Error('Write what happened.');return {id,role:m.role,text,correction:m.correction===true}});
 if(messages.at(-1).role!=='user')throw Error('A new account is needed.');
 if(messages.reduce((n,m)=>n+m.text.length,0)>22000)throw Error('This conversation is too long for one test. Download the record before starting another investigation.');
 return {messages};
}
export const responseSchema={type:'object',additionalProperties:false,required:['reply','question','steps','record','form'],properties:{
 reply:{type:'string'},question:{type:'string'},
 steps:{type:'array',items:{type:'object',additionalProperties:false,required:['action','who','when','bringBack'],properties:Object.fromEntries(['action','who','when','bringBack'].map(k=>[k,{type:'string'}]))}},
 record:{type:'array',items:{type:'object',additionalProperties:false,required:['kind','text','sourceId'],properties:{kind:{type:'string',enum:['reported','hypothesis','evidence-described','correction']},text:{type:'string'},sourceId:{type:'string'}}}},
 form:{type:'string',enum:['none','guestrecovery','waste','managerhandoff']}
}};
export function validateResponse(raw,input){
 if(!raw||typeof raw!=='object')throw Error('No usable answer.');
 const reply=str(raw.reply,3000,'reply'),question=str(raw.question,600,'question');if(!reply&&!question)throw Error('Empty answer.');
 if(!Array.isArray(raw.steps)||raw.steps.length>4||!Array.isArray(raw.record)||raw.record.length>8)throw Error('Answer too long.');
 const steps=raw.steps.map(s=>Object.fromEntries(['action','who','when','bringBack'].map(k=>[k,str(s[k],1000,k)])));
 if(steps.some(s=>!s.action||!s.who||!s.when||!s.bringBack))throw Error('Incomplete next step.');
 const ids=new Set(input.messages.filter(m=>m.role==='user').map(m=>m.id));
 const record=raw.record.map(r=>{if(!['reported','hypothesis','evidence-described','correction'].includes(r.kind)||!ids.has(r.sourceId))throw Error('Untraceable record.');const source=input.messages.find(m=>m.role==='user'&&m.id===r.sourceId);return {kind:r.kind,text:source.text,summary:str(r.summary??r.text,1600,'working summary'),sourceId:r.sourceId}});
 if(record.some(r=>!r.text)||!['none','guestrecovery','waste','managerhandoff'].includes(raw.form))throw Error('Invalid record or form.');
 return {reply,question,steps,record,form:raw.form};
}
export function newCase(){return {version:VERSION,messages:[],record:[],tasks:[],forms:{},verification:null,history:[],savedAt:null}}
export function addAnswer(current,input,response,now=new Date().toISOString()){
 const answer=validateResponse(response,input);const next=structuredClone(current);
 next.messages=structuredClone(input.messages).map(m=>{const old=current.messages.find(x=>x.id===m.id&&x.text===m.text);return old?.answer?{...m,answer:structuredClone(old.answer)}:m});const text=[answer.reply,...answer.steps.map((s,i)=>`${i+1}. ${s.action}\nWho: ${s.who}\nWhen: ${s.when}\nBring back: ${s.bringBack}`),answer.question].filter(Boolean).join('\n\n');
 next.messages.push({id:'a-'+input.messages.at(-1).id,role:'assistant',text,answer});
 for(const row of answer.record){if(!next.record.some(r=>r.kind===row.kind&&r.text===row.text&&r.sourceId===row.sourceId))next.record.push({...row,at:now})}
 next.tasks=answer.steps;next.suggestedForm=answer.form;
 if(next.verification&&(input.messages.at(-1).correction||answer.record.length||answer.steps.length)){next.history.push({at:now,type:'verification-reopened',previous:next.verification});next.verification=null}
 next.history.push({at:now,type:input.messages.at(-1).correction?'corrected-account':'conversation-update',sourceId:input.messages.at(-1).id});
 return next;
}
export function recordVerification(current,raw,now=new Date().toISOString()){
 const next=structuredClone(current);const v=Object.fromEntries(['who','before','after','how','followup'].map(k=>[k,str(raw[k],2000,k)]));
 if(Object.values(v).some(x=>!x))throw Error('Complete each check, including how the result was checked.');
 if(!next.messages.length)throw Error('Start an investigation first.');
 const text='Manager-recorded verification — not an independent inspection by Gravity:\n'+Object.entries(v).map(([k,value])=>k+': '+value).join('\n');
 if(text.length>6000||next.messages.length>=MAX_MESSAGES-1)throw Error('Save the current history first. Keep the verification account under 6,000 characters and within this test’s message limit.');
 next.messages.push({id:'v-'+now,role:'user',text,correction:false});
 next.verification={...v,at:now};next.history.push({at:now,type:'manager-recorded-verification',details:v});return next;
}
export function validateBackup(raw){
 if(!raw||raw.version!==VERSION||!Array.isArray(raw.messages)||!Array.isArray(raw.record)||!Array.isArray(raw.history)||!Array.isArray(raw.tasks)||typeof raw.forms!=='object'||!raw.forms)throw Error('Not a conversation backup.');
 if(raw.messages.length>MAX_MESSAGES+1||raw.record.length>200||raw.history.length>200||raw.tasks.length>4)throw Error('Backup is too large.');
 for(const m of raw.messages){str(m.id,80,'message ID');str(m.text,6000,'message');if(!['user','assistant'].includes(m.role))throw Error('Invalid message.');if(m.answer){const upTo=raw.messages.slice(0,raw.messages.indexOf(m));validateResponse(m.answer,{messages:upTo})}}
 for(const r of raw.record){if(!['reported','hypothesis','evidence-described','correction'].includes(r.kind)||!raw.messages.some(m=>m.role==='user'&&m.id===r.sourceId))throw Error('Invalid record.');str(r.text,6000,'record');if(r.summary!==undefined)str(r.summary,1600,'working summary');}
 for(const task of raw.tasks)for(const k of ['action','who','when','bringBack'])str(task[k],1000,'task');
 if(raw.verification)for(const k of ['who','before','after','how','followup'])if(!str(raw.verification[k],2000,k))throw Error('Invalid verification.');
 for(const [key,value] of Object.entries(raw.forms)){if(!['guestrecovery','waste','managerhandoff'].includes(key)||!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid form.');for(const v of Object.values(value))str(v,5000,'form field')}
 const next=structuredClone(raw);next.record=next.record.map(r=>{const original=next.messages.find(m=>m.role==='user'&&m.id===r.sourceId);return {...r,summary:r.summary??r.text,text:original.text}});return next;
}
export function csvCell(value){const s=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replaceAll('"','""')+'"'}
