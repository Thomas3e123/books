import { getDatabase } from '@netlify/database';
import crypto from 'node:crypto';

const db=getDatabase();
const allowedOrigins=new Set(['https://thomasmonroebooks.com','https://www.thomasmonroebooks.com','https://gravity-leadership-system.netlify.app','https://gravityleadershipsystem.com','https://www.gravityleadershipsystem.com']);
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
const makeId=(prefix='x')=>prefix+'_'+crypto.randomUUID().replaceAll('-','');
const makeToken=()=>crypto.randomBytes(24).toString('base64url');
const makeCode=()=>crypto.randomBytes(5).toString('base64url').replace(/[^A-Za-z0-9]/g,'').slice(0,8).toUpperCase();
const hash=s=>crypto.createHash('sha256').update(String(s||'')).digest('hex');
const clean=(v,n=4000)=>String(v||'').trim().slice(0,n);
const safeEmail=v=>{const s=clean(v,254);return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)?s:null};
const safePhone=v=>clean(v,80).replace(/[^0-9+().\- xext]/gi,'').slice(0,80);
function bearer(req){const h=req.headers.get('authorization')||'';return h.replace(/^Bearer\s+/i,'').trim()}
function testerToken(req){return clean(req.headers.get('x-gravity-tester-token')||bearer(req),200)}
function cors(req){const o=req.headers.get('origin')||'';return !o||allowedOrigins.has(o)||o.endsWith('.netlify.app')}
async function readBody(req){try{return await req.json()}catch{return {}}}
async function testerFromToken(t){if(!t)return null;const r=await db.sql`SELECT * FROM gravity_testing_testers WHERE token_hash=${hash(t)} LIMIT 1`;return r[0]||null}
function publicTester(t){return{id:t.id,displayName:t.display_name,email:t.email||'',interests:t.interests||[],status:t.status,createdAt:t.created_at,updatedAt:t.updated_at}}
function managerOK(req){const expected=process.env.GRAVITY_TESTING_MANAGER_KEY||'';const got=bearer(req);if(!expected||!got)return false;const a=Buffer.from(expected),b=Buffer.from(got);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
async function isGroupMember(groupId,testerId){const r=await db.sql`SELECT 1 FROM gravity_testing_group_members WHERE group_id=${groupId} AND tester_id=${testerId} LIMIT 1`;return !!r[0]}

export default async(request)=>{
  if(!cors(request))return json({error:'Origin not allowed.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':request.headers.get('origin')||'*','Access-Control-Allow-Headers':'content-type,authorization,x-gravity-tester-token','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
  const url=new URL(request.url);const p=url.pathname.replace(/^\/testing-room\/?/,'');
  try{
    if(request.method==='POST'&&p==='join'){
      const b=await readBody(request);const t=makeToken();const testerId=makeId('tester');
      const name=clean(b.displayName,80)||'Gravity Tester';const email=safeEmail(b.email);const interests=Array.isArray(b.interests)?b.interests.map(x=>clean(x,80)).filter(Boolean).slice(0,12):[];
      await db.sql`INSERT INTO gravity_testing_testers (id,token_hash,display_name,email,interests,status) VALUES (${testerId},${hash(t)},${name},${email},${JSON.stringify(interests)}::jsonb,'new')`;
      return json({tester:{id:testerId,displayName:name,email:email||'',interests,status:'new'},token:t});
    }
    if(request.method==='GET'&&p==='me'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);
      return json({tester:publicTester(t)});
    }
    if(request.method==='GET'&&p==='messages'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);
      const rows=await db.sql`SELECT id,sender,kind,body,context,screenshot_data,created_at FROM gravity_testing_messages WHERE tester_id=${t.id} ORDER BY created_at ASC LIMIT 1000`;
      await db.sql`UPDATE gravity_testing_messages SET read_by_tester=TRUE WHERE tester_id=${t.id} AND sender='manager'`;
      return json({messages:rows});
    }
    if(request.method==='POST'&&p==='message'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);const b=await readBody(request);
      const kind=['problem','idea','confusing','worked','other','schedule'].includes(b.kind)?b.kind:'other';const text=clean(b.body,6000);if(!text)return json({error:'Write a short message first.'},400);
      const context={program:clean(b.program,120),page:clean(b.page,300),windows:clean(b.windows,120),build:clean(b.build,120),device:clean(b.device,500)};
      const rawShot=clean(b.screenshotData,900000);const screenshot=/^data:image\/(png|jpeg|webp);base64,/i.test(rawShot)&&rawShot.length<900000?rawShot:null;
      const mid=makeId('msg');await db.sql`INSERT INTO gravity_testing_messages (id,tester_id,sender,kind,body,context,screenshot_data,read_by_manager,read_by_tester) VALUES (${mid},${t.id},'tester',${kind},${text},${JSON.stringify(context)}::jsonb,${screenshot},FALSE,TRUE)`;
      await db.sql`UPDATE gravity_testing_testers SET status=CASE WHEN status='new' THEN 'active' ELSE status END,updated_at=NOW(),last_tester_message_at=NOW() WHERE id=${t.id}`;
      return json({ok:true,id:mid});
    }
    if(request.method==='POST'&&p==='schedule'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);const b=await readBody(request);
      const method=['messenger','phone'].includes(b.method)?b.method:'messenger';const when=clean(b.when,180);if(!when)return json({error:'Tell me what day/time works for you.'},400);
      const phone=method==='phone'?safePhone(b.phone):'';if(method==='phone'&&!phone)return json({error:'Add a phone number for the scheduled call.'},400);
      const tz=clean(b.timezone,80);const notes=clean(b.notes,1200);const context={method,when,timezone:tz,phone,notes};const text=method==='phone'?`Phone chat requested: ${when}${tz?' ('+tz+')':''}. Phone: ${phone}${notes?' — '+notes:''}`:`Messenger chat requested: ${when}${tz?' ('+tz+')':''}${notes?' — '+notes:''}`;
      const mid=makeId('msg');await db.sql`INSERT INTO gravity_testing_messages (id,tester_id,sender,kind,body,context,read_by_manager,read_by_tester) VALUES (${mid},${t.id},'tester','schedule',${text},${JSON.stringify(context)}::jsonb,FALSE,TRUE)`;
      await db.sql`UPDATE gravity_testing_testers SET status='active',updated_at=NOW(),last_tester_message_at=NOW() WHERE id=${t.id}`;
      return json({ok:true,id:mid});
    }
    if(request.method==='POST'&&p==='group/create'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);const b=await readBody(request);
      const name=clean(b.name,100),purpose=clean(b.purpose,1200);if(!name)return json({error:'Give the group a short name.'},400);
      const gid=makeId('group'),code=makeCode();await db.sql`INSERT INTO gravity_testing_groups (id,name,purpose,created_by_tester_id,join_code) VALUES (${gid},${name},${purpose},${t.id},${code})`;
      await db.sql`INSERT INTO gravity_testing_group_members (group_id,tester_id,role) VALUES (${gid},${t.id},'creator')`;
      return json({group:{id:gid,name,purpose,joinCode:code}});
    }
    if(request.method==='POST'&&p==='group/join'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);const b=await readBody(request);const code=clean(b.code,24).toUpperCase();
      const g=(await db.sql`SELECT * FROM gravity_testing_groups WHERE join_code=${code} AND status='open' LIMIT 1`)[0];if(!g)return json({error:'That collaboration code was not found.'},404);
      await db.sql`INSERT INTO gravity_testing_group_members (group_id,tester_id,role) VALUES (${g.id},${t.id},'member') ON CONFLICT DO NOTHING`;
      return json({group:{id:g.id,name:g.name,purpose:g.purpose,joinCode:g.join_code}});
    }
    if(request.method==='GET'&&p==='groups'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);
      const rows=await db.sql`SELECT g.id,g.name,g.purpose,g.join_code,g.status,g.created_at,(SELECT COUNT(*)::int FROM gravity_testing_group_members gm2 WHERE gm2.group_id=g.id) members FROM gravity_testing_groups g JOIN gravity_testing_group_members gm ON gm.group_id=g.id WHERE gm.tester_id=${t.id} ORDER BY g.updated_at DESC`;
      return json({groups:rows});
    }
    if(request.method==='GET'&&p.startsWith('group/thread/')){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);const gid=clean(p.split('/').pop(),100);if(!(await isGroupMember(gid,t.id)))return json({error:'Group access required.'},403);
      const rows=await db.sql`SELECT id,tester_id,sender_name,body,kind,created_at FROM gravity_testing_group_messages WHERE group_id=${gid} ORDER BY created_at ASC LIMIT 2000`;return json({messages:rows});
    }
    if(request.method==='POST'&&p==='group/message'){
      const t=await testerFromToken(testerToken(request));if(!t)return json({error:'Tester link not found.'},404);const b=await readBody(request);const gid=clean(b.groupId,100),text=clean(b.body,5000);if(!text)return json({error:'Write a short message first.'},400);if(!(await isGroupMember(gid,t.id)))return json({error:'Group access required.'},403);
      const mid=makeId('gmsg');await db.sql`INSERT INTO gravity_testing_group_messages (id,group_id,tester_id,sender_name,body,kind) VALUES (${mid},${gid},${t.id},${t.display_name},${text},'message')`;await db.sql`UPDATE gravity_testing_groups SET updated_at=NOW() WHERE id=${gid}`;return json({ok:true,id:mid});
    }
    if(p.startsWith('manager/')){
      if(!managerOK(request))return json({error:'Manager access required.'},401);
      if(request.method==='GET'&&p==='manager/testers'){
        const rows=await db.sql`SELECT t.id,t.display_name,t.email,t.interests,t.status,t.helpful_level,t.created_at,t.updated_at,t.last_tester_message_at,t.last_manager_message_at,(SELECT COUNT(*)::int FROM gravity_testing_messages m WHERE m.tester_id=t.id AND m.sender='tester' AND m.read_by_manager=FALSE) unread FROM gravity_testing_testers t ORDER BY (SELECT COUNT(*) FROM gravity_testing_messages m WHERE m.tester_id=t.id AND m.sender='tester' AND m.read_by_manager=FALSE) DESC,t.updated_at DESC LIMIT 500`;
        return json({testers:rows});
      }
      if(request.method==='GET'&&p==='manager/groups'){
        const rows=await db.sql`SELECT g.id,g.name,g.purpose,g.join_code,g.status,g.created_at,g.updated_at,(SELECT COUNT(*)::int FROM gravity_testing_group_members gm WHERE gm.group_id=g.id) members FROM gravity_testing_groups g ORDER BY g.updated_at DESC LIMIT 200`;return json({groups:rows});
      }
      if(request.method==='GET'&&p.startsWith('manager/group-thread/')){
        const gid=clean(p.split('/').pop(),100);const rows=await db.sql`SELECT id,tester_id,sender_name,body,kind,created_at FROM gravity_testing_group_messages WHERE group_id=${gid} ORDER BY created_at ASC LIMIT 2000`;return json({messages:rows});
      }
      if(request.method==='GET'&&p.startsWith('manager/thread/')){
        const testerId=clean(p.split('/').pop(),100);const rows=await db.sql`SELECT id,sender,kind,body,context,screenshot_data,created_at FROM gravity_testing_messages WHERE tester_id=${testerId} ORDER BY created_at ASC LIMIT 2000`;
        await db.sql`UPDATE gravity_testing_messages SET read_by_manager=TRUE WHERE tester_id=${testerId} AND sender='tester'`;
        return json({messages:rows});
      }
      if(request.method==='POST'&&p==='manager/reply'){
        const b=await readBody(request);const testerId=clean(b.testerId,100),text=clean(b.body,6000);if(!testerId||!text)return json({error:'Tester and message required.'},400);
        const mid=makeId('msg');await db.sql`INSERT INTO gravity_testing_messages (id,tester_id,sender,kind,body,context,read_by_manager,read_by_tester) VALUES (${mid},${testerId},'manager','reply',${text},'{}'::jsonb,TRUE,FALSE)`;
        await db.sql`UPDATE gravity_testing_testers SET updated_at=NOW(),last_manager_message_at=NOW() WHERE id=${testerId}`;return json({ok:true,id:mid});
      }
      if(request.method==='POST'&&p==='manager/group-message'){
        const b=await readBody(request);const gid=clean(b.groupId,100),text=clean(b.body,5000);if(!gid||!text)return json({error:'Group and message required.'},400);const mid=makeId('gmsg');await db.sql`INSERT INTO gravity_testing_group_messages (id,group_id,tester_id,sender_name,body,kind) VALUES (${mid},${gid},NULL,'Thomas / Gravity',${text},'manager')`;await db.sql`UPDATE gravity_testing_groups SET updated_at=NOW() WHERE id=${gid}`;return json({ok:true,id:mid});
      }
      if(request.method==='POST'&&p==='manager/status'){
        const b=await readBody(request);const testerId=clean(b.testerId,100),status=['new','active','helpful','top10','closed'].includes(b.status)?b.status:'active';const helpful=Math.max(0,Math.min(10,Number(b.helpfulLevel)||0));
        await db.sql`UPDATE gravity_testing_testers SET status=${status},helpful_level=${helpful},updated_at=NOW() WHERE id=${testerId}`;return json({ok:true});
      }
    }
    return json({error:'Not found.'},404);
  }catch(err){console.error('Testing Room',err);return json({error:'Testing Room is temporarily unavailable.'},500)}
};

export const config={path:'/testing-room/*'};
