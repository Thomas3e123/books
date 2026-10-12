import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

const MAX_SNAPSHOT_BYTES = 5_000_000;
const SESSION_HOURS = 12;
const clip=(v,n=4000)=>String(v??'').trim().slice(0,n);
const now=()=>new Date().toISOString();
const tokenHash=v=>createHash('sha256').update(String(v||'')).digest('hex');
const pinHash=(pin,salt)=>scryptSync(String(pin),String(salt),32).toString('hex');
const safeEq=(a,b)=>{try{return timingSafeEqual(Buffer.from(String(a),'hex'),Buffer.from(String(b),'hex'))}catch{return false}};
const code=()=>Array.from(randomBytes(6),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('').slice(0,6);
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const bearer=req=>String(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
const body=async req=>{try{return await req.json()}catch{return {}}};
const cleanEvent=(d={})=>Object.fromEntries(Object.entries(d).map(([k,v])=>[k,typeof v==='string'?clip(v,4000):v]));
const cleanSnapshot=(raw={})=>({
  restaurantName:clip(raw.restaurantName||raw.restaurant||'Your Restaurant',160),
  branding:{name:clip(raw.branding?.name||raw.restaurantName||'Your Restaurant',160),logo:typeof raw.branding?.logo==='string'?raw.branding.logo.slice(0,2_500_000):''},
  publishedSops:Array.isArray(raw.publishedSops)?raw.publishedSops.slice(0,1200):[],
  publishedRecipes:Array.isArray(raw.publishedRecipes)?raw.publishedRecipes.slice(0,1200):[],
  posters:Array.isArray(raw.posters)?raw.posters.filter(x=>x&&x.status==='Active').slice(0,800):[],
  syncedAt:now()
});
function validateSnapshot(s){const text=JSON.stringify(s);if(Buffer.byteLength(text,'utf8')>MAX_SNAPSHOT_BYTES)throw Object.assign(new Error('The employee snapshot is too large to sync in one request. Export or reduce oversized embedded images and try again.'),{status:413});return s}
function makeOptions(correct,alts){return [...new Set([correct,...alts].map(x=>clip(x,260)).filter(Boolean))].slice(0,4)}
function buildQuiz(s){const clean=x=>String(x??'').replace(/^\s*(?:\d+[.)]|[-•□✓])\s*/,'').trim(),steps=(s.steps||[]).map(clean).filter(Boolean),lines=x=>String(x||'').split(/\r?\n/).map(clean).filter(Boolean);const purpose=clip(s.purpose||'Follow the approved procedure exactly.',260),r=clip(s.role||'The assigned employee completes the procedure and manager verifies it.',260),first=clip(steps[0]||'Start with the first approved procedure step.',260),standard=clip(lines(s.checks)[0]||'Complete the success checks.',260),mistake=clip(lines(s.correction)[0]||'Correct any failed check.',260);return [{id:'purpose',prompt:'Which statement best describes the purpose of this SOP?',correct:purpose,options:makeOptions(purpose,['Skip steps to work faster.','Replace the approved method with preference.'])},{id:'role',prompt:'Who is responsible for completing or verifying this procedure?',correct:r,options:makeOptions(r,['No one needs to verify it.','Any employee may change it without approval.'])},{id:'first-step',prompt:'What should happen first when performing this procedure?',correct:first,options:makeOptions(first,[steps[1],steps[2],'Skip to the final step.'])},{id:'standard',prompt:'Which item is a required standard or success check?',correct:standard,options:makeOptions(standard,[mistake,'Ignore the check if busy.'])},{id:'mistake',prompt:'Which issue should you avoid or correct?',correct:mistake,options:makeOptions(mistake,[standard,'Follow the approved procedure.'])}]}
function employeeSource(snapshot,kind,id){if(kind==='sop')return snapshot.publishedSops.find(x=>x.id===id);return snapshot.publishedRecipes.find(x=>x.id===id)}
function assistantAnswer(source,question){const q=clip(question,2000).toLowerCase();let answer='Use the current published source as the authority. ';if(q.includes('first')||q.includes('start'))answer+=(source.steps?.[0]||source.purpose||'Begin with the first approved step.');else if(q.includes('safety'))answer+=source.safety||'No separate safety note is recorded; ask the manager before improvising.';else if(q.includes('why')||q.includes('purpose'))answer+=source.purpose||source.notes||'Follow the approved procedure as written.';else if(q.includes('check')||q.includes('finish'))answer+=source.checks||'Complete every approved step and verify the expected result.';else answer+=(source.purpose||'Follow the approved source.')+'\n\n'+(source.steps?.slice(0,4).map((x,i)=>`${i+1}. ${x}`).join('\n')||source.notes||'');return answer.replace(/Gravity Signals|signal analytics|development interest|viewing-pattern analysis/gi,'manager review')}
async function managerWorkspace(req,repo){const key=bearer(req);if(!key)return null;return repo.getWorkspaceByManagerHash(tokenHash(key))}
async function staffWorkspace(req,repo){const token=bearer(req);if(!token)return null;const s=await repo.getSession(tokenHash(token));if(!s||new Date(s.expires_at).getTime()<=Date.now())return null;return s}

export function createHostedFoundryHandler(repo){return async function(req){try{const url=new URL(req.url),path=url.pathname.replace(/^\/foundry-hosted\/?/,'');
  if(path==='health'&&req.method==='GET')return json({ok:true,service:'Gravity Foundry Hosted Employee Connection'});
  if(path==='manager/create'&&req.method==='POST'){
    const b=await body(req),pin=String(b.employeePin||'');if(!/^\d{4,12}$/.test(pin)||pin==='0000')return json({error:'Change the Employee Library PIN from the default 0000 before creating hosted employee access.'},400);
    const snapshot=validateSnapshot(cleanSnapshot(b.snapshot||{})),managerKey=randomBytes(32).toString('base64url'),salt=randomBytes(16).toString('hex'),id=randomUUID();let workspaceCode;
    for(let i=0;i<5;i++){workspaceCode=code();if(!(await repo.getWorkspaceByCode(workspaceCode)))break}
    await repo.createWorkspace({id,code:workspaceCode,restaurant_name:snapshot.restaurantName,manager_key_hash:tokenHash(managerKey),employee_pin_salt:salt,employee_pin_hash:pinHash(pin,salt),snapshot});
    return json({ok:true,workspaceCode,managerKey,restaurantName:snapshot.restaurantName,syncedAt:snapshot.syncedAt},201);
  }
  if(path==='manager/sync'&&req.method==='POST'){
    const w=await managerWorkspace(req,repo);if(!w)return json({error:'Hosted manager connection is not authorized.'},401);const b=await body(req),snapshot=validateSnapshot(cleanSnapshot(b.snapshot||{})),patch={restaurant_name:snapshot.restaurantName,snapshot};
    if(b.employeePin!==undefined){const pin=String(b.employeePin||'');if(!/^\d{4,12}$/.test(pin)||pin==='0000')return json({error:'Use a non-default 4–12 digit Employee Library PIN before syncing.'},400);const salt=randomBytes(16).toString('hex');patch.employee_pin_salt=salt;patch.employee_pin_hash=pinHash(pin,salt)}
    await repo.updateWorkspace(w.id,patch);return json({ok:true,workspaceCode:w.code,syncedAt:snapshot.syncedAt});
  }
  if(path==='manager/status'&&req.method==='GET'){
    const w=await managerWorkspace(req,repo);if(!w)return json({error:'Hosted manager connection is not authorized.'},401);const counts=await repo.countEvents(w.id);return json({ok:true,workspaceCode:w.code,restaurantName:w.restaurant_name,updatedAt:w.updated_at,counts});
  }
  if(path==='manager/events'&&req.method==='GET'){
    const w=await managerWorkspace(req,repo);if(!w)return json({error:'Hosted manager connection is not authorized.'},401);const since=url.searchParams.get('since')||'1970-01-01T00:00:00.000Z',events=await repo.listEvents(w.id,since);return json({ok:true,serverTime:now(),...events});
  }
  if(path.startsWith('workspace/')&&req.method==='GET'){
    const workspaceCode=path.split('/')[1]?.toUpperCase(),w=await repo.getWorkspaceByCode(workspaceCode);if(!w)return json({error:'Restaurant workspace not found.'},404);return json({ok:true,workspaceCode:w.code,restaurantName:w.restaurant_name});
  }
  if(path==='login'&&req.method==='POST'){
    const b=await body(req),workspaceCode=clip(b.code,16).toUpperCase(),pin=String(b.pin||''),w=await repo.getWorkspaceByCode(workspaceCode);if(!w||!safeEq(pinHash(pin,w.employee_pin_salt),w.employee_pin_hash))return json({error:'The restaurant code or Employee Library PIN is not correct.'},401);
    const token=randomBytes(32).toString('base64url'),expiresAt=new Date(Date.now()+SESSION_HOURS*3600000).toISOString();await repo.createSession({token_hash:tokenHash(token),workspace_id:w.id,role:'staff',expires_at:expiresAt});const snapshot=w.snapshot||{};return json({ok:true,token,expiresAt,workspaceCode:w.code,restaurantName:w.restaurant_name,branding:snapshot.branding||{name:w.restaurant_name,logo:''}});
  }
  const session=await staffWorkspace(req,repo);if(!session)return json({error:'Employee access has expired. Re-enter the restaurant code and Employee Library PIN.'},401);const w=session,snapshot=w.snapshot||{};
  if(path==='session'&&req.method==='GET')return json({ok:true,workspaceCode:w.code,restaurantName:w.restaurant_name,expiresAt:session.expires_at,branding:snapshot.branding||{name:w.restaurant_name,logo:''}});
  if(path==='published-sops'&&req.method==='GET')return json({data:{restaurant:w.restaurant_name,sops:snapshot.publishedSops||[],recipes:snapshot.publishedRecipes||[]},canBuild:false});
  if(path==='staff-recipes'&&req.method==='GET')return json({recipes:snapshot.publishedRecipes||[],canBuild:false});
  if(path==='published-posters'&&req.method==='GET')return json({posters:snapshot.posters||[],canBuild:false});
  if(path==='activity'&&req.method==='POST'){const d=cleanEvent(await body(req)),record={id:randomUUID(),...d,createdAt:now()};await repo.insertActivity(w.id,record);return json({ok:true,id:record.id});}
  if(path==='messages'&&req.method==='POST'){const d=cleanEvent(await body(req)),record={id:clip(d.requestId,120)||randomUUID(),kind:clip(d.kind,40),sourceId:clip(d.sourceId,180),name:clip(d.name,120),category:clip(d.category,80),text:clip(d.text||d.message,4000),status:'open',resolved:false,createdAt:now()};if(!record.text)return json({error:'Enter a question or report.'},400);await repo.insertMessage(w.id,record);return json({ok:true,message:record},201);}
  if(path==='training'&&req.method==='GET'){const id=url.searchParams.get('id'),sop=(snapshot.publishedSops||[]).find(x=>x.id===id);if(!sop)return json({error:'This SOP is not currently published.'},404);const quiz=buildQuiz(sop);return json({sop:{id:sop.id,title:sop.title,revision:sop.revision,trainingRequirement:sop.trainingRequirement||'review',changeSummary:sop.changeSummary||'',nextReviewDate:sop.nextReviewDate||''},passScore:80,questions:quiz.map(({correct,...x})=>x)});}
  if(path==='training'&&req.method==='POST'){const b=await body(req),sop=(snapshot.publishedSops||[]).find(x=>x.id===b.sopId);if(!sop||sop.revision!==b.revision)return json({error:'The published revision changed. Review the current version.'},409);if(!clip(b.name)||!b.acknowledge)return json({error:'Enter your name, answer every question, and acknowledge the current SOP.'},400);const quiz=buildQuiz(sop),feedback=quiz.map(q=>({id:q.id,prompt:q.prompt,selected:String(b.answers?.[q.id]||''),correct:q.correct,correctAnswer:String(b.answers?.[q.id]||'')===q.correct}));if(feedback.some(x=>!x.selected))return json({error:'Answer all five questions before submitting.'},400);const correct=feedback.filter(x=>x.correctAnswer).length,score=Math.round(correct/quiz.length*100),passed=score>=80,requirement=sop.trainingRequirement||'review',record={id:randomUUID(),kind:'knowledge-check',name:clip(b.name,120),sopId:sop.id,title:sop.title,revision:sop.revision,trainingRequirement:requirement,score,correct,total:quiz.length,passed,acknowledged:true,completedAt:now(),changeSummary:sop.changeSummary||'',managerSignoff:null,result:passed?(requirement==='competency'?'Knowledge check passed; manager competency sign-off required.':'Training complete — knowledge check passed and current revision acknowledged.'):'Knowledge check not passed; review the SOP and retry.'};await repo.insertTraining(w.id,record);return json({ok:true,record,feedback,passScore:80});}
  if(path==='assistant'&&req.method==='GET')return json({ready:true,mode:'source-grounded-hosted'});
  if(path==='assistant'&&req.method==='POST'){const b=await body(req),source=employeeSource(snapshot,b.kind,b.sourceId);if(!source)return json({error:'Selected published source was not found.'},404);const question=(b.messages||[]).slice(-1)[0]?.content||'';return json({answer:assistantAnswer(source,question),source:{title:source.title,status:'Published',revision:source.revision||''}});}
  return json({error:'Unsupported hosted employee operation.'},404);
}catch(e){console.error('foundry-hosted',e);return json({error:e?.message||'Hosted employee connection failed.'},Number(e?.status)||500)}}}

export const testHelpers={tokenHash,pinHash,buildQuiz,cleanSnapshot,assistantAnswer};
