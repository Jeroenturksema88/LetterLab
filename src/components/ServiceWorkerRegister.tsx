'use client';

// components/ServiceWorkerRegister.tsx — Registreert de service worker voor PWA-functionaliteit.
// Alleen actief in productie; in dev is een SW lastig vanwege HMR.

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    // Registreer na "load" zodat het de initiële paginaprestatie niet vertraagt
    const registreer = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          // Stilzwijgend negeren: de app werkt ook zonder SW
        });
    };

    if (document.readyState === 'complete') {
      registreer();
    } else {
      window.addEventListener('load', registreer, { once: true });
    }
  }, []);

  return null;
}
