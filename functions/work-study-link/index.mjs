import { getDatabase } from '@netlify/database';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

const db=getDatabase();
const HOURS=12;
const MAX_BYTES=2_500_000;
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const now=()=>new Date().toISOString();
const hash=v=>createHash('sha256').update(String(v||'')).digest('hex');
const token=()=>randomBytes(32).toString('base64url');
const code=()=>Array.from(randomBytes(6),b=>ALPHABET[b%ALPHABET.length]).join('');
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const bearer=req=>String(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
const readBody=async req=>{try{return await req.json()}catch{return {}}};
function cleanStudy(study){
 if(!study||typeof study!=='object'||Array.isArray(study))throw Object.assign(new Error('A valid Work Study snapshot is required.'),{status:400});
 const text=JSON.stringify(study);
 if(Buffer.byteLength(text,'utf8')>MAX_BYTES)throw Object.assign(new Error('This Work Study is too large to connect in one session.'),{status:413});
 return JSON.parse(text);
}
async function byAuth(req){
 const raw=bearer(req);if(!raw)return null;const h=hash(raw);
 const rows=await db.sql`SELECT *, CASE WHEN owner_token_hash=${h} THEN 'owner' WHEN device_token_hash=${h} THEN 'device' ELSE NULL END AS role FROM gravity_work_study_links WHERE (owner_token_hash=${h} OR device_token_hash=${h}) LIMIT 1`;
 const row=rows[0]||null;if(!row||!row.role)return null;return row;
}
function active(row){return row&&row.status==='open'&&new Date(row.expires_at).getTime()>Date.now()}
async function uniqueCode(){for(let i=0;i<8;i++){const c=code();const r=await db.sql`SELECT id FROM gravity_work_study_links WHERE pair_code=${c} LIMIT 1`;if(!r[0])return c}throw Error('Could not allocate a connection code. Try again.')}

export default async function(req){
 try{
  const url=new URL(req.url),path=url.pathname.replace(/^\/work-study-link\/?/,'');
  if(path==='health'&&req.method==='GET')return json({ok:true,service:'Gravity Work Study Device Link'});
  if(path==='create'&&req.method==='POST'){
   const b=await readBody(req),study=cleanStudy(b.study),studyId=String(study.id||b.studyId||'').trim();
   if(!studyId)return json({error:'Save the Work Study before connecting a portable device.'},400);
   const ownerToken=token(),pairCode=await uniqueCode(),id=randomUUID(),expiresAt=new Date(Date.now()+HOURS*3600000).toISOString();
   await db.sql`INSERT INTO gravity_work_study_links (id,study_id,pair_code,owner_token_hash,snapshot,revision,status,expires_at) VALUES (${id},${studyId},${pairCode},${hash(ownerToken)},${JSON.stringify(study)}::jsonb,1,'open',${expiresAt}::timestamptz)`;
   return json({ok:true,pairCode,ownerToken,revision:1,expiresAt,joinUrl:`https://thomasmonroebooks.com/gravity-work-study-lab?pair=${pairCode}`},201);
  }
  if(path==='join'&&req.method==='POST'){
   const b=await readBody(req),pairCode=String(b.code||'').trim().toUpperCase();
   if(!/^[A-Z2-9]{6}$/.test(pairCode))return json({error:'Enter the six-character connection code.'},400);
   const rows=await db.sql`SELECT * FROM gravity_work_study_links WHERE pair_code=${pairCode} LIMIT 1`,row=rows[0];
   if(!row)return json({error:'That Work Study connection code was not found.'},404);
   if(!active(row))return json({error:'That Work Study connection has expired or ended.'},410);
   if(row.device_token_hash)return json({error:'A portable device is already connected to this study. End that connection before pairing another device.'},409);
   const deviceToken=token();
   await db.sql`UPDATE gravity_work_study_links SET device_token_hash=${hash(deviceToken)}, updated_at=NOW() WHERE id=${row.id} AND device_token_hash IS NULL`;
   return json({ok:true,deviceToken,study:row.snapshot,revision:row.revision,expiresAt:row.expires_at});
  }
  const session=await byAuth(req);
  if(!session)return json({error:'This Work Study device connection is not authorized.'},401);
  if(!active(session))return json({error:'This Work Study device connection has expired or ended.'},410);
  if(path==='state'&&req.method==='GET')return json({ok:true,role:session.role,study:session.snapshot,revision:session.revision,expiresAt:session.expires_at,updatedAt:session.updated_at});
  if(path==='state'&&req.method==='PUT'){
   const b=await readBody(req),study=cleanStudy(b.study),expected=Number(b.revision);
   if(!Number.isInteger(expected)||expected<1)return json({error:'A valid revision is required.'},400);
   const client=await db.pool.connect();
   try{
    await client.query('BEGIN');
    const locked=await client.query('SELECT revision,status,expires_at FROM gravity_work_study_links WHERE id=$1 FOR UPDATE',[session.id]);
    const row=locked.rows[0];
    if(!row||row.status!=='open'||new Date(row.expires_at).getTime()<=Date.now()){await client.query('ROLLBACK');return json({error:'This Work Study device connection has expired or ended.'},410)}
    if(Number(row.revision)!==expected){await client.query('ROLLBACK');return json({error:'A newer copy of this Work Study exists. Reload it before saving more changes.',revision:Number(row.revision)},409)}
    const next=expected+1;
    await client.query('UPDATE gravity_work_study_links SET snapshot=$1::jsonb, revision=$2, updated_at=NOW() WHERE id=$3',[JSON.stringify(study),next,session.id]);
    await client.query('COMMIT');
    return json({ok:true,revision:next,updatedAt:now()});
   }catch(e){try{await client.query('ROLLBACK')}catch{}throw e}finally{client.release()}
  }
  if(path==='end'&&req.method==='POST'){
   if(session.role!=='owner')return json({error:'Only the study owner can end this device connection.'},403);
   await db.sql`UPDATE gravity_work_study_links SET status='ended', updated_at=NOW() WHERE id=${session.id}`;
   return json({ok:true,ended:true});
  }
  return json({error:'Unsupported Work Study device operation.'},404);
 }catch(e){console.error('work-study-link',e);return json({error:e?.message||'Work Study device connection failed.'},Number(e?.status)||500)}
}

export const config={path:'/work-study-link/*'};
