const {test,expect}=require('@playwright/test');

async function completeSupportForm(page){
  const form=page.locator('#gravity-support-request');
  await form.locator('[name="name"]').fill('Synthetic Customer');
  await form.locator('[name="email"]').fill('synthetic@example.invalid');
  await form.locator('[name="issue_type"]').selectOption('tool');
  await form.locator('[name="product_or_file"]').fill('Shift Lab');
  await form.locator('[name="device_os"]').fill('Windows 11 desktop');
  await form.locator('[name="browser_version"]').fill('Chromium');
  await form.locator('[name="intended_action"]').fill('Save a shift schedule.');
  await form.locator('[name="steps_to_reproduce"]').fill('Open Shift Lab, enter a shift, then select Save.');
  await form.locator('[name="actual_result"]').fill('The example shift disappeared after a reload.');
  await form.locator('[name="expected_result"]').fill('The example shift should still be visible.');
  return form;
}

test('Contact routes technical problems to Help while keeping general inquiries separate',async({page})=>{
  await page.goto('/contact');
  const link=page.locator('#technical-support-routing a.btn');
  await expect(link).toHaveAttribute('href','/help-center#report-problem');
  await link.click();
  await expect(page).toHaveURL(/\/help-center#report-problem$/);
  await expect(page.locator('#gravity-support-request')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Report a Gravity problem'})).toBeVisible();
});

test('Support form is present in built HTML for Netlify detection, with matching field names and honeypot',async({page})=>{
  await page.goto('/help-center');
  const form=page.locator('#gravity-support-request');
  await expect(form).toHaveAttribute('name','gravity-support-request');
  await expect(form).toHaveAttribute('data-netlify','true');
  await expect(form).toHaveAttribute('netlify-honeypot','bot-field');
  await expect(form.locator('input[name="form-name"]')).toHaveValue('gravity-support-request');
  await expect(form.locator('[name="case_reference"]')).toHaveCount(1);
  await expect(form.locator('[name="submitted_at_utc"]')).toHaveCount(1);
  await expect(form.locator('[name="bot-field"]')).toHaveCount(1);
  await expect(form.getByRole('link',{name:'Use Email Instead'})).toHaveAttribute('href',/thomas\.butler@gravityleadershipsystem\.com/);
  await expect(form).toContainText('Privacy Policy');
  await expect(page.locator('#gravity-support-request .gravity-support-grid')).toBeVisible();
});

test('Invalid support form is not posted',async({page})=>{
  let posts=0;
  await page.route('http://127.0.0.1:8765/',route=>{
    if(route.request().method()==='POST'){posts++;return route.fulfill({status:200,body:'Accepted'});}
    return route.continue();
  });
  await page.goto('/help-center');
  await page.locator('#support-submit').click();
  await expect(page.locator('#support-name')).toBeFocused();
  expect(posts).toBe(0);
});

test('Success requires an HTTP success, sends structured fields, saves reference and blocks resubmission',async({page})=>{
  const received=[];
  await page.route('http://127.0.0.1:8765/',route=>{
    if(route.request().method()==='POST'){
      received.push(new URLSearchParams(route.request().postData()));
      return route.fulfill({status:200,contentType:'text/html',body:'OK'});
    }
    return route.continue();
  });
  await page.goto('/help-center');
  await completeSupportForm(page);
  await page.locator('#support-submit').click();
  await expect(page.locator('#support-submission-status')).toContainText('successful submission response');
  await expect(page.locator('#support-submit')).toBeDisabled();
  expect(received).toHaveLength(1);
  const body=received[0];
  expect(body.get('form-name')).toBe('gravity-support-request');
  expect(body.get('issue_type')).toBe('tool');
  expect(body.get('product_or_file')).toBe('Shift Lab');
  expect(body.get('steps_to_reproduce')).toContain('Open Shift Lab');
  expect(body.get('bot-field')).toBe('');
  expect(body.get('submitted_at_utc')).toMatch(/^\d{4}-\d\d-\d\dT/);
  const ref=body.get('case_reference');
  expect(ref).toMatch(/^GRV-SUP-\d{8}-[A-F0-9]{16}$/);
  await expect(page.locator('#support-submission-status')).toContainText(ref);
  await expect(page.locator('#support-submission-status')).toContainText('not a Control Room case number');
  const followUp=page.locator('#support-submission-status a');
  await expect(followUp).toHaveText('Follow up by email with this reference');
  await expect(followUp).toHaveAttribute('href',new RegExp('^mailto:thomas\\.butler@gravityleadershipsystem\\.com\\?subject='));
  await expect(followUp).toHaveAttribute('href',new RegExp(ref));
  await page.locator('#gravity-support-request').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  expect(received).toHaveLength(1);
  await page.reload();
  await expect(page.locator('#support-submission-status')).toContainText(ref);
  await expect(page.locator('#support-submission-status a')).toHaveAttribute('href',new RegExp(ref));
});

test('Non-2xx failure preserves entries and retry reuses the same reference, without false receipt',async({page})=>{
  const refs=[];
  let attempt=0;
  await page.route('http://127.0.0.1:8765/',route=>{
    if(route.request().method()==='POST'){
      refs.push(new URLSearchParams(route.request().postData()).get('case_reference'));
      attempt++;
      return route.fulfill({status:attempt===1?503:200,body:attempt===1?'Unavailable':'OK'});
    }
    return route.continue();
  });
  await page.goto('/help-center');
  await completeSupportForm(page);
  await page.locator('#support-submit').click();
  await expect(page.locator('#support-submission-status')).toContainText('could not be confirmed');
  await expect(page.locator('#support-submission-status')).not.toContainText('successful submission response');
  await expect(page.locator('#support-submit')).toBeEnabled();
  await expect(page.locator('#support-product')).toHaveValue('Shift Lab');
  await page.locator('#support-submit').click();
  await expect(page.locator('#support-submission-status')).toContainText('successful submission response');
  expect(refs).toHaveLength(2);
  expect(refs[0]).toBe(refs[1]);
});

test('Network timeout or abort does not issue a false acceptance receipt',async({page})=>{
  let intercepted=0;
  await page.route('http://127.0.0.1:8765/',route=>{
    if(route.request().method()==='POST'){intercepted++;return route.abort('timedout');}
    return route.continue();
  });
  await page.goto('/help-center');
  await completeSupportForm(page);
  await page.locator('#support-submit').click();
  await expect(page.locator('#support-submission-status')).toContainText('Do not assume it was received');
  await expect(page.locator('#support-submit')).toBeEnabled();
  await expect(page.locator('#support-name')).toHaveValue('Synthetic Customer');
  expect(intercepted).toBe(1);
});

test('Only one in-flight support submission is allowed',async({page})=>{
  let unblock;
  const gate=new Promise(resolve=>{unblock=resolve;});
  let received=0;
  await page.route('http://127.0.0.1:8765/',async route=>{
    if(route.request().method()!=='POST')return route.continue();
    received++;
    await gate;
    await route.fulfill({status:200,body:'OK'});
  });
  await page.goto('/help-center');
  await completeSupportForm(page);
  await page.locator('#support-submit').click();
  await expect(page.locator('#support-submit')).toBeDisabled();
  await page.locator('#gravity-support-request').evaluate(form=>{
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  });
  expect(received).toBe(1);
  unblock();
  await expect(page.locator('#support-submission-status')).toContainText('successful submission response');
  expect(received).toBe(1);
});
