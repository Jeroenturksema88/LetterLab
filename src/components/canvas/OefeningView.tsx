'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, Niveau, TekenPunt, FeedbackType } from '@/types';
import { evalueerOvertrekking, evalueerSimilarity } from '@/lib/stroke-matching';
import { svgPadNaarPunten } from '@/lib/pad-normalisatie';
import { useInstellingenStore } from '@/stores/instellingen-store';
import TemplateCanvas from './TemplateCanvas';
import TekenCanvas from './TekenCanvas';
import type { TekenCanvasActies } from './TekenCanvas';
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

// --- Lijndikte-opties ---

const LIJN_DIKTES = [
  { dikte: 6, label: 'dun', weergaveDiameter: 8 },
  { dikte: 12, label: 'normaal', weergaveDiameter: 14 },
  { dikte: 20, label: 'dik', weergaveDiameter: 22 },
];

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
  const [tekenKleur, setTekenKleur] = useState(item.kleur);
  const [lijnDikte, setLijnDikte] = useState(12);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const tekenCanvasRef = useRef<TekenCanvasActies>(null);

  // Kleurenpalet voor de kleurkiezer
  const TEKEN_KLEUREN = useMemo(() => [
    item.kleur,       // Standaard categorie-kleur
    '#EF4444',        // Rood
    '#F59E0B',        // Oranje/amber
    '#10B981',        // Groen
    '#3B82F6',        // Blauw
    '#8B5CF6',        // Paars
    '#EC4899',        // Roze
    '#06B6D4',        // Cyaan
  ], [item.kleur]);

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

  // Instellingen ophalen voor evaluatiedrempels en hand-voorkeur
  const evaluatieInstellingen = useInstellingenStore((state) => state.evaluatie);
  const dominanteHand = useInstellingenStore((state) => state.dominanteHand);

  const isNaschrijven = niveau === 'naschrijven';
  // Linkshandig kind: voorbeeld rechts, canvas links zodat de tekenende hand
  // het voorbeeld niet bedekt.
  const voorbeeldRechts = dominanteHand === 'links';

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
        // Feedback overlay pas NA de beloningsanimatie (3 sec)
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
    // Wis canvas via de imperative handle
    tekenCanvasRef.current?.wisAlles();
  }, []);

  const handleVolgende = useCallback(() => {
    onVoltooid(true);
  }, [onVoltooid]);

  const handleWis = useCallback(() => {
    setStreken([]);
    tekenCanvasRef.current?.wisAlles();
  }, []);

  const handleUndo = useCallback(() => {
    setStreken((prev) => prev.slice(0, -1));
    tekenCanvasRef.current?.ongedaanMaken();
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
            className="w-12 h-12 rounded-full shadow-md flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            disabled={disabled || streken.length === 0}
            // Wis-knop heeft een zacht roze/oranje achtergrond zodat een 3,5-jarige
            // hem nooit verwart met de groene "klaar"-knop. Visueel verschil belangrijk:
            // klaar = vrolijk groen, wis = "let op, dit haalt alles weg" oranje-roze.
            style={{
              opacity: streken.length === 0 ? 0.3 : 1,
              background: streken.length === 0 ? '#FFFFFF' : 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
            }}
            aria-label="Alles wissen"
          >
            <WisIcoon />
          </motion.button>
        </div>
      </div>

      {/* Canvas-gebied — neemt alle beschikbare hoogte in.
          Bij naschrijven: voorbeeld staat standaard links, canvas rechts.
          Voor een linkshandig kind wisselt de volgorde via flex-row-reverse
          zodat de tekenende hand het voorbeeld niet bedekt. */}
      <div
        className={`flex-1 flex items-center justify-center gap-4 px-4 pb-4 ${
          isNaschrijven && voorbeeldRechts ? 'flex-row-reverse' : ''
        }`}
      >
        {/* Voorbeeld-canvas voor naschrijven.
            Heeft een "kijk-icoon" (oog) bovenin zodat het kind zonder tekst snapt
            dat dit voorbeeld is om naar te kijken, niet om op te tekenen. Subtiele
            sluier en geen pointer-events maken visueel duidelijk dat tekenen hier
            niets doet. */}
        {isNaschrijven && (
          <div
            className="relative bg-white rounded-kind shadow-lg overflow-hidden flex-shrink-0"
            style={{ width: voorbeeldBreedte, height: canvasHoogte }}
          >
            {/* Oog-icoon rechtsboven — universeel "kijk hier"-symbool */}
            <div
              className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.kleur} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <TemplateCanvas
                item={item}
                niveau="naschrijven"
                breedte={voorbeeldBreedte}
                hoogte={canvasHoogte}
              />
            </div>
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
            ref={tekenCanvasRef}
            breedte={canvasBreedte}
            hoogte={canvasHoogte}
            kleur={tekenKleur}
            lijnDikte={lijnDikte}
            onStreekKlaar={handleStreekKlaar}
            disabled={disabled}
          />

          {/* Beloningsanimatie — feedback overlay pas NA animatie */}
          <BeloningAnimatie
            type={beloningType}
            zichtbaar={toonBeloning}
            onKlaar={() => {
              setToonBeloning(false);
              setFeedback('succes');
            }}
          />
        </div>
      </div>

      {/* Kleur- en diktekiezer */}
      <div className="flex items-center justify-center gap-6 py-2">
        {/* Kleurkiezer */}
        <div className="flex items-center gap-2">
          {TEKEN_KLEUREN.map((kleur) => (
            <motion.button
              key={kleur}
              onClick={() => setTekenKleur(kleur)}
              className="rounded-full flex-shrink-0"
              style={{
                width: 28,
                height: 28,
                backgroundColor: kleur,
                border: tekenKleur === kleur ? '3px solid #4A3728' : '3px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
              whileTap={{ scale: 0.85 }}
              animate={{ scale: tekenKleur === kleur ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              aria-label={`Kleur ${kleur}`}
            />
          ))}
        </div>

        {/* Scheiding */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Diktekiezer */}
        <div className="flex items-center gap-3">
          {LIJN_DIKTES.map(({ dikte, label, weergaveDiameter }) => (
            <motion.button
              key={dikte}
              onClick={() => setLijnDikte(dikte)}
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
              }}
              whileTap={{ scale: 0.85 }}
              aria-label={`Lijndikte ${label}`}
            >
              <div
                className="rounded-full"
                style={{
                  width: weergaveDiameter,
                  height: weergaveDiameter,
                  backgroundColor: tekenKleur,
                  border: lijnDikte === dikte ? '2px solid #4A3728' : '2px solid transparent',
                  boxShadow: lijnDikte === dikte ? '0 0 0 1px #4A3728' : 'none',
                }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Klaar-knop: altijd zichtbaar. Pulseert zachtjes zodra het kind iets
          getekend heeft — visuele uitnodiging om te tikken als ze klaar zijn.
          Dit verkleint de behoefte om op de inactiviteit-timer te leunen. */}
      {!disabled && (
        <div className="flex justify-center pb-3">
          <motion.button
            onClick={handleKlaarKnop}
            className="rounded-full shadow-lg flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              backgroundColor: streken.length > 0 ? '#22C55E' : '#D1D5DB',
            }}
            whileTap={streken.length > 0 ? { scale: 0.9 } : {}}
            // Subtiele schaal-puls die alleen draait als er streken zijn:
            // trekt de blik naar de knop zonder afleidend te zijn.
            animate={
              streken.length > 0
                ? { scale: [1, 1.08, 1], boxShadow: ['0 4px 12px rgba(34,197,94,0.3)', '0 6px 20px rgba(34,197,94,0.55)', '0 4px 12px rgba(34,197,94,0.3)'] }
                : { scale: 1 }
            }
            transition={
              streken.length > 0
                ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
            disabled={streken.length === 0}
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
