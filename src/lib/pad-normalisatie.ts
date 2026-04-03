// lib/pad-normalisatie.ts — Padnormalisatie-utilities
//
// Converteert SVG-paddata naar punt-arrays en normaliseert streken
// naar een 0-1 bounding box voor vergelijking.

import type { Punt } from '@/types';
import { berekenBoundingBox } from '@/lib/scoring';

/**
 * Lineaire interpolatie tussen twee punten
 */
function lerp(a: Punt, b: Punt, t: number): Punt {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

/**
 * Bereken een punt op een kwadratische Bezier-curve
 */
function kwadratischBezierPunt(p0: Punt, p1: Punt, p2: Punt, t: number): Punt {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

/**
 * Bereken een punt op een kubieke Bezier-curve
 */
function kubiekeBezierPunt(p0: Punt, p1: Punt, p2: Punt, p3: Punt, t: number): Punt {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  };
}

/**
 * Bereken een punt op een elliptische boog (vereenvoudigde benadering).
 * SVG arc-commando's worden benaderd door de boog in kleine lijnstukken
 * op te delen via parametrische sampling.
 */
function boogPunten(
  huidig: Punt,
  rx: number,
  ry: number,
  _xRotatie: number,
  _groteBoog: boolean,
  _meeDraaiend: boolean,
  eind: Punt,
  aantalSamples: number
): Punt[] {
  // Vereenvoudigde benadering: interpoleer lineair als rx/ry te klein zijn
  if (rx === 0 || ry === 0) {
    const punten: Punt[] = [];
    for (let i = 1; i <= aantalSamples; i++) {
      punten.push(lerp(huidig, eind, i / aantalSamples));
    }
    return punten;
  }

  // Voor een nauwkeurigere benadering splitsen we de boog in
  // lijnstukken via lineaire interpolatie (voldoende voor evaluatie)
  const punten: Punt[] = [];
  for (let i = 1; i <= aantalSamples; i++) {
    const t = i / aantalSamples;
    // Gebruik een kwadratische benadering met een controlepunt
    // dat de boog benadert
    const midX = (huidig.x + eind.x) / 2;
    const midY = (huidig.y + eind.y) / 2;
    const dx = eind.x - huidig.x;
    const dy = eind.y - huidig.y;
    const afstandFactor = Math.min(rx, ry) * 0.5;
    const controlePunt: Punt = {
      x: midX + (-dy / Math.sqrt(dx * dx + dy * dy || 1)) * afstandFactor,
      y: midY + (dx / Math.sqrt(dx * dx + dy * dy || 1)) * afstandFactor,
    };
    punten.push(kwadratischBezierPunt(huidig, controlePunt, eind, t));
  }
  return punten;
}

/**
 * Parse een SVG-padstring en converteer naar een array van punten.
 *
 * Ondersteunt de commando's: M, L, C, Q, A (zowel absoluut als relatief).
 * Het pad wordt gesampeld naar het opgegeven aantal punten.
 */
export function svgPadNaarPunten(padData: string, aantalPunten: number = 100): Punt[] {
  const ruwePunten: Punt[] = [];
  let huidig: Punt = { x: 0, y: 0 };
  let startPunt: Punt = { x: 0, y: 0 };

  // Tokenize de SVG-padstring
  const tokens = padData.match(/[MmLlCcQqAaZzHhVvSsTt]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g);

  if (!tokens) return [];

  let i = 0;
  const leesGetal = (): number => {
    if (i >= tokens.length) return 0;
    return parseFloat(tokens[i++]);
  };

  const samplesPerSegment = 10;

  while (i < tokens.length) {
    const commando = tokens[i];

    // Controleer of het een commando-letter is
    if (/^[MmLlCcQqAaZzHhVvSsTt]$/.test(commando)) {
      i++; // Sla het commando over

      switch (commando) {
        case 'M': {
          const x = leesGetal();
          const y = leesGetal();
          huidig = { x, y };
          startPunt = { ...huidig };
          ruwePunten.push({ ...huidig });
          // Impliciete L-commando's na M
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const lx = leesGetal();
            const ly = leesGetal();
            const doel: Punt = { x: lx, y: ly };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
            }
            huidig = doel;
          }
          break;
        }
        case 'm': {
          const dx = leesGetal();
          const dy = leesGetal();
          huidig = { x: huidig.x + dx, y: huidig.y + dy };
          startPunt = { ...huidig };
          ruwePunten.push({ ...huidig });
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const ldx = leesGetal();
            const ldy = leesGetal();
            const doel: Punt = { x: huidig.x + ldx, y: huidig.y + ldy };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
            }
            huidig = doel;
          }
          break;
        }
        case 'L': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const x = leesGetal();
            const y = leesGetal();
            const doel: Punt = { x, y };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
            }
            huidig = doel;
          }
          break;
        }
        case 'l': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const dx = leesGetal();
            const dy = leesGetal();
            const doel: Punt = { x: huidig.x + dx, y: huidig.y + dy };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
            }
            huidig = doel;
          }
          break;
        }
        case 'H': {
          const x = leesGetal();
          const doel: Punt = { x, y: huidig.y };
          for (let s = 1; s <= samplesPerSegment; s++) {
            ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
          }
          huidig = doel;
          break;
        }
        case 'h': {
          const dx = leesGetal();
          const doel: Punt = { x: huidig.x + dx, y: huidig.y };
          for (let s = 1; s <= samplesPerSegment; s++) {
            ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
          }
          huidig = doel;
          break;
        }
        case 'V': {
          const y = leesGetal();
          const doel: Punt = { x: huidig.x, y };
          for (let s = 1; s <= samplesPerSegment; s++) {
            ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
          }
          huidig = doel;
          break;
        }
        case 'v': {
          const dy = leesGetal();
          const doel: Punt = { x: huidig.x, y: huidig.y + dy };
          for (let s = 1; s <= samplesPerSegment; s++) {
            ruwePunten.push(lerp(huidig, doel, s / samplesPerSegment));
          }
          huidig = doel;
          break;
        }
        case 'C': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const x1 = leesGetal();
            const y1 = leesGetal();
            const x2 = leesGetal();
            const y2 = leesGetal();
            const x = leesGetal();
            const y = leesGetal();
            const cp1: Punt = { x: x1, y: y1 };
            const cp2: Punt = { x: x2, y: y2 };
            const eind: Punt = { x, y };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(kubiekeBezierPunt(huidig, cp1, cp2, eind, s / samplesPerSegment));
            }
            huidig = eind;
          }
          break;
        }
        case 'c': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const dx1 = leesGetal();
            const dy1 = leesGetal();
            const dx2 = leesGetal();
            const dy2 = leesGetal();
            const dx = leesGetal();
            const dy = leesGetal();
            const cp1: Punt = { x: huidig.x + dx1, y: huidig.y + dy1 };
            const cp2: Punt = { x: huidig.x + dx2, y: huidig.y + dy2 };
            const eind: Punt = { x: huidig.x + dx, y: huidig.y + dy };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(kubiekeBezierPunt(huidig, cp1, cp2, eind, s / samplesPerSegment));
            }
            huidig = eind;
          }
          break;
        }
        case 'Q': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const x1 = leesGetal();
            const y1 = leesGetal();
            const x = leesGetal();
            const y = leesGetal();
            const cp: Punt = { x: x1, y: y1 };
            const eind: Punt = { x, y };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(kwadratischBezierPunt(huidig, cp, eind, s / samplesPerSegment));
            }
            huidig = eind;
          }
          break;
        }
        case 'q': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const dx1 = leesGetal();
            const dy1 = leesGetal();
            const dx = leesGetal();
            const dy = leesGetal();
            const cp: Punt = { x: huidig.x + dx1, y: huidig.y + dy1 };
            const eind: Punt = { x: huidig.x + dx, y: huidig.y + dy };
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(kwadratischBezierPunt(huidig, cp, eind, s / samplesPerSegment));
            }
            huidig = eind;
          }
          break;
        }
        case 'A': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const rx = leesGetal();
            const ry = leesGetal();
            const xRotatie = leesGetal();
            const groteBoog = leesGetal() !== 0;
            const meeDraaiend = leesGetal() !== 0;
            const x = leesGetal();
            const y = leesGetal();
            const eind: Punt = { x, y };
            const boog = boogPunten(huidig, rx, ry, xRotatie, groteBoog, meeDraaiend, eind, samplesPerSegment);
            ruwePunten.push(...boog);
            huidig = eind;
          }
          break;
        }
        case 'a': {
          while (i < tokens.length && /^[-+0-9.]/.test(tokens[i])) {
            const rx = leesGetal();
            const ry = leesGetal();
            const xRotatie = leesGetal();
            const groteBoog = leesGetal() !== 0;
            const meeDraaiend = leesGetal() !== 0;
            const dx = leesGetal();
            const dy = leesGetal();
            const eind: Punt = { x: huidig.x + dx, y: huidig.y + dy };
            const boog = boogPunten(huidig, rx, ry, xRotatie, groteBoog, meeDraaiend, eind, samplesPerSegment);
            ruwePunten.push(...boog);
            huidig = eind;
          }
          break;
        }
        case 'Z':
        case 'z': {
          // Sluit het pad: trek een lijn terug naar het startpunt
          if (huidig.x !== startPunt.x || huidig.y !== startPunt.y) {
            for (let s = 1; s <= samplesPerSegment; s++) {
              ruwePunten.push(lerp(huidig, startPunt, s / samplesPerSegment));
            }
          }
          huidig = { ...startPunt };
          break;
        }
        // S, s, T, t worden overgeslagen (relatief zeldzaam in onze data)
        default:
          break;
      }
    } else {
      // Onbekende token, sla over
      i++;
    }
  }

  // Sample de ruwe punten naar het gevraagde aantal
  return samplePad(ruwePunten, aantalPunten);
}

