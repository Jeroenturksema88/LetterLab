'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, Niveau, TekenPunt, EvaluatieResultaat, FeedbackType } from '@/types';
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

  // Canvas afmetingen
  const isNaschrijven = niveau === 'naschrijven';
  const canvasBreedte = isNaschrijven ? 400 : 500;
  const canvasHoogte = 450;

  useEffect(() => {
    // Speel instructie-audio bij laden
    const audioType =
      niveau === 'overtrekken'
        ? 'niveau1_instructie'
        : niveau === 'naschrijven'
        ? 'niveau2_instructie'
        : 'niveau3_instructie';
    audioSpeelFn?.(audioType);
  }, [niveau, audioSpeelFn]);

  const handleStreekKlaar = useCallback(
    (punten: TekenPunt[]) => {
      const nieuweStreken = [...streken, punten];
      setStreken(nieuweStreken);

      // Reset inactiviteitstimer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        evalueer(nieuweStreken);
      }, 4000);
    },
    [streken]
  );

  const evalueer = useCallback(
    (huidigeStreken: TekenPunt[][]) => {
      if (huidigeStreken.length === 0) return;

      // Eenvoudige evaluatie: als er genoeg streken zijn, is het geslaagd
      // De echte evaluatie wordt gedaan door de stroke-matching lib,
      // maar voor de MVP accepteren we elke redelijke poging
      const heeftGenoegStreken = huidigeStreken.length >= 1;
      const heeftGenoegPunten = huidigeStreken.flat().length > 10;

      const geslaagd = heeftGenoegStreken && heeftGenoegPunten;

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
    [niveau, audioSpeelFn]
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

  // Bereken schaal voor het startpunt-indicator
  const bb = item.boundingBox;
  const padding = 40;
  const beschikbareBreedte = canvasBreedte - padding * 2;
  const beschikbareHoogte = canvasHoogte - padding * 2;
  const schaalX = beschikbareBreedte / bb.breedte;
  const schaalY = beschikbareHoogte / bb.hoogte;
  const schaal = Math.min(schaalX, schaalY);
  const offsetX = padding + (beschikbareBreedte - bb.breedte * schaal) / 2 - bb.x * schaal;
  const offsetY = padding + (beschikbareHoogte - bb.hoogte * schaal) / 2 - bb.y * schaal;

  return (
    <div className="flex flex-col h-full">
      {/* Bovenbalk */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/50">
        <motion.button
          onClick={onTerug}
          className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold" style={{ color: item.kleur }}>
            {item.label}
          </span>
          <span className="text-sm font-semibold text-gray-400 bg-white/80 px-3 py-1 rounded-full">
            {niveau === 'overtrekken' ? '✏️ 1' : niveau === 'naschrijven' ? '👀 2' : '🧠 3'}
          </span>
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={handleUndo}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            disabled={disabled || streken.length === 0}
            style={{ opacity: streken.length === 0 ? 0.3 : 1 }}
          >
            <span className="text-xl">↩️</span>
          </motion.button>
          <motion.button
            onClick={handleWis}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            disabled={disabled || streken.length === 0}
            style={{ opacity: streken.length === 0 ? 0.3 : 1 }}
          >
            <span className="text-xl">🧹</span>
          </motion.button>
        </div>
      </div>

      {/* Canvas-gebied */}
      <div className="flex-1 flex items-center justify-center gap-4 p-4">
        {isNaschrijven && (
          <div className="relative bg-white rounded-kind shadow-lg overflow-hidden" style={{ width: canvasBreedte * 0.8, height: canvasHoogte }}>
            <TemplateCanvas
              item={item}
              niveau="naschrijven"
              breedte={canvasBreedte * 0.8}
              hoogte={canvasHoogte}
            />
          </div>
        )}

        <div className="relative bg-white rounded-kind shadow-lg overflow-hidden" style={{ width: canvasBreedte, height: canvasHoogte }}>
          {niveau === 'overtrekken' && (
            <>
              <TemplateCanvas
                item={item}
                niveau="overtrekken"
                breedte={canvasBreedte}
                hoogte={canvasHoogte}
              />
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

          <TekenCanvas
            breedte={canvasBreedte}
            hoogte={canvasHoogte}
            kleur={item.kleur}
            onStreekKlaar={handleStreekKlaar}
            disabled={disabled}
          />

          <BeloningAnimatie
            type={beloningType}
            zichtbaar={toonBeloning}
            onKlaar={() => setToonBeloning(false)}
          />
        </div>
      </div>

      {/* Klaar-knop */}
      {!disabled && streken.length > 0 && (
        <div className="flex justify-center pb-4">
          <motion.button
            onClick={handleKlaarKnop}
            className="px-8 py-3 rounded-full shadow-lg text-white font-bold text-lg"
            style={{ backgroundColor: item.kleur }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓
          </motion.button>
        </div>
      )}

      <FeedbackOverlay
        type={feedback}
        onVolgende={handleVolgende}
        onNogEenKeer={handleNogEenKeer}
      />
    </div>
  );
}
