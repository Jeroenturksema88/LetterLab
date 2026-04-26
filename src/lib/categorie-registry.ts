// lib/categorie-registry.ts — Centrale lookup van categorie → data + visuele kleuren.
//
// Eén plek waar alle drie de categorieën (letters, cijfers, vormen) hun data,
// kleuren en route-prefixen ophalen. Voorkomt duplicatie in de 6 route-bestanden.

import lettersData from '@/data/letters.json';
import cijfersData from '@/data/cijfers.json';
import vormenData from '@/data/vormen.json';
import type { Categorie, ItemDef } from '@/types';

export interface CategorieConfig {
  categorie: Categorie;
  items: ItemDef[];
  // Hoofd-accentkleur (komt overeen met tailwind.config.ts)
  hoofdkleur: string;
  // Pad-prefix voor alle item-routes binnen deze categorie
  routePrefix: string;
}

const REGISTRY: Record<Categorie, CategorieConfig> = {
  letters: {
    categorie: 'letters',
    items: lettersData as ItemDef[],
    hoofdkleur: '#6366F1',
    routePrefix: '/letters',
  },
  cijfers: {
    categorie: 'cijfers',
    items: cijfersData as ItemDef[],
    hoofdkleur: '#F59E0B',
    routePrefix: '/cijfers',
  },
  vormen: {
    categorie: 'vormen',
    items: vormenData as ItemDef[],
    hoofdkleur: '#10B981',
    routePrefix: '/vormen',
  },
};

export function haalCategorieConfig(categorie: Categorie): CategorieConfig {
  return REGISTRY[categorie];
}

export function isGeldigeCategorie(waarde: string): waarde is Categorie {
  return waarde === 'letters' || waarde === 'cijfers' || waarde === 'vormen';
}
