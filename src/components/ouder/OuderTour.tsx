'use client';

// components/ouder/OuderTour.tsx — 3-stap eerste-keer onboarding voor het ouder-
// dashboard. Wordt één keer per gebruiker getoond; vlag in instellingen-store.
//
// Doel: een ouder/oma die het dashboard voor het eerst opent (persona "Carola"
// uit het panel) snapt zonder uitleg niet wat de drie secties doen. Een korte
// tour van 3 schermpjes maakt de mentale model in 30 seconden duidelijk.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstellingenStore } from '@/stores/instellingen-store';

interface TourStap {
  titel: string;
  uitleg: string;
  icoon: React.ReactNode;
}

const STAPPEN: TourStap[] = [
  {
    titel: 'Voortgang',
    uitleg: 'Hier zie je hoe ver je kind is met letters, cijfers en vormen. Tik op een balk om per item te zien wat al af is.',
    icoon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    titel: 'Instellingen',
    uitleg: 'Audio aan/uit, schrijfhand, hoe streng de beoordeling is, en hoe lang je kind per dag mag spelen. Tik op het ⓘ-icoontje voor uitleg.',
    icoon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    titel: 'Pincode & Reset',
    uitleg: 'Wijzig de pincode (standaard 1234 — verander hem!) zodat je kind dit dashboard niet zelf kan openen. Reset wist alle voortgang.',
    icoon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

export default function OuderTour() {
  const dashboardTourGezien = useInstellingenStore((s) => s.dashboardTourGezien);
  const updateInstellingen = useInstellingenStore((s) => s.updateInstellingen);
  const [stap, setStap] = useState(0);

  if (dashboardTourGezien) return null;

  const sluiten = () => {
    updateInstellingen({ dashboardTourGezien: true });
  };

  const volgende = () => {
    if (stap < STAPPEN.length - 1) {
      setStap(stap + 1);
    } else {
      sluiten();
    }
  };

  const huidigeStap = STAPPEN[stap];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-label="Eerste-keer tour"
      >
        <motion.div
          key={stap}
          className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        >
          {/* Sluit-knop rechtsboven (skip) */}
          <button
            onClick={sluiten}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-medium"
            aria-label="Tour overslaan"
          >
            Overslaan
          </button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STAPPEN.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === stap ? 24 : 8,
                  height: 8,
                  backgroundColor: i === stap ? '#6366F1' : i < stap ? '#A5B4FC' : '#E5E7EB',
                }}
              />
            ))}
          </div>

          {/* Icoon + tekst */}
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 88,
                height: 88,
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)',
              }}
            >
              {huidigeStap.icoon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{huidigeStap.titel}</h2>
            <p className="text-gray-600 leading-relaxed">{huidigeStap.uitleg}</p>
          </div>

          {/* Volgende-knop */}
          <button
            onClick={volgende}
            className="mt-6 w-full py-3 rounded-xl text-white font-semibold transition-colors"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            }}
          >
            {stap < STAPPEN.length - 1 ? 'Volgende' : 'Begrepen!'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
