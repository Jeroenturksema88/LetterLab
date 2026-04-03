'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Ontgrendelt audio op iOS Safari door bij de eerste gebruikersinteractie
 * een stille utterance af te spelen. Dit is nodig omdat iOS Safari
 * speechSynthesis.speak() en Audio.play() blokkeert totdat er een
 * user gesture heeft plaatsgevonden.
 *
 * Plaats dit component zo hoog mogelijk in de component-boom (layout).
 */
export default function AudioOntgrendelaar({ children }: { children: React.ReactNode }) {
  const ontgrendeldRef = useRef(false);

  const ontgrendelAudio = useCallback(() => {
    if (ontgrendeldRef.current) return;
    ontgrendeldRef.current = true;

    // 1. Ontgrendel Web Speech API met een lege utterance
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const stilleUiting = new SpeechSynthesisUtterance('');
      stilleUiting.volume = 0;
      stilleUiting.lang = 'nl-NL';
      window.speechSynthesis.speak(stilleUiting);
    }

    // 2. Ontgrendel AudioContext (voor geluidseffecten)
    try {
      const ctx = new AudioContext();
      // Maak een korte stille buffer en speel die af
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      // Resume als suspended (iOS Safari)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch {
      // AudioContext niet beschikbaar, negeer
    }

    // 3. Ontgrendel HTML5 Audio
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwWHAAAAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQZB8P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
      audio.volume = 0;
      audio.play().catch(() => {});
    } catch {
      // Negeer
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Luister naar de eerste interactie op het hele document
    const events = ['touchstart', 'touchend', 'mousedown', 'click', 'pointerdown'];

    const handler = () => {
      ontgrendelAudio();
      // Verwijder alle listeners na ontgrendeling
      events.forEach((e) => document.removeEventListener(e, handler, true));
    };

    events.forEach((e) => document.addEventListener(e, handler, true));

    return () => {
      events.forEach((e) => document.removeEventListener(e, handler, true));
    };
  }, [ontgrendelAudio]);

  return <>{children}</>;
}
