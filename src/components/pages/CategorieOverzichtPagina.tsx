'use client';

// components/pages/CategorieOverzichtPagina.tsx — Gedeelde overzichtspagina
// voor letters / cijfers / vormen. Vervangt drie eerder gedupliceerde routes.

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import ItemGrid from '@/components/navigatie/ItemGrid';
import TerugKnop from '@/components/navigatie/TerugKnop';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useAudioSpeler } from '@/components/audio/AudioSpeler';
import { haalCategorieConfig } from '@/lib/categorie-registry';
import type { Categorie } from '@/types';

interface CategorieOverzichtPaginaProps {
  categorie: Categorie;
}

export default function CategorieOverzichtPagina({ categorie }: CategorieOverzichtPaginaProps) {
  const router = useRouter();
  const letterStijl = useInstellingenStore((s) => s.letterStijl);
  const config = haalCategorieConfig(categorie, letterStijl);
  const { items: voortgangItems, aantalSterren } = useVoortgangStore();
  const audioAan = useInstellingenStore((s) => s.audioAan);
  const { spreek } = useAudioSpeler(audioAan);

  const sterrenPerItem = useMemo(() => {
    const result: Record<string, number> = {};
    config.items.forEach((item) => {
      result[item.id] = aantalSterren(item.id);
    });
    return result;
    // voortgangItems triggert re-evaluatie wanneer voortgang wijzigt
  }, [voortgangItems, aantalSterren, config.items]);

  const volgendItem = useMemo(
    () => config.items.find((item) => (sterrenPerItem[item.id] ?? 0) < 3),
    [sterrenPerItem, config.items]
  );

  // Volgende-item audio-suggestie. Als we hier komen direct na het voltooien
  // van een item (OefeningPagina zet sessieStorage flag), spreek dan een
  // vriendelijke prompt om naar het volgende te gaan. Persona "Nore" — na
  // voltooiing wist ze niet wat te kiezen.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let trigger: string | null = null;
    try {
      trigger = sessionStorage.getItem('letterlab:suggestVolgende');
    } catch {
      return;
    }
    if (trigger !== categorie) return;
    try {
      sessionStorage.removeItem('letterlab:suggestVolgende');
    } catch {
      /* negeer */
    }
    if (!volgendItem) return;

    // Vertraging zodat de pagina-overgang eerst landt; "een" werkt grammaticaal
    // voor letters (een A), cijfers (een 3) en vormen (een cirkel/kruis/etc).
    const timer = setTimeout(() => {
      spreek(`Probeer nu eens een ${volgendItem.label}!`);
    }, 800);
    return () => clearTimeout(timer);
  }, [categorie, volgendItem, spreek]);

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
          volgendItemId={volgendItem?.id}
          onSelecteer={(item) => router.push(`${config.routePrefix}/${item.id}`)}
        />
      </div>
    </div>
  );
}
