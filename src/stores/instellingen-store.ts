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
    // Aantal milliseconden zonder nieuwe streek voordat automatisch geëvalueerd wordt.
    // 6000ms is een goede balans: tijd voor het kind om de pen op te tillen en even
    // te kijken, maar niet zo lang dat ze afgeleid raken.
    inactiviteitTimeout: 6000,
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
      // Bij version-bump verhoog je dit getal; oudere persisted state wordt dan
      // genegeerd en standaardwaarden worden opnieuw geladen. Belangrijk wanneer
      // we evaluatiedrempels herzien — anders blijven gebruikers met oude waardes
      // hangen.
      version: 2,
    }
  )
);
