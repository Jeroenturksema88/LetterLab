'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackType } from '@/types';

interface FeedbackOverlayProps {
  type: FeedbackType | null;
  onVolgende: () => void;
  onNogEenKeer: () => void;
}

export default function FeedbackOverlay({ type, onVolgende, onNogEenKeer }: FeedbackOverlayProps) {
  if (!type) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Zachte overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/80 backdrop-blur-sm" />

        <motion.div
          className="relative flex flex-col items-center gap-8"
          initial={{ scale: 0.3, y: 60 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        >
          {type === 'succes' ? (
            <>
              {/* Groot succes-icoon met glow */}
              <motion.div
                className="relative"
                animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="absolute inset-0 blur-2xl bg-yellow-300/50 rounded-full scale-150" />
                <span className="relative text-8xl block">🌟</span>
              </motion.div>

              {/* Twee grote knoppen */}
              <div className="flex gap-6">
                {/* Nog een keer */}
                <motion.button
                  onClick={onNogEenKeer}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg border-4 border-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </motion.button>

                {/* Volgende */}
                <motion.button
                  onClick={onVolgende}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 shadow-lg border-4 border-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="#059669" stroke="none">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.button>
              </div>
            </>
          ) : (
            <>
              {/* Aanmoedigingsicoon */}
              <motion.div
                className="relative"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
              >
                <div className="absolute inset-0 blur-2xl bg-orange-200/50 rounded-full scale-150" />
                <span className="relative text-8xl block">💪</span>
              </motion.div>

              {/* Probeer opnieuw knop */}
              <motion.button
                onClick={onNogEenKeer}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 shadow-lg border-4 border-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
