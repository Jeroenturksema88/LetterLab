'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import ItemGrid from '@/components/navigatie/ItemGrid';
import TerugKnop from '@/components/navigatie/TerugKnop';
import { useVoortgangStore } from '@/stores/voortgang-store';
import vormenData from '@/data/vormen.json';
import type { ItemDef } from '@/types';

const vormen = vormenData as ItemDef[];

export default function VormenOverzicht() {
  const router = useRouter();
  const { items, aantalSterren } = useVoortgangStore();

  const sterrenPerItem = useMemo(() => {
    const result: Record<string, number> = {};
    vormen.forEach((v) => {
      result[v.id] = aantalSterren(v.id);
    });
    return result;
  }, [items, aantalSterren]);

  const volgendItemId = useMemo(() => {
    return vormen.find((v) => (sterrenPerItem[v.id] ?? 0) < 3)?.id;
  }, [sterrenPerItem]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 bg-white/50">
        <TerugKnop href="/" />
        <h2 className="text-2xl font-extrabold text-vorm-kleur">Vormen</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <ItemGrid
          items={vormen}
          sterrenPerItem={sterrenPerItem}
          volgendItemId={volgendItemId}
          onSelecteer={(item) => router.push(`/vormen/${item.id}`)}
        />
      </div>
    </div>
  );
}
