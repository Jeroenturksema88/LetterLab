'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import ItemGrid from '@/components/navigatie/ItemGrid';
import TerugKnop from '@/components/navigatie/TerugKnop';
import { useVoortgangStore } from '@/stores/voortgang-store';
import lettersData from '@/data/letters.json';
import type { ItemDef } from '@/types';

const letters = lettersData as ItemDef[];

export default function LettersOverzicht() {
  const router = useRouter();
  const { items, aantalSterren } = useVoortgangStore();

  const sterrenPerItem = useMemo(() => {
    const result: Record<string, number> = {};
    letters.forEach((l) => {
      result[l.id] = aantalSterren(l.id);
    });
    return result;
  }, [items, aantalSterren]);

  // Vind het eerste item dat nog niet volledig is voltooid
  const volgendItemId = useMemo(() => {
    return letters.find((l) => (sterrenPerItem[l.id] ?? 0) < 3)?.id;
  }, [sterrenPerItem]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 bg-white/50">
        <TerugKnop href="/" />
        <h2 className="text-2xl font-extrabold text-letter-kleur">Letters</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <ItemGrid
          items={letters}
          sterrenPerItem={sterrenPerItem}
          volgendItemId={volgendItemId}
          onSelecteer={(item) => router.push(`/letters/${item.id}`)}
        />
      </div>
    </div>
  );
}
