'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface TerugKnopProps {
  href?: string;
}

export default function TerugKnop({ href }: TerugKnopProps) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => (href ? router.push(href) : router.back())}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow-md"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Terug"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </motion.button>
  );
}
