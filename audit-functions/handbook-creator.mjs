import {handle} from '../functions/handbook-creator/index.mjs';
export default async function(req){
 const action=new URL(req.url).searchParams.get('action')||'status';
 if(!['status','preview','export'].includes(action))return Response.json({error:'Payments disabled in isolated audit.'},{status:503});
 return handle(req,{env:{},payments:{licensed:async()=>false}});
}
