// lib/stroke-matching.ts — Geometrische stroke-matching evaluatie
//
// Geen ML/OCR — puur geometrische vergelijking op basis van:
// - Proximity (dekking van het template-pad)
// - Proportie, richting en overlap (similarity)

import type { Punt, TekenPunt, StreekDef, OvertrekResultaat, SimilarityResultaat, FeedbackType } from '@/types';
import { samplePad, normaliseerStreken } from '@/lib/pad-normalisatie';
import { afstand, vergelijkProportie, vergelijkStrokeRichtingen, vergelijkOverlap } from '@/lib/scoring';

/**
 * Evalueer een overtrekpoging (niveau 1).
 *
 * Samplet het template-pad naar 100 punten en telt hoeveel daarvan
 * "bedekt" worden door de gebruiker (d.w.z. binnen de marge liggen).
 * Geeft een dekkingsratio terug (0-1).
 */
export function evalueerOvertrekking(
  gebruikersPunten: TekenPunt[],
  templatePadPunten: Punt[],
  marge: number
): OvertrekResultaat {
  // Sample het template-pad naar 100 gelijkmatig verdeelde punten
  const templateSamples = samplePad(templatePadPunten, 100);

  if (templateSamples.length === 0 || gebruikersPunten.length === 0) {
    return {
      type: 'overtrekken',
      dekking: 0,
      geslaagd: false,
      feedback: 'aanmoediging',
    };
  }

  // Tel hoeveel template-punten "bedekt" zijn door gebruikerspunten
  let bedektePunten = 0;

  for (const templatePunt of templateSamples) {
    let isBedekt = false;

    for (const gebruikersPunt of gebruikersPunten) {
      if (afstand(templatePunt, gebruikersPunt) <= marge) {
        isBedekt = true;
        break;
      }
    }

    if (isBedekt) {
      bedektePunten++;
    }
  }

  const dekking = bedektePunten / templateSamples.length;

  // Standaard drempel voor overtrekken is 70% (configureerbaar via instellingen)
  const geslaagd = dekking >= 0.70;
  const feedback: FeedbackType = geslaagd ? 'succes' : 'aanmoediging';

  return {
    type: 'overtrekken',
    dekking,
    geslaagd,
    feedback,
  };
}

/**
 * Evalueer similarity voor niveau 2 (naschrijven) en niveau 3 (zelfstandig).
 *
 * Normaliseert beide sets streken naar een 0-1 bounding box,
 * berekent dan een gewogen score uit:
 * - Proportie (0.3): vergelijking van aspect ratio's
 * - Richting (0.3): vergelijking van dominante streekrichtingen
 * - Overlap (0.4): rasterisatie naar 20x20 grid, IoU berekening
 */
export function evalueerSimilarity(
  gebruikersStreken: TekenPunt[][],
  templateStreken: StreekDef[],
  drempel: number,
  type: 'naschrijven' | 'zelfstandig' = 'naschrijven'
): SimilarityResultaat {
  // Converteer template-streken naar punt-arrays
  const templatePuntArrays: Punt[][] = templateStreken.map((streek) => [
    streek.startPunt,
    ...streek.tussenPunten,
    streek.eindPunt,
  ]);

  // Normaliseer beide sets naar 0-1 bounding box
  const genormaliseerdeGebruiker = normaliseerStreken(
    gebruikersStreken.map((punten) =>
      punten.map((p) => ({ x: p.x, y: p.y }))
    )
  );
  const genormaliseerdeTemplate = normaliseerStreken(templatePuntArrays);

  // Bereken de drie deelscores
  const proportieScore = vergelijkProportie(
    genormaliseerdeGebruiker.flat(),
    genormaliseerdeTemplate.flat()
  );
  const richtingScore = vergelijkStrokeRichtingen(
    genormaliseerdeGebruiker,
    genormaliseerdeTemplate
  );
  const overlapScore = vergelijkOverlap(
    genormaliseerdeGebruiker,
    genormaliseerdeTemplate
  );

  // Gewogen totaalscore
  const score =
    proportieScore * 0.3 +
    richtingScore * 0.3 +
    overlapScore * 0.4;

  const geslaagd = score >= drempel;
  const feedback: FeedbackType = geslaagd ? 'succes' : 'aanmoediging';

  return {
    type,
    score,
    geslaagd,
    feedback,
    details: {
      proportieScore,
      richtingScore,
      overlapScore,
    },
  };
}
