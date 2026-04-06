'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Ontgrendelt audio op iOS Safari.
 * iOS Safari blokkeert speechSynthesis en Audio tot na een user gesture.
 * Dit component luistert naar de eerste tap en ontgrendelt alles.
 */
export default function AudioOntgrendelaar({ children }: { children: React.ReactNode }) {
  const ontgrendeldRef = useRef(false);

  const ontgrendelAudio = useCallback(() => {
    if (ontgrendeldRef.current) return;
    ontgrendeldRef.current = true;

    // 1. Ontgrendel Web Speech API
    // iOS Safari vereist een NIET-lege utterance met volume > 0
    // om de speech engine echt te activeren
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel eventuele hangende spraak
      window.speechSynthesis.cancel();

      // Spreek een heel kort woordje uit op minimaal volume
      const uiting = new SpeechSynthesisUtterance('.');
      uiting.volume = 0.01; // Bijna onhoorbaar maar niet 0
      uiting.rate = 2; // Zo snel mogelijk
      uiting.lang = 'nl-NL';

      // Probeer een Nederlandse stem te vinden
      const stemmen = window.speechSynthesis.getVoices();
      const nlStem = stemmen.find((s) => s.lang === 'nl-NL') ||
                     stemmen.find((s) => s.lang.startsWith('nl'));
      if (nlStem) uiting.voice = nlStem;

      window.speechSynthesis.speak(uiting);
    }

    // 2. Ontgrendel AudioContext
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      if (ctx.state === 'suspended') ctx.resume();
    } catch {
      // Negeer
    }

    // 3. Ontgrendel HTML5 Audio element
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      audio.volume = 0.01;
      audio.play().catch(() => {});
    } catch {
      // Negeer
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const events = ['touchstart', 'touchend', 'mousedown', 'click', 'pointerdown'];

    const handler = () => {
      ontgrendelAudio();
      events.forEach((e) => document.removeEventListener(e, handler, true));
    };

    // Capture phase zodat we voor alle andere handlers komen
    events.forEach((e) => document.addEventListener(e, handler, { capture: true, passive: true }));

    return () => {
      events.forEach((e) => document.removeEventListener(e, handler, true));
    };
  }, [ontgrendelAudio]);

  return <>{children}</>;
}
