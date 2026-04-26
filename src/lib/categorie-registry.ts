// lib/categorie-registry.ts — Centrale lookup van categorie → data + visuele kleuren.
//
// Eén plek waar alle drie de categorieën (letters, cijfers, vormen) hun data,
// kleuren en route-prefixen ophalen. Voorkomt duplicatie in de route-bestanden.
//
// Letters bestaan in twee stijlen: 'blok' (default, klassieke hoekige
// hoofdletters) en 'schoolschrift' (aanleerletter-stijl met curves voor NL
// groep 1-3 didactiek). De `letterStijl` parameter selecteert de juiste set;
// wordt door consumers uit `instellingen-store` gehaald.

import lettersBlokData from '@/data/letters.json';
import lettersSchoolschriftData from '@/data/letters-schoolschrift.json';
import cijfersData from '@/data/cijfers.json';
import vormenData from '@/data/vormen.json';
import type { Categorie, ItemDef, LetterStijl } from '@/types';

export interface CategorieConfig {
  categorie: Categorie;
  items: ItemDef[];
  // Hoofd-accentkleur (komt overeen met tailwind.config.ts)
  hoofdkleur: string;
  // Pad-prefix voor alle item-routes binnen deze categorie
  routePrefix: string;
}

const LETTERS_BLOK = lettersBlokData as ItemDef[];
const LETTERS_SCHOOLSCHRIFT = lettersSchoolschriftData as ItemDef[];

export function haalCategorieConfig(
  categorie: Categorie,
  letterStijl: LetterStijl = 'blok'
): CategorieConfig {
  switch (categorie) {
    case 'letters':
      return {
        categorie: 'letters',
        items: letterStijl === 'schoolschrift' ? LETTERS_SCHOOLSCHRIFT : LETTERS_BLOK,
        hoofdkleur: '#6366F1',
        routePrefix: '/letters',
      };
    case 'cijfers':
      return {
        categorie: 'cijfers',
        items: cijfersData as ItemDef[],
        hoofdkleur: '#F59E0B',
        routePrefix: '/cijfers',
      };
    case 'vormen':
      return {
        categorie: 'vormen',
        items: vormenData as ItemDef[],
        hoofdkleur: '#10B981',
        routePrefix: '/vormen',
      };
  }
}

export function isGeldigeCategorie(waarde: string): waarde is Categorie {
  return waarde === 'letters' || waarde === 'cijfers' || waarde === 'vormen';
}
