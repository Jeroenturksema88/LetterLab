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
        className="absolute inset-0 z-40 flex items-center justify-center bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-kind p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {type === 'succes' ? (
            <>
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                🎉
              </motion.div>
              <div className="flex gap-4">
                <motion.button
                  onClick={onNogEenKeer}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Nog een keer"
                >
                  <span className="text-2xl">🔄</span>
                </motion.button>
                <motion.button
                  onClick={onVolgende}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Volgende"
                >
                  <span className="text-2xl">▶️</span>
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <motion.div
                className="text-6xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                💪
              </motion.div>
              <motion.button
                onClick={onNogEenKeer}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Probeer nog eens"
              >
                <span className="text-2xl">🔄</span>
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
