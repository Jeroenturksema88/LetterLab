// stores/profiel-store.ts — Zustand store voor kindprofiel en diploma's

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Avatar } from '@/types';

export interface ProfielState {
  naam: string;
  avatar: Avatar | null;
  profielIngesteld: boolean;
  diplomas: string[];

  setNaam: (naam: string) => void;
  setAvatar: (avatar: Avatar) => void;
  markeerProfielIngesteld: () => void;
  voegDiplomaToe: (diplomaId: string) => void;
  heeftDiploma: (diplomaId: string) => boolean;
  reset: () => void;
}

// Mapping voor migratie van v1 (geslacht) naar v2 (avatar). Behoudt iets
// herkenbaars voor bestaande gebruikers; ze kunnen zelf wisselen via profiel.
const GESLACHT_NAAR_AVATAR: Record<string, Avatar> = {
  jongen: 'aap',
  meisje: 'vlinder',
};

export const useProfielStore = create<ProfielState>()(
  persist(
    (set, get) => ({
      naam: '',
      avatar: null,
      profielIngesteld: false,
      diplomas: [],

      setNaam: (naam: string) => set({ naam }),
      setAvatar: (avatar: Avatar) => set({ avatar }),
      markeerProfielIngesteld: () => set({ profielIngesteld: true }),

      voegDiplomaToe: (diplomaId: string) => {
        const huidige = get().diplomas;
        if (!huidige.includes(diplomaId)) {
          set({ diplomas: [...huidige, diplomaId] });
        }
      },

      heeftDiploma: (diplomaId: string): boolean => {
        return get().diplomas.includes(diplomaId);
      },

      reset: () => {
        set({
          naam: '',
          avatar: null,
          profielIngesteld: false,
          diplomas: [],
        });
      },
    }),
    {
      name: 'letterlab-profiel',
      version: 2,
      // Migratie v1 → v2: vervang `geslacht` door `avatar`. Oude waardes worden
      // gemapt zodat het profiel niet "leeg" voelt na de update; ouder kan
      // alsnog wisselen via de profiel-flow.
      migrate: (persistedState: unknown, fromVersion) => {
        if (fromVersion < 2 && persistedState && typeof persistedState === 'object') {
          const state = persistedState as Record<string, unknown>;
          const oudGeslacht = state.geslacht as string | undefined;
          const avatar: Avatar | null = oudGeslacht && GESLACHT_NAAR_AVATAR[oudGeslacht]
            ? GESLACHT_NAAR_AVATAR[oudGeslacht]
            : null;
          // Behoud overige velden, vervang geslacht door avatar
          const { geslacht: _verwijderd, ...rest } = state;
          void _verwijderd;
          return { ...rest, avatar };
        }
        return persistedState;
      },
    }
  )
);
