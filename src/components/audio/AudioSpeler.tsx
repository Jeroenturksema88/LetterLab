'use client';

// components/audio/AudioSpeler.tsx — Audio-systeem voor LetterLab.
//
// Eén centrale hook die per item-uitspraak:
// 1. eerst probeert een pre-recorded .mp3 te laden uit /public/audio/<categorie>/<itemId>/<type>.mp3
// 2. en bij ontbreken/falen terugvalt op de Web Speech API met een Nederlandse stem.
//
// iOS Safari-specifieke afhandelingen:
// - Eerste user-gesture ontgrendelt audio (zie AudioOntgrendelaar).
// - speechSynthesis pauzeert spontaan na ~15s; we hervatten elke 5s.
// - We resetten met cancel() voor we beginnen, en wachten 50ms voor we praten.
//
// Critical: alle afspeel-acties zijn cancellable. Wanneer een nieuwe call binnenkomt
// terwijl een vorige nog loopt, wordt de vorige netjes afgekapt zodat audio niet
// over elkaar heen komt en promises altijd resolven.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AlleAudioScripts, AudioType, Categorie } from '@/types';
import audioScripts from '@/data/audio-scripts.json';

const scripts = audioScripts as AlleAudioScripts;

// Eén globaal afspeel-token: bij een nieuwe call wordt dit verhoogd, oudere
// playbacks zien dat hun token achterhaald is en stoppen vroeg.
let huidigeAfspeelToken = 0;

export function useAudioSpeler(audioAan: boolean = true) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const stemRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [stemKlaar, setStemKlaar] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    synthRef.current = window.speechSynthesis;

    function laadStemmen() {
      const stemmen = synthRef.current?.getVoices() ?? [];
      // Op iPad Safari is "Ellen" (nl-NL) standaard; voorkeur voor lokale stem (geen
      // netwerk-roundtrip → snellere start).
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
    // iOS Safari laadt stemmen soms 200-500ms na paginalaad
    const timer = setTimeout(laadStemmen, 500);

    return () => {
      synthRef.current?.removeEventListener('voiceschanged', laadStemmen);
      clearTimeout(timer);
    };
  }, []);

  // Stop alle lopende audio (HTML Audio + SpeechSynthesis)
  const stopAlles = useCallback(() => {
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      } catch {
        /* negeer */
      }
      audioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  /**
   * Spreek een tekst uit via de Web Speech API.
   * Resolved zodra de uitspraak klaar is (of wordt afgekapt door nieuwere call).
   */
  const spreek = useCallback(
    (tekst: string, mijnToken: number): Promise<void> => {
      if (!audioAan) return Promise.resolve();
      if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();

      const synth = window.speechSynthesis;

      return new Promise((resolve) => {
        // Korte vertraging na cancel zodat iOS Safari de state reset.
        // Zonder deze pauze faalt de eerste utterance na een cancel soms stil.
        setTimeout(() => {
          if (mijnToken !== huidigeAfspeelToken) {
            resolve();
            return;
          }

          // Als stem nog niet geladen is, probeer nu nog
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
          uiting.rate = 0.85;     // Iets langzamer voor 3-jarige
          uiting.pitch = 1.1;     // Iets hoger, vriendelijker
          uiting.volume = 1;
          if (stemRef.current) uiting.voice = stemRef.current;

          // iOS Safari pauzeert speechSynthesis spontaan na ~15s — actief hervatten
          const hervatTimer = setInterval(() => {
            if (synth.speaking && synth.paused) synth.resume();
            if (!synth.speaking) clearInterval(hervatTimer);
          }, 5000);

          uiting.onend = () => {
            clearInterval(hervatTimer);
            resolve();
          };
          uiting.onerror = () => {
            clearInterval(hervatTimer);
            resolve();
          };

          // Fallback timeout: als de spraak vastzit, garandeer dat we resolven
          setTimeout(() => {
            clearInterval(hervatTimer);
            resolve();
          }, 12000);

          synth.speak(uiting);
        }, 50);
      });
    },
    [audioAan]
  );

  /**
   * Speel een pre-recorded .mp3 voor het opgegeven item/type.
   * Resolved zodra het bestand klaar is met afspelen, of rejects bij netwerk-fout.
   */
  const speelMp3 = useCallback(
    (pad: string, mijnToken: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(pad);
        audio.volume = 1;
        audioElementRef.current = audio;

        let opgelost = false;
        const klaar = (ok: boolean, foutmelding?: string) => {
          if (opgelost) return;
          opgelost = true;
          // Als er ondertussen een nieuwere call is gekomen, schoon op
          if (mijnToken !== huidigeAfspeelToken) {
            try {
              audio.pause();
            } catch {
              /* negeer */
            }
          }
          if (audioElementRef.current === audio) audioElementRef.current = null;
          if (ok) resolve();
          else reject(new Error(foutmelding || 'Audio afspeelfout'));
        };

        audio.addEventListener('ended', () => klaar(true), { once: true });
        audio.addEventListener('error', () => klaar(false, 'Audio laadfout'), { once: true });

        // Safety net — als 'ended' nooit komt, valt na duur+1s alsnog af
        audio.addEventListener('loadedmetadata', () => {
          const totaal = (audio.duration || 5) * 1000 + 1500;
          setTimeout(() => klaar(true), totaal);
        }, { once: true });

        audio
          .play()
          .catch((fout) => klaar(false, String(fout)));
      });
    },
    []
  );

  /**
   * Hoofd-API: speel het audio-snippet voor een specifiek item en type.
   * Probeert eerst .mp3, valt terug op TTS met de tekst uit audio-scripts.json.
   */
  const speelVoorItem = useCallback(
    async (categorie: Categorie, itemId: string, type: AudioType) => {
      if (!audioAan) return;

      // Token-systeem: deze call krijgt een nieuw token, oudere calls weten dat
      // ze achterhaald zijn en stoppen.
      const mijnToken = ++huidigeAfspeelToken;

      // Stop direct alles wat liep
      stopAlles();

      // Haal de Nederlandse tekst op voor TTS-fallback
      const categorieScripts = scripts[categorie];
      if (!categorieScripts) return;
      const itemScripts = categorieScripts[itemId as keyof typeof categorieScripts];
      if (!itemScripts) return;
      const tekst = (itemScripts as unknown as Record<string, string>)[type];
      if (!tekst) return;

      const mp3Pad = `/audio/${categorie}/${itemId}/${type}.mp3`;

      try {
        await speelMp3(mp3Pad, mijnToken);
      } catch {
        // Pre-recorded niet beschikbaar — val terug op TTS
        if (mijnToken === huidigeAfspeelToken) {
          await spreek(tekst, mijnToken);
        }
      }
    },
    [audioAan, spreek, speelMp3, stopAlles]
  );

  // Schoonmaak: stop afspelen bij unmount
  useEffect(() => {
    return () => stopAlles();
  }, [stopAlles]);

  return { spreek: (t: string) => spreek(t, ++huidigeAfspeelToken), speelVoorItem, stemKlaar };
}
