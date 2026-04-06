'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { AudioType, Categorie } from '@/types';
import audioScripts from '@/data/audio-scripts.json';
import type { AlleAudioScripts } from '@/types';

const scripts = audioScripts as AlleAudioScripts;

export function useAudioSpeler(audioAan: boolean = true) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const stemRef = useRef<SpeechSynthesisVoice | null>(null);
  const [stemKlaar, setStemKlaar] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    synthRef.current = window.speechSynthesis;

    function laadStemmen() {
      const stemmen = synthRef.current?.getVoices() ?? [];

      // Zoek de beste Nederlandse stem
      // Op iPad Safari is "Ellen" (nl-NL) de standaard en klinkt goed
      const nlStem =
        stemmen.find((s) => s.lang === 'nl-NL' && s.localService) ||
        stemmen.find((s) => s.lang === 'nl-NL') ||
        stemmen.find((s) => s.lang.startsWith('nl'));

      if (nlStem) {
        stemRef.current = nlStem;
        setStemKlaar(true);
      }
    }

    laadStemmen();

    // Op sommige browsers (Chrome) worden stemmen async geladen
    synthRef.current?.addEventListener('voiceschanged', laadStemmen);

    // iOS Safari laadt stemmen soms pas na een korte vertraging
    const timer = setTimeout(laadStemmen, 500);

    return () => {
      synthRef.current?.removeEventListener('voiceschanged', laadStemmen);
      clearTimeout(timer);
    };
  }, []);

  const spreek = useCallback(
    (tekst: string): Promise<void> => {
      if (!audioAan) return Promise.resolve();
      if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();

      const synth = window.speechSynthesis;

      return new Promise((resolve) => {
        // iOS Safari fix: cancel eventuele hangende spraak eerst
        synth.cancel();

        // Korte vertraging na cancel zodat iOS Safari de state reset
        setTimeout(() => {
          // Herlaad stemmen (iOS Safari laadt ze soms laat)
          if (!stemRef.current) {
            const stemmen = synth.getVoices();
            const nlStem =
              stemmen.find((s) => s.lang === 'nl-NL' && s.localService) ||
              stemmen.find((s) => s.lang === 'nl-NL') ||
              stemmen.find((s) => s.lang.startsWith('nl'));
            if (nlStem) stemRef.current = nlStem;
          }

          const uiting = new SpeechSynthesisUtterance(tekst);
          uiting.lang = 'nl-NL';
          uiting.rate = 0.85;
          uiting.pitch = 1.1;
          uiting.volume = 1;

          if (stemRef.current) {
            uiting.voice = stemRef.current;
          }

          // iOS Safari bug: speechSynthesis pauzeert soms na ~15 sec
          const hervatTimer = setInterval(() => {
            if (synth.speaking && synth.paused) {
              synth.resume();
            }
            if (!synth.speaking) {
              clearInterval(hervatTimer);
            }
          }, 5000);

          uiting.onend = () => {
            clearInterval(hervatTimer);
            resolve();
          };
          uiting.onerror = () => {
            clearInterval(hervatTimer);
            resolve();
          };

          // Timeout fallback: als spraak na 10 sec niet klaar is, resolve toch
          setTimeout(() => {
            clearInterval(hervatTimer);
            resolve();
          }, 10000);

          synth.speak(uiting);
        }, 100);
      });
    },
    [audioAan]
  );

  const speelVoorItem = useCallback(
    async (categorie: Categorie, itemId: string, type: AudioType) => {
      if (!audioAan) return;

      // Haal de tekst op uit de scripts
      const categorieScripts = scripts[categorie];
      if (!categorieScripts) return;
      const itemScripts = categorieScripts[itemId as keyof typeof categorieScripts];
      if (!itemScripts) return;
      const tekst = (itemScripts as unknown as Record<string, string>)[type];
      if (!tekst) return;

      // Probeer pre-recorded audio eerst
      try {
        const audio = new Audio(`/audio/${categorie}/${itemId}/${type}.mp3`);
        audio.volume = 1;
        await audio.play();
        return;
      } catch {
        // Fallback naar TTS
      }

      await spreek(tekst);
    },
    [audioAan, spreek]
  );

  return { spreek, speelVoorItem, stemKlaar };
}
