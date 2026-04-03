'use client';

// hooks/useVoortgang.ts — Convenience-wrapper rondom de Zustand voortgang-store
//
// Biedt eenvoudige functies voor het opvragen en bijwerken van
// de voortgang per item, zodat componenten niet direct met de
// store hoeven te communiceren.

import { useVoortgangStore } from '@/stores/voortgang-store';
import type { Niveau, Categorie } from '@/types';

export function useVoortgang() {
  const voortgang = useVoortgangStore((state) => state.items);
  const storeMarkeerVoltooid = useVoortgangStore((state) => state.markeerVoltooid);
  const storeRegistreerPoging = useVoortgangStore((state) => state.registreerPoging);
  const storeHuidigNiveau = useVoortgangStore((state) => state.huidigNiveau);
  const storeAantalSterren = useVoortgangStore((state) => state.aantalSterren);

  /**
   * Markeer een specifiek niveau als voltooid voor een item.
   */
  const markeerVoltooid = (itemId: string, niveau: Niveau) => {
    storeMarkeerVoltooid(itemId, niveau);
  };

  /**
   * Registreer een poging (ongeacht of deze geslaagd is).
   */
  const registreerPoging = (itemId: string) => {
    storeRegistreerPoging(itemId);
  };

  /**
   * Geeft het eerstvolgende niveau terug dat nog niet voltooid is.
   * Als alles voltooid is, wordt 'zelfstandig' teruggegeven.
   */
  const huidigNiveau = (itemId: string): Niveau => {
    return storeHuidigNiveau(itemId);
  };

  /**
   * Geeft het aantal behaalde sterren (0-3) voor een item.
   * Elke ster komt overeen met een voltooid niveau.
   */
  const aantalSterren = (itemId: string): number => {
    return storeAantalSterren(itemId);
  };

  /**
   * Bereken de voortgang voor een hele categorie.
   * Telt hoeveel items alle drie de niveaus voltooid hebben.
   *
   * @param categorie - De categorie (niet direct gebruikt, maar handig voor context)
   * @param itemIds - Lijst van item-IDs die tot deze categorie behoren
   * @returns Object met { voltooid: number, totaal: number }
   */
  const categorieVoortgang = (
    categorie: Categorie,
    itemIds: string[]
  ): { voltooid: number; totaal: number } => {
    let voltooid = 0;

    for (const id of itemIds) {
      const sterren = storeAantalSterren(id);
      // Een item is "voltooid" als alle 3 niveaus behaald zijn
      if (sterren === 3) {
        voltooid++;
      }
    }

    return {
      voltooid,
      totaal: itemIds.length,
    };
  };

  return {
    voortgang,
    markeerVoltooid,
    registreerPoging,
    huidigNiveau,
    aantalSterren,
    categorieVoortgang,
  };
}
