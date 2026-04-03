// stores/voortgang-store.ts — Zustand store voor voortgang/progress tracking

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemVoortgang, Niveau, VoortgangState } from '@/types';

// Standaard voortgang voor een nieuw item
const standaardVoortgang: ItemVoortgang = {
  niveau1: false,
  niveau2: false,
  niveau3: false,
  pogingen: 0,
  laatstePoging: null,
};

// Vertaal niveau-naam naar de bijbehorende property-key
const niveauNaarKey = (niveau: Niveau): keyof Pick<ItemVoortgang, 'niveau1' | 'niveau2' | 'niveau3'> => {
  switch (niveau) {
    case 'overtrekken':
      return 'niveau1';
    case 'naschrijven':
      return 'niveau2';
    case 'zelfstandig':
      return 'niveau3';
  }
};

export const useVoortgangStore = create<VoortgangState>()(
  persist(
    (set, get) => ({
      items: {},

      // Markeer een niveau als voltooid voor een item
      markeerVoltooid: (itemId: string, niveau: Niveau) => {
        const key = niveauNaarKey(niveau);
        set((state) => ({
          items: {
            ...state.items,
            [itemId]: {
              ...(state.items[itemId] || standaardVoortgang),
              [key]: true,
              laatstePoging: Date.now(),
            },
          },
        }));
      },

      // Registreer een poging (ongeacht of deze geslaagd is)
      registreerPoging: (itemId: string) => {
        set((state) => {
          const huidig = state.items[itemId] || standaardVoortgang;
          return {
            items: {
              ...state.items,
              [itemId]: {
                ...huidig,
                pogingen: huidig.pogingen + 1,
                laatstePoging: Date.now(),
              },
            },
          };
        });
      },

      // Reset de voortgang van één item
      resetItem: (itemId: string) => {
        set((state) => {
          const nieuweItems = { ...state.items };
          delete nieuweItems[itemId];
          return { items: nieuweItems };
        });
      },

      // Reset alle voortgang
      resetAlles: () => {
        set({ items: {} });
      },

      // Bepaal het huidige niveau van een item
      huidigNiveau: (itemId: string): Niveau => {
        const voortgang = get().items[itemId];
        if (!voortgang || !voortgang.niveau1) return 'overtrekken';
        if (!voortgang.niveau2) return 'naschrijven';
        return 'zelfstandig';
      },

      // Controleer of een specifiek niveau voltooid is
      isVoltooid: (itemId: string, niveau: Niveau): boolean => {
        const voortgang = get().items[itemId];
        if (!voortgang) return false;
        const key = niveauNaarKey(niveau);
        return voortgang[key];
      },

      // Bereken het aantal sterren (0-3) voor een item
      aantalSterren: (itemId: string): number => {
        const voortgang = get().items[itemId];
        if (!voortgang) return 0;
        let sterren = 0;
        if (voortgang.niveau1) sterren++;
        if (voortgang.niveau2) sterren++;
        if (voortgang.niveau3) sterren++;
        return sterren;
      },
    }),
    {
      name: 'letterlab-voortgang',
    }
  )
);
