const {test,expect}=require('@playwright/test');

test('Free Resources explains how to open ZIP, PDF, and editable files on desktop and phone',async({page})=>{
 await page.goto('/free-resources');
 const guide=page.locator('#download-getting-started');
 await expect(guide.getByRole('heading',{name:'Open the files, then put one tool to work.'})).toBeVisible();
 await expect(guide).toContainText('Extract All');
 await expect(guide).toContainText('iPhone');
 await expect(guide).toContainText('Android');
 await expect(guide).toContainText('PDF');
 await expect(guide).toContainText('DOCX');
 await expect(guide).toContainText('XLSX');
 await expect(guide).toContainText('PPTX');
 await expect(guide).toContainText('3–5 useful forms');
 await expect(guide.getByRole('link',{name:'Download the Start Here Guide'}))
   .toHaveAttribute('href','assets/customer-resources/current/Gravity_Start_Here_v2.6_2026-10-10.pdf');
 await expect(guide.getByRole('link',{name:'Need Help Opening a File?'})).toHaveAttribute('href','/help-center');
});

test('Registration confirmation leads directly to help opening files without extra registration',async({page})=>{
 await page.goto('/registration-thanks');
 const link=page.getByRole('link',{name:/Downloaded a ZIP, PDF, or editable file/});
 await expect(link).toHaveAttribute('href','/free-resources#download-getting-started');
 await link.click();
 await expect(page).toHaveURL(/\/free-resources#download-getting-started$/);
 await expect(page.locator('#download-getting-started')).toBeVisible();
});

test('First-use instructions do not remove or replace any existing Free Resources downloads',async({page})=>{
 await page.goto('/free-resources');
 const hrefs=await page.locator('a[download]').evaluateAll(list=>[...new Set(list.map(x=>x.getAttribute('href')))].filter(Boolean));
 expect(hrefs.length).toBeGreaterThanOrEqual(34);
 await expect(page.getByRole('navigation',{name:'Browse by resource type'}).locator('a')).toHaveCount(4);
 await expect(page.locator('#all-operating-systems .comparison-card')).toHaveCount(15);
});
