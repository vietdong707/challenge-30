// Network first: online users always get the newest version; offline users get the last copy.
const CACHE='challenge30-v1';
self.addEventListener('install',()=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin) return;
  e.respondWith((async()=>{
    try{
      const res=await fetch(r);
      if(res&&res.ok){ const c=await caches.open(CACHE); c.put(r,res.clone()); }
      return res;
    }catch(err){
      const c=await caches.open(CACHE);
      const hit=await c.match(r,{ignoreSearch:true});
      if(hit) return hit;
      if(r.mode==='navigate'){ const idx=await c.match(self.registration.scope); if(idx) return idx; }
      throw err;
    }
  })());
});
