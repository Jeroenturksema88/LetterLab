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
      if (!audioAan || !synthRef.current) return Promise.resolve();

      return new Promise((resolve) => {
        const synth = synthRef.current!;

        // iOS Safari fix: cancel eventuele hangende spraak eerst
        synth.cancel();

        // Korte vertraging na cancel zodat iOS Safari de state reset
        setTimeout(() => {
          const uiting = new SpeechSynthesisUtterance(tekst);
          uiting.lang = 'nl-NL';
          uiting.rate = 0.85;
          uiting.pitch = 1.1;
          uiting.volume = 1;

          if (stemRef.current) {
            uiting.voice = stemRef.current;
          }

          uiting.onend = () => resolve();
          uiting.onerror = () => resolve();

          // iOS Safari bug: speechSynthesis kan pauzeren na 15 sec
          // Workaround: hervat elke 10 seconden
          const hervatTimer = setInterval(() => {
            if (synth.speaking && synth.paused) {
              synth.resume();
            }
            if (!synth.speaking) {
              clearInterval(hervatTimer);
            }
          }, 10000);

          uiting.onend = () => {
            clearInterval(hervatTimer);
            resolve();
          };
          uiting.onerror = () => {
            clearInterval(hervatTimer);
            resolve();
          };

          synth.speak(uiting);
        }, 50);
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
