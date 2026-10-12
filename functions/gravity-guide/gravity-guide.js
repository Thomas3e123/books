'use strict';
exports.handler = async function(event) {
  try {
    const method = event.httpMethod || 'GET';
    if (method === 'GET') return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({ok:true,function:'gravity-guide',configured:Boolean(process.env.OPENAI_API_KEY)})};
    const run = (await import('./guide-core.mjs')).default;
    const request = new Request('https://thomasmonroebooks.com/.netlify/functions/gravity-guide', {method,headers:event.headers||{},body:['GET','HEAD'].includes(method)?undefined:(event.isBase64Encoded?Buffer.from(event.body||'','base64').toString():event.body||'')});
    const response = await run(request);
    return {statusCode:response.status,headers:{...Object.fromEntries(response.headers),'Cache-Control':'no-store'},body:await response.text()};
  } catch (error) {
    console.error('Gravity Guide request failed',error.name);
    return {statusCode:502,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({error:'Gravity Guide AI is temporarily unavailable.'})};
  }
};
