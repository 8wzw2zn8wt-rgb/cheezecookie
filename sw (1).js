// 치즈쿠키 가계부 — 오프라인에서도 열리도록 파일을 저장해 둠. 앱을 고치면 VERSION 숫자를 올리기.
const VERSION = "ccgb-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // 앱 파일: 새 버전을 먼저 받아보고, 인터넷이 없으면 저장본 사용
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
    return;
  }
  // 글꼴: 한 번 받으면 저장본 사용
  if (url.host.endsWith("fonts.googleapis.com") || url.host.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return res; })));
  }
});
