'use strict';
// Read-only side-by-side menu and appearance audit. NEVER submits forms or calls customer APIs.
const fs = require('node:fs');
const {chromium} = require('playwright');
const urls = {
  TMB: 'https://thomasmonroebooks.com/',
  GRAVITY: process.env.PARITY_GRAVITY_URL || 'https://gravity-leadership-system.netlify.app/'
};
const sizes = [{width:390,height:844},{width:820,height:1040},{width:1280,height:800},{width:1920,height:1080}];
const results=[];
function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const viewport of sizes){
    for(const [site,url] of Object.entries(urls)){
      const page=await browser.newPage({viewport,deviceScaleFactor:1});
      let navigated=false, err=null;
      const failed=[];
      page.on('requestfailed',r=>{if(failed.length<15)failed.push({url:r.url(),failure:r.failure()?.errorText})});
      try{
        const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
        navigated=true;
        await page.waitForTimeout(1600);
        const enter=page.locator('#gravity-first-visit:not([hidden]) [data-welcome-enter]');
        if(await enter.count()) await enter.last().click({timeout:5000}).catch(()=>{});
        await page.waitForTimeout(300);
        let initial=await page.evaluate(()=>{
          const nav=document.querySelector('nav[data-menu],#site-nav');
          const toggle=document.querySelector('[data-menu-toggle]');
          return {url:location.href,title:document.title,navCount:nav?.querySelectorAll('a').length??0,navItems:[...(nav?.querySelectorAll('a')||[])].map(a=>a.textContent.trim()),navHTMLLength:nav?.innerHTML.length??0,navVisible:nav?getComputedStyle(nav).display!=='none':false,toggleVisible:toggle?getComputedStyle(toggle).display!=='none':false,welcomeVisible:!!document.querySelector('#gravity-first-visit:not([hidden])'),previewNotice:!!document.querySelector('#gravity-migration-preview-notice'),cssSheets:document.styleSheets.length};
        });
        if(initial.toggleVisible){
          const toggle=page.locator('[data-menu-toggle]').first();
          await toggle.click({timeout:4000});
          await page.waitForTimeout(200);
        }
        const after=await page.evaluate(()=>{
          const nav=document.querySelector('nav[data-menu],#site-nav');
          const toggle=document.querySelector('[data-menu-toggle]');
          if(!nav)return {error:'nav missing'};
          const ns=getComputedStyle(nav),nr=nav.getBoundingClientRect();
          const ancestor=[];
          for(let e=nav.parentElement;e&&ancestor.length<5;e=e.parentElement){const st=getComputedStyle(e);ancestor.push({tag:e.tagName,cls:e.className,overflowX:st.overflowX,overflowY:st.overflowY,rect:[Math.round(e.getBoundingClientRect().x),Math.round(e.getBoundingClientRect().y),Math.round(e.getBoundingClientRect().width),Math.round(e.getBoundingClientRect().height)]})}
          const anchors=[...nav.querySelectorAll('a')].map(a=>{
            const r=a.getBoundingClientRect();const st=getComputedStyle(a);
            const center=[r.left+r.width/2,r.top+r.height/2];
            let overlapped = false;
            if(center[0]>0&&center[0]<innerWidth&&center[1]>0&&center[1]<innerHeight) {
              const e=document.elementFromPoint(center[0],center[1]);
              overlapped = e!==a&&!a.contains(e);
            }
            return {text:a.textContent.trim(),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),display:st.display,visible:st.visibility!=='hidden'&&st.display!=='none'&&st.opacity!=='0'&&r.width>0&&r.height>0,withinViewport:r.y<innerHeight&&r.bottom>0,overlapped};
          });
          return {navDisplay:ns.display,navPosition:ns.position,navOverflow:ns.overflowY,navMaxHeight:ns.maxHeight,navRect:[Math.round(nr.x),Math.round(nr.y),Math.round(nr.width),Math.round(nr.height)],scrollHeight:nav.scrollHeight,clientHeight:nav.clientHeight,linksVisible:anchors.filter(a=>a.visible).length,linksVisibleWithoutScrolling:anchors.filter(a=>a.visible&&a.y>=nr.top&&a.y+a.h<=Math.min(nr.bottom,innerHeight)).length,linksWithinViewport:anchors.filter(a=>a.visible&&a.withinViewport).length,links:anchors,ancestors:ancestor,toggleExpanded:toggle?.getAttribute('aria-expanded')};
        });
        const filename='gravity-nav-'+site.toLowerCase()+'-'+viewport.width+'.png';
        await page.screenshot({path:filename,fullPage:false}).catch(()=>{});
        results.push({site,viewport,code:response?.status(),initial,after,failed,filename});
        console.log(JSON.stringify({site,viewport,code:response?.status(),initial,after,failed,filename}));
      }catch(e){err=e.message;results.push({site,viewport,navigated,error:err,failed});console.log(JSON.stringify({site,viewport,error:err,failed}));}
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync('gravity-nav-parity.json',JSON.stringify(results,null,2));
  const mismatch=[];
  for(const size of sizes){const a=results.find(x=>x.viewport.width===size.width&&x.site==='TMB');const b=results.find(x=>x.viewport.width===size.width&&x.site==='GRAVITY');if(!a?.after||!b?.after){mismatch.push('Unable to compare '+size.width);continue}if(JSON.stringify(a.initial?.navItems)!==JSON.stringify(b.initial?.navItems))mismatch.push('Navigation source discrepancy '+size.width);if(a.after.linksVisibleWithoutScrolling!==b.after.linksVisibleWithoutScrolling)mismatch.push('Visible nav discrepancy '+size.width+': '+a.after.linksVisibleWithoutScrolling+' vs '+b.after.linksVisibleWithoutScrolling)}
  console.log('NAV_PARITY_FINDINGS '+JSON.stringify({mismatches:mismatch}));
  if(mismatch.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=2});
