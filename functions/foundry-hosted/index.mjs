import { getDatabase } from '@netlify/database';
import { createHostedFoundryHandler } from './core.mjs';

class PostgresRepo {
  constructor(){this.db=getDatabase()}
  async getWorkspaceByCode(code){const r=await this.db.sql`SELECT * FROM gravity_foundry_workspaces WHERE code=${code} LIMIT 1`;return r[0]||null}
  async getWorkspaceByManagerHash(hash){const r=await this.db.sql`SELECT * FROM gravity_foundry_workspaces WHERE manager_key_hash=${hash} LIMIT 1`;return r[0]||null}
  async createWorkspace(x){await this.db.sql`INSERT INTO gravity_foundry_workspaces (id,code,restaurant_name,manager_key_hash,employee_pin_salt,employee_pin_hash,snapshot) VALUES (${x.id},${x.code},${x.restaurant_name},${x.manager_key_hash},${x.employee_pin_salt},${x.employee_pin_hash},${JSON.stringify(x.snapshot)}::jsonb)`}
  async updateWorkspace(id,p){const current=(await this.db.sql`SELECT * FROM gravity_foundry_workspaces WHERE id=${id} LIMIT 1`)[0];if(!current)throw Error('Workspace not found.');await this.db.sql`UPDATE gravity_foundry_workspaces SET restaurant_name=${p.restaurant_name??current.restaurant_name}, snapshot=${JSON.stringify(p.snapshot??current.snapshot)}::jsonb, employee_pin_salt=${p.employee_pin_salt??current.employee_pin_salt}, employee_pin_hash=${p.employee_pin_hash??current.employee_pin_hash}, updated_at=NOW() WHERE id=${id}`}
  async createSession(s){await this.db.sql`INSERT INTO gravity_foundry_sessions (token_hash,workspace_id,role,expires_at) VALUES (${s.token_hash},${s.workspace_id},${s.role},${s.expires_at}::timestamptz) ON CONFLICT (token_hash) DO NOTHING`}
  async getSession(hash){const r=await this.db.sql`SELECT s.expires_at,s.role,w.* FROM gravity_foundry_sessions s JOIN gravity_foundry_workspaces w ON w.id=s.workspace_id WHERE s.token_hash=${hash} LIMIT 1`;return r[0]||null}
  async insertActivity(workspaceId,data){await this.db.sql`INSERT INTO gravity_foundry_activity (id,workspace_id,data,created_at) VALUES (${data.id},${workspaceId},${JSON.stringify(data)}::jsonb,${data.createdAt}::timestamptz) ON CONFLICT (id) DO NOTHING`}
  async insertMessage(workspaceId,data){await this.db.sql`INSERT INTO gravity_foundry_messages (id,workspace_id,data,created_at) VALUES (${data.id},${workspaceId},${JSON.stringify(data)}::jsonb,${data.createdAt}::timestamptz) ON CONFLICT (id) DO NOTHING`}
  async insertTraining(workspaceId,data){await this.db.sql`INSERT INTO gravity_foundry_training (id,workspace_id,data,created_at) VALUES (${data.id},${workspaceId},${JSON.stringify(data)}::jsonb,${data.completedAt||new Date().toISOString()}::timestamptz) ON CONFLICT (id) DO NOTHING`}
  async listEvents(workspaceId,since){const a=await this.db.sql`SELECT data FROM gravity_foundry_activity WHERE workspace_id=${workspaceId} AND created_at>${since}::timestamptz ORDER BY created_at ASC LIMIT 5000`,m=await this.db.sql`SELECT data FROM gravity_foundry_messages WHERE workspace_id=${workspaceId} AND created_at>${since}::timestamptz ORDER BY created_at ASC LIMIT 2000`,t=await this.db.sql`SELECT data FROM gravity_foundry_training WHERE workspace_id=${workspaceId} AND created_at>${since}::timestamptz ORDER BY created_at ASC LIMIT 2000`;return{activity:a.map(x=>x.data),messages:m.map(x=>x.data),training:t.map(x=>x.data)}}
  // Bounded, independent per-stream pagination. The cursor uses Postgres timestamps
  // and record IDs so equal-time events are not silently dropped.
  async listEventPage(workspaceId,{stream,since,until,afterAt,afterId,limit}){
    const at=afterAt||since,id=afterId||'',cap=Math.min(500,Math.max(1,Number(limit)||500));
    let rows;
    if(stream==='activity'){
      rows=await this.db.sql`SELECT data,created_at::text AS event_time,id::text AS event_id FROM gravity_foundry_activity WHERE workspace_id=${workspaceId} AND created_at>${since}::timestamptz AND created_at<=${until}::timestamptz AND (created_at,id::text)>(${at}::timestamptz,${id}) ORDER BY created_at ASC,id::text ASC LIMIT ${cap+1}`;
    }else if(stream==='messages'){
      rows=await this.db.sql`SELECT data,created_at::text AS event_time,id::text AS event_id FROM gravity_foundry_messages WHERE workspace_id=${workspaceId} AND created_at>${since}::timestamptz AND created_at<=${until}::timestamptz AND (created_at,id::text)>(${at}::timestamptz,${id}) ORDER BY created_at ASC,id::text ASC LIMIT ${cap+1}`;
    }else if(stream==='training'){
      rows=await this.db.sql`SELECT data,created_at::text AS event_time,id::text AS event_id FROM gravity_foundry_training WHERE workspace_id=${workspaceId} AND created_at>${since}::timestamptz AND created_at<=${until}::timestamptz AND (created_at,id::text)>(${at}::timestamptz,${id}) ORDER BY created_at ASC,id::text ASC LIMIT ${cap+1}`;
    }else throw Error('Unknown hosted event stream');
    const page=rows.slice(0,cap),last=page[page.length-1];
    return{records:page.map(row=>row.data),hasMore:rows.length>cap,nextCursor:last?{at:String(last.event_time),id:String(last.event_id)}:null};
  }
  async countEvents(workspaceId){const r=await this.db.sql`SELECT (SELECT COUNT(*)::int FROM gravity_foundry_activity WHERE workspace_id=${workspaceId}) activity, (SELECT COUNT(*)::int FROM gravity_foundry_messages WHERE workspace_id=${workspaceId}) messages, (SELECT COUNT(*)::int FROM gravity_foundry_training WHERE workspace_id=${workspaceId}) training`;return r[0]||{activity:0,messages:0,training:0}}
}

const handler=createHostedFoundryHandler(new PostgresRepo());
export default handler;
export const config={path:'/foundry-hosted/*'};
