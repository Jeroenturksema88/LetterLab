// lib/scoring.ts — Scoring-utilities voor stroke-evaluatie
//
// Bevat geometrische vergelijkingsfuncties voor proportie,
// streekrichting en overlap (IoU op een 20x20 raster).

import type { Punt, BoundingBox } from '@/types';

/**
 * Bereken de bounding box van een array punten.
 */
export function berekenBoundingBox(punten: Punt[]): BoundingBox {
  if (punten.length === 0) {
    return { x: 0, y: 0, breedte: 0, hoogte: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const punt of punten) {
    if (punt.x < minX) minX = punt.x;
    if (punt.y < minY) minY = punt.y;
    if (punt.x > maxX) maxX = punt.x;
    if (punt.y > maxY) maxY = punt.y;
  }

  return {
    x: minX,
    y: minY,
    breedte: maxX - minX,
    hoogte: maxY - minY,
  };
}

/**
 * Euclidische afstand tussen twee punten.
 */
export function afstand(a: Punt, b: Punt): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Vergelijk de aspect ratio's van twee sets punten.
 *
 * Berekent de breedte/hoogte-verhouding van beide en geeft
 * een score tussen 0 en 1 terug (1 = identieke verhoudingen).
 */
export function vergelijkProportie(gebruiker: Punt[], template: Punt[]): number {
  const bboxGebruiker = berekenBoundingBox(gebruiker);
  const bboxTemplate = berekenBoundingBox(template);

  // Bereken aspect ratio's (voorkom deling door nul)
  const ratioGebruiker = (bboxGebruiker.breedte || 1) / (bboxGebruiker.hoogte || 1);
  const ratioTemplate = (bboxTemplate.breedte || 1) / (bboxTemplate.hoogte || 1);

  // Score: 1 als ratio's gelijk zijn, daalt naarmate ze meer afwijken
  const verhouding = Math.min(ratioGebruiker, ratioTemplate) / Math.max(ratioGebruiker, ratioTemplate);

  return verhouding;
}

/**
 * Bereken de dominante richting van een streek (array van punten).
 * Geeft de hoek in radialen terug (-PI tot PI).
 */
function dominanteRichting(punten: Punt[]): number {
  if (punten.length < 2) return 0;

  // Gebruik de richting van het eerste naar het laatste punt
  const eerste = punten[0];
  const laatste = punten[punten.length - 1];

  return Math.atan2(laatste.y - eerste.y, laatste.x - eerste.x);
}

/**
 * Vergelijk de dominante streekrichtingen van twee sets streken.
 *
 * Berekent de gemiddelde hoekverschillen tussen overeenkomstige streken.
 * Geeft een score tussen 0 en 1 terug (1 = zelfde richtingen).
 */
export function vergelijkStrokeRichtingen(
  gebruiker: Punt[][],
  template: Punt[][]
): number {
  if (gebruiker.length === 0 || template.length === 0) return 0;

  // Bereken richtingen van alle streken
  const gebruikerRichtingen = gebruiker.map(dominanteRichting);
  const templateRichtingen = template.map(dominanteRichting);

  // Vergelijk streken op volgorde (zoveel als er zijn)
  const aantalVergelijkingen = Math.min(gebruikerRichtingen.length, templateRichtingen.length);

  if (aantalVergelijkingen === 0) return 0;

  let totaalScore = 0;

  for (let i = 0; i < aantalVergelijkingen; i++) {
    // Hoekverschil genormaliseerd naar 0-1
    let verschil = Math.abs(gebruikerRichtingen[i] - templateRichtingen[i]);

    // Normaliseer naar [0, PI] (richtingen in tegengestelde richting zijn maximaal verschil)
    if (verschil > Math.PI) {
      verschil = 2 * Math.PI - verschil;
    }

    // Converteer naar score: 0 verschil = score 1, PI verschil = score 0
    totaalScore += 1 - verschil / Math.PI;
  }

  // Straf voor verschil in aantal streken
  const aantalStraf = Math.min(gebruiker.length, template.length) /
    Math.max(gebruiker.length, template.length);

  return (totaalScore / aantalVergelijkingen) * aantalStraf;
}

/**
 * Teken een lijn op een raster met behulp van het Bresenham-algoritme.
 *
 * Markeert alle cellen langs de lijn als "gevuld" (true).
 */
export function tekenLijnOpGrid(
  grid: boolean[][],
  van: Punt,
  naar: Punt,
  grootte: number,
  dikte: number = 1
): void {
  // Schaal punten naar grid-coördinaten
  const x0 = Math.round(van.x * (grootte - 1));
  const y0 = Math.round(van.y * (grootte - 1));
  const x1 = Math.round(naar.x * (grootte - 1));
  const y1 = Math.round(naar.y * (grootte - 1));

  // Bresenham's lijn-algoritme
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let fout = dx + dy;

  let x = x0;
  let y = y0;

  const halveDikte = Math.floor(dikte / 2);

  while (true) {
    // Vul cellen rond het huidige punt (voor dikte)
    for (let di = -halveDikte; di <= halveDikte; di++) {
      for (let dj = -halveDikte; dj <= halveDikte; dj++) {
        const gi = x + di;
        const gj = y + dj;
        if (gi >= 0 && gi < grootte && gj >= 0 && gj < grootte) {
          grid[gj][gi] = true;
        }
      }
    }

    if (x === x1 && y === y1) break;

    const e2 = 2 * fout;
    if (e2 >= dy) {
      if (x === x1) break;
      fout += dy;
      x += sx;
    }
    if (e2 <= dx) {
      if (y === y1) break;
      fout += dx;
      y += sy;
    }
  }
}

/**
 * Rasteriseer een set streken naar een grid van de opgegeven grootte.
 * Elke streek wordt als lijnstukken op het raster getekend.
 */
function rasteriseerStreken(streken: Punt[][], grootte: number, dikte: number = 1): boolean[][] {
  // Maak een leeg grid
  const grid: boolean[][] = Array.from({ length: grootte }, () =>
    Array.from({ length: grootte }, () => false)
  );

  for (const streek of streken) {
    for (let i = 0; i < streek.length - 1; i++) {
      tekenLijnOpGrid(grid, streek[i], streek[i + 1], grootte, dikte);
    }

    // Als een streek maar 1 punt heeft, markeer dat punt
    if (streek.length === 1) {
      const x = Math.round(streek[0].x * (grootte - 1));
      const y = Math.round(streek[0].y * (grootte - 1));
      if (x >= 0 && x < grootte && y >= 0 && y < grootte) {
        grid[y][x] = true;
      }
    }
  }

  return grid;
}

/**
 * Vergelijk de overlap tussen twee sets streken via rasterisatie (IoU).
 *
 * Rasteriseert beide sets naar een 20x20 grid en berekent de
 * Intersection over Union (IoU) score.
 */
export function vergelijkOverlap(
  gebruiker: Punt[][],
  template: Punt[][]
): number {
  const GRID_GROOTTE = 20;
  const LIJN_DIKTE = 2; // Dikkere lijnen voor meer vergevingsgezinde overlap

  const gridGebruiker = rasteriseerStreken(gebruiker, GRID_GROOTTE, LIJN_DIKTE);
  const gridTemplate = rasteriseerStreken(template, GRID_GROOTTE, LIJN_DIKTE);

  let doorsnede = 0; // Intersection: beide gevuld
  let vereniging = 0; // Union: minstens één gevuld

  for (let y = 0; y < GRID_GROOTTE; y++) {
    for (let x = 0; x < GRID_GROOTTE; x++) {
      const g = gridGebruiker[y][x];
      const t = gridTemplate[y][x];

      if (g && t) doorsnede++;
      if (g || t) vereniging++;
    }
  }

  // Voorkom deling door nul
  if (vereniging === 0) return 0;

  return doorsnede / vereniging;
}
