'use client';

// components/SessieLimietBewaker.tsx — Bewaakt of de sessie de ouder-ingestelde
// limiet overschrijdt en toont dan een "klaar voor vandaag"-overlay die alleen
// via pincode-invoer is te ontgrendelen.
//
// Persona "Lisa" (panel): single mom rekent erop dat sessielimiet ENFORCED
// wordt zodat zij weet dat haar kind na 30 min stopt. Voorheen was sessieLimiet
// een lege belofte; nu bewaakt deze component het actief.
//
// Werking:
// - Op mount zet `sessieStartTijd` in store als hij null is.
// - Elke 15 seconden: check (now - start) > limit. Bij overschrijding: toon overlay.
// - Pincode-unlock reset `sessieStartTijd` naar nu zodat het kind nog X minuten
//   verder kan.
// - sessieLimiet === 0 betekent "onbeperkt" — bewaker doet niks.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstellingenStore } from '@/stores/instellingen-store';

const CHECK_INTERVAL_MS = 15000;

export default function SessieLimietBewaker() {
  const sessieLimiet = useInstellingenStore((s) => s.sessieLimiet);
  const sessieStartTijd = useInstellingenStore((s) => s.sessieStartTijd);
  const pincode = useInstellingenStore((s) => s.pincode);
  const updateInstellingen = useInstellingenStore((s) => s.updateInstellingen);

  const [overschreden, setOverschreden] = useState(false);
  const [pinInvoer, setPinInvoer] = useState('');
  const [pinFout, setPinFout] = useState(false);

  // Initialiseer sessieStartTijd op mount als die nog null is.
  useEffect(() => {
    if (sessieStartTijd === null) {
      updateInstellingen({ sessieStartTijd: Date.now() });
    }
  }, [sessieStartTijd, updateInstellingen]);

  // Periodieke check
  useEffect(() => {
    if (sessieLimiet === 0) {
      // Onbeperkt — geen bewaking
      setOverschreden(false);
      return;
    }
    if (sessieStartTijd === null) return;

    const limietMs = sessieLimiet * 60 * 1000;

    function check() {
      const verlopen = Date.now() - (sessieStartTijd ?? Date.now());
      if (verlopen >= limietMs) {
        setOverschreden(true);
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessieLimiet, sessieStartTijd]);

  const handlePinInvoer = (cijfer: string) => {
    const nieuw = pinInvoer + cijfer;
    setPinInvoer(nieuw);
    setPinFout(false);

    if (nieuw.length === 4) {
      if (nieuw === pincode) {
        // Correct: reset sessietijd zodat het kind weer X minuten heeft.
        updateInstellingen({ sessieStartTijd: Date.now() });
        setOverschreden(false);
        setPinInvoer('');
      } else {
        setPinFout(true);
        setTimeout(() => {
          setPinInvoer('');
          setPinFout(false);
        }, 1000);
      }
    }
  };

  if (!overschreden) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[180] flex flex-col items-center justify-center p-6 bg-warm-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-label="Sessielimiet bereikt"
      >
        {/* Vrolijk icoon — zon die ondergaat als metafoor voor "klaar voor vandaag" */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="55" r="22" fill="#F59E0B" />
            {/* Zonnestralen */}
            {Array.from({ length: 8 }).map((_, i) => {
              const hoek = (i / 8) * Math.PI * 2;
              const x1 = 50 + Math.cos(hoek) * 30;
              const y1 = 55 + Math.sin(hoek) * 30;
              const x2 = 50 + Math.cos(hoek) * 38;
              const y2 = 55 + Math.sin(hoek) * 38;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Slapend gezichtje */}
            <path d="M 42 53 L 47 53" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 53 53 L 58 53" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 44 63 Q 50 67 56 63" stroke="#451A03" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </motion.div>

        <motion.h2
          className="mt-8 text-3xl font-bold text-center"
          style={{ color: '#92400E' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Klaar voor vandaag!
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-gray-600 max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Knap gedaan. Tot morgen!
        </motion.p>

        {/* Ouder-ontgrendel sectie — discreet onder het kind-bericht */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-3 opacity-70 hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-gray-500">Ouder: voer pincode in om door te gaan</p>
          <div className="flex gap-2 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < pinInvoer.length
                    ? pinFout
                      ? 'bg-red-400'
                      : 'bg-letter-kleur'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((cijfer) => (
              <button
                key={cijfer}
                onClick={() => {
                  if (cijfer === '←') setPinInvoer((p) => p.slice(0, -1));
                  else if (cijfer) handlePinInvoer(cijfer);
                }}
                className={`w-12 h-12 rounded-xl text-lg font-bold flex items-center justify-center ${
                  cijfer ? 'bg-white shadow-sm active:bg-gray-100' : ''
                }`}
                disabled={!cijfer || pinInvoer.length >= 4}
              >
                {cijfer}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
