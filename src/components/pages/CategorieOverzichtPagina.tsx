'use client';

// components/pages/CategorieOverzichtPagina.tsx — Gedeelde overzichtspagina
// voor letters / cijfers / vormen. Vervangt drie eerder gedupliceerde routes.

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import ItemGrid from '@/components/navigatie/ItemGrid';
import TerugKnop from '@/components/navigatie/TerugKnop';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { haalCategorieConfig } from '@/lib/categorie-registry';
import type { Categorie } from '@/types';

interface CategorieOverzichtPaginaProps {
  categorie: Categorie;
}

export default function CategorieOverzichtPagina({ categorie }: CategorieOverzichtPaginaProps) {
  const router = useRouter();
  const config = haalCategorieConfig(categorie);
  const { items: voortgangItems, aantalSterren } = useVoortgangStore();

  const sterrenPerItem = useMemo(() => {
    const result: Record<string, number> = {};
    config.items.forEach((item) => {
      result[item.id] = aantalSterren(item.id);
    });
    return result;
    // voortgangItems triggert re-evaluatie wanneer voortgang wijzigt
  }, [voortgangItems, aantalSterren, config.items]);

  const volgendItemId = useMemo(
    () => config.items.find((item) => (sterrenPerItem[item.id] ?? 0) < 3)?.id,
    [sterrenPerItem, config.items]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 bg-white/50">
        <TerugKnop href="/" />
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${config.hoofdkleur}20` }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: config.hoofdkleur }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ItemGrid
          items={config.items}
          sterrenPerItem={sterrenPerItem}
          volgendItemId={volgendItemId}
          onSelecteer={(item) => router.push(`${config.routePrefix}/${item.id}`)}
        />
      </div>
    </div>
  );
}
