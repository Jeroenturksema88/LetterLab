'use client';

// components/RotatieOverlay.tsx — Toont een vriendelijke prompt wanneer het iPad
// in portrait staat. De canvas-flow vereist landscape om de teken-ruimte
// werkbaar te houden. Speelt ook een Nederlandse audio-prompt af zodat
// pre-leerkinderen die de tekst niet kunnen lezen toch begrijpen wat te doen.

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstellingenStore } from '@/stores/instellingen-store';

export default function RotatieOverlay() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobiel, setIsMobiel] = useState(false);
  const audioAan = useInstellingenStore((s) => s.audioAan);
  const heeftGesprokenRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function check() {
      const portrait = window.innerHeight > window.innerWidth;
      // Alleen tonen op mobiel/tablet (smalle viewport). Desktop in portrait is
      // ongewoon en hoeft de overlay niet te zien.
      const mobiel = window.innerWidth < 1100 && 'ontouchstart' in window;
      setIsPortrait(portrait);
      setIsMobiel(mobiel);
    }

    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  const tonen = isPortrait && isMobiel;

  // Speel "draai je iPad om" audio wanneer de overlay zichtbaar wordt.
  // Eén keer per sessie; reset wanneer de overlay verdwijnt zodat een
  // tweede portrait-detectie opnieuw kan spreken.
  useEffect(() => {
    if (!tonen) {
      heeftGesprokenRef.current = false;
      return;
    }
    if (!audioAan) return;
    if (heeftGesprokenRef.current) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    heeftGesprokenRef.current = true;

    // Korte vertraging zodat de visuele animatie eerst landt
    const timer = setTimeout(() => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const stemmen = synth.getVoices();
      const nlStem =
        stemmen.find((s) => s.lang === 'nl-NL' && s.localService) ||
        stemmen.find((s) => s.lang === 'nl-NL') ||
        stemmen.find((s) => s.lang.startsWith('nl'));

      const uiting = new SpeechSynthesisUtterance('Draai je iPad om alsjeblieft');
      uiting.lang = 'nl-NL';
      uiting.rate = 0.85;
      uiting.pitch = 1.05;
      if (nlStem) uiting.voice = nlStem;
      synth.speak(uiting);
    }, 600);

    return () => clearTimeout(timer);
  }, [tonen, audioAan]);

  return (
    <AnimatePresence>
      {tonen && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 p-8 bg-warm-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alert"
          aria-live="polite"
        >
          <motion.div
            animate={{ rotate: [0, 90, 90, 0, 0], scale: [1, 1.05, 1, 1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.55, 0.75, 1] }}
          >
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              {/* iPad-silhouet */}
              <rect
                x="20" y="10" width="80" height="100" rx="10"
                fill="none" stroke="#6366F1" strokeWidth="6"
              />
              <circle cx="60" cy="98" r="3" fill="#6366F1" />
              {/* Pijl die rotatie suggereert */}
              <path
                d="M 14 60 Q 8 50 14 40"
                fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"
              />
              <path d="M 14 40 L 18 36 M 14 40 L 18 44" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </motion.div>
          <p className="text-xl md:text-2xl text-center font-semibold text-[#4A3728]">
            Draai je iPad naar de zijkant
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
