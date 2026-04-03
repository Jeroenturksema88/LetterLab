'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CategorieKnop from '@/components/navigatie/CategorieKnop';
import type { Categorie } from '@/types';

export default function Startscherm() {
  const router = useRouter();

  const handleCategorieKlik = (categorie: Categorie) => {
    router.push(`/${categorie}`);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-8">
      <motion.div
        className="text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-letter-kleur via-cijfer-kleur to-vorm-kleur bg-clip-text text-transparent">
          LetterLab
        </h1>
      </motion.div>

      <motion.div
        className="flex gap-6 flex-wrap justify-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
      >
        <CategorieKnop
          categorie="letters"
          onClick={() => handleCategorieKlik('letters')}
        />
        <CategorieKnop
          categorie="cijfers"
          onClick={() => handleCategorieKlik('cijfers')}
        />
        <CategorieKnop
          categorie="vormen"
          onClick={() => handleCategorieKlik('vormen')}
        />
      </motion.div>

      <motion.button
        onClick={() => router.push('/ouder')}
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-gray-400 shadow"
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </motion.button>
    </div>
  );
}
