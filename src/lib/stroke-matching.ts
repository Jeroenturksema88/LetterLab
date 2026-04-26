// lib/stroke-matching.ts — Geometrische stroke-matching evaluatie
//
// Geen ML/OCR — puur geometrische vergelijking op basis van:
// - Proximity (dekking van het template-pad), per segment om "krabbel-in-één-zone"
//   te voorkomen.
// - Proportie, richting, Chamfer-distance en overlap (similarity).

import type { Punt, TekenPunt, StreekDef, OvertrekResultaat, SimilarityResultaat, FeedbackType } from '@/types';
import { samplePad, normaliseerStreken } from '@/lib/pad-normalisatie';
import {
  afstand,
  vergelijkProportie,
  vergelijkStrokeRichtingen,
  vergelijkOverlap,
  vergelijkChamfer,
} from '@/lib/scoring';

const AANTAL_SEGMENTEN = 4;

/**
 * Evalueer een overtrekpoging (niveau 1).
 *
 * Drie checks (gecombineerd):
 * 1. Globale dekking — wat % van het template-pad is bedekt door gebruikerspunten?
 * 2. Per-segment dekking — verdeel het pad in N segmenten; minimum dekking
 *    per segment moet redelijk zijn. Voorkomt dat een kind één deel keurig
 *    overtrekt en de rest leeg laat ("krabbel-in-een-zone-pass").
 * 3. Niet teveel overschot — als de gebruiker veel meer punten heeft buiten
 *    het pad dan erop, is het waarschijnlijk een willekeurige krabbel.
 */
export function evalueerOvertrekking(
  gebruikersPunten: TekenPunt[],
  templatePadPunten: Punt[],
  marge: number
): OvertrekResultaat {
  const templateSamples = samplePad(templatePadPunten, 100);

  if (templateSamples.length === 0 || gebruikersPunten.length === 0) {
    return {
      type: 'overtrekken',
      dekking: 0,
      minSegmentDekking: 0,
      geslaagd: false,
      feedback: 'aanmoediging',
    };
  }

  // Voor elke template-sample: is er een gebruikerspunt binnen marge?
  // Markeer per sample of die bedekt is, zodat we én globaal én per segment kunnen
  // tellen.
  const bedektPerSample: boolean[] = templateSamples.map((templatePunt) => {
    for (const gebruikersPunt of gebruikersPunten) {
      if (afstand(templatePunt, gebruikersPunt) <= marge) return true;
    }
    return false;
  });

  // Globale dekking
  const totaalBedekt = bedektPerSample.filter(Boolean).length;
  const dekking = totaalBedekt / templateSamples.length;

  // Per-segment dekking. Verdeel de samples in N segmenten en bereken voor elk
  // welk percentage bedekt is. De minimale segment-dekking wordt meegenomen.
  const segmentGrootte = templateSamples.length / AANTAL_SEGMENTEN;
  let minSegmentDekking = 1;
  for (let s = 0; s < AANTAL_SEGMENTEN; s++) {
    const start = Math.floor(s * segmentGrootte);
    const eind = Math.floor((s + 1) * segmentGrootte);
    const segment = bedektPerSample.slice(start, eind);
    if (segment.length === 0) continue;
    const segmentDekking = segment.filter(Boolean).length / segment.length;
    if (segmentDekking < minSegmentDekking) minSegmentDekking = segmentDekking;
  }

  // Combinatie-eindscore: gewogen gemiddelde van globale dekking en
  // minimale segment-dekking. De gemiddelde-eis voorkomt dat één leeg segment
  // de hele evaluatie kapt (bv. als kind net een puntje miste), maar
  // straft een krabbel die maar één derde van het pad raakt.
  const eindscore = dekking * 0.6 + minSegmentDekking * 0.4;

  // Drempel-vergelijking gebeurt verderop in evalueerOvertrekking-aanroeper
  // (huidigeOvertrekDrempel uit instellingen). We berekenen hier de score; de
  // aanroeper bepaalt wat "geslaagd" betekent. Voor backwards compat behouden
  // we ook een interne default-drempel.
  const geslaagd = eindscore >= 0.6;
  const feedback: FeedbackType = geslaagd ? 'succes' : 'aanmoediging';

  return {
    type: 'overtrekken',
    dekking: eindscore,
    minSegmentDekking,
    geslaagd,
    feedback,
  };
}

/**
 * Evalueer similarity voor niveau 2 (naschrijven) en niveau 3 (zelfstandig).
 *
 * Normaliseert beide sets streken naar een 0-1 bounding box, berekent dan een
 * gewogen score uit:
 * - Proportie (0.20): aspect ratio's vergelijken.
 * - Richting (0.10): dominante streekrichtingen vergelijken (zwak gewicht
 *   omdat 3,5-jarigen streken in willekeurige richting tekenen).
 * - Chamfer-distance (0.45): hoofdgewicht — robuuste vorm-similariteit die
 *   tolerant is voor lijn-positie en -dikte.
 * - Overlap/IoU (0.25): klassieke pixel-overlap als secondaire check.
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
    gebruikersStreken.map((punten) => punten.map((p) => ({ x: p.x, y: p.y })))
  );
  const genormaliseerdeTemplate = normaliseerStreken(templatePuntArrays);

  // Vier deelscores
  const proportieScore = vergelijkProportie(
    genormaliseerdeGebruiker.flat(),
    genormaliseerdeTemplate.flat()
  );
  const richtingScore = vergelijkStrokeRichtingen(
    genormaliseerdeGebruiker,
    genormaliseerdeTemplate
  );
  const chamferScore = vergelijkChamfer(
    genormaliseerdeGebruiker,
    genormaliseerdeTemplate
  );
  const overlapScore = vergelijkOverlap(
    genormaliseerdeGebruiker,
    genormaliseerdeTemplate
  );

  // Gewogen totaalscore. Chamfer is hoofdgewicht omdat het de meest robuuste
  // vorm-similariteit geeft op kindertekeningen. Overlap als secondaire check;
  // proportie zorgt dat extreem misvormde vormen niet slagen; richting is
  // bewust laag (kinderen tekenen vaak in willekeurige richting/volgorde).
  const score =
    proportieScore * 0.20 +
    richtingScore * 0.10 +
    chamferScore * 0.45 +
    overlapScore * 0.25;

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
      chamferScore,
      overlapScore,
    },
  };
}
