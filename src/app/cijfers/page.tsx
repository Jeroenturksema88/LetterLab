'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import ItemGrid from '@/components/navigatie/ItemGrid';
import TerugKnop from '@/components/navigatie/TerugKnop';
import { useVoortgangStore } from '@/stores/voortgang-store';
import cijfersData from '@/data/cijfers.json';
import type { ItemDef } from '@/types';

const cijfers = cijfersData as ItemDef[];

export default function CijfersOverzicht() {
  const router = useRouter();
  const { items, aantalSterren } = useVoortgangStore();

  const sterrenPerItem = useMemo(() => {
    const result: Record<string, number> = {};
    cijfers.forEach((c) => {
      result[c.id] = aantalSterren(c.id);
    });
    return result;
  }, [items, aantalSterren]);

  const volgendItemId = useMemo(() => {
    return cijfers.find((c) => (sterrenPerItem[c.id] ?? 0) < 3)?.id;
  }, [sterrenPerItem]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 bg-white/50">
        <TerugKnop href="/" />
        <div className="w-8 h-8 rounded-full bg-cijfer-kleur/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-cijfer-kleur" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ItemGrid
          items={cijfers}
          sterrenPerItem={sterrenPerItem}
          volgendItemId={volgendItemId}
          onSelecteer={(item) => router.push(`/cijfers/${item.id}`)}
        />
      </div>
    </div>
  );
}
