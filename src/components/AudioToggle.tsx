'use client';

// components/AudioToggle.tsx — Globale audio aan/uit knop, altijd zichtbaar top-right.
//
// Twee verantwoordelijkheden:
// 1. Zet `audioAan` in de instellingen-store. Componenten die audio afspelen
//    (zoals useAudioSpeler) checken deze waarde voor elke utterance.
// 2. Bij toggle naar ON: warm de iOS Safari speech-engine actief op met een
//    micro-utterance + bevestigt met een vrolijk woord. Dit lost het "audio
//    werkte niet"-probleem op iPad op waarbij de auto-unlock op eerste tap
//    soms gemist wordt (Safari blokkeert speech tot een expliciete user gesture
//    die ook een speak()-call doet).

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInstellingenStore } from '@/stores/instellingen-store';

// Kleine iOS-Safari helper: forceer dat de speech-engine wakker is door
// een onhoorbare utterance te triggeren, gevolgd door een vrolijke bevestiging
// in een Nederlandse stem (als beschikbaar).
function warmSpeechEngine() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;

  // Stop eerst hangende spraak — iOS Safari blijft soms in een "speaking maar
  // niet hoorbaar" state hangen tot we expliciet cancel'len.
  synth.cancel();

  // Stille opwarming
  const opwarmer = new SpeechSynthesisUtterance('.');
  opwarmer.volume = 0.01;
  opwarmer.rate = 2;
  opwarmer.lang = 'nl-NL';
  synth.speak(opwarmer);

  // Hoorbare bevestiging — laat het kind weten dat het geluid aan staat.
  const stemmen = synth.getVoices();
  const nlStem =
    stemmen.find((s) => s.lang === 'nl-NL' && s.localService) ||
    stemmen.find((s) => s.lang === 'nl-NL') ||
    stemmen.find((s) => s.lang.startsWith('nl'));

  const bevestiging = new SpeechSynthesisUtterance('Geluid aan!');
  bevestiging.lang = 'nl-NL';
  bevestiging.rate = 0.85;
  bevestiging.pitch = 1.1;
  bevestiging.volume = 1;
  if (nlStem) bevestiging.voice = nlStem;
  synth.speak(bevestiging);
}

// Stop alle hangende audio direct.
function silenceSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export default function AudioToggle() {
  const audioAan = useInstellingenStore((s) => s.audioAan);
  const updateInstellingen = useInstellingenStore((s) => s.updateInstellingen);

  const toggle = useCallback(() => {
    const nieuw = !audioAan;
    updateInstellingen({ audioAan: nieuw });
    if (nieuw) {
      // Belangrijk: dit moet binnen de user-gesture call-stack van de tap
      // gebeuren, anders weigert iOS Safari de speech alsnog. Daarom direct
      // hier, niet in een setTimeout.
      warmSpeechEngine();
    } else {
      silenceSpeech();
    }
  }, [audioAan, updateInstellingen]);

  return (
    <motion.button
      onClick={toggle}
      // Bottom-left positie: vrij van terug-knoppen (top-left), wis/undo knoppen
      // (top-right in OefeningView), klaar-knop (bottom-center) en ouder-knop
      // (bottom-right op startscherm).
      // z-30 < z-40 (FeedbackOverlay) < z-50 (BeloningAnimatie) < z-100 (DiplomaOverlay)
      // < z-200 (RotatieOverlay) — toggle blijft clickbaar tijdens normale UI maar
      // verdwijnt onder feestelijke overlays.
      className="fixed bottom-3 left-3 z-30 flex items-center justify-center rounded-full shadow-md"
      style={{
        width: 44,
        height: 44,
        // Warmere achtergrond als geluid aan staat, neutrale als uit
        background: audioAan
          ? 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)'
          : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        border: audioAan
          ? '2px solid #34D39940'
          : '2px solid #9CA3AF40',
      }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={audioAan ? 'Geluid uit' : 'Geluid aan'}
      aria-pressed={audioAan}
    >
      {audioAan ? (
        // Speaker met geluidsgolven
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#059669"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#059669" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        // Speaker met streep er doorheen
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#6B7280" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </motion.button>
  );
}
