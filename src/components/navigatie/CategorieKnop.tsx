'use client';

import { motion } from 'framer-motion';
import type { Categorie } from '@/types';

interface CategorieKnopProps {
  categorie: Categorie;
  onClick: () => void;
}

const CATEGORIE_CONFIG: Record<Categorie, { kleur: string; bgKleur: string; icoon: string; label: string }> = {
  letters: {
    kleur: '#6366F1',
    bgKleur: 'bg-indigo-100',
    icoon: 'ABC',
    label: 'Letters',
  },
  cijfers: {
    kleur: '#F59E0B',
    bgKleur: 'bg-amber-100',
    icoon: '123',
    label: 'Cijfers',
  },
  vormen: {
    kleur: '#10B981',
    bgKleur: 'bg-emerald-100',
    icoon: '△○□',
    label: 'Vormen',
  },
};

export default function CategorieKnop({ categorie, onClick }: CategorieKnopProps) {
  const config = CATEGORIE_CONFIG[categorie];

  return (
    <motion.button
      onClick={onClick}
      className={`${config.bgKleur} rounded-kind p-8 flex flex-col items-center justify-center gap-4 min-w-[200px] min-h-[200px] shadow-lg border-4 border-white/50`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span
        className="text-5xl font-extrabold"
        style={{ color: config.kleur }}
      >
        {config.icoon}
      </span>
      <span
        className="text-xl font-bold"
        style={{ color: config.kleur }}
      >
        {config.label}
      </span>
    </motion.button>
  );
}