/**
 * Her-sample een array van punten naar een vast aantal met gelijke tussenafstand.
 *
 * Berekent de totale padlengte, verdeelt die in gelijke segmenten,
 * en interpoleert langs het pad.
 */
export function samplePad(punten: Punt[], aantal: number): Punt[] {
  if (punten.length === 0) return [];
  if (punten.length === 1 || aantal <= 1) return [{ ...punten[0] }];

  // Bereken cumulatieve afstanden
  const cumulatieveAfstanden: number[] = [0];
  for (let i = 1; i < punten.length; i++) {
    const dx = punten[i].x - punten[i - 1].x;
    const dy = punten[i].y - punten[i - 1].y;
    cumulatieveAfstanden.push(cumulatieveAfstanden[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }

  const totaleAfstand = cumulatieveAfstanden[cumulatieveAfstanden.length - 1];

  // Als alle punten op dezelfde plek liggen, geef kopieën terug
  if (totaleAfstand === 0) {
    return Array.from({ length: aantal }, () => ({ ...punten[0] }));
  }

  const gesampledePunten: Punt[] = [];
  const stapGrootte = totaleAfstand / (aantal - 1);

  let segmentIndex = 0;

  for (let i = 0; i < aantal; i++) {
    const doelAfstand = i * stapGrootte;

    // Zoek het segment waar de doelafstand in valt
    while (
      segmentIndex < cumulatieveAfstanden.length - 2 &&
      cumulatieveAfstanden[segmentIndex + 1] < doelAfstand
    ) {
      segmentIndex++;
    }

    const segmentStart = cumulatieveAfstanden[segmentIndex];
    const segmentEind = cumulatieveAfstanden[segmentIndex + 1];
    const segmentLengte = segmentEind - segmentStart;

    if (segmentLengte === 0) {
      gesampledePunten.push({ ...punten[segmentIndex] });
    } else {
      const t = (doelAfstand - segmentStart) / segmentLengte;
      gesampledePunten.push(lerp(punten[segmentIndex], punten[segmentIndex + 1], t));
    }
  }

  return gesampledePunten;
}

/**
 * Normaliseer een set streken naar een 0-1 bounding box.
 *
 * Alle punten worden geschaald zodat ze binnen [0,1] x [0,1] vallen,
 * met behoud van de aspect ratio (de kortste as wordt gecentreerd).
 */
export function normaliseerStreken(streken: Punt[][]): Punt[][] {
  // Verzamel alle punten
  const allePunten = streken.flat();
  if (allePunten.length === 0) return streken;

  const bbox = berekenBoundingBox(allePunten);

  // Voorkom deling door nul
  const breedte = bbox.breedte || 1;
  const hoogte = bbox.hoogte || 1;
  const schaal = Math.max(breedte, hoogte);

  // Centreer de kortere as
  const offsetX = (schaal - breedte) / 2;
  const offsetY = (schaal - hoogte) / 2;

  return streken.map((streek) =>
    streek.map((punt) => ({
      x: (punt.x - bbox.x + offsetX) / schaal,
      y: (punt.y - bbox.y + offsetY) / schaal,
    }))
  );
}
