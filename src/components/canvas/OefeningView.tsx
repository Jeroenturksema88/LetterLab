'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, Niveau, TekenPunt, FeedbackType } from '@/types';
import { evalueerOvertrekking, evalueerSimilarity } from '@/lib/stroke-matching';
import { svgPadNaarPunten } from '@/lib/pad-normalisatie';
import { useInstellingenStore } from '@/stores/instellingen-store';
import TemplateCanvas from './TemplateCanvas';
import TekenCanvas from './TekenCanvas';
import StrokePad from './StrokePad';
import BeloningAnimatie from '../feedback/BeloningAnimatie';
import FeedbackOverlay from '../feedback/FeedbackOverlay';

interface OefeningViewProps {
  item: ItemDef;
  niveau: Niveau;
  onVoltooid: (geslaagd: boolean) => void;
  onTerug: () => void;
  audioSpeelFn?: (type: string) => void;
}

// --- SVG Iconen (geen emoji) ---

function UndoIcoon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h12a5 5 0 0 1 0 10H9" />
      <polyline points="7 14 3 10 7 6" />
    </svg>
  );
}

function WisIcoon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function VinkIcoon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  );
}

// --- Niveau-indicator als gekleurde bolletjes ---

function NiveauBolletjes({ niveau, kleur }: { niveau: Niveau; kleur: string }) {
  const aantalBolletjes = niveau === 'overtrekken' ? 1 : niveau === 'naschrijven' ? 2 : 3;
  const totaalBolletjes = 3;

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totaalBolletjes }, (_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 10,
            height: 10,
            backgroundColor: i < aantalBolletjes ? kleur : '#E2E8F0',
            border: i < aantalBolletjes ? 'none' : '1.5px solid #CBD5E1',
          }}
        />
      ))}
    </div>
  );
}

