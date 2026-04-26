'use client';

// components/pages/OefeningPagina.tsx — Gedeelde oefenpagina voor letters / cijfers / vormen.
// Bevat de volledige flow: laad item, speel intro-audio, render OefeningView, regel
// voortgang/diploma's bij voltooiing. Vervangt drie eerder gedupliceerde routes.

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import OefeningView from '@/components/canvas/OefeningView';
import DiplomaOverlay from '@/components/feedback/DiplomaOverlay';
import type { DiplomaInfo } from '@/components/feedback/DiplomaOverlay';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useProfielStore } from '@/stores/profiel-store';
import { useAudioSpeler } from '@/components/audio/AudioSpeler';
import { haalCategorieConfig } from '@/lib/categorie-registry';
import type { AudioType, Categorie, Niveau } from '@/types';

interface OefeningPaginaProps {
  categorie: Categorie;
  itemId: string;
}

export default function OefeningPagina({ categorie, itemId }: OefeningPaginaProps) {
  const router = useRouter();
  const config = haalCategorieConfig(categorie);
  const { markeerVoltooid, huidigNiveau, registreerPoging } = useVoortgangStore();
  const { audioAan } = useInstellingenStore();
  const { naam, voegDiplomaToe, heeftDiploma } = useProfielStore();
  const { speelVoorItem } = useAudioSpeler(audioAan);

  const [diplomaInfo, setDiplomaInfo] = useState<DiplomaInfo | null>(null);
  const [toonDiploma, setToonDiploma] = useState(false);

  const item = useMemo(
    () => config.items.find((i) => i.id === itemId),
    [config.items, itemId]
  );

  const niveau: Niveau = useMemo(
    () => (item ? huidigNiveau(item.id) : 'overtrekken'),
    [item, huidigNiveau]
  );

  const audioSpeelFn = useCallback(
    (type: string) => {
      if (item) speelVoorItem(categorie, item.id, type as AudioType);
    },
    [item, speelVoorItem, categorie]
  );

  // Categorie-diploma: alle items in de categorie hebben alle 3 niveaus voltooid
  const isCategorieKlaar = useCallback((): boolean => {
    const voortgang = useVoortgangStore.getState().items;
    return config.items.every((i) => {
      const v = voortgang[i.id];
      return v && v.niveau1 && v.niveau2 && v.niveau3;
    });
  }, [config.items]);

  if (!item) {
    router.push(config.routePrefix);
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem(categorie, item.id, 'voltooiing');

      // Diploma alleen bij niveau 3 (zelfstandig)
      if (niveau === 'zelfstandig') {
        const itemDiplomaId = `item-${item.id}`;
        if (!heeftDiploma(itemDiplomaId)) {
          voegDiplomaToe(itemDiplomaId);

          const categorieDiplomaId = `categorie-${categorie}`;
          if (!heeftDiploma(categorieDiplomaId) && isCategorieKlaar()) {
            voegDiplomaToe(categorieDiplomaId);
            setDiplomaInfo({
              type: 'categorie',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie,
              kindNaam: naam,
            });
          } else {
            setDiplomaInfo({
              type: 'item',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie,
              kindNaam: naam,
            });
          }
          setToonDiploma(true);
          return; // Wacht tot diploma gesloten wordt
        }
      }
    }

    registreerPoging(item.id);

    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau && geslaagd) {
      router.push(config.routePrefix);
    } else {
      router.refresh();
    }
  };

  const handleDiplomaSluiten = () => {
    setToonDiploma(false);
    setDiplomaInfo(null);
    registreerPoging(item.id);

    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau) {
      router.push(config.routePrefix);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="h-full">
      <OefeningView
        item={item}
        niveau={niveau}
        onVoltooid={handleVoltooid}
        onTerug={() => router.push(config.routePrefix)}
        audioSpeelFn={audioSpeelFn}
      />
      <DiplomaOverlay
        diploma={diplomaInfo}
        zichtbaar={toonDiploma}
        onSluiten={handleDiplomaSluiten}
      />
    </div>
  );
}
