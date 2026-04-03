'use client';

// hooks/useAudio.ts — Audiohook: Web Speech API (TTS) met pre-recorded fallback
//
// Probeert eerst een vooraf opgenomen .mp3 af te spelen.
// Als dat niet lukt, valt de hook terug op de Web Speech API met
// Nederlandse stem (nl-NL).

import { useRef, useState, useEffect, useCallback } from 'react';
import type { AudioType, Categorie } from '@/types';

export function useAudio(audioAan: boolean = true) {
  const [stemKlaar, setStemKlaar] = useState(false);
  const nederlandseStemRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Zoek een Nederlandse stem bij het mounten
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const zoekNederlandseStem = () => {
      const stemmen = window.speechSynthesis.getVoices();
      // Zoek specifiek een nl-NL stem, val terug op nl-*
      const nlStem =
        stemmen.find((s) => s.lang === 'nl-NL') ||
        stemmen.find((s) => s.lang.startsWith('nl'));

      if (nlStem) {
        nederlandseStemRef.current = nlStem;
      }

      setStemKlaar(true);
    };

    // Stemmen zijn mogelijk al beschikbaar
    if (window.speechSynthesis.getVoices().length > 0) {
      zoekNederlandseStem();
    }

    // In sommige browsers worden stemmen asynchroon geladen
    window.speechSynthesis.addEventListener('voiceschanged', zoekNederlandseStem);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', zoekNederlandseStem);
    };
  }, []);

  // Stop eventuele lopende audio bij unmounten
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  /**
   * Spreek een tekst uit via de Web Speech API (TTS).
   * Gebruikt de Nederlandse stem als die beschikbaar is.
   * Snelheid: 0.85 (iets langzamer), toonhoogte: 1.1 (iets hoger, kindvriendelijk).
   */
  const spreek = useCallback(
    (tekst: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!audioAan) {
          resolve();
          return;
        }

        if (typeof window === 'undefined' || !window.speechSynthesis) {
          reject(new Error('Web Speech API niet beschikbaar'));
          return;
        }

        // Annuleer eventuele lopende spraak
        window.speechSynthesis.cancel();

        const uitspraak = new SpeechSynthesisUtterance(tekst);
        uitspraak.lang = 'nl-NL';
        uitspraak.rate = 0.85;
        uitspraak.pitch = 1.1;

        if (nederlandseStemRef.current) {
          uitspraak.voice = nederlandseStemRef.current;
        }

        uitspraak.onend = () => resolve();
        uitspraak.onerror = (event) => {
          // 'interrupted' en 'canceled' zijn geen echte fouten
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve();
          } else {
            reject(new Error(`Spraakfout: ${event.error}`));
          }
        };

        window.speechSynthesis.speak(uitspraak);
      });
    },
    [audioAan]
  );

  /**
   * Speel audio af voor een specifiek item en type.
   *
   * Probeert eerst het pre-recorded bestand:
   *   /audio/{categorie}/{itemId}/{type}.mp3
   *
   * Als dat niet gevonden wordt (404 of fout), valt terug op TTS
   * met de meegegeven fallbackTekst.
   */
  const speelAudio = useCallback(
    async (
      categorie: Categorie,
      itemId: string,
      type: AudioType,
      fallbackTekst: string
    ): Promise<void> => {
      if (!audioAan) return;

      // Stop eventuele lopende audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Pad naar het pre-recorded audiobestand
      const audioPad = `/audio/${categorie}/${itemId}/${type}.mp3`;

      try {
        // Probeer het pre-recorded bestand af te spelen
        const audio = new Audio(audioPad);
        audioElementRef.current = audio;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            audioElementRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            audioElementRef.current = null;
            reject(new Error('Audio laden mislukt'));
          };
          // Controleer of het bestand daadwerkelijk bestaat
          audio.oncanplaythrough = () => {
            audio.play().then(() => {
              // Afspelen gestart, wacht op onended
            }).catch(reject);
          };
          audio.load();
        });
      } catch {
        // Pre-recorded bestand niet beschikbaar, gebruik TTS als fallback
        await spreek(fallbackTekst);
      }
    },
    [audioAan, spreek]
  );

  return {
    speelAudio,
    spreek,
    stemKlaar,
  };
}