export default function OefeningView({
  item,
  niveau,
  onVoltooid,
  onTerug,
  audioSpeelFn,
}: OefeningViewProps) {
  const [streken, setStreken] = useState<TekenPunt[][]>([]);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [toonBeloning, setToonBeloning] = useState(false);
  const [beloningType, setBeloningType] = useState<'sparkle' | 'ster' | 'confetti'>('sparkle');
  const [disabled, setDisabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const tekenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Responsieve canvas-afmetingen op basis van venstergrootte
  const [vensterGrootte, setVensterGrootte] = useState({ breedte: 1024, hoogte: 768 });

  useEffect(() => {
    function updateGrootte() {
      setVensterGrootte({ breedte: window.innerWidth, hoogte: window.innerHeight });
    }
    updateGrootte();
    window.addEventListener('resize', updateGrootte);
    return () => window.removeEventListener('resize', updateGrootte);
  }, []);

  // Instellingen ophalen voor evaluatiedrempels
  const evaluatieInstellingen = useInstellingenStore((state) => state.evaluatie);

  const isNaschrijven = niveau === 'naschrijven';

  // Canvas afmetingen berekenen: ~80% van viewport hoogte minus header (64px)
  const headerHoogte = 64;
  const beschikbareHoogte = vensterGrootte.hoogte - headerHoogte - 32; // 32px voor padding
  const canvasHoogte = Math.round(beschikbareHoogte * 0.8);

  // Breedte: voor naschrijven 60% van beschikbare breedte, anders 80%
  const beschikbareBreedte = vensterGrootte.breedte - 48; // 48px voor padding
  const canvasBreedte = isNaschrijven
    ? Math.round(beschikbareBreedte * 0.55)
    : Math.min(Math.round(beschikbareBreedte * 0.8), canvasHoogte * 1.1);

  // Voorbeeld-canvas breedte voor naschrijven (40% van de ruimte)
  const voorbeeldBreedte = isNaschrijven ? Math.round(beschikbareBreedte * 0.35) : 0;

  // Bereken schaal en offset voor template → canvas transformatie
  // Dit moet identiek zijn aan TemplateCanvas zodat de vergelijking klopt
  const padding = 40;
  const bb = item.boundingBox;
  const tBeschikbareBreedte = canvasBreedte - padding * 2;
  const tBeschikbareHoogte = canvasHoogte - padding * 2;
  const schaalX = tBeschikbareBreedte / bb.breedte;
  const schaalY = tBeschikbareHoogte / bb.hoogte;
  const schaal = Math.min(schaalX, schaalY);
  const offsetX = padding + (tBeschikbareBreedte - bb.breedte * schaal) / 2 - bb.x * schaal;
  const offsetY = padding + (tBeschikbareHoogte - bb.hoogte * schaal) / 2 - bb.y * schaal;

  // Template-padpunten voorbereiden en naar canvas-ruimte schalen (voor overtrekken)
  const geschaaldeTemplatePunten = useMemo(() => {
    if (niveau !== 'overtrekken') return [];
    // Converteer alle SVG-paden naar punten en schaal naar canvas-coordinaten
    const allePunten = item.paden.flatMap((pad) => {
      const svgPunten = svgPadNaarPunten(pad, 100);
      // Schaal van SVG-ruimte (item coordinate space) naar canvas-ruimte
      return svgPunten.map((p) => ({
        x: p.x * schaal + offsetX,
        y: p.y * schaal + offsetY,
      }));
    });
    return allePunten;
  }, [item.paden, niveau, schaal, offsetX, offsetY]);

  // Geschaalde proximity-marge: de geconfigureerde marge is in SVG-eenheden,
  // dus vermenigvuldigen met de schaalfactor voor canvas-ruimte
  const geschaaldeProximityMarge = evaluatieInstellingen.proximityMarge * schaal;

  // Audio met vertraging afspelen bij laden
  useEffect(() => {
    const audioType =
      niveau === 'overtrekken'
        ? 'niveau1_instructie'
        : niveau === 'naschrijven'
        ? 'niveau2_instructie'
        : 'niveau3_instructie';

    // 500ms vertraging voor een natuurlijker gevoel
    const timer = setTimeout(() => {
      audioSpeelFn?.(audioType);
    }, 500);

    return () => clearTimeout(timer);
  }, [niveau, audioSpeelFn]);

  const handleStreekKlaar = useCallback(
    (punten: TekenPunt[]) => {
      const nieuweStreken = [...streken, punten];
      setStreken(nieuweStreken);

      // Reset inactiviteitstimer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        evalueer(nieuweStreken);
      }, evaluatieInstellingen.inactiviteitTimeout);
    },
    [streken, evaluatieInstellingen.inactiviteitTimeout]
  );

  const evalueer = useCallback(
    (huidigeStreken: TekenPunt[][]) => {
      if (huidigeStreken.length === 0) return;

      // Minimale sanity check: minstens 1 streek met meer dan 3 punten
      const heeftGenoegPunten = huidigeStreken.some((s) => s.length > 3);
      if (!heeftGenoegPunten) return;

      let geslaagd = false;

      if (niveau === 'overtrekken') {
        // Voeg alle gebruikerspunten samen voor de dekkingsberekening
        const allePunten = huidigeStreken.flat();

        const resultaat = evalueerOvertrekking(
          allePunten,
          geschaaldeTemplatePunten,
          geschaaldeProximityMarge
        );

        geslaagd = resultaat.dekking >= evaluatieInstellingen.overtrekDrempel;
      } else {
        // Naschrijven of zelfstandig: similarity-evaluatie
        const drempel =
          niveau === 'naschrijven'
            ? evaluatieInstellingen.naschrijfDrempel
            : evaluatieInstellingen.freehandDrempel;

        const resultaat = evalueerSimilarity(
          huidigeStreken,
          item.streken,
          drempel,
          niveau
        );

        geslaagd = resultaat.geslaagd;
      }

      setDisabled(true);

      if (geslaagd) {
        setBeloningType(niveau === 'zelfstandig' ? 'confetti' : 'ster');
        setToonBeloning(true);
        audioSpeelFn?.('succes');
        setTimeout(() => {
          setFeedback('succes');
        }, 2000);
      } else {
        audioSpeelFn?.('aanmoediging');
        setFeedback('aanmoediging');
      }
    },
    [
      niveau,
      audioSpeelFn,
      geschaaldeTemplatePunten,
      geschaaldeProximityMarge,
      evaluatieInstellingen,
      item.streken,
    ]
  );

  const handleKlaarKnop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    evalueer(streken);
  }, [streken, evalueer]);

  const handleNogEenKeer = useCallback(() => {
    setStreken([]);
    setFeedback(null);
    setToonBeloning(false);
    setDisabled(false);
    // Wis canvas
    const canvas = tekenCanvasRef.current;
    if (canvas && (canvas as any).wisAlles) {
      (canvas as any).wisAlles();
    }
  }, []);

  const handleVolgende = useCallback(() => {
    onVoltooid(true);
  }, [onVoltooid]);

  const handleWis = useCallback(() => {
    setStreken([]);
    const canvas = tekenCanvasRef.current;
    if (canvas && (canvas as any).wisAlles) {
      (canvas as any).wisAlles();
    }
  }, []);

  const handleUndo = useCallback(() => {
    setStreken((prev) => prev.slice(0, -1));
    const canvas = tekenCanvasRef.current;
    if (canvas && (canvas as any).ongedaanMaken) {
      (canvas as any).ongedaanMaken();
    }
  }, []);

  // Opruimen timer bij unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Bovenbalk — geen tekst, alleen iconen en kleurindicatoren */}
      <div
        className="flex items-center justify-between px-4 bg-white/50"
        style={{ height: headerHoogte }}
      >
        {/* Terug-knop */}
        <motion.button
          onClick={onTerug}
          className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          aria-label="Terug"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        {/* Item-kleur bolletje + niveau-indicator */}
        <div className="flex items-center gap-3">
          <div
            className="rounded-full shadow-sm"
            style={{
              width: 24,
              height: 24,
              backgroundColor: item.kleur,
            }}
          />
          <NiveauBolletjes niveau={niveau} kleur={item.kleur} />
        </div>

        {/* Undo en wis knoppen met SVG-iconen */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleUndo}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            disabled={disabled || streken.length === 0}
            style={{ opacity: streken.length === 0 ? 0.3 : 1 }}
            aria-label="Ongedaan maken"
          >
            <UndoIcoon />
          </motion.button>
          <motion.button
            onClick={handleWis}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            disabled={disabled || streken.length === 0}
            style={{ opacity: streken.length === 0 ? 0.3 : 1 }}
            aria-label="Alles wissen"
          >
            <WisIcoon />
          </motion.button>
        </div>
      </div>

      {/* Canvas-gebied — neemt alle beschikbare hoogte in */}
      <div className="flex-1 flex items-center justify-center gap-4 px-4 pb-4">
        {/* Voorbeeld-canvas voor naschrijven (links, kleiner) */}
        {isNaschrijven && (
          <div
            className="relative bg-white rounded-kind shadow-lg overflow-hidden flex-shrink-0"
            style={{ width: voorbeeldBreedte, height: canvasHoogte }}
          >
            <TemplateCanvas
              item={item}
              niveau="naschrijven"
              breedte={voorbeeldBreedte}
              hoogte={canvasHoogte}
            />
          </div>
        )}

        {/* Teken-canvas (hoofdgebied) */}
        <div
          className="relative bg-white rounded-kind shadow-lg overflow-hidden flex-shrink-0"
          style={{ width: canvasBreedte, height: canvasHoogte }}
        >
          {/* Template-laag */}
          {niveau === 'overtrekken' && (
            <>
              <TemplateCanvas
                item={item}
                niveau="overtrekken"
                breedte={canvasBreedte}
                hoogte={canvasHoogte}
              />
              {/* Startpunt-animatie: alleen tonen als er nog niet getekend is */}
              {item.streken.length > 0 && streken.length === 0 && (
                <StrokePad
                  startPunt={item.streken[0].startPunt}
                  kleur={item.kleur}
                  schaal={schaal}
                  offsetX={offsetX}
                  offsetY={offsetY}
                />
              )}
            </>
          )}

          {niveau === 'zelfstandig' && (
            <TemplateCanvas
              item={item}
              niveau="zelfstandig"
              breedte={canvasBreedte}
              hoogte={canvasHoogte}
            />
          )}

          {/* Interactieve tekenlaag */}
          <TekenCanvas
            breedte={canvasBreedte}
            hoogte={canvasHoogte}
            kleur={item.kleur}
            onStreekKlaar={handleStreekKlaar}
            disabled={disabled}
          />

          {/* Beloningsanimatie */}
          <BeloningAnimatie
            type={beloningType}
            zichtbaar={toonBeloning}
            onKlaar={() => setToonBeloning(false)}
          />
        </div>
      </div>

      {/* Klaar-knop: groot groen rondje met witte vink */}
      {!disabled && streken.length > 0 && (
        <div className="flex justify-center pb-4">
          <motion.button
            onClick={handleKlaarKnop}
            className="rounded-full shadow-lg flex items-center justify-center bg-green-500"
            style={{ width: 64, height: 64 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            aria-label="Klaar"
          >
            <VinkIcoon />
          </motion.button>
        </div>
      )}

      {/* Feedback overlay (succes / aanmoediging) */}
      <FeedbackOverlay
        type={feedback}
        onVolgende={handleVolgende}
        onNogEenKeer={handleNogEenKeer}
      />
    </div>
  );
}
