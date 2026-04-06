'use client';

// components/feedback/DiplomaOverlay.tsx — Feestelijke diploma-overlay bij voltooiing

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo } from 'react';
import type { Categorie } from '@/types';

// Type diploma: per item of per categorie
export type DiplomaType = 'item' | 'categorie';

export interface DiplomaInfo {
  type: DiplomaType;
  itemLabel: string;       // Het label van het item (bijv. "A", "3", "Cirkel")
  itemPaden: string[];     // SVG-paden om het item te tonen
  categorie: Categorie;
  kindNaam: string;
}

interface DiplomaOverlayProps {
  diploma: DiplomaInfo | null;
  zichtbaar: boolean;
  onSluiten: () => void;
}

// Confetti-regen als achtergrond-animatie
function DiplomaConfetti() {
  const kleuren = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#6366F1', '#EC4899', '#F59E0B', '#10B981'];

  const stukjes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        kleur: kleuren[i % kleuren.length],
        x: Math.random() * 100,
        vertraging: Math.random() * 0.8,
        rotatie: Math.random() * 720,
        breedte: 5 + Math.random() * 10,
        hoogte: 4 + Math.random() * 8,
        driftX: (Math.random() - 0.5) * 250,
        vorm: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm',
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {stukjes.map((s) => (
        <motion.div
          key={s.id}
          className={`absolute ${s.vorm}`}
          style={{
            left: `${s.x}%`,
            top: '-5%',
            width: s.breedte,
            height: s.hoogte,
            backgroundColor: s.kleur,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            rotate: s.rotatie,
            opacity: [1, 1, 1, 0.5, 0],
            x: [0, s.driftX * 0.3, s.driftX],
          }}
          transition={{
            duration: 3.5,
            delay: s.vertraging,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}

// Drie gouden sterren met gestaffelde animatie
function GoudenSterren() {
  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="text-4xl md:text-5xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.8 + i * 0.2,
            type: 'spring',
            stiffness: 300,
            damping: 12,
          }}
          style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.6))' }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 2L30.18 16.36L46 18.72L34.5 29.64L37.36 46L24 38.36L10.64 46L13.5 29.64L2 18.72L17.82 16.36L24 2Z"
              fill="#FFD700"
              stroke="#DAA520"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Categorie-icoon (trofee of medaille) op basis van diplomatype
function DiplomaIcoon({ type }: { type: DiplomaType }) {
  if (type === 'categorie') {
    // Trofee-SVG voor categorie-diploma
    return (
      <motion.div
        initial={{ scale: 0, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          {/* Trofee lichaam */}
          <path
            d="M20 12H52V32C52 44 44 52 36 52C28 52 20 44 20 32V12Z"
            fill="#FFD700"
            stroke="#DAA520"
            strokeWidth="2"
          />
          {/* Linker handvat */}
          <path
            d="M20 18H14C10 18 8 22 8 26C8 30 10 34 14 34H20"
            stroke="#DAA520"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Rechter handvat */}
          <path
            d="M52 18H58C62 18 64 22 64 26C64 30 62 34 58 34H52"
            stroke="#DAA520"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Voet */}
          <path d="M30 52V58H26V62H46V58H42V52" fill="#DAA520" stroke="#B8860B" strokeWidth="1.5" />
          {/* Glansstreep */}
          <path d="M28 18V36" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>
    );
  }

  // Medaille-SVG voor item-diploma
  return (
    <motion.div
      initial={{ scale: 0, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
    >
      <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
        {/* Lint */}
        <path d="M20 0L32 28L44 0" fill="#E53E3E" opacity="0.9" />
        <path d="M22 0L32 24L42 0" fill="#FC8181" opacity="0.5" />
        {/* Medaille cirkel */}
        <circle cx="32" cy="42" r="26" fill="#FFD700" stroke="#DAA520" strokeWidth="2.5" />
        <circle cx="32" cy="42" r="20" fill="none" stroke="#DAA520" strokeWidth="1.5" />
        {/* Ster in medaille */}
        <path
          d="M32 26L35.5 35.5L45 36.5L38 43L40 52.5L32 48L24 52.5L26 43L19 36.5L28.5 35.5L32 26Z"
          fill="#FFF8DC"
          stroke="#DAA520"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
}

// Het item (letter/cijfer/vorm) als SVG weergeven
function ItemWeergave({ paden, kleur }: { paden: string[]; kleur: string }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
    >
      <svg width="80" height="80" viewBox="0 0 200 200" fill="none">
        {paden.map((pad, i) => (
          <path
            key={i}
            d={pad}
            stroke={kleur}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </svg>
    </motion.div>
  );
}

// Kleur per categorie (consistent met CategorieKnop)
const CATEGORIE_KLEUR: Record<Categorie, string> = {
  letters: '#6366F1',
  cijfers: '#F59E0B',
  vormen: '#10B981',
};

export default function DiplomaOverlay({ diploma, zichtbaar, onSluiten }: DiplomaOverlayProps) {
  // Sluit automatisch na 8 seconden als er niet op gedrukt wordt
  useEffect(() => {
    if (zichtbaar) {
      const timer = setTimeout(onSluiten, 8000);
      return () => clearTimeout(timer);
    }
  }, [zichtbaar, onSluiten]);

  // Voorkom scroll op de achtergrond
  useEffect(() => {
    if (zichtbaar) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [zichtbaar]);

  const handleSluiten = useCallback(() => {
    onSluiten();
  }, [onSluiten]);

  if (!diploma) return null;

  const itemKleur = CATEGORIE_KLEUR[diploma.categorie];

  return (
    <AnimatePresence>
      {zichtbaar && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Donkere overlay-achtergrond */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSluiten}
          />

          {/* Confetti */}
          <DiplomaConfetti />

          {/* Diploma-kaart */}
          <motion.div
            className="relative z-20 flex flex-col items-center gap-4 p-8 md:p-12 mx-6"
            style={{
              maxWidth: 420,
              width: '100%',
              background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E1 50%, #FFF3CD 100%)',
              borderRadius: 28,
              // Gouden rand/frame
              border: '4px solid #DAA520',
              boxShadow: `
                0 0 0 2px #B8860B,
                0 0 0 6px #FFD70040,
                0 20px 60px -10px rgba(0, 0, 0, 0.3),
                inset 0 2px 8px rgba(255, 255, 255, 0.8)
              `,
            }}
            initial={{ scale: 0.3, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.3, y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 18,
              delay: 0.1,
            }}
          >
            {/* Decoratieve binnenrand */}
            <div
              className="absolute inset-3 rounded-[20px] pointer-events-none"
              style={{
                border: '2px dashed #DAA52060',
              }}
            />

            {/* Diploma-icoon (medaille of trofee) */}
            <DiplomaIcoon type={diploma.type} />

            {/* Het item als SVG */}
            <ItemWeergave paden={diploma.itemPaden} kleur={itemKleur} />

            {/* Naam van het kind — prominent weergegeven */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{
                  color: '#8B6914',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {diploma.kindNaam}
              </div>
            </motion.div>

            {/* Drie gouden sterren */}
            <GoudenSterren />

            {/* Sluit-knop — groot en duidelijk */}
            <motion.button
              onClick={handleSluiten}
              className="mt-2 flex items-center justify-center w-16 h-16 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
                border: '3px solid rgba(255,255,255,0.6)',
              }}
              whileTap={{ scale: 0.85 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
            >
              {/* Vinkje-icoon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Gloeiende achtergrondcirkels voor extra feestelijkheid */}
          <motion.div
            className="absolute pointer-events-none z-10"
            style={{
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 2.5, 2] }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
