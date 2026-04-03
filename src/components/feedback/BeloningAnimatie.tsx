'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BeloningAnimatieProps {
  type: 'sparkle' | 'ster' | 'confetti';
  zichtbaar: boolean;
  onKlaar?: () => void;
}

function Confetti() {
  const kleuren = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6366F1', '#F59E0B', '#10B981', '#EC4899'];
  const stukjes = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    kleur: kleuren[i % kleuren.length],
    x: Math.random() * 100,
    vertraging: Math.random() * 0.5,
    rotatie: Math.random() * 360,
    grootte: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stukjes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-sm"
          style={{
            left: `${s.x}%`,
            top: '-10px',
            width: s.grootte,
            height: s.grootte,
            backgroundColor: s.kleur,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window?.innerHeight || 600,
            rotate: s.rotatie + 720,
            opacity: [1, 1, 0],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 2,
            delay: s.vertraging,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function Sparkles() {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    y: 20 + Math.random() * 60,
    grootte: 8 + Math.random() * 16,
    vertraging: Math.random() * 0.8,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute text-yellow-400"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.grootte,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: s.vertraging }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  );
}

function SterAnimatie() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="text-7xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.3, 1], rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        ⭐
      </motion.div>
      <Sparkles />
    </div>
  );
}

export default function BeloningAnimatie({ type, zichtbaar, onKlaar }: BeloningAnimatieProps) {
  useEffect(() => {
    if (zichtbaar && onKlaar) {
      const timer = setTimeout(onKlaar, 2500);
      return () => clearTimeout(timer);
    }
  }, [zichtbaar, onKlaar]);

  return (
    <AnimatePresence>
      {zichtbaar && (
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {type === 'confetti' && <Confetti />}
          {type === 'sparkle' && <Sparkles />}
          {type === 'ster' && <SterAnimatie />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
