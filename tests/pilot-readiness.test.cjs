const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'functions/pilot-room/index.mjs'),'utf8');
function fixture(){
  const p={id:'synthetic',email:'tester@example.invalid',status:'enrolled'}, entries=[];
  let plan=null,rotated=false,created=[];
  const sql=async(strings,...values)=>{
    const q=strings.join('?');
    if(q.includes('WHERE token_hash='))return [p];
    if(q.includes('SELECT status FROM gravity_pilot_plans'))return plan?[plan]:[];
    if(q.includes('INSERT INTO gravity_pilot_entries')){const row={id:values[0],entry_type:values[2],details:JSON.parse(values[4])};entries.push(row);return [row]}
    if(q.includes('UPDATE gravity_pilot_participants SET status=')){p.status=values[0];return []}
    if(q.includes("UPDATE gravity_pilot_plans SET status='complete'")){plan.status='complete';return []}
    if(q.includes('SELECT failed_count,locked_until'))return [];
    if(q.includes('DELETE FROM gravity_pilot_manager_attempts'))return [];
    if(q.includes('SELECT id,email FROM gravity_pilot_participants'))return [p];
    if(q.includes('SET token_hash=')){rotated=true;return []}
    if(q.includes('INSERT INTO gravity_pilot_participants')){created.push({query:q,values});return []}
    throw Error('Unexpected mock database operation');
  };
  const context={getDatabase:()=>({sql}),crypto,Response,Request,URL,Netlify:{env:{get:()=> 'test-only-manager-key'}},Buffer,console};
  const script=source.replace(/^import .*;\n/gm,'').replace('export default async function handler','async function handler').replace('export const config','const config')+'\nhandler;';
  const handler=vm.runInNewContext(script,context);
  const send=(route,data,manager=false)=>handler(new Request('https://test.invalid/pilot-room/api/'+route,{method:'POST',headers:manager?{authorization:'Bearer test-only-manager-key'}:{'x-gravity-pilot-token':'synthetic'},body:JSON.stringify(data)}));
  return {p,entries,send,setPlan:()=>{plan={status:'active'};p.status='plan_ready'},rotated:()=>rotated,created};
}
test('enrollment requires consent and records its version',async()=>{const f=fixture();const payload={name:'Synthetic',email:'synthetic@example.invalid',role:'Owner',issueArea:'Tool testing'};assert.equal((await f.send('join',payload)).status,400);assert.equal(f.created.length,0);const res=await f.send('join',{...payload,consentAccepted:true});assert.equal(res.status,201);assert.equal(f.created.length,1);assert.match(f.created[0].query,/consent_version,consent_accepted_at/);assert.match(f.created[0].query,/NOW\(\)/);assert.equal(f.created[0].values[7],'pilot-room-consent-v1-2026-11-26')});
test('long protocol feedback preserves every permitted character',async()=>{const f=fixture();const report='case results\n'+'x'.repeat(12000);const res=await f.send('feedback',{title:'Test',protocol_report:report});assert.equal(res.status,201);assert.equal(f.entries[0].details.protocol_report,report);assert.equal((await f.send('feedback',{protocol_report:'x'.repeat(25001)})).status,400);assert.equal(f.entries.length,1)});
test('reviews require a plan and preserve milestone order',async()=>{const f=fixture();assert.equal((await f.send('final-review',{standard_holding:'Yes'})).status,400);f.setPlan();assert.equal((await f.send('final-review',{standard_holding:'Yes'})).status,400);assert.equal((await f.send('weekly-checkin',{completion:'Done'})).status,201);assert.equal((await f.send('midpoint-review',{decision:'Continue'})).status,201);assert.equal((await f.send('weekly-checkin',{completion:'Done'})).status,201);assert.equal(f.p.status,'midpoint_reviewed');assert.equal((await f.send('final-review',{standard_holding:'Yes'})).status,201);assert.equal(f.p.status,'complete');assert.equal((await f.send('weekly-checkin',{completion:'Done'})).status,409)});
test('return-link reissue requires manager and identity verification',async()=>{const f=fixture();const payload={participantId:'synthetic',identityVerified:true,confirmEmail:'tester@example.invalid'};assert.equal((await f.send('manager/reissue-return-link',payload)).status,401);assert.equal((await f.send('manager/reissue-return-link',{...payload,identityVerified:false},true)).status,400);assert.equal(f.rotated(),false);const res=await f.send('manager/reissue-return-link',payload,true);assert.equal(res.status,200);assert.equal(typeof (await res.json()).token,'string');assert.equal(f.rotated(),true)});
test('all 142 test cases agree with the printable guide',()=>{const j=JSON.parse(fs.readFileSync(path.join(root,'site/pilot-room-protocols.json')));const md=fs.readFileSync(path.join(root,'site/pilot-room-tool-process-test-protocols.md'),'utf8');const cases=j.suites.flatMap(s=>s.cases);assert.equal(cases.length,142);assert.equal(new Set(cases.map(x=>x[0])).size,142);for(const c of cases)for(const text of c)assert.ok(md.includes(text),c[0]);});

test('pilot API has shared-network headroom for the first ten participants',()=>{assert.match(source,/windowLimit:100,windowSize:60,aggregateBy:\['ip','domain'\]/)});
