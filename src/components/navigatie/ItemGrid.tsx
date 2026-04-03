'use client';

import { motion } from 'framer-motion';
import type { ItemDef } from '@/types';
import VoortgangSterren from './VoortgangSterren';

interface ItemGridProps {
  items: ItemDef[];
  sterrenPerItem: Record<string, number>;
  volgendItemId?: string;
  onSelecteer: (item: ItemDef) => void;
}

export default function ItemGrid({ items, sterrenPerItem, volgendItemId, onSelecteer }: ItemGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-3 p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
      {items.map((item, index) => {
        const sterren = sterrenPerItem[item.id] ?? 0;
        const isVolgend = item.id === volgendItemId;

        return (
          <motion.button
            key={item.id}
            onClick={() => onSelecteer(item)}
            className={`relative flex flex-col items-center justify-center rounded-2xl p-3 min-h-[80px] shadow-md transition-colors ${
              sterren === 3
                ? 'bg-succes/20 border-2 border-succes'
                : isVolgend
                ? 'bg-white border-2 border-dashed'
                : 'bg-white/80 border-2 border-transparent'
            }`}
            style={{
              borderColor: isVolgend ? item.kleur : undefined,
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, type: 'spring', stiffness: 300 }}
          >
            {isVolgend && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ borderColor: item.kleur, borderWidth: 2, borderStyle: 'solid' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <span
              className="text-2xl font-extrabold"
              style={{ color: item.kleur }}
            >
              {item.label}
            </span>
            <VoortgangSterren aantal={sterren} grootte="sm" />
          </motion.button>
        );
      })}
    </div>
  );
}
