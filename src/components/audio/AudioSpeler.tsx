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
    synthRef.current?.addEventListener('voiceschanged', laadStemmen);
    return () => {
      synthRef.current?.removeEventListener('voiceschanged', laadStemmen);
    };
  }, []);

  const spreek = useCallback(
    (tekst: string): Promise<void> => {
      if (!audioAan || !synthRef.current) return Promise.resolve();

      return new Promise((resolve) => {
        synthRef.current!.cancel();
        const uiting = new SpeechSynthesisUtterance(tekst);
        uiting.lang = 'nl-NL';
        uiting.rate = 0.85;
        uiting.pitch = 1.1;
        if (stemRef.current) {
          uiting.voice = stemRef.current;
        }
        uiting.onend = () => resolve();
        uiting.onerror = () => resolve();
        synthRef.current!.speak(uiting);
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
