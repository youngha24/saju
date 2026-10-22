/* 사주 ✦ 운세 — 오프라인 캐시 서비스워커 v3.0 (2026-10-21 · 시·분 입력·검토 반영) */
var CACHE="saju-v31";
var ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-180.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k.indexOf("saju-")===0&&k!==CACHE)return caches.delete(k);   /* 같은 주소의 다른 앱 캐시는 건드리지 않는다 */}));}).then(function(){return self.clients.claim();}));
});
/* HTML·네비게이션은 network-first — 새 버전을 올려도 사용자가 구버전 화면에 고착되지 않게 한다.
   네트워크가 없으면 캐시로 떨어지므로 오프라인 동작은 그대로 유지된다.
   그 밖의 정적 자산(아이콘·매니페스트)은 cache-first로 두어 재방문 속도를 지킨다. */
function offline(){
  return caches.match("./index.html",{ignoreSearch:true}).then(function(r){return r||caches.match("./",{ignoreSearch:true});});
}
function isDoc(req){
  return req.mode==="navigate" || (req.headers.get("accept")||"").indexOf("text/html")>=0;
}
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET") return;
  if(isDoc(req)){
    e.respondWith(
      /* 4초 안에 정상 응답이 없거나 404·500 이면 오프라인 사본을 보여 준다(사본이 없을 때만 받은 응답 그대로) */
      new Promise(function(ok,no){ var t=setTimeout(no,4000); fetch(req).then(function(r){clearTimeout(t);ok(r);},function(x){clearTimeout(t);no(x);}); })
      .then(function(res){
        if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});return res;}
        return offline().then(function(r){return r||res;});
      }).catch(offline)
    );
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(r){return r||fetch(req);}));
});
