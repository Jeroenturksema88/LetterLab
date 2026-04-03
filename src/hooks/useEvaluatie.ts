'use client';

// hooks/useEvaluatie.ts — Evaluatiehook voor stroke-matching
//
// Combineert geometrische stroke-matching (lib/stroke-matching.ts)
// met de configureerbare drempels uit de instellingen-store.
//
// Werkt met een inactiviteitstimer: wanneer de gebruiker stopt met
// tekenen (standaard 4 seconden), wordt de evaluatie automatisch
// uitgevoerd. Kan ook handmatig getriggerd worden via markeerKlaar().

import { useState, useRef, useCallback } from 'react';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { evalueerOvertrekking, evalueerSimilarity } from '@/lib/stroke-matching';
import { svgPadNaarPunten } from '@/lib/pad-normalisatie';
import type { ItemDef, Niveau, EvaluatieResultaat, TekenPunt, Punt } from '@/types';

export function useEvaluatie(item: ItemDef, niveau: Niveau) {
  const [streken, setStreken] = useState<TekenPunt[][]>([]);
  const [resultaat, setResultaat] = useState<EvaluatieResultaat | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Haal evaluatie-instellingen op uit de store
  const evaluatieInstellingen = useInstellingenStore((state) => state.evaluatie);

  /**
   * Voer de evaluatie uit op basis van het huidige niveau.
   * - Overtrekken: vergelijk gebruikerspunten met het template-pad
   * - Naschrijven/Zelfstandig: vergelijk streekpatronen met template
   */
  const voerEvaluatieUit = useCallback(
    (huidigeStreken: TekenPunt[][]) => {
      if (huidigeStreken.length === 0) return;

      let evaluatieResultaat: EvaluatieResultaat;

      if (niveau === 'overtrekken') {
        // Combineer alle streken tot één vlakke array van punten
        const allePunten = huidigeStreken.flat();

        // Converteer de template-paden (SVG) naar punten
        const templatePunten: Punt[] = item.paden.flatMap((pad) =>
          svgPadNaarPunten(pad)
        );

        evaluatieResultaat = evalueerOvertrekking(
          allePunten,
          templatePunten,
          evaluatieInstellingen.proximityMarge
        );

        // Overschrijf de standaard drempelwaarde met de configureerbare drempel
        evaluatieResultaat = {
          ...evaluatieResultaat,
          geslaagd: evaluatieResultaat.dekking >= evaluatieInstellingen.overtrekDrempel,
          feedback:
            evaluatieResultaat.dekking >= evaluatieInstellingen.overtrekDrempel
              ? 'succes'
              : 'aanmoediging',
        };
      } else {
        // Naschrijven of zelfstandig schrijven
        const drempel =
          niveau === 'naschrijven'
            ? evaluatieInstellingen.naschrijfDrempel
            : evaluatieInstellingen.freehandDrempel;

        evaluatieResultaat = evalueerSimilarity(
          huidigeStreken,
          item.streken,
          drempel,
          niveau
        );
      }

      setResultaat(evaluatieResultaat);
    },
    [item, niveau, evaluatieInstellingen]
  );

  /**
   * Verwerk een voltooide streek.
   * Voegt de streek toe aan de lijst en herstart de inactiviteitstimer.
   */
  const handleStreekKlaar = useCallback(
    (punten: TekenPunt[]) => {
      if (punten.length === 0) return;

      // Reset eventuele vorige evaluatie bij een nieuwe streek
      setResultaat(null);

      setStreken((vorige) => {
        const nieuweStreken = [...vorige, punten];

        // Reset de inactiviteitstimer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Start een nieuwe timer — als de gebruiker niet verder tekent
        // binnen de timeout, evalueer automatisch
        timerRef.current = setTimeout(() => {
          voerEvaluatieUit(nieuweStreken);
        }, evaluatieInstellingen.inactiviteitTimeout);

        return nieuweStreken;
      });
    },
    [voerEvaluatieUit, evaluatieInstellingen.inactiviteitTimeout]
  );

  /**
   * Markeer de tekening als klaar en voer direct de evaluatie uit.
   * Stopt de inactiviteitstimer als die loopt.
   */
  const markeerKlaar = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    voerEvaluatieUit(streken);
  }, [voerEvaluatieUit, streken]);

  /**
   * Reset de evaluatie en alle streken.
   * Wordt gebruikt wanneer de gebruiker opnieuw begint.
   */
  const resetEvaluatie = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setStreken([]);
    setResultaat(null);
  }, []);

  return {
    handleStreekKlaar,
    markeerKlaar,
    resultaat,
    resetEvaluatie,
    streken,
  };
}
