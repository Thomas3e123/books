// One controlled, clearly marked synthetic customer-support intake test.
// This does not include any customer, employee, payment or login data.
// DO NOT enable automatic reruns: each execution creates one real QA-only form entry.
import {randomBytes} from 'node:crypto';
const reference='GRV-SUP-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+randomBytes(8).toString('hex').toUpperCase();
const data={
 'form-name':'gravity-support-request',
 'case_reference':reference,
 'submitted_at_utc':new Date().toISOString(),
 'bot-field':'',
 'name':'Gravity Audit QA - Controlled Test',
 'email':'thomas3e@gmail.com',
 'issue_type':'other',
 'product_or_file':'Gravity Help Center - controlled notification verification',
 'device_os':'Automated browser-equivalent HTTP client',
 'browser_version':'Node.js 22 audit client',
 'page_or_filename':'https://gravityleadershipsystem.com/help-center',
 'when_happened':new Date().toISOString(),
 'intended_action':'Verify that a valid technical support request is accepted, recorded, and routed to the correct staff inbox. This is a controlled quality assurance check.',
 'steps_to_reproduce':'Submit one complete technical support request through the public Netlify Forms POST endpoint, using harmless synthetic fields and an audit-only reference.',
 'actual_result':'No customer problem has occurred. This submission is a synthetic QA request for verification of the real support intake and email notification path.',
 'expected_result':'Netlify records the single synthetic request and sends its normal notification to the configured support recipient, if notifications are enabled.',
 'already_tried':'Read-only live checks passed. This is the first and only write-side support notification test.',
 'impact':'question'
};
const response=await fetch('https://gravityleadershipsystem.com/',{
 method:'POST',redirect:'manual',
 headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'text/html,*/*','Origin':'https://gravityleadershipsystem.com','User-Agent':'GravitySupportDeliveryQA/1.0'},
 body:new URLSearchParams(data).toString(),
 signal:AbortSignal.timeout(20000)
});
console.log('GRAVITY_SUPPORT_DELIVERY_QA '+JSON.stringify({
 reference,status:response.status,
 location:response.headers.get('location')||null,
 acceptedHttp:response.status>=200&&response.status<400,
 exactlyOnePost:true,syntheticTest:true
}));
if(response.status<200||response.status>=400)process.exitCode=1;
