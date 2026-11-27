import { getDatabase } from '@netlify/database';
import crypto from 'node:crypto';

const db=getDatabase();
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const clean=(v,n=3000)=>String(v??'').trim().slice(0,n);
const id=(p)=>p+'_'+crypto.randomUUID().replaceAll('-','');
const token=()=>crypto.randomBytes(32).toString('base64url');
const hash=(v)=>crypto.createHash('sha256').update(String(v||'')).digest('hex');
const CONSENT_VERSION='pilot-room-consent-v1-2026-11-26';
const bearer=(r)=>String(r.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
const participantToken=(r)=>clean(r.headers.get('x-gravity-pilot-token')||bearer(r),200);
const emailOk=(v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v,254));
const dateOk=(v)=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))&&!Number.isNaN(Date.parse(String(v)+'T12:00:00Z'));
async function managerOK(r){
  const expected=Netlify.env.get('GRAVITY_PILOT_MANAGER_KEY')||'';const got=bearer(r);
  if(!expected||!got)return {ok:false,locked:false};
  const rawIp=clean(r.headers.get('x-nf-client-connection-ip')||r.headers.get('x-forwarded-for')||'unknown',160).split(',')[0].trim()||'unknown';
  const ipHash=crypto.createHmac('sha256',expected).update(rawIp).digest('hex');
  const attempt=(await db.sql`SELECT failed_count,locked_until FROM gravity_pilot_manager_attempts WHERE ip_hash=${ipHash} LIMIT 1`)[0];
  if(attempt?.locked_until&&new Date(attempt.locked_until).getTime()>Date.now())return {ok:false,locked:true};
  const a=Buffer.from(expected),b=Buffer.from(got);const valid=a.length===b.length&&crypto.timingSafeEqual(a,b);
  if(valid){await db.sql`DELETE FROM gravity_pilot_manager_attempts WHERE ip_hash=${ipHash}`;return {ok:true,locked:false};}
  const rows=await db.sql`INSERT INTO gravity_pilot_manager_attempts (ip_hash,failed_count,window_started_at,locked_until) VALUES (${ipHash},1,NOW(),NULL) ON CONFLICT (ip_hash) DO UPDATE SET failed_count=CASE WHEN gravity_pilot_manager_attempts.window_started_at<NOW()-INTERVAL '1 hour' THEN 1 ELSE gravity_pilot_manager_attempts.failed_count+1 END,window_started_at=CASE WHEN gravity_pilot_manager_attempts.window_started_at<NOW()-INTERVAL '1 hour' THEN NOW() ELSE gravity_pilot_manager_attempts.window_started_at END,locked_until=CASE WHEN gravity_pilot_manager_attempts.window_started_at<NOW()-INTERVAL '1 hour' THEN NULL WHEN gravity_pilot_manager_attempts.failed_count+1>=5 THEN NOW()+INTERVAL '24 hours' ELSE gravity_pilot_manager_attempts.locked_until END RETURNING failed_count,locked_until`;
  return {ok:false,locked:Boolean(rows[0]?.locked_until&&new Date(rows[0].locked_until).getTime()>Date.now())};
}
async function body(r){const raw=await r.text();if(raw.length>90000)throw Object.assign(Error('Request too large.'),{status:413});try{return raw?JSON.parse(raw):{}}catch{return {}}}
async function byToken(t){if(!t)return null;const rows=await db.sql`SELECT * FROM gravity_pilot_participants WHERE token_hash=${hash(t)} LIMIT 1`;return rows[0]||null}
const pub=(p)=>({id:p.id,name:p.display_name,email:p.email,role:p.role,restaurantType:p.restaurant_type,issueArea:p.issue_area,status:p.status,qualifyingContribution:p.qualifying_contribution,finalVersionAwarded:p.final_version_awarded,lifetimeLibraryAwarded:p.lifetime_library_awarded,createdAt:p.created_at});
const managerKey=(r)=>managerOK(r);
export default async function handler(request){
  const path=new URL(request.url).pathname.replace(/^\/pilot-room\/api\/?/,'');
  try{
    if(request.method==='POST'&&path==='join'){
      const b=await body(request);const name=clean(b.name,80),email=clean(b.email,254).toLowerCase(),role=clean(b.role,80),issue=clean(b.issueArea,120);
      if(!name||!emailOk(email)||!role||!issue)return json({error:'Add your name, valid email, role, and first issue.'},400);
      if(b.consentAccepted!==true)return json({error:'Please accept the pilot follow-up and data storage notice.'},400);
      const t=token(),pid=id('pilot');
      await db.sql`INSERT INTO gravity_pilot_participants (id,token_hash,display_name,email,role,restaurant_type,issue_area,consent_version,consent_accepted_at) VALUES (${pid},${hash(t)},${name},${email},${role},${clean(b.restaurantType,120)},${issue},${CONSENT_VERSION},NOW())`;
      return json({participant:{id:pid,name,email,role,restaurantType:clean(b.restaurantType,120),issueArea:issue,status:'enrolled'},token:t},201);
    }
    if(request.method==='GET'&&path==='me'){
      const p=await byToken(participantToken(request));if(!p)return json({error:'Pilot return link not found.'},404);
      const plan=(await db.sql`SELECT * FROM gravity_pilot_plans WHERE participant_id=${p.id} LIMIT 1`)[0]||null;
      const entries=await db.sql`SELECT id,entry_type,title,details,created_at FROM gravity_pilot_entries WHERE participant_id=${p.id} ORDER BY created_at DESC LIMIT 100`;
      const messages=await db.sql`SELECT id,sender,body,created_at FROM gravity_pilot_messages WHERE participant_id=${p.id} ORDER BY created_at ASC LIMIT 500`;
      await db.sql`UPDATE gravity_pilot_messages SET read_by_participant=TRUE WHERE participant_id=${p.id} AND sender='manager'`;
      return json({participant:pub(p),plan,entries,messages});
    }
    if(request.method==='POST'&&path==='plan'){
      const p=await byToken(participantToken(request));if(!p)return json({error:'Pilot return link not found.'},404);const b=await body(request);
      if(['complete','closed','paused','midpoint_reviewed'].includes(p.status))return json({error:'This plan cannot be replaced at its current stage. Contact Gravity for assistance.'},409);
      const issue=clean(b.issueArea,120),problem=clean(b.problemStatement,1500),owner=clean(b.systemOwner,120),measure=clean(b.baselineMeasure,300),pace=Number(b.paceDays),start=String(b.startDate||'');
      const tools=Array.isArray(b.selectedTools)?[...new Set(b.selectedTools.map(x=>clean(x,100)).filter(Boolean))].slice(0,5):[];
      const d1=String(b.firstReviewDate||''),d2=String(b.midpointDate||''),d3=String(b.targetEndDate||'');
      if(!issue||!problem||!owner||!measure||![30,60].includes(pace)||!dateOk(start)||!dateOk(d1)||!dateOk(d2)||!dateOk(d3)||new Date(d1)<new Date(start)||new Date(d2)<new Date(d1)||new Date(d3)<new Date(d2)||tools.length<3||tools.length>5)return json({error:'Complete the problem, owner, baseline measure, dates, pace, and select three to five tools in date order.'},400);
      const pid=id('plan');
      const row=await db.sql`INSERT INTO gravity_pilot_plans (id,participant_id,issue_area,problem_statement,system_owner,baseline_measure,baseline_source,baseline_recorded,selected_tools,pace_days,start_date,first_review_date,midpoint_date,target_end_date,status) VALUES (${pid},${p.id},${issue},${problem},${owner},${measure},${clean(b.baselineSource,500)},${Boolean(b.baselineRecorded)},${JSON.stringify(tools)}::jsonb,${pace},${start},${d1},${d2},${d3},'active') ON CONFLICT (participant_id) DO UPDATE SET issue_area=EXCLUDED.issue_area,problem_statement=EXCLUDED.problem_statement,system_owner=EXCLUDED.system_owner,baseline_measure=EXCLUDED.baseline_measure,baseline_source=EXCLUDED.baseline_source,baseline_recorded=EXCLUDED.baseline_recorded,selected_tools=EXCLUDED.selected_tools,pace_days=EXCLUDED.pace_days,start_date=EXCLUDED.start_date,first_review_date=EXCLUDED.first_review_date,midpoint_date=EXCLUDED.midpoint_date,target_end_date=EXCLUDED.target_end_date,status='active',updated_at=NOW() RETURNING *`;
      await db.sql`UPDATE gravity_pilot_participants SET status='plan_ready',issue_area=${issue},updated_at=NOW() WHERE id=${p.id}`;
      return json({plan:row});
    }
    if(request.method==='POST'&&['weekly-checkin','midpoint-review','final-review','issue-report','feedback'].includes(path)){
      const p=await byToken(participantToken(request));if(!p)return json({error:'Pilot return link not found.'},404);const b=await body(request);
      const types={'weekly-checkin':'weekly_checkin','midpoint-review':'midpoint_review','final-review':'final_review','issue-report':'issue_report',feedback:'feedback'};const type=types[path];
      const review=['weekly_checkin','midpoint_review','final_review'].includes(type);
      if(review){
        const plan=(await db.sql`SELECT status FROM gravity_pilot_plans WHERE participant_id=${p.id} LIMIT 1`)[0];
        if(!plan)return json({error:'Save an improvement plan before submitting a review.'},400);
        if(['complete','closed','paused'].includes(p.status)||plan.status==='complete')return json({error:'This plan is not active. Contact Gravity before submitting another review.'},409);
        if(type==='midpoint_review'&&!['active','midpoint_reviewed'].includes(p.status))return json({error:'Save a weekly review before your midpoint review.'},400);
        if(type==='final_review'&&p.status!=='midpoint_reviewed')return json({error:'Save your midpoint review before completing your plan.'},400);
      }
      const title=clean(b.title||({weekly_checkin:'Weekly progress check-in',midpoint_review:'Midpoint review',final_review:'Final review',issue_report:'Issue report',feedback:'Pilot feedback'}[type]),150);
      const details={};for(const [k,v] of Object.entries(b)){if(k==='title')continue;if(typeof v==='string'){const limit=type==='feedback'&&k==='protocol_report'?25000:1800;if(v.length>limit)return json({error:'Your response is too long to save. Shorten it and try again; nothing was saved.'},400);details[clean(k,60)]=v.trim()}else if(typeof v==='boolean'||typeof v==='number')details[clean(k,60)]=v;else if(Array.isArray(v))details[clean(k,60)]=v.map(x=>clean(x,100)).slice(0,12)}
      const filled=Object.values(details).some(v=>typeof v==='string'?Boolean(v.trim()):Array.isArray(v)?v.length>0:v!==null&&v!==undefined);
      if(!filled)return json({error:'Add a short update before saving.'},400);
      if(type==='midpoint_review'&&!clean(details.decision,100))return json({error:'Choose a midpoint decision before saving.'},400);
      if(type==='final_review'&&!clean(details.standard_holding,100))return json({error:'Choose whether the standard held before saving.'},400);
      if(type==='issue_report'&&!clean(details.expected,1200)&&!clean(details.actual,1800))return json({error:'Describe what you expected or what happened.'},400);
      const eid=id('entry');const row=await db.sql`INSERT INTO gravity_pilot_entries (id,participant_id,entry_type,title,details) VALUES (${eid},${p.id},${type},${title},${JSON.stringify(details)}::jsonb) RETURNING id,entry_type,title,details,created_at`;
      const status=type==='final_review'?'complete':(type==='midpoint_review'?'midpoint_reviewed':(type==='weekly_checkin'&&p.status!=='midpoint_reviewed'?'active':(type==='feedback'&&p.status==='enrolled'?'active':p.status)));
      await db.sql`UPDATE gravity_pilot_participants SET status=${status},updated_at=NOW() WHERE id=${p.id}`;
      if(type==='final_review')await db.sql`UPDATE gravity_pilot_plans SET status='complete',updated_at=NOW() WHERE participant_id=${p.id}`;
      return json({entry:row[0]},201);
    }
    if(request.method==='POST'&&path==='message'){
      const p=await byToken(participantToken(request));if(!p)return json({error:'Pilot return link not found.'},404);const b=await body(request),text=clean(b.body,4000);if(!text)return json({error:'Write a short message first.'},400);
      const mid=id('msg');await db.sql`INSERT INTO gravity_pilot_messages (id,participant_id,sender,body) VALUES (${mid},${p.id},'participant',${text})`;await db.sql`UPDATE gravity_pilot_participants SET updated_at=NOW() WHERE id=${p.id}`;return json({ok:true,id:mid},201);
    }
    if(path.startsWith('manager/')){
      const auth=await managerKey(request);if(!auth.ok)return json({error:auth.locked?'Too many failed passkey attempts. Access is locked for 24 hours.':'Manager access required.'},auth.locked?429:401);
      if(request.method==='GET'&&path==='manager/participants'){
        const rows=await db.sql`SELECT p.id,p.display_name,p.email,p.role,p.restaurant_type,p.issue_area,p.status,p.qualifying_contribution,p.final_version_awarded,p.lifetime_library_awarded,p.consent_version,p.consent_accepted_at,p.created_at,p.updated_at,pl.pace_days,pl.start_date,pl.first_review_date,pl.midpoint_date,pl.target_end_date,pl.baseline_recorded,(SELECT COUNT(*)::int FROM gravity_pilot_entries e WHERE e.participant_id=p.id) entry_count,(SELECT COUNT(*)::int FROM gravity_pilot_messages m WHERE m.participant_id=p.id AND m.sender='participant' AND m.read_by_manager=FALSE) unread FROM gravity_pilot_participants p LEFT JOIN gravity_pilot_plans pl ON pl.participant_id=p.id ORDER BY p.updated_at DESC LIMIT 500`;
        return json({participants:rows});
      }
      if(request.method==='GET'&&path.startsWith('manager/participant/')){
        const pid=clean(path.split('/').pop(),100);const p=(await db.sql`SELECT * FROM gravity_pilot_participants WHERE id=${pid} LIMIT 1`)[0];if(!p)return json({error:'Pilot not found.'},404);
        const plan=(await db.sql`SELECT * FROM gravity_pilot_plans WHERE participant_id=${pid} LIMIT 1`)[0]||null;
        const entries=await db.sql`SELECT id,entry_type,title,details,created_at FROM gravity_pilot_entries WHERE participant_id=${pid} ORDER BY created_at DESC LIMIT 200`;
        const messages=await db.sql`SELECT id,sender,body,created_at FROM gravity_pilot_messages WHERE participant_id=${pid} ORDER BY created_at ASC LIMIT 500`;await db.sql`UPDATE gravity_pilot_messages SET read_by_manager=TRUE WHERE participant_id=${pid} AND sender='participant'`;
        return json({participant:{...pub(p),managerNotes:p.manager_notes||'',consentVersion:p.consent_version||'',consentAcceptedAt:p.consent_accepted_at||null},plan,entries,messages});
      }
      if(request.method==='POST'&&path==='manager/update'){
        const b=await body(request),pid=clean(b.participantId,100);const status=['enrolled','plan_ready','active','midpoint_reviewed','paused','complete','closed'].includes(b.status)?b.status:'active';
        await db.sql`UPDATE gravity_pilot_participants SET status=${status},qualifying_contribution=${Boolean(b.qualifyingContribution)},final_version_awarded=${Boolean(b.finalVersionAwarded)},lifetime_library_awarded=${Boolean(b.lifetimeLibraryAwarded)},manager_notes=${clean(b.managerNotes,2500)},updated_at=NOW() WHERE id=${pid}`;return json({ok:true});
      }
      if(request.method==='POST'&&path==='manager/reply'){
        const b=await body(request),pid=clean(b.participantId,100),text=clean(b.body,4000);if(!text)return json({error:'Write a reply first.'},400);const mid=id('msg');await db.sql`INSERT INTO gravity_pilot_messages (id,participant_id,sender,body) VALUES (${mid},${pid},'manager',${text})`;await db.sql`UPDATE gravity_pilot_participants SET updated_at=NOW() WHERE id=${pid}`;return json({ok:true,id:mid},201);
      }
      if(request.method==='POST'&&path==='manager/reissue-return-link'){
        const b=await body(request),pid=clean(b.participantId,100);
        const p=(await db.sql`SELECT id,email FROM gravity_pilot_participants WHERE id=${pid} LIMIT 1`)[0];
        if(!p)return json({error:'Pilot not found.'},404);
        if(b.identityVerified!==true||clean(b.confirmEmail,254).toLowerCase()!==p.email.toLowerCase())return json({error:'Independently verify the participant through their registered email before reissuing access.'},400);
        const t=token();
        await db.sql`UPDATE gravity_pilot_participants SET token_hash=${hash(t)},updated_at=NOW() WHERE id=${pid}`;
        return json({token:t});
      }
    }
    return json({error:'Not found.'},404);
  }catch(e){console.error('Pilot Room request failed',e?.name||'unknown');return json({error:e?.status===413?'Request too large.':'Pilot Room is temporarily unavailable.'},e?.status||500)}
}
export const config={path:'/pilot-room/api/*',rateLimit:{action:'rate_limit',windowLimit:45,windowSize:60,aggregateBy:['ip','domain']}};
