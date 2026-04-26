// stores/instellingen-store.ts — Zustand store voor app-instellingen
//
// De evaluatiedrempels zijn iteratief gekalibreerd: laag genoeg dat een 3,5-jarige
// kind regelmatig succes ervaart, hoog genoeg dat een willekeurige krabbel niet
// als "geslaagd" geldt. Standaardwaarden zijn een redelijk compromis; de ouder
// kan in het dashboard schuiven per niveau.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Instellingen, InstellingenState } from '@/types';

// Standaard instellingen voor productie
const standaardInstellingen: Instellingen = {
  taal: 'nl',
  audioAan: true,
  actieveCategorieen: ['letters', 'cijfers', 'vormen'],
  sessieLimiet: 15,
  pincode: '1234',
  // Default rechts; ouder kan switchen via profiel of dashboard.
  dominanteHand: 'rechts',
  evaluatie: {
    // Overtrekken: 60% van het pad moet bedekt zijn — pittig genoeg dat er echt
    // langs het pad getekend wordt, soepel genoeg dat een 3,5-jarige slaagt.
    overtrekDrempel: 0.60,
    // Naschrijven: 35% similarity — vergt herkenbare vorm zonder pixel-precisie.
    naschrijfDrempel: 0.35,
    // Zelfstandig: 30% similarity — soepelste, maar niet "elke krabbel".
    freehandDrempel: 0.30,
    // Hoeveel pixels (in template-coördinaten) een teken-punt mag afwijken om als
    // "op het pad" te gelden tijdens overtrekken.
    proximityMarge: 45,
    // Aantal milliseconden zonder nieuwe streek voordat automatisch geëvalueerd
    // wordt. 10s is genereus — een 3,5-jarige denkt soms even na, tilt de pen op
    // om te kijken, etc. Te kort = frustratie ("ik was nog niet klaar!"). Voor
    // expliciete bevestiging is er de groene klaar-knop die pulseert zodra er
    // streken zijn.
    inactiviteitTimeout: 10000,
  },
};

export const useInstellingenStore = create<InstellingenState>()(
  persist(
    (set) => ({
      ...standaardInstellingen,

      // Update één of meerdere instellingen. Evaluatie-instellingen worden diep
      // gemerged zodat een partiële update geen velden weggooit.
      updateInstellingen: (deels: Partial<Instellingen>) => {
        set((state) => {
          if (deels.evaluatie) {
            return {
              ...deels,
              evaluatie: {
                ...state.evaluatie,
                ...deels.evaluatie,
              },
            };
          }
          return deels;
        });
      },

      resetInstellingen: () => {
        set(standaardInstellingen);
      },
    }),
    {
      name: 'letterlab-instellingen',
      // v3: dominanteHand toegevoegd, inactiviteit-timeout verhoogd naar 10s,
      // evaluatie-algoritme uitgebreid met segment-check + Chamfer. Bestaande
      // gebruikers krijgen zo automatisch de nieuwe defaults.
      version: 3,
    }
  )
);
