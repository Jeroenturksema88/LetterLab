// public/sw.js — Lichtgewicht service worker voor LetterLab.
//
// Doel: app werkt offline op iPad zodra de boel een keer geladen is.
// - Pre-cache: shell, manifest, iconen.
// - Runtime: stale-while-revalidate voor statische assets en eigen data.
// - Audio: cache-first (bestanden zijn immutable per itemId/type).

const CACHE_VERSIE = 'letterlab-v1-2026-04-26';
const SHELL_BESTANDEN = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSIE).then((cache) => cache.addAll(SHELL_BESTANDEN))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((sleutels) =>
      Promise.all(sleutels.filter((s) => s !== CACHE_VERSIE).map((s) => caches.delete(s)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const verzoek = event.request;
  if (verzoek.method !== 'GET') return;

  const url = new URL(verzoek.url);
  if (url.origin !== self.location.origin) return;

  // Audio: cache-first (immutable assets, mogen lang in cache blijven)
  if (url.pathname.startsWith('/audio/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(verzoek).then((cacheHit) => {
        if (cacheHit) return cacheHit;
        return fetch(verzoek).then((respons) => {
          if (respons && respons.ok) {
            const kopie = respons.clone();
            caches.open(CACHE_VERSIE).then((cache) => cache.put(verzoek, kopie));
          }
          return respons;
        }).catch(() => cacheHit);
      })
    );
    return;
  }

  // HTML / data: network-first met cache-fallback
  event.respondWith(
    fetch(verzoek).then((respons) => {
      if (respons && respons.ok && respons.type === 'basic') {
        const kopie = respons.clone();
        caches.open(CACHE_VERSIE).then((cache) => cache.put(verzoek, kopie));
      }
      return respons;
    }).catch(() => caches.match(verzoek).then((c) => c || caches.match('/')))
  );
});
