import {getDatabase} from '@netlify/database';
import {getUser} from '@netlify/identity';
import {createCloudBackupHandler} from './core.mjs';

class GravityEncryptedBackupStore{
 get db(){return getDatabase()}
 async latest(uid,tool){
  const r=await this.db.sql`SELECT revision,created_at FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} AND tool=${tool} ORDER BY revision DESC LIMIT 1`;
  return r[0]?{revision:Number(r[0].revision),createdAt:new Date(r[0].created_at).toISOString()}:null;
 }
 async status(uid){
  const r=await this.db.sql`SELECT DISTINCT ON (tool) tool,revision,created_at FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} ORDER BY tool, revision DESC`;
  return r.map(x=>({tool:x.tool,revision:Number(x.revision),createdAt:new Date(x.created_at).toISOString()}));
 }
 async history(uid,tool,keep){
  const rows=await this.db.sql`SELECT revision,created_at FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} AND tool=${tool} ORDER BY revision DESC LIMIT ${keep}`;
  return rows.map(x=>({revision:Number(x.revision),createdAt:new Date(x.created_at).toISOString()}));
 }
 async read(uid,tool,revision){
  const r=revision===null
   ?await this.db.sql`SELECT revision,envelope,created_at FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} AND tool=${tool} ORDER BY revision DESC LIMIT 1`
   :await this.db.sql`SELECT revision,envelope,created_at FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} AND tool=${tool} AND revision=${revision} LIMIT 1`;
  return r[0]?{revision:Number(r[0].revision),envelope:r[0].envelope,createdAt:new Date(r[0].created_at).toISOString()}:null;
 }
 async insert(uid,tool,revision,envelope,size){
  const r=await this.db.sql`INSERT INTO gravity_customer_backup_snapshots(identity_user_id,tool,revision,envelope,envelope_bytes) VALUES (${uid},${tool},${revision},${JSON.stringify(envelope)}::jsonb,${size}) RETURNING revision,created_at`;
  return {revision:Number(r[0].revision),createdAt:new Date(r[0].created_at).toISOString()};
 }
 async prune(uid,tool,keep){
  await this.db.sql`DELETE FROM gravity_customer_backup_snapshots
  WHERE identity_user_id=${uid} AND tool=${tool} AND revision NOT IN
  (SELECT revision FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} AND tool=${tool} ORDER BY revision DESC LIMIT ${keep})`;
 }
 async deleteAll(uid,tool){
  const r=await this.db.sql`DELETE FROM gravity_customer_backup_snapshots WHERE identity_user_id=${uid} AND tool=${tool} RETURNING revision`;
  return r.length;
 }
}
const authenticatedHandler=createCloudBackupHandler({getIdentityUser:getUser,store:new GravityEncryptedBackupStore()});
export default async request=>{
 if(request.method==='GET'&&new URL(request.url).pathname==='/gravity-cloud-backup/health')
  return Response.json({ok:true,service:'Gravity encrypted backup',authenticatedAccountRequired:true},{headers:{'Cache-Control':'no-store'}});
 return authenticatedHandler(request);
};
export const config={path:'/gravity-cloud-backup/*'};
