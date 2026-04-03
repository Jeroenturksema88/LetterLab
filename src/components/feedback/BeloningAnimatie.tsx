'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';

interface BeloningAnimatieProps {
  type: 'sparkle' | 'ster' | 'confetti';
  zichtbaar: boolean;
  onKlaar?: () => void;
}

function Confetti() {
  const kleuren = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6366F1', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#F472B6'];

  const stukjes = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    kleur: kleuren[i % kleuren.length],
    x: Math.random() * 100,
    vertraging: Math.random() * 0.6,
    rotatie: Math.random() * 360,
    breedte: 4 + Math.random() * 10,
    hoogte: 4 + Math.random() * 6,
    driftX: (Math.random() - 0.5) * 200,
    vorm: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm',
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            rotate: s.rotatie + 720,
            opacity: [1, 1, 1, 0],
            x: [0, s.driftX * 0.3, s.driftX],
          }}
          transition={{
            duration: 2.5,
            delay: s.vertraging,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}

function Sparkles() {
  const sparkles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    grootte: 12 + Math.random() * 24,
    vertraging: Math.random() * 1,
    symbool: ['✦', '✧', '⭐', '💫', '✨'][Math.floor(Math.random() * 5)],
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.grootte,
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
          }}
          initial={{ scale: 0, opacity: 0, rotate: -30 }}
          animate={{
            scale: [0, 1.4, 0],
            opacity: [0, 1, 0],
            rotate: [0, 20],
          }}
          transition={{ duration: 1.2, delay: s.vertraging }}
        >
          {s.symbool}
        </motion.div>
      ))}
    </div>
  );
}

function SterAnimatie() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Glow achter de ster */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 2, 1.5] }}
        transition={{ duration: 1 }}
      />

      {/* De ster zelf */}
      <motion.div
        className="text-8xl relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.4, 1], rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
      >
        ⭐
      </motion.div>

      {/* Ring van sterretjes eromheen */}
      {Array.from({ length: 8 }).map((_, i) => {
        const hoek = (i / 8) * Math.PI * 2;
        const straal = 100;
        return (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: Math.cos(hoek) * straal,
              y: Math.sin(hoek) * straal,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
          >
            ✦
          </motion.div>
        );
      })}

      <Sparkles />
    </div>
  );
}

export default function BeloningAnimatie({ type, zichtbaar, onKlaar }: BeloningAnimatieProps) {
  useEffect(() => {
    if (zichtbaar && onKlaar) {
      const timer = setTimeout(onKlaar, 3000);
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
