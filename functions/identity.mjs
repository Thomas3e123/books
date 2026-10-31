import {getDatabase} from '@netlify/database';
// Identity user deletion webhook is signed and delivered by Netlify.
// Remove cloud snapshots when the owning customer account is deleted.
export default {
 async userDeleted(event){
  const id=event?.user?.id;
  if(typeof id!=='string'||!id)return;
  const db=getDatabase();
  await db.sql`DELETE FROM gravity_customer_backup_snapshots WHERE identity_user_id=${id}`;
 }
};
