// stores/instellingen-store.ts — Zustand store voor app-instellingen

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Instellingen, InstellingenState } from '@/types';

// Standaard instellingen
const standaardInstellingen: Instellingen = {
  taal: 'nl',
  audioAan: true,
  actieveCategorieen: ['letters', 'cijfers', 'vormen'],
  sessieLimiet: 15,
  pincode: '1234',
  evaluatie: {
    overtrekDrempel: 0.55,
    naschrijfDrempel: 0.25,
    freehandDrempel: 0.20,
    proximityMarge: 45,
    inactiviteitTimeout: 4000,
  },
};

export const useInstellingenStore = create<InstellingenState>()(
  persist(
    (set) => ({
      ...standaardInstellingen,

      // Update één of meerdere instellingen
      updateInstellingen: (deels: Partial<Instellingen>) => {
        set((state) => {
          // Als evaluatie-instellingen meegegeven worden, merge deze diep
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

      // Herstel alle instellingen naar standaardwaarden
      resetInstellingen: () => {
        set(standaardInstellingen);
      },
    }),
    {
      name: 'letterlab-instellingen',
    }
  )
);
