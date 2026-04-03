'use client';

import { motion } from 'framer-motion';
import type { Punt } from '@/types';

interface StrokePadProps {
  startPunt: Punt;
  kleur: string;
  schaal: number;
  offsetX: number;
  offsetY: number;
}

export default function StrokePad({ startPunt, kleur, schaal, offsetX, offsetY }: StrokePadProps) {
  const x = startPunt.x * schaal + offsetX;
  const y = startPunt.y * schaal + offsetY;

  return (
    <motion.div
      className="absolute rounded-full z-20 pointer-events-none"
      style={{
        width: 20,
        height: 20,
        backgroundColor: kleur,
        left: x - 10,
        top: y - 10,
      }}
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
