/* Ponte Vedra Beach Tides — service worker.
   Caches the app shell so it opens instantly; tide data always comes
   fresh from NOAA over the network, never from cache. */
var CACHE = "pvb-tides-v1";
var SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-180.png"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var url = new URL(e.request.url);
  // Tide data: always network, so every open shows live predictions.
  if(url.hostname.indexOf("tidesandcurrents.noaa.gov") !== -1) return;
  e.respondWith(
    caches.match(e.request).then(function(hit){ return hit || fetch(e.request); })
  );
});
