import OpenAI from 'openai';
import {instructions} from './instructions.mjs';
import {validateInput,validateResponse,responseSchema} from '../../site/assets/js/gravity-conversation-core.mjs';
import {sources} from '../gravity-action-plan/sources.mjs';
const env=k=>globalThis.Netlify?.env?.get(k)??process.env[k];
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export const config={rateLimit:{action:'rate_limit',aggregateBy:'domain',windowSize:60,windowLimit:3}};
export function allowedOrigin(request){const origin=request.headers.get('origin');return !origin||/^https:\/\/[a-z0-9-]+--gravity-leadership-system\.netlify\.app$/.test(origin)}
export async function handle(request,context={},deps={}){
 const json=(data,status=200)=>Response.json(data,{status,headers});
 const isPreview=(deps.deployContext??context.deploy?.context??env('CONTEXT'))==='deploy-preview';
 // Invited preview only. This model matches the existing site guide; real-provider verification is required before handoff.
 const enabled=(deps.enabled??env('GRAVITY_CONVERSATION_AI_ENABLED')??(isPreview?'true':'false'))==='true';const model=deps.model??env('GRAVITY_CONVERSATION_MODEL')??'gpt-5.6-luna';
 if(request.method==='GET')return json({available:isPreview&&enabled&&!!model,mode:'ai',previewOnly:true});
 if(request.method!=='POST')return json({error:'POST required.'},405);
 if(!allowedOrigin(request))return json({error:'Origin not allowed.'},403);
 if(!isPreview||!enabled||!model)return json({error:'The conversation test is not activated on this deployment. Your words have not been sent to the AI service.'},503);
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'Send JSON.'},415);
 let input;try{const reader=request.body?.getReader();if(!reader)throw Error();const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>100000){await reader.cancel();return json({error:'Conversation too large. Download the record before continuing in a new investigation.'},413)}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}input=validateInput(JSON.parse(new TextDecoder().decode(bytes)))}catch(e){return json({error:e.message||'Invalid conversation.'},400)}
 const enc=new TextEncoder();const stream=new ReadableStream({async start(controller){let closed=false;const send=x=>{if(!closed)try{controller.enqueue(enc.encode(JSON.stringify(x)+'\n'))}catch{closed=true}};send({type:'progress',message:'Looking at your account and the next useful check…'});const timer=setInterval(()=>send({type:'progress',message:'Still preparing your next step…'}),8000);
 try{const client=deps.client??new OpenAI({timeout:45000,maxRetries:0});const response=await client.responses.create({model,store:false,instructions,input:JSON.stringify({conversation:input.messages,reference:sources.map(({id,title,text})=>({id,title,text:text.slice(0,2600)}))}),max_output_tokens:2200,text:{format:{type:'json_schema',name:'gravity_conversation',strict:true,schema:responseSchema}}});if(response.status&&response.status!=='completed')throw Error('Incomplete response');const answer=validateResponse(JSON.parse(response.output_text),input);send({type:'result',answer})}catch(error){console.error('Gravity conversation request failed',error.status||'',error.code||error.name||'');send({type:'error',message:'Gravity could not finish this reply. Your existing history is unchanged. Your new words are still in the box; try again.'})}finally{clearInterval(timer);if(!closed)controller.close()}
 }});return new Response(stream,{headers:{...headers,'Content-Type':'application/x-ndjson; charset=utf-8'}});
}
export default handle;
