'use client';

import { motion } from 'framer-motion';
import type { ItemDef } from '@/types';

// Ster-kleuren per positie: brons, zilver/staal, goud.
// Het oude #C0C0C0 zilver had te weinig contrast tegen de warme cream-achtergrond
// (#FFF8F0) waardoor de tweede ster "leeg" leek na voltooiing van niveau 2.
// We gebruiken nu Tailwind's slate-500 voor zilver en deeper bronze/gold voor
// duidelijke verzadiging op alle drie de niveaus.
const STER_KLEUREN = ['#B45309', '#64748B', '#EAB308'];
const STER_LEEG_KLEUR = '#E2E8F0';

/** SVG ster-icoon — gevuld of leeg afhankelijk van behaald niveau */
function SterIcoon({ gevuld, kleur }: { gevuld: boolean; kleur: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={gevuld ? kleur : 'none'}
      stroke={gevuld ? kleur : STER_LEEG_KLEUR}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** Visuele voortgang als rij van drie sterren */
function GridSterren({ aantal }: { aantal: number }) {
  return (
    <div className="flex gap-1 mt-1">
      {[0, 1, 2].map((i) => (
        <SterIcoon key={i} gevuld={i < aantal} kleur={STER_KLEUREN[i]} />
      ))}
    </div>
  );
}

/** Kleine SVG-preview van een item op basis van diens pad-data */
function ItemPreview({ item }: { item: ItemDef }) {
  const { boundingBox, paden, kleur } = item;

  return (
    <svg
      viewBox={`${boundingBox.x} ${boundingBox.y} ${boundingBox.breedte} ${boundingBox.hoogte}`}
      className="w-12 h-12"
      aria-label={item.label}
      role="img"
    >
      {paden.map((pad, i) => (
        <path
          key={i}
          d={pad}
          stroke={kleur}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

interface ItemGridProps {
  items: ItemDef[];
  sterrenPerItem: Record<string, number>;
  volgendItemId?: string;
  onSelecteer: (item: ItemDef) => void;
}

export default function ItemGrid({
  items,
  sterrenPerItem,
  volgendItemId,
  onSelecteer,
}: ItemGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3 p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
      {items.map((item, index) => {
        const sterren = sterrenPerItem[item.id] ?? 0;
        const isVolgend = item.id === volgendItemId;
        const isVoltooid = sterren === 3;

        return (
          <motion.button
            key={item.id}
            onClick={() => onSelecteer(item)}
            className={`
              relative flex flex-col items-center justify-center
              rounded-2xl p-3 min-h-[90px] min-w-[90px]
              shadow-md transition-colors
              ${isVoltooid
                ? 'border-2 border-succes'
                : isVolgend
                  ? 'border-2 border-dashed'
                  : 'border-2 border-transparent'
              }
            `}
            style={{
              // Lichte achtergrondkleur op basis van item-kleur
              backgroundColor: isVoltooid
                ? `${item.kleur}15`
                : `${item.kleur}0A`,
              borderColor: isVolgend ? item.kleur : undefined,
              // Gloed-effect voor voltooide items
              ...(isVoltooid
                ? { boxShadow: `0 0 12px 2px ${item.kleur}40` }
                : {}),
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.03,
              type: 'spring',
              stiffness: 300,
            }}
          >
            {/* Stuiterende rand-animatie voor het volgende voorgestelde item */}
            {isVolgend && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  borderColor: item.kleur,
                  borderWidth: 3,
                  borderStyle: 'solid',
                }}
                animate={{
                  scale: [1, 1.06, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* SVG-preview in plaats van tekstlabel */}
            <ItemPreview item={item} />

            {/* Sterren-indicator */}
            <GridSterren aantal={sterren} />
          </motion.button>
        );
      })}
    </div>
  );
}
