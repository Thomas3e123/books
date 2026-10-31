/* Shift Lab offline shell: cache only known public static assets.
 * NEVER intercept/cache identity, authenticated API, encrypted cloud backup,
 * hosted employee activity, or unrelated restaurant tools.
 */
const CACHE='gravity-shift-lab-v9-static-only-cloud-safe';
const CORE=[
 '/gravity-shift-lab','/gravity-shift-lab.html','/gravity-shift-lab.webmanifest',
 '/assets/js/gravity-shift-lab.js','/assets/js/gravity-qr.js','/assets/js/site.js',
 '/assets/js/gravity-local-recovery-v1.js','/assets/js/gravity-cloud-vault-v1.js',
 '/assets/css/styles.css','/assets/css/shift-lab-web-sync.css',
 '/assets/images/gravity-system-mark.svg','/assets/images/shift-lab-icon-192.png','/assets/images/shift-lab-icon-512.png'
];
const allowed=new Set(CORE);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(name=>name.startsWith('gravity-shift-lab-')&&name!==CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 // The worker may control requests beyond the page URL's scope.
 // Only explicitly listed public static resources are eligible for caching.
 if(url.origin!==self.location.origin||!allowed.has(url.pathname))return;
 event.respondWith(
  fetch(req).then(response=>{
   if(response.ok&&response.type==='basic'){
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));
   }
   return response;
  }).catch(async()=>{
   const cache=await caches.open(CACHE);
   const cached=await cache.match(req,{ignoreSearch:true});
   if(cached)return cached;
   return new Response('Shift Lab offline file is unavailable',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })
 );
});
