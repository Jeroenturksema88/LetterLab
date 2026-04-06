// stores/profiel-store.ts — Zustand store voor kindprofiel en diploma's

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfielState {
  naam: string;
  geslacht: 'jongen' | 'meisje' | null;
  profielIngesteld: boolean;
  diplomas: string[];

  setNaam: (naam: string) => void;
  setGeslacht: (geslacht: 'jongen' | 'meisje') => void;
  markeerProfielIngesteld: () => void;
  voegDiplomaToe: (diplomaId: string) => void;
  heeftDiploma: (diplomaId: string) => boolean;
  reset: () => void;
}

export const useProfielStore = create<ProfielState>()(
  persist(
    (set, get) => ({
      naam: '',
      geslacht: null,
      profielIngesteld: false,
      diplomas: [],

      // Sla de naam van het kind op
      setNaam: (naam: string) => {
        set({ naam });
      },

      // Sla het geslacht op (voor audio-personalisatie)
      setGeslacht: (geslacht: 'jongen' | 'meisje') => {
        set({ geslacht });
      },

      // Markeer dat het profiel volledig is ingesteld
      markeerProfielIngesteld: () => {
        set({ profielIngesteld: true });
      },

      // Voeg een nieuw diploma toe (als het nog niet bestaat)
      voegDiplomaToe: (diplomaId: string) => {
        const huidige = get().diplomas;
        if (!huidige.includes(diplomaId)) {
          set({ diplomas: [...huidige, diplomaId] });
        }
      },

      // Controleer of een diploma al behaald is
      heeftDiploma: (diplomaId: string): boolean => {
        return get().diplomas.includes(diplomaId);
      },

      // Reset het volledige profiel
      reset: () => {
        set({
          naam: '',
          geslacht: null,
          profielIngesteld: false,
          diplomas: [],
        });
      },
    }),
    {
      name: 'letterlab-profiel',
    }
  )
);
